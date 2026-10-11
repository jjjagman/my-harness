import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Harness} from '../scripts/harness.mjs';
import {downloadReferenceImages} from '../scripts/reference-images.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=','base64');
function setup(t,imageUrls){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'charok-images-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const h=new Harness(root);
 h.save('.codex/roles.json',{references:{gateBefore:null}});
 h.save('harness/artifacts/01-references/references.json',{references:[{id:'../unsafe-id',imageUrls}]});
 h.start();return h;
}
test('downloads binary image through guard and records source',async t=>{
 const h=setup(t,['https://example.com/screen']);
 const report=await downloadReferenceImages(h,{fetcher:async()=>new Response(png,{headers:{'content-type':'image/png'}})});
 assert.equal(report.status,'pass');const item=report.results[0];
 assert.match(item.file,/images\/[a-f0-9]{64}\.png$/);
 assert.deepEqual(fs.readFileSync(path.join(h.root,item.file)),png);
 assert.equal(item.url,'https://example.com/screen');
 assert.ok(h.state().snapshot[item.file]);
});
test('missing image URL is reported without network',async t=>{
 const h=setup(t,[]);const r=await downloadReferenceImages(h,{fetcher:()=>{throw Error('must not call');}});
 assert.equal(r.status,'blocked');assert.equal(r.results[0].status,'missing');
});
for(const [name,response] of [
 ['HTTP failure',()=>new Response('',{status:403})],
 ['HTML page',()=>new Response('<html/>',{headers:{'content-type':'text/html'}})],
 ['fake image',()=>new Response('<html/>',{headers:{'content-type':'image/png'}})],
 ['oversize image',()=>new Response(png,{headers:{'content-type':'image/png','content-length':'10485761'}})],
 ['unsafe redirect',()=>new Response(null,{status:302,headers:{location:'http://example.com/image'}})],
 ['network failure',()=>{throw Error('network unavailable');}],
])test('reports '+name+' without saving image',async t=>{
 const h=setup(t,['https://example.com/image']);const r=await downloadReferenceImages(h,{fetcher:async()=>response()});
 assert.equal(r.status,'blocked');assert.equal(r.results[0].status,'failed');
 assert.equal(fs.existsSync(path.join(h.root,'harness/artifacts/01-references/images')),false);
});
test('follows HTTPS redirects',async t=>{
 const h=setup(t,['https://example.com/start']);let calls=0;
 const r=await downloadReferenceImages(h,{fetcher:async url=>{
  calls++;return url.endsWith('/start')?new Response(null,{status:302,headers:{location:'/image'}}):new Response(png,{headers:{'content-type':'image/png'}});
 }});assert.equal(r.status,'pass');assert.equal(calls,2);
});
test('retry guard blocks downloading before network access',async t=>{
 const h=setup(t,['https://example.com/image']);const s=h.state();s.repairRequired.G1=true;h.save('harness/artifacts/run-state.json',s);
 let called=false;await assert.rejects(downloadReferenceImages(h,{fetcher:()=>{called=true;}}),/Reserve retry/);assert.equal(called,false);
});
