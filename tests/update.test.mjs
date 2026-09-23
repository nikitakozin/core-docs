import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cssChanges, cssApiDelta, impactFor, prepareUpdate} from '../tools/update-diff.mjs';

test('CSS comparison finds value changes without a class rename and ignores comments',()=>{
 assert.deepEqual(cssChanges('.button { color: red; }','/* release */ .button { color: red; }'),[]);
 const changes=cssChanges('.button { color: red; }','.button { color: blue; }');
 assert.equal(changes.length,1);assert.equal(changes[0].kind,'changed');
 assert.deepEqual(changes[0].after.declarations,[['color','blue',false]]);
});
test('CSS comparison preserves declaration order, importance and rule cascade order',()=>{
 for(const [before,after] of [
  ['.a {color:red;color:blue}', '.a {color:blue;color:red}'],
  ['.a {color:red}', '.a {color:red!important}'],
  ['.a {color:red}.b {color:blue}', '.b {color:blue}.a {color:red}']
 ])assert.ok(cssChanges(before,after).length);
});
test('added and removed rules retain their cascade position including nested contexts',()=>{
 for(const wrap of [css=>css,css=>`@media (width < 720px){.scope{${css}}}`]) {
  const baseline=wrap('.a{color:red}'),first=wrap('.b{color:blue}.a{color:red}'),last=wrap('.a{color:red}.b{color:blue}');
  const addedFirst=cssChanges(baseline,first).find(c=>c.kind==='added').after;
  const addedLast=cssChanges(baseline,last).find(c=>c.kind==='added').after;
  assert.notDeepEqual(addedFirst,addedLast,'Insertion before/after a competing rule must be distinguishable');
  assert.ok(addedFirst.position.index<addedLast.position.index);
  assert.equal(addedFirst.position.next,addedLast.position.previous);
  assert.ok(addedFirst.position.next.includes('.a'));
  assert.deepEqual(cssChanges(first,baseline).find(c=>c.kind==='removed').before.position,addedFirst.position);
  assert.deepEqual(cssChanges(last,baseline).find(c=>c.kind==='removed').before.position,addedLast.position);
 }
});
test('CSS comparison covers nested conditions, duplicate selectors and property registrations',()=>{
 const changes=cssChanges('@media (width < 720px){.a{color:red}} .a{color:blue}.a{color:green}@property --x{inherits:false;initial-value:0px;syntax:"<length>"}',
 '@media (width < 721px){.a{color:red}} .a{color:blue}.a{color:black}@property --x{inherits:true;initial-value:0px;syntax:"<length>"}');
 assert.ok(changes.some(c=>c.kind==='added'&&c.after.path.some(x=>x.includes('721px'))));
 assert.ok(changes.some(c=>c.kind==='removed'&&c.before.path.some(x=>x.includes('720px'))));
 assert.ok(changes.some(c=>c.kind==='changed'&&c.after.declarations.some(d=>d[1]==='black')));
 assert.ok(changes.some(c=>c.kind==='changed'&&c.after.label==='@property --x'));
});
const documents=[{id:'buttons',body:'Use `core-button` and `--accent`.'},{id:'themes',body:'Theme guide'},{id:'javascript',body:'Modules'}];
test('removing an earlier repeated media block does not report unchanged later rules as replaced',()=>{
 const changes=cssChanges('@media (width < 720px){.removed{color:red}} @media (width < 720px){.kept{color:blue}}', '@media (width < 720px){.kept{color:blue}}');
 assert.ok(changes.some(c=>c.before?.label==='.removed'));
 assert.ok(!changes.some(c=>c.before?.label==='.kept'||c.after?.label==='.kept'));
});
test('moving declarations across nested rules remains visible',()=>{
 assert.ok(cssChanges('.a {color:red; & {color:blue}}','.a {& {color:blue} color:red}').length);
});
const examples=[{id:'E01',chapter:'buttons',html:'<button class="core-button">OK</button>'}];
test('impact connects existing prose/examples and makes unknown changes visible',()=>{
 const result=impactFor('core.css',cssChanges('.core-button{color:red}.unknown{opacity:1}', '.core-button{color:blue}.unknown{opacity:0}'),documents,examples,{});
 assert.deepEqual(result.chapters,['buttons']);assert.deepEqual(result.examples,['E01']);
 assert.equal(result.unmapped.length,1);
});
test('root tokens broaden review to every chapter including JS components',()=>{
 const result=impactFor('core.css',cssChanges(':root{--f-s-base:18px}',':root{--f-s-base:16px}'),documents,examples,{});
 assert.deepEqual(result.chapters,['buttons','javascript','themes']);assert.equal(result.global,true);
});
test('API summary separates class/token removals from changed declarations',()=>{
 const api=cssApiDelta('.old{--old:1;color:red}.same{color:red}', '.new{--new:1;color:red}.same{color:blue}');
 assert.deepEqual(api.classes,{added:['new'],removed:['old']});
 assert.deepEqual(api.tokens,{added:['--new'],removed:['--old']});
});

