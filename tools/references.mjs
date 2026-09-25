import {readFileSync as read, writeFileSync as write} from 'node:fs';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import {fetchVerified} from './cdn.mjs';

export async function buildReferences() {
const manifest=JSON.parse(read('content/reference/source-manifest.json','utf8'));
const output=(path,value)=>write(path,JSON.stringify(value,null,2)+'\n');
const classes={}, tokens={}, registrations={};
for (const file of ['core.css','theme-nk.css','theme-nkui.css','theme-ss.css','theme-tg.css']) {
 const source=manifest.version_files.find(entry=>entry.file===file);
 const tree=postcss.parse((await fetchVerified(source)).toString('utf8'),{from:source.url});
 const context=node=>{const parts=[];for(let p=node.parent;p&&p.type!=='root';p=p.parent)parts.unshift(p.type==='atrule'?`@${p.name} ${p.params}`:p.selector);return parts.join(' → ');};
 if(file==='core.css') tree.walkRules(rule=>{
  selectorParser(selectors=>selectors.walkClasses(node=>{
   const entry={line:rule.source.start.line,selector:rule.selector,context:context(rule)};
   const refs=classes[node.value] ||= [];
   if(!refs.some(x=>x.line===entry.line)) refs.push(entry);
  })).processSync(rule.selector);
 });
 tree.walkDecls(decl=>{if(decl.prop.startsWith('--')) (tokens[decl.prop] ||= []).push({file,line:decl.source.start.line,scope:context(decl),value:decl.value,important:Boolean(decl.important)});});
 tree.walkAtRules('property',rule=>{const entry={file,line:rule.source.start.line};rule.walkDecls(d=>entry[d.prop]=d.value);registrations[rule.params]=entry;});
}
output('docs/reference/classes.json',{source:manifest.version_base+'core.css',coverage:'explicit class selectors, including nested rules; attribute patterns and JS-created names excluded',count:Object.keys(classes).length,classes});
output('docs/reference/tokens.json',{source:manifest.version_base,coverage:'all declared custom-property names in five verified CDN CSS files; declarations, not computed defaults',count:Object.keys(tokens).length,registrations,tokens});
const examples=JSON.parse(read('content/reference/examples.json','utf8')).examples,used={};
for(const e of examples) for(const match of e.html.matchAll(/class="([^"]+)"/g)) for(const name of match[1].split(/\s+/)) if(name.includes('core-')) {const ids=used[name] ||= new Set();ids.add(e.id);}
let index=`# Индекс классов и примеров\n\n[Оглавление](../README.md) · [Правила агента](../AGENTS.md)\n\nВ проверенном CSS v${manifest.version} с CDN найдено **${Object.keys(classes).length} явных имён классов**. Полный каталог с селекторами, контекстом и строками — [classes.json](../reference/classes.json). Атрибутные шаблоны и классы, создаваемые JS, не входят в этот счётчик.\n\nНиже — **${Object.keys(used).length} классов из примеров**. Это навигация по мануалу, не полный список возможностей.\n\n## Классы из примеров\n\n`;
for(const [name,ids] of Object.entries(used).sort(([a],[b])=>a.localeCompare(b))) index+='`'+name+'` — '+[...ids].map(id=>`[${id}](${examples.find(e=>e.id===id).chapter}.md)`).join(', ')+'.\n\n';
write('docs/chapters/class-index.md',index.trimEnd()+'\n');
console.log(`Indexed ${Object.keys(classes).length} classes, ${Object.keys(tokens).length} tokens, ${Object.keys(registrations).length} registrations`);
}
