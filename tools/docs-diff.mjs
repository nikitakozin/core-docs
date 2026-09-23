// Explicit preparation only: accepted content and manifest are never changed here.
import {readFileSync as read,writeFileSync as write,mkdirSync,readdirSync} from 'node:fs';
import {fetchBytes} from './cdn.mjs';
import {prepareUpdate} from './update-diff.mjs';
const json=path=>JSON.parse(read(path,'utf8'));
try {
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=='--to'||! /^(?:v?[1-9]\d*|latest)$/.test(args[1]))throw new Error('Usage: npm run docs:diff -- --to v190 (or latest, resolved once)');
 const manifest=json('content/reference/source-manifest.json');let to=Number(args[1].replace(/^v/,''));
 if(args[1]==='latest') {
  const catalog=await fetchBytes(new URL('../',manifest.version_base).href);
  const versions=[...catalog.toString().matchAll(/\bv(\d+)\//g)].map(m=>Number(m[1]));
  if(!versions.length)throw new Error('No Core versions found');to=Math.max(...versions);
 }
 const documents=readdirSync('content/chapters').filter(n=>n.endsWith('.md')).sort().map(name=>({id:name.slice(0,-3),body:read('content/chapters/'+name,'utf8')}));
 const examples=json('content/reference/examples.json').examples,hints=json('tools/update-dependencies.json');
 for(const module of json('content/reference/cdn.json').modules)hints.files[`${module.name}.js`]=['javascript',`js-${module.name}`];
 const report=await prepareUpdate({manifest,to,documents,examples,hints});
 const path=`work/core-update/v${report.from}-v${to}-${report.input_sha256.slice(0,12)}`;
 mkdirSync(path,{recursive:true});
 write(`${path}/report.json`,JSON.stringify(report,null,2)+'\n');
 write(`${path}/candidate-manifest.json`,JSON.stringify(report.candidate,null,2)+'\n');
 write(`${path}/api.json`,JSON.stringify(report.files.filter(f=>f.api).map(f=>({file:f.file,...f.api})),null,2)+'\n');
 const changed=report.files.filter(f=>f.status!=='unchanged');
 const summary=`# Core v${report.from} → v${to}\n\nPrepared: ${report.prepared_at}\nInput SHA-256: ${report.input_sha256}\n\n`+
  `Changed/added/removed files: ${changed.length}. Global review: ${report.global_review}. Unmapped changes: ${report.unmapped.length}.\n`+
  `Latest content differences (channel URLs normalized): ${report.latest_content_differences.join(', ')||'none'}. This is a dated check, not a permanent version guarantee.\n\n`+
  '| File | Status | Analysis | Changes |\n| --- | --- | --- | --- |\n'+changed.map(f=>`| ${f.file} | ${f.status} | ${f.kind}${f.requires_separate_review?' — separate review required':''} | ${f.changes?.length??'see report'} |`).join('\n')+
  `\n\n## Chapters to review\n\n${report.chapters.map(id=>'- content/chapters/'+id+'.md').join('\n')||'None'}\n\nExamples: ${report.examples.join(', ')||'none'}.\n\n`+
  '## Continue\n\nStart with api.json for class/token additions and removals. Read selected file changes in report.json, then affected source chapters/examples. Global changes require broad behavior review; unmapped changes must be classified explicitly. Minified files are hashed, not assumed equivalent to their source. Reports contain changes, never a vendored Core tree.\n\n'+
  'candidate-manifest.json is a proposal. After reviewing changes, apply it to the working tree together with the source edits; build and run tests. Accept and publish only the verified commit. Keep this report to resume review; regenerate if CDN hashes or source inputs change.\n';
 write(`${path}/report.md`,summary);
 console.log(JSON.stringify({from:report.from,to,path,changed_files:changed.length,chapters:report.chapters.length,examples:report.examples.length,global_review:report.global_review,unmapped:report.unmapped.length,latest_content_differences:report.latest_content_differences,baseline_unchanged:true},null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
