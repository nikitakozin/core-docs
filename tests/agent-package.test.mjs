import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync as read, writeFileSync as write, mkdtempSync, cpSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, posix} from 'node:path';

const unpack=path=>JSON.parse(execFileSync('python3',['-c',
 'import json,sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print(json.dumps({n:z.read(n).decode("utf-8") for n in z.namelist()}))',path],{encoding:'utf8',maxBuffer:10*1024*1024,timeout:30000}));

test('agent download is a complete portable Markdown and JSON package without runtime files',()=>{
 assert.ok(existsSync('docs/core-agent.zip'),'build must produce the agent ZIP');
 const files=unpack('docs/core-agent.zip'),names=Object.keys(files);
 const chapters=JSON.parse(read('docs/chapters.json','utf8'));
 assert.equal(names.length,51);
 assert.ok(names.every(name=>/^core\/(?:[\w-]+\.(?:md|json)|(?:chapters|reference)\/[\w-]+\.(?:md|json))$/.test(name)));
 for(const name of ['AGENTS.md','README.md','chapters.json',...chapters.map(c=>`chapters/${c.id}.md`),...['classes','tokens','examples','javascript','cdn','source-manifest'].map(n=>`reference/${n}.json`)])assert.ok(files[`core/${name}`],name);
 assert.deepEqual(JSON.parse(files['core/reference/examples.json']),JSON.parse(read('docs/reference/examples.json','utf8')));
 assert.deepEqual(JSON.parse(files['core/reference/source-manifest.json']),JSON.parse(read('docs/reference/source-manifest.json','utf8')));
 for(const [name,body] of Object.entries(files)) {
  assert.doesNotMatch(body,/https:\/\/nikitakozin\.github\.io\/core-docs\/[^\s)]+\.(?:md|json)/,`${name}: documentation should resolve locally`);
  if(!name.endsWith('.md'))continue;
  for(const [,href] of body.replace(/```[\s\S]*?```/g,'').matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
   if(/^(https?:|#|mailto:)/.test(href))continue;
   const target=posix.normalize(posix.join(posix.dirname(name),href.split('#')[0]));
   assert.ok(files[target],`${name}: broken archive link ${href}`);
  }
 }
});

test('repackaging picks up current chapter bytes and is reproducible',()=>{
 assert.ok(existsSync('docs/core-agent.zip'),'build must produce the agent ZIP');
 const dir=mkdtempSync(join(tmpdir(),'core-agent-test-'));
 try {
  cpSync('docs',dir,{recursive:true});
  const path=join(dir,'chapters/architecture.md'),updated=read(path,'utf8')+'\nНовый текст для проверки обновления комплекта.\n';
  write(path,updated);
  const pack=()=>execFileSync('python3',['tools/package-agent.py',dir],{timeout:30000});
  pack();
  assert.equal(unpack(join(dir,'core-agent.zip'))['core/chapters/architecture.md'],updated);
  const first=read(join(dir,'core-agent.zip'));pack();
  assert.deepEqual(read(join(dir,'core-agent.zip')),first);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
