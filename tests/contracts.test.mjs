import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as read, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fetchBytes, fetchVerified} from '../tools/cdn.mjs';
const json = path => JSON.parse(read(path,'utf8'));
test('Pages artifact contains only public documentation',()=>{
 assert.deepEqual(readdirSync('docs').sort(),['AGENTS.md','README.md','chapters','chapters.json','index.html','reference']);
 assert.equal(readdirSync('docs/chapters').filter(name=>name.endsWith('.md')).length,42);
});
test('CDN verification rejects bytes that differ from the manifest',async()=>{
 await assert.rejects(fetchVerified({url:'data:text/plain,changed',sha256:'0'.repeat(64)}),/SHA-256 mismatch/);
});
test('complete canonical manual and unique examples', () => {
 const chapters=json('content/chapters.json'), examples=json('content/reference/examples.json').examples;
 assert.equal(chapters.length,42); assert.equal(examples.length,82);
 assert.equal(new Set(examples.map(e=>e.id)).size,82);
 for (const c of chapters) assert.ok(read(`docs/chapters/${c.id}.md`,'utf8').startsWith('# '));
 for (const e of examples) assert.ok(chapters.some(c=>c.id===e.chapter));
});
test('viewer and demos use Core without custom style rules', () => {
 const html=read('docs/index.html','utf8');
 assert.doesNotMatch(html,/<style(?:\s|>)/i);
 const known=json('docs/reference/classes.json').classes;
 const shell=html.split('<script id="manual-data"')[0];
 const ids=[...shell.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique for routing and focus');
 for(const match of shell.matchAll(/class="([^"]*)"/g))for(const name of match[1].split(/\s+/))
  if(/^(?:m-|t-)?core-/.test(name))assert.ok(known[name],`Unknown Core class: ${name}`);
 const tokens=json('docs/reference/tokens.json').tokens;
 for(const match of shell.matchAll(/style="([^"]*)"/g))for(const declaration of match[1].split(';').filter(Boolean))
  assert.ok(tokens[declaration.split(':')[0].trim()],`Non-Core style: ${declaration}`);

 for (const e of json('docs/reference/examples.json').examples) {
  assert.equal(e.css,'',e.id);
  const extra=e.styles?.some(url=>url.endsWith('/theme-ss.css'))?['core-theme-ss-light','core-theme-ss-dark','core-theme-ss-black']:[];
  for(const match of e.html.matchAll(/class="([^"]*)"/g))for(const name of match[1].split(/\s+/))
   if(/^(?:m-|t-)?core-/.test(name))assert.ok(known[name]||extra.includes(name),`${e.id}: unknown Core class ${name}`);
 }
});
test('live CDN assets are available and version drift is reported', {timeout:300000}, async context => {
 const m=json('content/reference/source-manifest.json');assert.ok(Number.isSafeInteger(m.version));
 assert.ok(m.version_base.endsWith(`/v${m.version}/`));
 const html=read('docs/index.html','utf8');
 const data=JSON.parse(html.match(/<script id="manual-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(data.version,m.version);assert.ok(html.includes(`Core v${m.version}`));
 const changed=[];
 for(let i=0;i<m.files.length;i+=4)await Promise.all(m.files.slice(i,i+4).map(async file=>{
  const bytes=await fetchBytes(file.url);assert.ok(bytes.length>0,`${file.url}: empty response`);
  if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)changed.push(file.file);
 }));
 if(changed.length)context.diagnostic(`CDN latest differs from documented v${m.version}: ${changed.sort().join(', ')}. Run npm run check:upstream to review; the documentation baseline is unchanged.`);
});
test('published renamed classes and tokens are indexed', () => {
 const c=json('docs/reference/classes.json').classes,t=json('docs/reference/tokens.json').tokens;
 for(const k of ['core-icon-chevron','core-table-border-head','t-core-nogrow','m-core-noshrink','core-animate:spin']) assert.ok(c[k],k);
 for(const k of ['core-icon-shevron','core-heading-underline','t-nogrow','core-spin']) assert.equal(c[k],undefined,k);
 assert.ok(t['--s-170x']);
});
test('Markdown and canonical example markup stay synchronized',()=>{
 for(const e of json('content/reference/examples.json').examples){const body=read(`content/chapters/${e.chapter}.md`,'utf8');assert.ok(body.includes(e.html),`${e.id}: HTML differs from Markdown`);if(e.js)assert.ok(body.includes(e.js),`${e.id}: JS differs from Markdown`);assert.ok(body.includes(`<!-- demo:${e.id} -->`),e.id);for(const style of e.html.matchAll(/style="([^"]*)"/g))for(const declaration of style[1].split(';').filter(s=>s.trim()))assert.ok(declaration.trim().startsWith('--'),`${e.id}: custom declaration ${declaration}`);}
});
test('versioned CDN sources match the documented manifest',{timeout:300000},async()=>{
 const files=json('content/reference/source-manifest.json').version_files;
 for(let i=0;i<files.length;i+=4)await Promise.all(files.slice(i,i+4).map(fetchVerified));
});
test('local Markdown links resolve',()=>{
 const files=['README.md','AGENTS.md','content/README.md','content/AGENTS.md',...readdirSync('content/chapters').map(n=>'content/chapters/'+n)];
 for(const file of files){const body=read(file,'utf8').replace(/```[\s\S]*?```/g,'');for(const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;const target=new URL(href,new URL(file,'file://'+process.cwd()+'/'));assert.doesNotThrow(()=>read(target),`${file}: ${href}`);}}
});
test('published Markdown links stay inside the Pages artifact',()=>{
 const files=['docs/README.md','docs/AGENTS.md',...readdirSync('docs/chapters').map(n=>'docs/chapters/'+n)];
 for(const file of files){const body=read(file,'utf8').replace(/```[\s\S]*?```/g,'');for(const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;const target=new URL(href,new URL(file,'file://'+process.cwd()+'/'));assert.ok(decodeURIComponent(target.pathname).startsWith(`${process.cwd()}/docs/`),`${file}: ${href} escapes docs artifact`);assert.doesNotThrow(()=>read(target),`${file}: ${href}`);}}
});
test('JSON reference links resolve in source and published documentation',()=>{
 for(const root of ['content','docs'])for(const file of ['cdn.json','javascript.json']){
  const path=`${root}/reference/${file}`,body=read(path,'utf8');
  for(const [,href] of body.matchAll(/"(?:documentation|reference)": "([^"]+)"/g))
   assert.doesNotThrow(()=>read(new URL(href,new URL(path,'file://'+process.cwd()+'/'))),`${path}: ${href}`);
 }
});
test('generated HTML links resolve inside the Pages artifact',()=>{
 const html=read('docs/index.html','utf8').split('<script id="manual-data"')[0];
 for(const [,href] of html.matchAll(/href="([^"]+)"/g)){
  if(/^(https?:|#|mailto:)/.test(href))continue;
  const target=new URL(href,new URL('docs/index.html','file://'+process.cwd()+'/'));
  assert.ok(decodeURIComponent(target.pathname).startsWith(`${process.cwd()}/docs/`),href);
  assert.doesNotThrow(()=>read(target),href);
 }
});
test('existing deep links to examples remain stable',()=>{
 const html=read('docs/index.html','utf8');for(const e of json('docs/reference/examples.json').examples)assert.ok(html.includes(`id="${e.chapter}--${e.id.toLowerCase()}"`),e.id);
});
