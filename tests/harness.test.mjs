import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Harness} from '../scripts/harness.mjs';
import {validate} from '../scripts/validate.mjs';
import {guardWrite} from '../scripts/guard-write.mjs';
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'charok-test-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const h=new Harness(root);
 const r=JSON.parse(fs.readFileSync(new URL('../rules/design-rules.json',import.meta.url),'utf8'));r.unresolved=[];h.save('rules/design-rules.json',r);
 h.save('.codex/roles.json',JSON.parse(fs.readFileSync(new URL('../.codex/roles.json',import.meta.url),'utf8')));
 h.save('.codex/figma-target.json',{fileKey:'fixture',pageId:'1:1'});
 h.save('docs/prd.md',{fixture:true});
 h.save('harness/artifacts/01-references/references.json',{references:['a','b'].map(id=>({id,url:'https://uibowl.io/name/fixture?imgId='+id,reason:'fixture',provider:r.referencePolicy.provider,app:r.referencePolicy.app,imageId:id})),patterns:[{summary:'fixture pattern',references:['a','b']}]});
 const fields=[{id:'tea-name',required:true},{id:'photo',required:false}],settings=[{field:'tea-name',hideable:false},{field:'photo',hideable:true}];
 const screens=r.requiredScreens.map((id,i)=>({id,source:'docs/prd.md',nodeId:`1:${i}`,extraction:`harness/artifacts/04-design/${id}.json`,image:`harness/artifacts/04-design/${id}.png`}));
 h.save('harness/artifacts/02-structure/screens.json',{screens,fields,settings});
 h.save('harness/artifacts/04-design/figma-manifest.json',{fileKey:'fixture',pageId:'1:1',screens,fields,settings});
 for(const s of screens){h.save(s.extraction,{fileKey:'fixture',pageId:'1:1',nodeId:s.nodeId,properties:[{kind:'spacing',value:8}],fields,settings});fs.writeFileSync(path.join(root,s.image),'fixture image');}
 h.start();return {root,h,r};
}
test('normal gates pass',t=>{const {h}=fixture(t);for(const g of ['G1','G2','G3'])assert.equal(h.check(g).status,'pass');});
for(const [key,value]of [['url','https://example.com'],['provider','external'],['app','other'],['imageId','']])test('G1 rejects invalid reference '+key,t=>{const {root,h}=fixture(t);const p='harness/artifacts/01-references/references.json';const d=JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));d.references[0][key]=value;h.save(p,d);assert.equal(h.check('G1').checks.find(c=>c.id==='REF-PROVIDER').status,'fail');});

