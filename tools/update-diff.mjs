import {createHash} from 'node:crypto';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import {fetchBytes} from './cdn.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=values=>[...new Set(values)].sort();
export function cssApiDelta(before,after) {
 function names(source) {
  const classes=new Set(),tokens=new Set(),tree=postcss.parse(source);
  tree.walkRules(rule=>selectorParser(selectors=>selectors.walkClasses(n=>classes.add(n.value))).processSync(rule.selector));
  tree.walkDecls(decl=>{if(decl.prop.startsWith('--'))tokens.add(decl.prop);});
  return {classes,tokens};
 }
 const a=names(before),b=names(after),result={};
 for(const kind of ['classes','tokens'])result[kind]={added:sorted([...b[kind]].filter(n=>!a[kind].has(n))),removed:sorted([...a[kind]].filter(n=>!b[kind].has(n)))};
 return result;
}

function cssBlocks(source) {
 const blocks=[],occurrences=new Map();
 function visit(node,path=[],selectors=[]) {
  const label=node.type==='root'?'root':node.type==='rule'?node.selector.trim():`@${node.name} ${node.params}`.trim();
  const declarations=(node.nodes||[]).filter(n=>n.type==='decl').map(n=>[n.prop,n.value,Boolean(n.important)]);
  const context=JSON.stringify(path),count=occurrences.get(context)||0;occurrences.set(context,count+1);
  const sequence=declarations.length&&(node.nodes||[]).some(n=>['rule','atrule'].includes(n.type))
   ?node.nodes.filter(n=>n.type!=='comment').map(n=>n.type==='decl'?['decl',n.prop,n.value,Boolean(n.important)]:['child',n.type,n.selector||n.name,n.params||'']):undefined;
  if(node.type!=='root'||declarations.length)blocks.push({key:JSON.stringify([path,count]),path,label,selectors,declarations,block:Boolean(node.nodes),...(sequence?{sequence}:{})});
  for(const child of node.nodes||[]) {
   if(!['rule','atrule'].includes(child.type))continue;
   const name=child.type==='rule'?child.selector.trim():`@${child.name} ${child.params}`.trim();
   visit(child,[...path,name],child.type==='rule'?[...selectors,child.selector]:selectors);
  }
 }
 visit(postcss.parse(source));return blocks;
}

export function cssChanges(before,after) {
 const a=cssBlocks(before),b=cssBlocks(after),old=new Map(a.map(r=>[r.key,r])),next=new Map(b.map(r=>[r.key,r]));
 // Keep source positions in the report, without treating an unchanged rule shifted by an insertion as edited.
 const positioned=rows=>new Map(rows.map((row,index)=>[row.key,{...row,position:{index,previous:rows[index-1]?.key||null,next:rows[index+1]?.key||null}}]));
 const oldPositions=positioned(a),newPositions=positioned(b);
 const changes=[];
 for(const row of a) {
  const other=next.get(row.key);
  if(!other)changes.push({kind:'removed',before:oldPositions.get(row.key)});
  else if(!same(row,other))changes.push({kind:'changed',before:oldPositions.get(row.key),after:newPositions.get(row.key)});
 }
 for(const row of b)if(!old.has(row.key))changes.push({kind:'added',after:newPositions.get(row.key)});
 // Compare relative order of surviving blocks: insertion alone is not a reorder.
 const oldOrder=a.filter(r=>next.has(r.key)).map(r=>r.key),newOrder=b.filter(r=>old.has(r.key)).map(r=>r.key);
 if(!same(oldOrder,newOrder))changes.push({kind:'order',before:oldOrder,after:newOrder});
 return changes;
}

export function impactFor(file,changes,documents,examples,hints) {
 const chapters=new Set(),affectedExamples=new Set(),unmapped=[];let global=false;
 const allIds=documents.map(d=>d.id),fileHints=hints.files?.[file]||[];
 for(const change of changes) {
  const records=[change.before,change.after].filter(r=>r&&!Array.isArray(r)),names=new Set();
  let broad=change.kind==='order';
  for(const record of records) {
   for(const selector of record.selectors) {
    if(/:root|:where\(\.core\)|core-solo|(?:^|[\s,>+~])(?:html|body)(?:$|[\s,.#[:>+~])/.test(selector))broad=true;
    try {selectorParser(tree=>tree.walkClasses(n=>names.add(n.value))).processSync(selector);}
    catch {broad=true;}
   }
   for(const [prop,value] of record.declarations) {
    if(prop.startsWith('--'))names.add(prop);
    for(const match of value.matchAll(/--[\w-]+/g))names.add(match[0]);
   }
   if(record.label.startsWith('@property ')) {names.add(record.label.slice(10));broad=true;}
   if(record.label==='root')broad=true;
  }
  if([...names].some(n=>hints.global_tokens?.includes(n)))broad=true;
  const matches=new Set(fileHints);
  for(const doc of documents)if([...names].some(n=>doc.body.includes(n)))matches.add(doc.id);
  for(const e of examples)if([...names].some(n=>`${e.html}\n${e.js||''}`.includes(n)))matches.add(e.chapter);
  if(broad){global=true;for(const id of allIds)matches.add(id);}
  for(const id of matches)chapters.add(id);
  if(!matches.size)unmapped.push({kind:change.kind,path:records[0]?.path||[],names:sorted(names)});
 }
 for(const e of examples)if(chapters.has(e.chapter))affectedExamples.add(e.id);
 return {global,chapters:sorted(chapters),examples:sorted(affectedExamples),unmapped};
}

async function mapLimit(items,fn) {
 const results=new Array(items.length);let index=0;
 await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{
  while(index<items.length){const i=index++;results[i]=await fn(items[i]);}
 }));return results;
}

function listing(bytes,hidden) {
 const files=sorted([...bytes.toString().matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]).filter(name=>/^[a-z][a-z0-9.-]*\.(css|js|html)$/.test(name)));
 if(!files.includes('core.css')||!files.includes('state.js'))throw new Error('Unexpected CDN file listing');
 return sorted([...files,...hidden]);
}

