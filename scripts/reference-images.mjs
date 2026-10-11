import crypto from 'node:crypto';
import {read,files} from './validate.mjs';

const folder='harness/artifacts/01-references/';
const limit=10*1024*1024;
function extension(b){
 if(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(b.length>=4&&b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217)return 'jpg';
 if(b.length>=13&&['GIF87a','GIF89a'].includes(b.toString('ascii',0,6)))return 'gif';
 if(b.length>=20&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'webp';
 throw Error('Supported image bytes required (PNG/JPEG/GIF/WebP); HTML is not an image');
}
async function download(url,fetcher){
 const signal=AbortSignal.timeout(20000);
 for(let i=0;i<6;i++){
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password)throw Error('HTTPS image URL without credentials required');
  const response=await fetcher(u.href,{redirect:'manual',signal});
  if([301,302,303,307,308].includes(response.status)){
   const location=response.headers.get('location');await response.body?.cancel();
   if(!location)throw Error('Redirect location missing');url=new URL(location,u).href;continue;
  }
  if(!response.ok){await response.body?.cancel();throw Error('Image download HTTP '+response.status);}
  if(!response.headers.get('content-type')?.toLowerCase().startsWith('image/')){await response.body?.cancel();throw Error('Response is not an image');}
  if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw Error('Image exceeds 10 MiB');}
  if(!response.body)throw Error('Empty image response');
  const chunks=[];let size=0;
  for await(const chunk of response.body){size+=chunk.length;if(size>limit)throw Error('Image exceeds 10 MiB');chunks.push(chunk);}
  const bytes=Buffer.concat(chunks);return {bytes,ext:extension(bytes)};
 }
 throw Error('Too many redirects');
}

export async function downloadReferenceImages(h,{fetcher=fetch}={}){
 const s=h.sync();
 if(s.repairRequired?.G1&&!s.repairPermits?.G1)throw Error('Reserve retry before repair');
 const data=read(h.root,files.references);
 if(!Array.isArray(data?.references))throw Error('Missing references');
 const results=[];
 for(const ref of data.references){
  if(!Array.isArray(ref.imageUrls)||!ref.imageUrls.length){results.push({referenceId:ref.id,status:'missing',reason:'No verified imageUrls supplied'});continue;}
  for(const url of ref.imageUrls){
   let downloaded;
   try{downloaded=await download(url,fetcher);}catch(error){results.push({referenceId:ref.id,url,status:'failed',reason:error.message});continue;}
   const {bytes,ext}=downloaded;
   const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
   const file=folder+'images/'+sha256+'.'+ext;
   // All binary files and the result manifest use the normal role/gate guard.
   h.write('references',file,bytes);
   results.push({referenceId:ref.id,url,status:'saved',file,sha256,bytes:bytes.length});
  }
 }
 const report={status:results.length&&results.every(x=>x.status==='saved')?'pass':'blocked',results};
 h.write('references',folder+'image-downloads.json',JSON.stringify(report,null,2)+'\n');
 return report;
}