const manifestPath='harness/artifacts/04-design/figma-manifest.json';
const extractionPath='harness/artifacts/04-design/record-list.json';
const load=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const g3Cases=[
 ['missing target configuration','.codex/figma-target.json',()=>({}),'FIGMA-TARGET-CONFIG','blocked'],
 ['different configured file','.codex/figma-target.json',d=>({...d,fileKey:'other'}),'FIGMA-TARGET','fail'],
 ['different configured page','.codex/figma-target.json',d=>({...d,pageId:'9:9'}),'FIGMA-TARGET','fail'],
 ['blank manifest file',manifestPath,d=>({...d,fileKey:' '}),'FIGMA-TARGET','blocked'],
 ['missing manifest node',manifestPath,d=>{delete d.screens[0].nodeId;return d;},'FIGMA-NODE:record-list','blocked'],
 ['duplicate screen nodes',manifestPath,d=>{d.screens[1].nodeId=d.screens[0].nodeId;return d;},'FIGMA-NODE-UNIQUE','fail'],
 ['missing extraction path',manifestPath,d=>{delete d.screens[0].extraction;return d;},'FIGMA-NODE:record-list','blocked'],
 ['missing extracted node',extractionPath,d=>{delete d.nodeId;return d;},'FIGMA-NODE:record-list','blocked'],
 ['blank extracted node',extractionPath,d=>({...d,nodeId:' '}),'FIGMA-NODE:record-list','blocked'],
 ['different extracted node',extractionPath,d=>({...d,nodeId:'9:9'}),'FIGMA-NODE:record-list','fail'],
 ['different extracted file',extractionPath,d=>({...d,fileKey:'other'}),'FIGMA-NODE:record-list','fail'],
 ['different extracted page',extractionPath,d=>({...d,pageId:'9:9'}),'FIGMA-NODE:record-list','fail'],
 ['missing extracted page',extractionPath,d=>{delete d.pageId;return d;},'FIGMA-NODE:record-list','blocked'],
 ['missing extracted properties',extractionPath,d=>{delete d.properties;return d;},'EXTRACTED-PROPERTIES:record-list','blocked'],
 ['empty extracted properties',extractionPath,d=>({...d,properties:[]}),'EXTRACTED-PROPERTIES:record-list','blocked'],
 ['invalid extracted property',extractionPath,d=>({...d,properties:[null]}),'TOKENS:record-list','fail'],
 ['missing image path',manifestPath,d=>{delete d.screens[0].image;return d;},'IMAGE:record-list','blocked'],
 ['directory instead of image',manifestPath,d=>{d.screens[0].image='harness/artifacts/04-design';return d;},'IMAGE:record-list','blocked'],
];
for(const [name,p,change,id,status] of g3Cases)test('G3 rejects '+name,t=>{
 const {h,root}=fixture(t);h.save(p,change(load(root,p)));
 const report=validate(root,'G3');
 assert.notEqual(report.status,'pass');
 assert.equal(report.checks.find(c=>c.id===id)?.status,status);
});
test('missing node IDs on both sides cannot pass',t=>{
 const {h,root}=fixture(t),d=load(root,manifestPath),e=load(root,extractionPath);
 delete d.screens[0].nodeId;delete e.nodeId;h.save(manifestPath,d);h.save(extractionPath,e);
 assert.equal(validate(root,'G3').checks.find(c=>c.id==='FIGMA-NODE:record-list').status,'blocked');
});
test('unreadable extraction blocks approval',t=>{
 const {h,root}=fixture(t);fs.writeFileSync(path.join(root,extractionPath),'{broken');
 h.check('G1');h.check('G2');assert.equal(h.check('G3').status,'blocked');
 assert.throws(()=>h.approve(h.digest(h.sync()),'fixture human',{brand:true,reference:true,readability:true}),/G3 not passed/);
});
test('missing URL fails G1',t=>{const {h,root}=fixture(t);h.save('harness/artifacts/01-references/references.json',{references:[{id:'x',reason:'x'}],patterns:[]});assert.equal(validate(root,'G1').status,'fail');});
test('empty patterns cannot vacuously pass',t=>{const {h,root}=fixture(t);const d=JSON.parse(fs.readFileSync(path.join(root,'harness/artifacts/01-references/references.json')));d.patterns=[];h.save('harness/artifacts/01-references/references.json',d);assert.equal(validate(root,'G1').status,'fail');});
test('missing screen fails',t=>{const {h,root}=fixture(t);h.save('harness/artifacts/02-structure/screens.json',{screens:[],fields:[],settings:[]});assert.equal(validate(root,'G2').status,'fail');});
test('extra required field fails both G2 and G3',t=>{const {h,root}=fixture(t);for(const p of ['harness/artifacts/02-structure/screens.json','harness/artifacts/04-design/figma-manifest.json']){const d=JSON.parse(fs.readFileSync(path.join(root,p)));d.fields.push({id:'photo2',required:true});h.save(p,d);}for(const g of ['G2','G3'])assert.equal(validate(root,g).status,'fail');});
test('missing extraction blocks',t=>{const {h,root}=fixture(t);const d=JSON.parse(fs.readFileSync(path.join(root,'harness/artifacts/04-design/figma-manifest.json')));d.screens[0].extraction='harness/artifacts/04-design/missing.json';h.save('harness/artifacts/04-design/figma-manifest.json',d);assert.equal(validate(root,'G3').status,'blocked');});
test('token violation fails',t=>{const {h,root}=fixture(t);h.save('harness/artifacts/04-design/record-list.json',{fileKey:'fixture',pageId:'1:1',nodeId:'1:0',properties:[{kind:'spacing',value:7}]});assert.equal(validate(root,'G3').status,'fail');});
test('unknown decisions block',t=>{const {h,r,root}=fixture(t);r.unresolved=['unknown'];h.save('rules/design-rules.json',r);assert.equal(validate(root,'G2').status,'blocked');});
test('unchanged resume preserves completed gates',t=>{const {h}=fixture(t);h.check('G1');assert.equal(h.sync().gates.G1.status,'pass');});
test('input changes invalidate dependent gates',t=>{const {h}=fixture(t);h.check('G1');h.save('docs/prd.md',{changed:true});assert.deepEqual(h.sync().gates,{});});
test('stage ordering blocks G2',t=>{const {h}=fixture(t);assert.throws(()=>h.check('G2'),/Previous gate/);});
test('third retry is blocked',t=>{const {h}=fixture(t);h.save('harness/artifacts/01-references/references.json',{});h.check('G1');h.retry('G1');h.retry('G1');assert.throws(()=>h.retry('G1'),/limit/);});
test('write outside role blocked without file creation',t=>{const {root}=fixture(t);assert.throws(()=>guardWrite(root,'references','docs/attack.md','x'));assert.equal(fs.existsSync(path.join(root,'docs/attack.md')),false);});
test('judge cannot write',t=>{const {root}=fixture(t);assert.throws(()=>guardWrite(root,'judge','rules/design-rules.json','x'));});
test('path traversal and Windows alternate streams blocked',t=>{const {root}=fixture(t);for(const p of ['harness/artifacts/01-references/../../docs/attack','harness/artifacts/01-references/a:stream'])assert.throws(()=>guardWrite(root,'references',p,'x'));});
test('handoff requires approval and approval expires on edit',t=>{const {h}=fixture(t);for(const g of ['G1','G2','G3'])h.check(g);assert.throws(()=>h.write('handoff','harness/artifacts/05-review/handoff.md','x'));const s=h.sync();h.approve(h.digest(s),'fixture human',{brand:true,reference:true,readability:true});h.write('handoff','harness/artifacts/05-review/handoff.md','approved fixture');h.save('harness/artifacts/04-design/changed.json',{});assert.equal(h.sync().approval,null);assert.throws(()=>h.write('handoff','harness/artifacts/05-review/handoff.md','x'));});
test('stale hash cannot approve',t=>{const {h}=fixture(t);for(const g of ['G1','G2','G3'])h.check(g);assert.throws(()=>h.approve('old','human',{brand:true,reference:true,readability:true}),/Stale/);});
test('failed gate repair cannot bypass retry reservation',t=>{const {h}=fixture(t);h.save('harness/artifacts/01-references/references.json',{});h.check('G1');assert.throws(()=>h.write('references','harness/artifacts/01-references/references.json','{}'),/Reserve retry/);h.retry('G1');h.write('references','harness/artifacts/01-references/references.json','{}');h.check('G1');h.retry('G1');h.write('references','harness/artifacts/01-references/references.json','{}');h.check('G1');assert.throws(()=>h.retry('G1'),/limit/);assert.throws(()=>h.write('references','harness/artifacts/01-references/references.json','{}'),/Reserve retry/);});
test('manifest cannot disagree with extracted fields',t=>{const {h,root}=fixture(t);h.save('harness/artifacts/04-design/record-create.json',{fileKey:'fixture',pageId:'1:1',nodeId:'1:1',properties:[{kind:'spacing',value:8}],fields:[{id:'extra',required:true}]});assert.equal(validate(root,'G3').status,'fail');});
test('overwritten artifact is recoverable from history',t=>{const {h,root}=fixture(t);const p='harness/artifacts/01-references/references.json',before=fs.readFileSync(path.join(root,p),'utf8');h.write('references',p,'{}');const dir=path.join(root,'harness/artifacts/history',h.state().id);const records=fs.readdirSync(dir).filter(x=>x.endsWith('-artifact.json'));assert.equal(records.length,1);const record=JSON.parse(fs.readFileSync(path.join(dir,records[0])));assert.equal(Buffer.from(record.content,'base64').toString('utf8'),before);});
