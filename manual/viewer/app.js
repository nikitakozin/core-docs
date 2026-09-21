/* Поведение документации. Оформление полностью задаётся CDN Core. */
(() => {
 'use strict';
 const data=JSON.parse(document.getElementById('manual-data').textContent);
 const root=document.documentElement,chapters=new Map(data.chapters.map(c=>[c.id,c])),examples=new Map(data.examples.map(e=>[e.id,e]));
 const instances=new Map(),search=document.getElementById('search'),results=document.getElementById('search-results'),sidebar=document.getElementById('sidebar'),nav=document.getElementById('chapter-nav'),menuButton=document.getElementById('menu-button'),themeButton=document.getElementById('theme-toggle');
 const norm=value=>String(value).toLocaleLowerCase('ru').replaceAll('ё','е');
 const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const visible=(node,show)=>node.classList.toggle('core-hide',!show);
 let activeId='',activeHeadings=[],anchorLock=null,anchorTimer=0,theme='light';
 try {if(localStorage.getItem('core-docs-theme')==='dark') theme='dark';} catch {}
 function closeMenu(restoreFocus=false){sidebar.classList.add('t-core-hide');menuButton.setAttribute('aria-expanded','false');if(restoreFocus)menuButton.focus();}
 menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';sidebar.classList.toggle('t-core-hide',!open);menuButton.setAttribute('aria-expanded',String(open));});
 matchMedia('(min-width:998px)').addEventListener('change',()=>closeMenu());
 function releaseAnchor(){clearTimeout(anchorTimer);anchorLock=null;}
 function positionAnchor(){if(anchorLock){document.getElementById(anchorLock)?.scrollIntoView({block:'start',behavior:'instant'});}}
 for(const event of ['wheel','touchstart','pointerdown']) window.addEventListener(event,releaseAnchor,{passive:true});
 function setActiveSubsection(id){nav.querySelectorAll('.nav-sublink').forEach(link=>{const active=link.dataset.target===id;link.classList.toggle('core-text-bold',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
 let scrollQueued=false;
 window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;if(search.value||anchorLock)return;let current='';for(const h of activeHeadings){if(h.getBoundingClientRect().top<=48)current=h.id;else break;}setActiveSubsection(current);});},{passive:true});
 function route(){
  let target;try{target=decodeURIComponent(location.hash.slice(1))||'overview';}catch{target='overview';}
  const candidate=target.split('--')[0],id=chapters.has(candidate)?candidate:'overview';if(!document.getElementById(target))target=id;
  activeId=id;search.value='';results.replaceChildren();visible(results,false);
  document.querySelectorAll('.chapter').forEach(node=>visible(node,node.id===id));
  nav.querySelectorAll('.nav-item').forEach(item=>{const active=item.dataset.chapter===id,link=item.querySelector('.nav-link');visible(item.querySelector('.nav-submenu'),active);link.classList.toggle('core-bg-surface',active);link.classList.toggle('core-text-bold',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  document.title=`${chapters.get(id).navTitle} — Core`;activeHeadings=[...document.querySelectorAll(`#${CSS.escape(id)} h2[id], #${CSS.escape(id)} h3[id]`)];
  closeMenu();releaseAnchor();if(target.includes('--')){anchorLock=target;anchorTimer=setTimeout(releaseAnchor,18000);}
  document.querySelectorAll(`#${CSS.escape(id)} .example`).forEach(card=>{if(card.dataset.loaded!=='true')loadDemo(card);else{layoutDemo(instances.get(card.dataset.example));sendTheme(instances.get(card.dataset.example));}});
  requestAnimationFrame(()=>{if(anchorLock){positionAnchor();setActiveSubsection(target);}else window.scrollTo({top:0,behavior:'instant'});});
 }
 window.addEventListener('hashchange',route);
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&link.hash===location.hash){event.preventDefault();route();}});
 const searchIndex=data.searchSections.map(item=>({...item,normalized:norm(item.title+' '+item.text)}));
 function runSearch(){
  releaseAnchor();const q=norm(search.value.trim());results.replaceChildren();visible(results,Boolean(q));document.querySelectorAll('.chapter').forEach(node=>visible(node,!q&&node.id===activeId));if(!q)return;
  const words=q.split(/\s+/),hits=searchIndex.filter(item=>words.every(word=>item.normalized.includes(word)));hits.sort((a,b)=>Number(norm(b.title).includes(q))-Number(norm(a.title).includes(q)));
  const h=document.createElement('h1');h.textContent='Результаты поиска';const count=document.createElement('p');count.textContent=`Совпадений: ${hits.length}${hits.length>80?' · первые 80':''}`;results.append(h,count);
  if(!hits.length){const empty=document.createElement('p');empty.textContent='Совпадений нет. Попробуйте имя класса или компонента.';results.append(empty);}
  hits.slice(0,80).forEach(item=>{const link=document.createElement('a');link.className='search-item core-card core-col core-g-4x core-m-b-6x';link.href='#'+item.id;const label=document.createElement('span');label.className='core-text core-text-xs';label.textContent=item.chapterTitle;const title=document.createElement('span');title.className='core-text core-text-bold';title.textContent=item.title;const snippet=document.createElement('span');snippet.className='core-text core-text-s';const pos=norm(item.text).indexOf(words[0]),start=Math.max(0,pos-50);snippet.textContent=(start?'…':'')+item.text.slice(start,start+200);link.append(label,title,snippet);results.append(link);});
 }
 search.addEventListener('input',runSearch);
 document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();window.scrollTo({top:0,behavior:'instant'});search.focus();}if(event.key==='Escape'){if(menuButton.getAttribute('aria-expanded')==='true')closeMenu(true);else if(search.value){search.value='';runSearch();}}if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key))releaseAnchor();});
 document.querySelectorAll('.copy-button').forEach(button=>button.addEventListener('click',async()=>{
  const text=button.parentElement.querySelector('code').textContent;try{
   if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(text);
   else{const area=document.createElement('textarea');area.value=text;area.className='core-fix core-fix-top-left core-ghost';document.body.append(area);try{area.select();if(!document.execCommand('copy'))throw new Error('clipboard');}finally{area.remove();button.focus();}}
   button.textContent='Скопировано';
  }catch{button.textContent='Выделите код вручную';}
  setTimeout(()=>button.textContent='Копировать',1600);
 }));
  function childRuntime(config) {
    'use strict';
    let ready=false, finished=false, timer=0, warning='';
    let scriptReady=!config.hasScript, coreReady=false;
    const main=document.getElementById('demo-root');
    const core=document.getElementById('core-css');
    const nk=document.getElementById('nk-css');
    const send=(state,detail='') => {
      const bounds=main.getBoundingClientRect();
      // A hidden chapter has no layout. Preserve its last measured size.
      const measurable=bounds.width>0 && bounds.height>0;
      if(state==='resize' && !measurable) return;
      const height=Math.ceil(bounds.height);
      parent.postMessage({type:'core-docs-demo',id:config.id,token:config.token,state,detail,
        height:measurable ? (config.fixedHeight || Math.max(64,height)) : undefined,width:innerWidth},'*');
    };
    const measure=() => { clearTimeout(timer); timer=setTimeout(() => {if(ready) send('resize');},35); };
    const fail=detail => {
      if (finished) return; finished=true; send('error',detail);
    };
    function verify() {
      if (finished) return;
      const probe=document.createElement('div'); probe.className='core-row core-abs core-ghost'; document.body.append(probe);
      const ok=getComputedStyle(probe).display==='flex' && getComputedStyle(document.documentElement).getPropertyValue('--rem-base').trim()!=='';
      probe.remove();
      if (!ok) return fail('Основные правила Core не обнаружены.');
      coreReady=true;
      if (!scriptReady) return;
      finished=true; ready=true; send('ok');
      new ResizeObserver(measure).observe(main);
      window.addEventListener('resize',measure);
      document.addEventListener('toggle',measure,true);
      document.addEventListener('input',measure);
      document.fonts.ready.then(measure);
      if (warning) send('warning',warning);
    }
    window.addEventListener('core-docs-script-ready',()=>{scriptReady=true;if(coreReady) verify();});
    window.addEventListener('error',event=>send('error','Ошибка JavaScript: '+(event.message || 'модуль не загрузился')));
    window.addEventListener('unhandledrejection',event=>send('error','Ошибка JavaScript: '+String(event.reason?.message || event.reason)));
    core.addEventListener('load',verify);
    core.addEventListener('error',() => fail('Core CSS не загрузился с CDN.'));
    if (core.dataset.state==='error') fail('Core CSS не загрузился с CDN.');
    else if (core.sheet || core.dataset.state==='ok') setTimeout(verify,0);
    setTimeout(() => fail('Нет ответа от CDN. Проверьте подключение.'),16000);
    const themeFailed=() => {
      warning='Тема NK недоступна. Показан базовый Core; проверьте доступ к CDN.';
      if (ready) send('warning',warning);
    };
    nk.addEventListener('load',measure); nk.addEventListener('error',themeFailed);
    if (nk.dataset.state==='error') themeFailed();
    window.addEventListener('message',event => {
      const message=event.data;
      if (event.source!==parent || !message || message.type!=='core-docs-settings' || message.token!==config.token) return;
      if (message.theme!=='light' && message.theme!=='dark') return;
      document.documentElement.dataset.theme=message.theme;
      measure();
    });
    document.addEventListener('submit',event => event.preventDefault());
    document.addEventListener('click',event => {if(event.target.closest('a')) event.preventDefault();});
  }
  function iframeDocument(example, token) {
    const config={id:example.id,token,hasScript:Boolean(example.js),fixedHeight:example.fixedHeight || (example.chapter==='popups'?example.height:0)};
    const script=`(${childRuntime.toString()})(${JSON.stringify(config)});`;
    const styles=(example.styles||[]).map(url=>`<link rel="stylesheet" href="${esc(url)}">`).join('');
    const module=example.js ? `<script type="module">${example.js.replace(/<\/script/gi,'<\\/script')}\nwindow.dispatchEvent(new Event('core-docs-script-ready'));<\/script>` : '';
    return `<!doctype html><html lang="ru" class="core-solo" data-theme="${esc(theme)}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.sdelal.tech; script-src 'unsafe-inline' https://cdn.sdelal.tech; img-src data: https:; font-src https: data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<link id="core-css" rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/core.css" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'">
<link id="nk-css" rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/theme-nk.css" onload="this.dataset.state='ok'" onerror="this.dataset.state='error'">
${styles}</head>
<body class="core-bg core-color"><main id="demo-root" class="core-col core-g-0x core-p-8x">${example.html}</main><script>${script}<\/script>${module}</body></html>`;
  }
  function layoutDemo(instance) {
    if (!instance) return;
    const {card,frame}=instance;
    const area=card.querySelector('.demo-viewport');
    const available=area.clientWidth;
    if (!available) return;
    const mode=card.dataset.width || 'auto';
    const width=mode==='auto'?available:Number(mode);
    const scale=Math.min(1,available/width);
    const height=instance.ready?Math.min(8000,Math.max(64,instance.height)):0;
    frame.style.setProperty('--w',width+'px'); frame.style.setProperty('--h',(height || 180)+'px');
    frame.style.setProperty('--tr',`translate(-50%, -50%) scale(${scale})`);
    const canvas=card.querySelector('.demo-canvas');
    canvas.style.setProperty('--w',Math.min(available,width)+'px'); canvas.style.setProperty('--h',Math.ceil((height || 180)*scale)+'px');
    card.querySelector('.demo-metrics').textContent=`${Math.round(width)} px${scale<.995?' · '+Math.round(scale*100)+'%':''}`;
    instance.width=width; instance.scale=scale;
  }
  function sendTheme(instance) {
    if (instance) instance.frame.contentWindow.postMessage({type:'core-docs-settings',token:instance.token,theme},'*');
  }
  function loadDemo(card) {
    const example=examples.get(card.dataset.example); if (!example) return;
    const old=instances.get(example.id); if (old) clearTimeout(old.timeout);
    const frame=card.querySelector('iframe');
    const token=globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const instance={card,frame,token,ready:false,height:example.fixedHeight || example.height || 180,width:0};
    instances.set(example.id,instance);
    card.dataset.loaded='true'; card.dataset.ok='false';
    const status=card.querySelector('.demo-status'); visible(status,true); status.dataset.state='loading'; status.textContent='Загрузка Core с CDN…';
    visible(card.querySelector('.demo-error-actions'),false); frame.classList.add('core-ghost');
    layoutDemo(instance);
    frame.srcdoc=iframeDocument(example,token);
    instance.timeout=setTimeout(() => {
      if (!instance.ready) showError(instance,'Нет ответа от CDN. Проверьте подключение.');
    },18500);
  }
  function showError(instance, detail) {
    const status=instance.card.querySelector('.demo-status');
    instance.ready=false; instance.card.dataset.ok='false';
    status.dataset.state='error'; status.textContent=detail; visible(status,true);
    visible(instance.card.querySelector('.demo-error-actions'),true); instance.frame.classList.add('core-ghost');
    layoutDemo(instance);
  }
  window.addEventListener('message',event => {
    const message=event.data;
    if (!message || message.type!=='core-docs-demo' || typeof message.id!=='string') return;
    const instance=instances.get(message.id);
    if (!instance || event.source!==instance.frame.contentWindow || message.token!==instance.token) return;
    const status=instance.card.querySelector('.demo-status');
    if (message.state==='error') { clearTimeout(instance.timeout); showError(instance,message.detail||'Не удалось загрузить Core.'); }
    if (message.state==='ok') {
      clearTimeout(instance.timeout); instance.ready=true; instance.card.dataset.ok='true';
      status.dataset.state='ok'; status.textContent=''; visible(status,false); instance.frame.classList.remove('core-ghost'); sendTheme(instance);
    }
    if (message.state==='warning' && instance.ready) {visible(status,true);status.dataset.state='warning';status.textContent=message.detail;}
    if ((message.state==='ok'||message.state==='resize') && instance.ready && Number.isFinite(message.height)) {
      instance.height=message.height; layoutDemo(instance);
      if (anchorLock && instance.card.closest('.chapter').id===activeId) requestAnimationFrame(positionAnchor);
    }
  });
  document.querySelectorAll('.example').forEach(card => {
    card.querySelector('.demo-width').addEventListener('change',event=>{ releaseAnchor(); card.dataset.width=event.target.value; layoutDemo(instances.get(card.dataset.example)); });
    card.querySelector('.retry-demo').addEventListener('click',() => loadDemo(card));
  });
  const areaObserver=new ResizeObserver(entries => {
    entries.forEach(entry => layoutDemo(instances.get(entry.target.closest('.example').dataset.example)));
  });
  document.querySelectorAll('.demo-viewport').forEach(area => areaObserver.observe(area));
  function applyTheme() {
    releaseAnchor(); root.dataset.theme=theme;
    themeButton.setAttribute('aria-pressed',String(theme==='dark'));
    themeButton.setAttribute('aria-label',theme==='dark'?'Включить светлую тему':'Включить тёмную тему');
    themeButton.querySelector('.theme-label').textContent=theme==='dark'?'Светлая':'Тёмная';
    instances.forEach(sendTheme);
    try {localStorage.setItem('core-docs-theme',theme);} catch { /* Storage необязателен. */ }
  }
  themeButton.addEventListener('click',() => {theme=theme==='dark'?'light':'dark';applyTheme();});
  let printState=[];
  window.addEventListener('beforeprint',() => {
    printState=[...document.querySelectorAll('.example-code')].map(node => [node,node.open]);
    printState.forEach(([node]) => {node.open=true;});
  });
  window.addEventListener('afterprint',() => {printState.forEach(([node,open]) => {node.open=open;});});
  const shellStatus=document.getElementById('shell-status');
  function checkShell(){
    const probe=document.createElement('div');probe.className='core-row';document.body.append(probe);
    const ok=getComputedStyle(probe).display==='flex';probe.remove();
    if(!ok){shellStatus.textContent='Оформление Core не загрузилось. Проверьте доступ к CDN и обновите страницу.';visible(shellStatus,true);}
    else if(document.getElementById('shell-theme').dataset.state==='error'){shellStatus.textContent='Тема NK не загрузилась. Доступен базовый Core.';visible(shellStatus,true);}
    else visible(shellStatus,false);
  }
  for(const id of ['shell-core','shell-theme']) {
    document.getElementById(id).addEventListener('load',checkShell);
    document.getElementById(id).addEventListener('error',checkShell);
  }
  checkShell(); applyTheme(); route();
})();
