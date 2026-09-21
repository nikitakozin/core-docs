import {readFileSync as read, writeFileSync as write} from 'node:fs';
import {Marked, Renderer} from 'marked';
const json=path=>JSON.parse(read(path,'utf8'));
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const chapters=json('manual/chapters.json'), examples=json('manual/reference/examples.json').examples;
const searchSections=[], pages=[], nav=[];
const button='core-button core-button-s';
function demo(id){
 const e=examples.find(e=>e.id===id);if(!e) throw new Error(`Unknown example ${id}`);
 if(e.css) throw new Error(`Custom CSS is not allowed: ${id}`);
 return `<div class="example core-card core-col core-g-6x core-w-full core-p-6x" data-example="${id}">
<div class="core-row core-y-center core-g-4x core-w-full"><span class="core-badge core-badge-s">${id}</span><label class="core-row core-y-center core-g-4x"><span class="core-text core-text-s">Ширина</span><select class="demo-width core-select core-select-s" aria-label="Ширина примера ${id}">${['auto',390,720,721,997,998,1200].map(w=>`<option value="${w}">${w==='auto'?'По окну':w+' px'}</option>`).join('')}</select></label><output class="demo-metrics core-text core-text-xs"></output></div>
<p class="demo-status core-text core-text-s" role="status">Откройте раздел для загрузки примера.</p>
<div class="demo-error-actions core-hide"><button type="button" class="retry-demo ${button}">Повторить загрузку</button></div>
<div class="demo-viewport core-w-full core-crop"><div class="demo-canvas core-col core-w-auto core-h-unset core-crop"><iframe class="core-abs core-abs-center core-w-auto core-h-unset core-ghost" title="${esc(e.id+'. '+e.title)}" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div></div>
</div>`;
}
for(const c of chapters){
 const body=read(`manual/docs/${c.id}.md`,'utf8');let n=0;const headings=[];const renderer=new Renderer();
 renderer.heading=function({tokens,depth}){const title=this.parser.parseInline(tokens);const plain=title.replace(/<[^>]+>/g,'');const exampleId=plain.match(/^(E\d+)\./)?.[1];const id=depth===1?`${c.id}--title`:exampleId?`${c.id}--${exampleId.toLowerCase()}`:`${c.id}--s${++n}`;if(depth>1)headings.push({id,title:plain,depth});return `<h${depth} id="${id}" tabindex="-1">${title}</h${depth}>\n`;};
 renderer.link=function({href,title,tokens}){let target=href;const file=href?.split('/').pop()?.split('#')[0];const found=chapters.find(x=>`${x.id}.md`===file);if(found)target='#'+found.id;else if(href==='../README.md')target='#overview';else if(href?.startsWith('../'))target=href.slice(3);return `<a href="${esc(target)}"${title?` title="${esc(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;};
 renderer.code=function({text,lang}){return `<details class="core-m-t-6x core-m-b-8x"><summary class="core-text core-text-s core-text-bold core-cursor:pointer">Код · ${esc(lang||'текст')}</summary><div class="core-col core-g-4x"><button type="button" class="copy-button ${button}" aria-label="Копировать блок кода">Копировать</button><pre><code>${esc(text)}</code></pre></div></details>\n`;};
 const marked=new Marked({renderer,gfm:true});let html=marked.parse(body).replace(/<!-- demo:(E\d+) -->/g,(_,id)=>demo(id));
 // Native tables keep semantics and get Core's horizontal scrolling container.
 html=html.replaceAll('<table>','<div class="core-table-container"><table class="core-table core-table-bordered-h">').replaceAll('</table>','</table></div>');
 pages.push(`<article id="${c.id}" class="chapter core-content${c.id==='overview'?'':' core-hide'}">${html}</article>`);
 const sections=body.split(/(?=^#{2,6} )/m);searchSections.push({id:c.id,chapter:c.id,chapterTitle:c.navTitle,title:c.title,text:sections[0]});
 sections.slice(1).forEach((text,i)=>searchSections.push({id:headings[i]?.id||c.id,chapter:c.id,chapterTitle:c.navTitle,title:headings[i]?.title||c.title,text}));
 nav.push(`<div class="nav-item core-col core-g-1x" data-chapter="${c.id}"><a class="nav-link core-text core-text-s core-p-3x core-b-r-2x core-w-full" data-chapter="${c.id}" href="#${c.id}">${esc(c.navTitle)}</a><div class="nav-submenu core-col core-g-1x core-p-l-6x core-p-0x core-hide">${headings.map(h=>`<a class="nav-sublink core-text core-text-xs core-p-2x" data-target="${h.id}" href="#${h.id}">${esc(h.title)}</a>`).join('')}</div></div>`);
}
const data=JSON.stringify({version:185,chapters,examples,searchSections}).replaceAll('<','\\u003c');
const app=read('manual/viewer/app.js','utf8').replaceAll('</script','<\\/script');
const html=`<!doctype html>
<html lang="ru" class="core-solo" data-theme="light"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Core — руководство</title>
<meta name="description" content="Документация Core v185: 42 раздела, 82 живых примера, CSS и JavaScript.">
<link id="shell-core" rel="stylesheet" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'" href="https://cdn.sdelal.tech/core/latest/core.css">
<link id="shell-theme" rel="stylesheet" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'" href="https://cdn.sdelal.tech/core/latest/theme-nk.css">
</head><body class="core-bg core-color">
<header class="topbar core-row t-core-col core-y-center core-g-8x core-p-10x m-core-p-6x core-bg-surface">
<a class="core-text core-text-xl core-text-bold" href="#overview">Core</a><span class="core-badge core-badge-s">Документация · v185</span>
<label class="core-row core-grow core-shrink t-core-w-full core-y-center core-g-4x"><span class="core-text core-text-s">Поиск</span><input id="search" type="search" class="core-input core-grow core-shrink" placeholder="Класс, компонент, API…" aria-label="Поиск по руководству" autocomplete="off"></label>
<div class="core-row core-g-4x"><button id="menu-button" type="button" class="${button} core-hide t-core-show" aria-controls="sidebar" aria-expanded="false">Разделы</button><button id="theme-toggle" type="button" class="${button}" aria-pressed="false"><span class="theme-label">Тёмная</span></button></div>
</header>
<p id="shell-status" class="core-text core-text-s core-p-6x" role="status">Загрузка оформления с CDN…</p>
<div class="core-row core-nowrap t-core-col core-g-12x core-p-10x m-core-p-6x">
<aside id="sidebar" class="core-w-128x core-noshrink core-sticky core-h-100dvh core-h-scroll t-core-w-full t-core-h-unset t-core-nosticky t-core-hide"><nav id="chapter-nav" aria-label="Разделы руководства" class="core-col core-g-2x core-p-b-12x">${nav.join('\n')}</nav></aside>
<main id="content" class="core-grow core-shrink t-core-w-full"><section id="search-results" class="core-content core-hide" aria-label="Результаты поиска"></section>${pages.join('\n')}</main>
</div>
<script id="manual-data" type="application/json">${data}</script>
<script>${app}</script>
</body></html>\n`;
write('manual/index.html',html);console.log(`Built ${chapters.length} chapters, ${examples.length} examples, ${searchSections.length} search sections`);
