import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {guardWrite,safePath} from './guard-write.mjs';
import {validate,read,files} from './validate.mjs';
export class Harness {
 constructor(root){this.root=fs.realpathSync(root);}
 save(p,data){const f=safePath(this.root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(data,null,2)+'\n');}
 state(){return read(this.root,'harness/artifacts/run-state.json');}
 snapshot(){
  const result={};
  const walk=dir=>{const full=safePath(this.root,dir);if(!fs.existsSync(full))return;for(const e of fs.readdirSync(full,{withFileTypes:true})){const p=dir+'/'+e.name;if(p==='harness/artifacts')continue;if(e.isSymbolicLink())throw Error('Linked input denied');if(e.isDirectory())walk(p);else result[p]=crypto.createHash('sha256').update(fs.readFileSync(safePath(this.root,p))).digest('hex');}};
  for(const d of ['docs','rules','harness','.codex','scripts','harness/artifacts/01-references','harness/artifacts/02-structure','harness/artifacts/04-design'])walk(d);
  return result;
 }
 sync(){let s=this.state();if(!s)throw Error('Run start first');const current=this.snapshot();const changed=[...new Set([...Object.keys(s.snapshot),...Object.keys(current)])].filter(p=>s.snapshot[p]!==current[p]);if(changed.length){
   this.save('harness/artifacts/history/'+s.id+'/'+Date.now()+'-'+crypto.randomUUID()+'.json',s);
   const onlyDesign=changed.every(p=>p.startsWith('harness/artifacts/04-design/'));
   const onlyStructure=changed.every(p=>p.startsWith('harness/artifacts/02-structure/'));
   for(const g of onlyDesign?['G3']:onlyStructure?['G2','G3']:['G1','G2','G3'])delete s.gates[g];
   s.approval=null;s.snapshot=current;s.changed=changed;this.save('harness/artifacts/run-state.json',s);
  }return s;}
 start(){if(this.state())throw Error('Existing run: use resume');const s={id:crypto.randomUUID(),snapshot:this.snapshot(),gates:{},retries:{},repairRequired:{},repairPermits:{},approval:null};this.save('harness/artifacts/run-state.json',s);return s;}
 check(gate){let s=this.sync();const previous={G2:'G1',G3:'G2'}[gate];if(previous&&s.gates[previous]?.status!=='pass')throw Error('Previous gate not passed');const report=validate(this.root,gate);s.gates[gate]=report;s.repairRequired??={};s.repairPermits??={};s.repairRequired[gate]=report.status!=='pass';delete s.repairPermits[gate];this.save('harness/artifacts/run-state.json',s);this.save('harness/artifacts/05-review/report.json',{runId:s.id,gates:s.gates});return report;}
 retry(gate){let s=this.sync();if(!s.repairRequired?.[gate])throw Error('No failed gate');const limit=read(this.root,files.rules)?.maxRetries;if(!Number.isInteger(limit))throw Error('Missing retry limit');if((s.retries[gate]||0)>=limit)throw Error('Retry limit reached');s.retries[gate]=(s.retries[gate]||0)+1;s.repairPermits??={};s.repairPermits[gate]=true;this.save('harness/artifacts/run-state.json',s);return s;}
 digest(s){return crypto.createHash('sha256').update(JSON.stringify(s.snapshot)).digest('hex');}
 approve(hash,reviewer,items){const s=this.sync();if(s.gates.G3?.status!=='pass')throw Error('G3 not passed');if(hash!==this.digest(s))throw Error('Stale approval');if(!reviewer?.trim()||!['handdrawn','reference','readability'].every(k=>items[k]===true))throw Error('Three explicit approvals required');s.approval={hash,reviewer,items,time:new Date().toISOString()};this.save('harness/artifacts/run-state.json',s);return s;}
 write(role,p,content){const roles=read(this.root,'.codex/roles.json');if(!roles?.[role])throw Error('Unknown role');let s=this.sync();const gate=roles[role].gateBefore;if(gate&&s.gates[gate]?.status!=='pass')throw Error('Gate blocks role');const own={references:'G1',structure:'G2',rules:'G2',design:'G3'}[role];if(own&&s.repairRequired?.[own]&&!s.repairPermits?.[own])throw Error('Reserve retry before repair');if(role==='handoff'&&s.approval?.hash!==this.digest(s))throw Error('Human approval required');const target=safePath(this.root,p);const old=fs.existsSync(target)?fs.readFileSync(target).toString('base64'):null;guardWrite(this.root,role,p,content);if(old!==null)this.save('harness/artifacts/history/'+s.id+'/'+Date.now()+'-'+crypto.randomUUID()+'-artifact.json',{path:p,encoding:'base64',content:old});return this.sync();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
 const [cmd,...args]=process.argv.slice(2),h=new Harness(process.cwd());let out;
 if(cmd==='start')out=h.start();
 else if(cmd==='resume'||cmd==='status'){out=h.sync();out.approvalHash=h.digest(out);}
 else if(cmd==='check')out=h.check(args[0]);
 else if(cmd==='retry')out=h.retry(args[0]);
 else if(cmd==='write'){out=h.write(args[0],args[1],fs.readFileSync(0,'utf8'));}
 else if(cmd==='approve'){
  if(!process.stdin.isTTY)throw Error('Human interactive terminal required');
  const {createInterface}=await import('node:readline/promises');const ui=createInterface({input:process.stdin,output:process.stdout});
  const reviewer=await ui.question('Reviewer name: '),items={};for(const k of ['handdrawn','reference','readability'])items[k]=(await ui.question(k+' approve? type yes: '))==='yes';ui.close();out=h.approve(args[0],reviewer,items);
 }else throw Error('Commands: start | status | resume | check G1/G2/G3 | retry G1/G2/G3 | write ROLE PATH (stdin) | approve HASH');
 console.log(JSON.stringify(out,null,2));if(out.status==='fail')process.exitCode=1;if(out.status==='blocked')process.exitCode=2;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
