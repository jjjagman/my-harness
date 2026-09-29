import fs from 'node:fs';
import path from 'node:path';
export const scopes = {references:'harness/artifacts/01-references/',structure:'harness/artifacts/02-structure/',rules:'rules/design-rules.json',design:'harness/artifacts/04-design/',handoff:'harness/artifacts/05-review/handoff.md'};
export function safePath(root, relative) {
  if(typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || path.isAbsolute(relative) || relative.split('/').some(x=>x==='..'||x==='.'||!x)) throw Error('Unsafe path');
  const base=fs.realpathSync(root), target=path.resolve(base,relative);
  if(!target.startsWith(base+path.sep)) throw Error('Outside workspace');
  let cursor=base;
  for(const part of relative.split('/')) { cursor=path.join(cursor,part); if(fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) throw Error('Linked path denied'); }
  return target;
}
export function guardWrite(root, role, relative, content) {
  const scope=scopes[role];
  if(!scope || !(scope.endsWith('/')? relative.startsWith(scope):relative===scope)) throw Error('Role write denied');
  const target=safePath(root,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,content);
}