function textChange(before,after) {
 const a=before.split('\n'),b=after.split('\n');let start=0,end=0;
 while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;
 while(end<Math.min(a.length,b.length)-start&&a[a.length-1-end]===b[b.length-1-end])end++;
 const offset=Math.max(0,start-3);
 return {start_line:offset+1,before:a.slice(offset,a.length-Math.max(0,end-3)).join('\n'),after:b.slice(offset,b.length-Math.max(0,end-3)).join('\n')};
}

export async function prepareUpdate({manifest,to,documents,examples,hints,fetcher=fetchBytes}) {
 if(!Number.isSafeInteger(to)||to<1)throw new Error('Target must be a positive Core version');
 const base=new URL('../',manifest.version_base).href,target=base+`v${to}/`,runtime=manifest.runtime_base;
 if(manifest.version_base!==base+`v${manifest.version}/`)throw new Error('Manifest version and version_base disagree');
 const hidden=manifest.version_files.filter(f=>f.file.startsWith('.')).map(f=>f.file);
 const [targetListing,latestListing]=await Promise.all([fetcher(target),fetcher(runtime)]);
 const targetNames=listing(targetListing,hidden),latestNames=listing(latestListing,hidden);
 const oldFiles=await mapLimit(manifest.version_files,async file=>{
  const bytes=await fetcher(file.url);
  if(hash(bytes)!==file.sha256)throw new Error(`CDN SHA-256 mismatch: ${file.url}`);
  return {...file,source:bytes.toString('utf8')};
 });
 async function collect(names,url) {return mapLimit(names,async file=>{
  const bytes=await fetcher(url+file);return {file,url:url+file,bytes:bytes.length,sha256:hash(bytes),source:bytes.toString('utf8')};
 });}
 const targetFiles=await collect(targetNames,target),latestFiles=await collect(latestNames,runtime);
 const old=new Map(oldFiles.map(f=>[f.file,f])),next=new Map(targetFiles.map(f=>[f.file,f])),live=new Map(latestFiles.map(f=>[f.file,f]));
 const stripSource=({source,...metadata})=>metadata;
 const channelText=file=>file?.source.replaceAll(manifest.version_base,'<CORE>/').replaceAll(target,'<CORE>/').replaceAll(runtime,'<CORE>/')||'';
 const files=[];
 for(const file of sorted([...old.keys(),...next.keys()])) {
  const before=old.get(file),after=next.get(file);
  const status=!before?'added':!after?'removed':before.sha256===after.sha256?'unchanged':'changed';
  const entry={file,status,before:before&&stripSource(before),after:after&&stripSource(after)};
  if(status!=='unchanged') {
   if(/\.min\.(css|js)$/.test(file)) {
    const plain=file.replace('.min.','.');
    entry.kind='minified';entry.source_file=plain;
    entry.requires_separate_review=old.get(plain)?.sha256===next.get(plain)?.sha256||!next.has(plain);
   } else if(file.endsWith('.css')) {
    entry.kind='css';entry.changes=cssChanges(before?.source||'',after?.source||'');
    entry.api=cssApiDelta(before?.source||'',after?.source||'');
    entry.impact=impactFor(file,entry.changes,documents,examples,hints);
   } else if(before&&after&&channelText(before)===channelText(after)) {
    entry.kind='channel-urls-only';
   } else {
    entry.kind='text';entry.diff=textChange(before?.source||'',after?.source||'');
    const chapters=hints.files?.[file]||[];
    entry.impact={global:false,chapters,examples:examples.filter(e=>chapters.includes(e.chapter)).map(e=>e.id),unmapped:chapters.length?[]:[{file,reason:'No chapter mapping for changed source'}]};
   }
  }
  files.push(entry);
 }
 const latestDifferences=sorted([...next.keys(),...live.keys()]).filter(name=>next.get(name)?.sha256!==live.get(name)?.sha256);
 const latestContentDifferences=latestDifferences.filter(name=>!next.has(name)||!live.has(name)||channelText(next.get(name))!==channelText(live.get(name)));
 const now=new Date().toISOString();
 const candidate={...manifest,version:to,version_base:target,retrieved_at:now,runtime_checked_at:now,
  files:latestFiles.map(stripSource),version_files:targetFiles.map(stripSource),
  comparison:{from_version:manifest.version,changed:files.filter(f=>f.status==='changed').map(f=>f.file),added:files.filter(f=>f.status==='added').map(f=>f.file),removed:files.filter(f=>f.status==='removed').map(f=>f.file),latest_vs_version_different:latestDifferences,latest_content_different:latestContentDifferences}};
 const inputs={baseline:manifest.version_files,target:candidate.version_files,latest:candidate.files,documents:documents.map(d=>({id:d.id,sha256:hash(d.body)})),examples_sha256:hash(JSON.stringify(examples)),hints};
 return {schema_version:1,from:manifest.version,to,prepared_at:now,input_sha256:hash(JSON.stringify(inputs)),files,
  chapters:sorted(files.flatMap(f=>f.impact?.chapters||[])),examples:sorted(files.flatMap(f=>f.impact?.examples||[])),
  global_review:files.some(f=>f.impact?.global),unmapped:files.flatMap(f=>(f.impact?.unmapped||[]).map(change=>({file:f.file,...change}))),
  latest_differences:latestDifferences,latest_content_differences:latestContentDifferences,candidate};
}