const hash=value=>createHash('sha256').update(value).digest('hex');
function fixture() {
 const base='https://cdn.sdelal.tech/core/';
 const bodies={'v1/core.css':'.core-button{color:red}','v1/state.js':'export const state=1;',
  'v2/core.css':'.core-button{color:blue}','v2/state.js':'export const state=1;',
  'v2/theme-new.css':':root{--accent:blue}',
  'latest/core.css':'.core-button{color:blue}','latest/state.js':'export const state=1;',
  'latest/theme-new.css':':root{--accent:blue}'};
 const manifest={version:1,version_base:base+'v1/',runtime_base:base+'latest/',version_files:['core.css','state.js'].map(file=>({file,url:base+'v1/'+file,bytes:bodies['v1/'+file].length,sha256:hash(bodies['v1/'+file])}))};
 const fetcher=async url=>{
  const path=url.slice(base.length);
  if(path==='v1/')return Buffer.from('<a href="core.css">core</a><a href="state.js">state</a>');
  if(['v2/','latest/'].includes(path))return Buffer.from('<a href="core.css">core</a><a href="state.js">state</a><a href="theme-new.css">theme</a>');
  if(!(path in bodies))throw new Error('HTTP 404: '+url);
  return Buffer.from(bodies[path]);
 };
 return {manifest,fetcher};
}
test('preparation compares fixed versions, produces candidate metadata and keeps accepted baseline intact',async()=>{
 const {manifest,fetcher}=fixture(),old=JSON.stringify(manifest);
 const report=await prepareUpdate({manifest,to:2,fetcher,documents,examples,hints:{}});
 assert.equal(JSON.stringify(manifest),old);
 assert.equal(report.from,1);assert.equal(report.to,2);
 assert.deepEqual(report.files.filter(f=>f.status==='changed').map(f=>f.file),['core.css']);
 assert.deepEqual(report.files.filter(f=>f.status==='added').map(f=>f.file),['theme-new.css']);
 assert.equal(report.candidate.version,2);assert.equal(report.candidate.version_files.length,3);
 assert.deepEqual(report.latest_differences,[]);
 assert.ok(report.files.find(f=>f.file==='core.css').changes.length);
});
test('preparation stops on changed baseline bytes or network failure',async()=>{
 const {manifest,fetcher}=fixture();manifest.version_files[0].sha256='0'.repeat(64);
 await assert.rejects(prepareUpdate({manifest,to:2,fetcher,documents,examples,hints:{}}),/SHA-256 mismatch/);
 await assert.rejects(prepareUpdate({manifest,to:2,fetcher:async()=>{throw new Error('offline');},documents,examples,hints:{}}),/offline/);
});
test('an unchanged version needs no chapter analysis; removed files and latest drift remain visible',async()=>{
 const {manifest,fetcher}=fixture();
 const accepted=(await prepareUpdate({manifest,to:2,fetcher,documents,examples,hints:{}})).candidate;
 const unchanged=await prepareUpdate({manifest:accepted,to:2,fetcher,documents,examples,hints:{}});
 assert.ok(unchanged.files.every(f=>f.status==='unchanged'));assert.deepEqual(unchanged.chapters,[]);
 const older=await prepareUpdate({manifest:accepted,to:1,fetcher,documents,examples,hints:{}});
 assert.deepEqual(older.files.filter(f=>f.status==='removed').map(f=>f.file),['theme-new.css']);
 assert.deepEqual(older.latest_content_differences,['core.css','theme-new.css']);
});
