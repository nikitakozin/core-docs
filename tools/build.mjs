import {readFileSync as read, writeFileSync as write, rmSync, mkdirSync, cpSync} from 'node:fs';
import {Marked, Renderer} from 'marked';
import {buildReferences} from './references.mjs';

// docs/ is disposable output. Copy only files intended for public readers.
rmSync('docs',{recursive:true,force:true});
mkdirSync('docs',{recursive:true});
for(const name of ['README.md','AGENTS.md','chapters.json','chapters','reference'])
 cpSync(`content/${name}`,`docs/${name}`,{recursive:true});
await buildReferences();

const json=path=>JSON.parse(read(path,'utf8'));
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const chapters=json('docs/chapters.json'), examples=json('docs/reference/examples.json').examples;
const searchSections=[], pages=[], groups=new Map();
const button='core-button core-button-s';
const widths=['auto',390,720,721,997,998,1200];

function codeBlock(text,lang='текст') {
 return `<div class="code-block core-col core-g-0x core-border core-b-r-4x core-crop core-m-t-6x core-m-b-8x">
<div class="core-row core-nowrap core-y-center core-justify core-g-4x core-p-4x core-p-l-8x core-bg-surface core-border core-border-b"><span class="core-text core-text-xs core-text-mono">${esc(lang)}</span><button type="button" class="copy-button ${button}" aria-label="Копировать блок кода">Копировать</button></div>
<div class="core-content"><pre class="core-m-t-0x core-m-b-0x core-b-r-0x core-p-8x"><code>${esc(text)}</code></pre></div>
</div>`;
}
function demo(id) {
 const e=examples.find(e=>e.id===id);
 if(!e) throw new Error(`Unknown example ${id}`);
 if(e.css) throw new Error(`Custom CSS is not allowed: ${id}`);
 return `<div class="example core-col core-g-0x core-w-full core-border core-b-r-6x core-crop core-m-t-8x core-m-b-12x" data-example="${id}" data-width="auto">
<div class="demo-toolbar core-row core-y-center core-g-3x core-p-6x core-bg-surface core-border core-border-b"><span class="core-text core-text-xs core-text-bold">Ширина</span><div class="core-row core-g-2x" role="group" aria-label="Ширина примера ${id}">${widths.map(w=>`<button type="button" class="demo-width ${button} core-text-xs core-p-l-4x core-p-r-4x${w==='auto'?' core-button-accent':''}" data-width="${w}" aria-pressed="${w==='auto'}">${w==='auto'?'Auto':w}</button>`).join('')}</div><output class="demo-metrics core-text core-text-xs core-muted-4x core-grow core-text-right"></output></div>
<p class="demo-status core-text core-text-s core-p-8x" role="status">Откройте раздел для загрузки примера.</p>
<div class="demo-error-actions core-p-8x core-hide"><button type="button" class="retry-demo ${button}">Повторить загрузку</button></div>
<div class="demo-viewport core-w-full core-crop core-bg"><div class="demo-canvas core-col core-w-auto core-h-unset core-crop"><iframe class="core-abs core-abs-center core-w-auto core-h-unset core-ghost" title="${esc(e.id+'. '+e.title)}" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div></div>
<details class="example-code core-border core-border-t"><summary class="core-row core-nowrap core-y-center core-g-4x core-text core-text-s core-text-bold core-p-8x core-cursor:pointer"><span class="code-chevron core-icon-chevron-right core-icon-xs" aria-hidden="true"></span>Код примера <span class="core-muted-4x">· ${id}</span></summary><div class="core-p-8x core-p-t-0x">${codeBlock(e.html,'HTML')}${e.js?codeBlock(e.js,'JavaScript'):''}</div></details>
</div>`;
}
function chapterFooter(index) {
 const previous=chapters[index-1], next=chapters[index+1];
 const link=(c,label,icon)=>c?`<a class="core-col core-g-3x core-shrink core-color core-p-8x core-border core-b-r-4x" href="#${c.id}"><span class="core-row core-y-center core-g-3x core-text core-text-xs core-muted-4x"><span class="core-icon-${icon} core-icon-xs" aria-hidden="true"></span>${label}</span><span class="core-text core-text-s core-text-bold">${esc(c.navTitle)}</span></a>`:'<span></span>';
 return `<footer class="chapter-footer core-grid core-grid-2c core-g-8x core-border core-border-t core-p-t-16x core-m-t-24x" aria-label="Переходы по руководству">${link(previous,'Предыдущий раздел','arrow-left')}${link(next,'Следующий раздел','arrow-right')}</footer>`;
}
for(const [index,c] of chapters.entries()) {
 const body=read(`docs/chapters/${c.id}.md`,'utf8');
 let n=0;const headings=[];const renderer=new Renderer();
 renderer.heading=function({tokens,depth}) {
  const title=this.parser.parseInline(tokens),plain=title.replace(/<[^>]+>/g,'');
  const exampleId=plain.match(/^(E\d+)\./)?.[1];
  const id=depth===1?`${c.id}--title`:exampleId?`${c.id}--${exampleId.toLowerCase()}`:`${c.id}--s${++n}`;
  if(depth>1)headings.push({id,title:plain,depth});
  const permalink=`<a class="heading-link core-color core-muted-6x core-text-s core-m-l-3x" href="#${id}" aria-label="Ссылка на раздел: ${esc(plain)}">#</a>`;
  if(depth===1) return `<header class="chapter-header core-border core-border-b core-p-b-14x core-m-b-14x"><p class="core-text core-text-xs core-text-upper core-text-bold core-muted-4x core-m-b-6x">${esc(c.group)} / ${esc(c.navTitle)}</p><h1 id="${id}" tabindex="-1" class="core-text core-text-xxl m-core-text-xl core-text-bold">${title}</h1></header>`;
  return `<h${depth} id="${id}" tabindex="-1" class="core-text core-text-l core-text-bold core-m-t-18x core-m-b-6x"${depth===2?' style="--f-s:1.5em"':''}>${title}${permalink}</h${depth}>\n`;
 };
 renderer.link=function({href,title,tokens}) {
  let target=href;const file=href?.split('/').pop()?.split('#')[0],found=chapters.find(x=>`${x.id}.md`===file);
  if(found)target='#'+found.id;else if(href==='../README.md')target='#overview';else if(href?.startsWith('../'))target=href.slice(3);
  return `<a class="core-link" href="${esc(target)}"${title?` title="${esc(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;
 };
 renderer.code=({text,lang})=>codeBlock(text,lang);
 const marked=new Marked({renderer,gfm:true});
 const tokens=marked.lexer(body);
 // The canonical demo source already appears in Markdown immediately before its
 // marker. Move only those exact code tokens into the card, keeping other snippets.
 for(let i=0;i<tokens.length;i++) {
  const id=tokens[i].type==='html'&&tokens[i].text.match(/^<!-- demo:(E\d+) -->/)?.[1];
  if(!id)continue;
  const e=examples.find(e=>e.id===id),sources=[e.html,e.js].filter(Boolean).reverse();
  let j=i-1;
  for(const source of sources) {
   while(tokens[j]?.type==='space')j--;
   if(tokens[j]?.type!=='code'||tokens[j].text.trim()!==source.trim()) throw new Error(`Demo source is not adjacent to ${id}`);
   tokens[j--].omit=true;
  }
 }
 let html='',prose=[];
 const flush=()=>{
  if(!prose.some(t=>t.type!=='space')){prose=[];return;}
  let content=marked.parser(prose);
  content=content.replaceAll('<table>','<div class="core-table-container"><table class="core-table core-table-bordered-h">').replaceAll('</table>','</table></div>');
  const source=prose.some(t=>t.type==='paragraph'&&t.text.startsWith('**Источник:'));
  html+=`<div class="prose core-content core-text m-core-text-s${source?' core-text-s core-muted-4x core-border core-border-t core-p-t-8x core-m-t-16x':''}">${content}</div>`;prose=[];
 };
 for(const token of tokens) {
  if(token.omit||(token.type==='paragraph'&&token.text.startsWith('[Оглавление](../README.md)')))continue;
  const demoId=token.type==='html'&&token.text.match(/^<!-- demo:(E\d+) -->/)?.[1];
  if(token.type==='heading'||token.type==='code'||demoId) {
   flush();html+=demoId?demo(demoId):marked.parser([token]);
   if(token.type==='heading'&&token.depth===1&&c.id==='overview') {
    html+=`<div class="core-row core-g-14x core-border core-border-b core-p-b-10x core-m-b-20x" aria-label="Состав руководства">${[['42','раздела'],['82','примера'],['10 JS','модулей']].map(([value,label])=>`<div class="core-col core-g-3x"><span class="core-text core-text-l core-text-bold">${value}</span><span class="core-text core-text-xs core-muted-4x">${label}</span></div>`).join('')}</div>`;
   }
  } else {if(token.type==='paragraph'&&token.text.startsWith('**Источник:'))flush();prose.push(token);}
 }
 flush();
 pages.push(`<article id="${c.id}" class="chapter${c.id==='overview'?'':' core-hide'}">${html}${chapterFooter(index)}</article>`);
 const sections=body.split(/(?=^#{2,6} )/m);
 searchSections.push({id:c.id,chapter:c.id,chapterTitle:c.navTitle,title:c.title,text:sections[0]});
 sections.slice(1).forEach((text,i)=>searchSections.push({id:headings[i]?.id||c.id,chapter:c.id,chapterTitle:c.navTitle,title:headings[i]?.title||c.title,text}));
 const item=`<div class="nav-item core-col core-g-0x" data-chapter="${c.id}"><a class="nav-link core-row core-nowrap core-y-center core-g-3x core-text core-text-s core-p-5x core-b-r-3x core-color" data-chapter="${c.id}" href="#${c.id}"><span class="core-grow core-shrink">${esc(c.navTitle)}</span><span class="nav-chevron core-icon-chevron-right core-icon-xs" aria-hidden="true"></span></a><div class="nav-submenu core-col core-g-0x core-p-l-8x core-p-b-6x core-hide">${headings.map(h=>`<a class="nav-sublink core-border core-border-l core-border-transparent core-text core-text-xs core-color core-muted-4x core-p-4x" data-target="${h.id}" href="#${h.id}">${esc(h.title)}</a>`).join('')}</div></div>`;
 if(!groups.has(c.group))groups.set(c.group,[]);groups.get(c.group).push(item);
}
const navigation=[...groups].map(([name,items])=>`<section class="nav-group core-m-b-10x"><h2 class="core-text core-text-xs core-text-upper core-text-bold core-color core-muted-4x core-p-5x core-m-b-2x">${esc(name)}</h2>${items.join('\n')}</section>`).join('\n');
const data=JSON.stringify({version:185,chapters,examples,searchSections}).replaceAll('<','\\u003c');
const app=read('content/viewer/app.js','utf8').replaceAll('</script','<\\/script');
const html=`<!doctype html>
<html lang="ru" class="core-solo" data-theme="light" style="--rem-base:16px"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Core — руководство</title>
<meta name="description" content="Документация Core v185: 42 раздела, 82 живых примера, CSS и JavaScript.">
<link id="shell-core" rel="stylesheet" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'" href="https://cdn.sdelal.tech/core/latest/core.css">
<link id="shell-theme" rel="stylesheet" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'" href="https://cdn.sdelal.tech/core/latest/theme-nk.css">
</head><body class="core-bg core-color">
<div id="document-shell" class="core-row core-nowrap core-g-0x">
<a id="skip-link" class="core-fix core-fix-top-left core-button core-button-accent core-ghost" href="#main-content">К содержанию</a>
<div id="sidebar-slot" class="core-z-0 core-w-140x core-noshrink t-core-hide">
<aside id="sidebar" class="core-theme-dark core-bg core-color core-col core-g-0x core-w-140x core-h-100dvh core-fix core-fix-top-left">
<div class="core-row core-nowrap core-y-center core-g-6x core-p-10x core-border core-border-b"><a class="core-col core-g-2x core-grow core-color" href="#overview"><span class="core-row core-nowrap core-y-center core-g-5x core-text core-text-xl core-text-bold"><span class="core-w-8x core-h-8x core-border core-border-2x core-border-accent core-b-r-full" aria-hidden="true"></span>Core</span><span class="core-text core-text-xs core-muted-4x">Руководство по фреймворку</span></a><button id="menu-close" type="button" class="${button} core-hide t-core-show" aria-label="Закрыть меню"><span class="core-icon-close core-icon-s" aria-hidden="true"></span></button></div>
<nav id="chapter-nav" aria-label="Разделы руководства" class="core-grow core-shrink core-h-0x core-h-scroll core-p-6x core-p-t-10x">${navigation}</nav>
<footer class="core-col core-g-3x core-p-10x core-border core-border-t"><a class="core-text core-text-xs core-color" href="AGENTS.md">Документация для агента <span class="core-icon-arrow-right core-icon-xs" aria-hidden="true"></span></a><span class="core-text core-text-xs core-muted-4x">Core v185 · 42 раздела · 82 примера</span></footer>
</aside></div>
<div id="workspace" class="core-z-0 core-grow core-shrink">
<header class="topbar core-sticky core-row core-nowrap core-y-center core-g-6x m-core-g-4x core-p-8x core-p-l-20x core-p-r-20x m-core-p-6x m-core-p-l-8x m-core-p-r-8x core-bg core-border core-border-b">
<button id="menu-button" type="button" class="${button} core-hide t-core-show" aria-controls="mobile-menu" aria-expanded="false" aria-label="Открыть разделы">Разделы</button>
<div class="core-input-box core-grow core-shrink core-m-w-s" role="search"><span class="core-icon-search core-icon-s" aria-hidden="true"></span><input id="search" type="search" class="core-input core-shrink" placeholder="Поиск по руководству…" aria-label="Поиск по руководству" autocomplete="off"><kbd class="core-kbd core-text-xs core-noshrink core-muted-4x m-core-hide">⌘ K</kbd></div>
<div class="core-row core-nowrap core-y-center core-g-6x core-grow core-text-right"><button id="theme-toggle" type="button" class="${button}" aria-pressed="false"><span class="core-text" aria-hidden="true">◐</span><span class="theme-label m-core-hide">Тёмная тема</span></button><span class="core-badge core-badge-s t-core-hide">CDN latest</span></div>
</header>
<main id="main-content" tabindex="-1" class="core-section core-text m-core-text-s core-g-0x core-m-w-l core-p-20x m-core-p-8x m-core-p-t-14x" style="--f-s-s:0.875rem;--l-h-m:1.45em">
<p id="shell-status" class="core-text core-text-s core-p-6x" role="status">Загрузка оформления с CDN…</p>
<section id="search-results" class="core-hide" aria-label="Результаты поиска"></section>${pages.join('\n')}
</main></div></div>
<div id="mobile-menu" class="core-popup-box core-p-0x core-hide" role="dialog" aria-modal="true" aria-label="Разделы руководства">
<div id="menu-overlay" class="core-popup-overlay" aria-hidden="true"></div><div id="mobile-panel" class="core-popup core-popup-left core-w-140x"></div>
</div>
<script id="manual-data" type="application/json">${data}</script>
<script>${app}</script>
</body></html>\n`;
write('docs/index.html',html);
console.log(`Built ${chapters.length} chapters, ${examples.length} examples, ${searchSections.length} search sections`);
