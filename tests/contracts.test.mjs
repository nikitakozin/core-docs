import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as read, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const json = path => JSON.parse(read(path,'utf8'));
test('complete canonical manual and unique examples', () => {
 const chapters=json('docs/chapters.json'), examples=json('docs/reference/examples.json').examples;
 assert.equal(chapters.length,42); assert.equal(examples.length,82);
 assert.equal(new Set(examples.map(e=>e.id)).size,82);
 for (const c of chapters) assert.ok(read(`docs/docs/${c.id}.md`,'utf8').startsWith('# '));
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

 for (const e of json('docs/reference/examples.json').examples) assert.equal(e.css,'',e.id);
});
test('source snapshot is verifiable and versioned', () => {
 const m=json('docs/reference/source-manifest.json');assert.equal(m.version,185);
 for (const f of m.files) assert.equal(createHash('sha256').update(read(`upstream/latest/${f.file}`)).digest('hex'),f.sha256,f.file);
});
test('published renamed classes and tokens are indexed', () => {
 const c=json('docs/reference/classes.json').classes,t=json('docs/reference/tokens.json').tokens;
 for(const k of ['core-icon-chevron','core-table-head-underline','t-core-nogrow','m-core-noshrink','core-animate:spin']) assert.ok(c[k],k);
 for(const k of ['core-icon-shevron','core-heading-underline','t-nogrow','core-spin']) assert.equal(c[k],undefined,k);
 assert.ok(t['--s-170x']);
});
test('Markdown and canonical example markup stay synchronized',()=>{
 for(const e of json('docs/reference/examples.json').examples){const body=read(`docs/docs/${e.chapter}.md`,'utf8');assert.ok(body.includes(e.html),`${e.id}: HTML differs from Markdown`);if(e.js)assert.ok(body.includes(e.js),`${e.id}: JS differs from Markdown`);assert.ok(body.includes(`<!-- demo:${e.id} -->`),e.id);for(const style of e.html.matchAll(/style="([^"]*)"/g))for(const declaration of style[1].split(';').filter(s=>s.trim()))assert.ok(declaration.trim().startsWith('--'),`${e.id}: custom declaration ${declaration}`);}
});
test('immutable version snapshot matches its manifest',()=>{
 for(const f of json('docs/reference/source-manifest.json').version_files)assert.equal(createHash('sha256').update(read(`upstream/v185/${f.file}`)).digest('hex'),f.sha256,f.file);
});
test('local Markdown links resolve',()=>{
 const files=['README.md','AGENTS.md','docs/README.md','docs/AGENTS.md',...readdirSync('docs/docs').map(n=>'docs/docs/'+n)];
 for(const file of files){const body=read(file,'utf8').replace(/```[\s\S]*?```/g,'');for(const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;const target=new URL(href,new URL(file,'file://'+process.cwd()+'/'));assert.doesNotThrow(()=>read(target),`${file}: ${href}`);}}
});
test('published Markdown links stay inside the Pages artifact',()=>{
 const files=['docs/README.md','docs/AGENTS.md',...readdirSync('docs/docs').map(n=>'docs/docs/'+n)];
 for(const file of files){const body=read(file,'utf8').replace(/```[\s\S]*?```/g,'');for(const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;const target=new URL(href,new URL(file,'file://'+process.cwd()+'/'));assert.ok(decodeURIComponent(target.pathname).startsWith(`${process.cwd()}/docs/`),`${file}: ${href} escapes docs artifact`);}}
});
test('existing deep links to examples remain stable',()=>{
 const html=read('docs/index.html','utf8');for(const e of json('docs/reference/examples.json').examples)assert.ok(html.includes(`id="${e.chapter}--${e.id.toLowerCase()}"`),e.id);
});
