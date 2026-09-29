import fs from 'node:fs';
import {safePath} from './guard-write.mjs';
export const files={references:'harness/artifacts/01-references/references.json',structure:'harness/artifacts/02-structure/screens.json',rules:'rules/design-rules.json',design:'harness/artifacts/04-design/figma-manifest.json'};
export function read(root,p){try{return JSON.parse(fs.readFileSync(safePath(root,p),'utf8'));}catch{return null;}}
const text=x=>typeof x==='string'&&x.trim().length>0;
const list=x=>Array.isArray(x)?x:[];
export function validate(root,gate) {
 if(!['G1','G2','G3'].includes(gate))throw Error('Unknown gate');
 const checks=[]; const add=(id,ok,stage,detail,missing=false)=>checks.push({id,status:missing?'blocked':ok?'pass':'fail',returnStage:stage,detail});
 const r=read(root,files.rules);
 if(!r){add('RULES',false,3,'Missing or invalid rules',true);return result();}
 if(!Array.isArray(r.requiredScreens)||r.requiredScreens.length!==5||!r.tokens||!Number.isInteger(r.minimumReferences)||!Number.isInteger(r.patternSources)){add('RULE-SCHEMA',false,3,'Invalid rules schema',true);return result();}
 if(gate==='G1') {
  const d=read(root,files.references); if(!d){add('REFERENCES',false,1,'Missing references',true);return result();}
  const refs=list(d.references),patterns=list(d.patterns),ids=refs.map(x=>x.id);
  add('REF-COUNT',refs.length>=r.minimumReferences,1,'Reference count');
  add('REF-SOURCE',refs.every(x=>text(x.id)&&text(x.reason)&&/^https?:\/\//.test(x.url)),1,'id/url/reason required');
  add('REF-IDS',new Set(ids).size===ids.length,1,'Unique reference IDs');
  add('PATTERNS',patterns.length>0&&patterns.every(x=>text(x.summary)&&new Set(list(x.references)).size>=r.patternSources&&list(x.references).every(id=>ids.includes(id))),1,'Nonempty patterns with distinct existing sources');
 } else {
  add('RULE-METADATA',list(r.rules).length>0&&r.rules.every(x=>text(x.id)&&text(x.source))&&new Set(r.rules.map(x=>x.id)).size===r.rules.length,3,'Unique rules with sources');
  add('RULE-UNRESOLVED',Array.isArray(r.unresolved)&&r.unresolved.length===0,3,'Unresolved decisions',!Array.isArray(r.unresolved)||r.unresolved.length>0);
  const d=read(root,gate==='G2'?files.structure:files.design);
  if(!d){add('SCREENS',false,gate==='G2'?2:4,'Missing screen data',true);return result();}
  const screens=list(d.screens),ids=screens.map(x=>x.id);
  add('SCREEN-COVERAGE',r.requiredScreens.every(id=>ids.includes(id))&&ids.length===new Set(ids).size,2,'Required screen IDs and uniqueness');
  if(gate==='G2')add('PRD-SOURCE',screens.every(x=>text(x.source)),2,'PRD source per screen');
  const fields=list(d.fields),settings=list(d.settings),required=fields.filter(x=>x.required===true).map(x=>x.id);
  add('SERVICE-REQUIRED',required.length===1&&required[0]==='tea-name'&&fields.every(x=>typeof x.required==='boolean'),2,'Only tea-name required',!Array.isArray(d.fields));
  add('SERVICE-SETTINGS',fields.filter(x=>!x.required).every(x=>settings.some(s=>s.field===x.id&&s.hideable===true))&&settings.some(x=>x.field==='tea-name'&&x.hideable===false),2,'Optional fields hideable; tea-name locked',!Array.isArray(d.settings));
  if(gate==='G3') {
   add('FIGMA-TARGET',text(d.fileKey)&&text(d.pageId),4,'Figma file/page identity',!d.fileKey||!d.pageId);
   for(const screen of screens){
    const e=text(screen.extraction)?read(root,screen.extraction):null;
    add('FIGMA-NODE:'+screen.id,!!e&&e.nodeId===screen.nodeId&&e.fileKey===d.fileKey&&Array.isArray(e.properties)&&e.properties.length>0,4,'Extracted node identity and properties',!e);
    if(e) add('TOKENS:'+screen.id,list(e.properties).length>0&&list(e.properties).every(p=>Array.isArray(r.tokens[p.kind])&&r.tokens[p.kind].includes(p.value)),4,'Extracted properties match allowed tokens');
    if(screen.id==='record-create')add('EXTRACTED-FIELDS',!!e&&JSON.stringify(e.fields)===JSON.stringify(d.fields),4,'Manifest fields match actual extraction',!e||!Array.isArray(e.fields));
    if(screen.id==='field-settings')add('EXTRACTED-SETTINGS',!!e&&JSON.stringify(e.settings)===JSON.stringify(d.settings),4,'Manifest settings match actual extraction',!e||!Array.isArray(e.settings));
    let image=false;try{image=text(screen.image)&&fs.statSync(safePath(root,screen.image)).size>0;}catch{}
    add('IMAGE:'+screen.id,image,4,'Review image exists',!image);
   }
  }
 }
 return result();
 function result(){return {gate,status:checks.some(x=>x.status==='fail')?'fail':checks.some(x=>x.status==='blocked')?'blocked':'pass',checks};}
}
