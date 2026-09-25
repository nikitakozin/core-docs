import {chromium} from 'playwright';
import {readFileSync as read,writeFileSync as write,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
import {checkNkui} from './nkui.mjs';
const failuresOnly=process.argv.includes('--failures'),root=resolve('docs'),out=resolve('test-results');mkdirSync(out,{recursive:true});
const data=JSON.parse(read('docs/reference/examples.json','utf8')).examples;
const chapters=JSON.parse(read('docs/chapters.json','utf8'));
const checks=[],errors=[],cdnResponses={shell:0,iframe:0,modules:0};let browser;
const server=createServer((req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+sep))throw new Error('outside docs');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8'})[extname(path)]||'text/plain');res.end(read(path));}catch{res.writeHead(404).end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const url=`http://127.0.0.1:${server.address().port}/index.html`;
try {
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 context.on('response',response=>{
  if(!response.url().startsWith('https://cdn.sdelal.tech/core/latest/'))return;
  if(!response.ok()){errors.push(`CDN HTTP ${response.status()}: ${response.url()}`);return;}
  cdnResponses[response.request().frame().parentFrame()?'iframe':'shell']++;
  if(response.url().endsWith('.js'))cdnResponses.modules++;
 });
 context.on('requestfailed',request=>{if(request.url().startsWith('https://cdn.sdelal.tech/core/latest/'))errors.push(`CDN request failed: ${request.url()}: ${request.failure()?.errorText}`);});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle',timeout:45000});
 await page.evaluate(()=>{window.demoMessages=[];addEventListener('message',e=>{if(e.data?.type==='core-docs-demo'&&e.data.state!=='resize')window.demoMessages.push({...e.data,at:Math.round(performance.now())});});});
 const waitFrame=async(target,predicate,arg)=>{try{return await target.waitForFunction(predicate,arg,{polling:100});}catch(error){console.error('Frame wait diagnostic',predicate.toString(),await target.evaluate(()=>({width:innerWidth,height:innerHeight,hidden:document.hidden})),await (await target.frameElement()).evaluate(e=>({style:e.getAttribute('style'),width:e.clientWidth,rect:e.getBoundingClientRect().toJSON(),card:e.closest('.example')?.dataset.width,active:e.closest('.chapter')?.className})));throw error;}};
 const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
 async function go(id){console.log("Chapter",id);await page.evaluate(id=>{location.hash=id;},id);await page.waitForFunction(id=>!document.getElementById(id).classList.contains('core-hide'),id);const ids=data.filter(e=>e.chapter===id).map(e=>e.id);if(ids.length)await page.waitForFunction(ids=>ids.every(id=>document.querySelector(`[data-example="${id}"]`).dataset.ok==='true'),ids,{timeout:25000});}
 const frame=async id=>{const node=page.locator(`[data-example="${id}"] iframe`);await node.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));return await node.elementHandle().then(e=>e.contentFrame());};
 check('shell CSS loaded',await page.locator('#shell-status').isHidden());
 check('42 chapters / 82 cards',await page.locator('.chapter').count()===42&&await page.locator('.example').count()===82);
 if(!failuresOnly) {
  await go('start');check('iframes load Core from the CDN',cdnResponses.iframe>0);
  const themeFrame=await frame('E01');
  const lightShell=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),lightFrame=await themeFrame.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  await page.locator('#theme-toggle').click();
  await waitFrame(themeFrame,()=>document.documentElement.dataset.theme==='dark');
  check('dark mode changes shell colors',await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)!==lightShell);
  check('dark mode changes iframe colors',await themeFrame.evaluate(()=>getComputedStyle(document.body).backgroundColor)!==lightFrame);
  await page.locator('#theme-toggle').click();await waitFrame(themeFrame,()=>document.documentElement.dataset.theme==='light');
  check('light mode restores iframe colors',await themeFrame.evaluate(()=>getComputedStyle(document.body).backgroundColor)===lightFrame);
  for(const c of chapters){await go(c.id);for(const e of data.filter(e=>e.chapter===c.id))checks.push(`${e.id} loads Core and initializes`);}
  check('all examples boot without runtime errors',errors.length===0);check('ESM modules load from the CDN',cdnResponses.modules>=8);
  for(const [chapter,id,selector,boundary] of [['forms','E66','',720],['layout','E07','.core-grid',720],['lists-tables','E67','li',720],['recipes','E70','.core-grid.t-core-grid-1c',997]]) {
   await go(chapter);const target=await frame(id);
   for(const width of [boundary+1,boundary]) {
    await page.locator(`[data-example="${id}"] .demo-width[data-width="${width}"]`).click();await waitFrame(target,w=>innerWidth===w,width);
    const boxes=await target.evaluate(({id,selector})=>{
     const nodes=id==='E66'?[document.querySelector('label[for="profile-name"]'),document.getElementById('profile-name')]:[...document.querySelector(selector).children];
     return nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
    },{id,selector});
    check(`${id} composition at ${width}`,width>boundary?boxes[1].x>=boxes[0].right:boxes.every((b,i)=>!i||(Math.abs(b.x-boxes[0].x)<1&&b.y>=boxes[i-1].bottom)));
   }
  }
  await page.locator('#search').fill('core-icon-chevron');await page.waitForSelector('#search-results .search-item');check('search finds current API',await page.locator('#search-results .search-item').count()>0);await page.locator('#search-results .search-item').first().click();check('search opens section anchor',page.url().includes('--'));
  await go('js-state');const state=await frame('E73');await state.locator('#plus').click();await waitFrame(state,()=>document.querySelector('#count').textContent==='1');checks.push('state counter');
  await go('js-event');const event=await frame('E74');await event.locator('#send').click();await waitFrame(event,()=>document.querySelector('#log').textContent==='Первое → Второе');checks.push('event queue preserves both events');
  await go('js-resource');const resource=await frame('E75');await resource.locator('#load').click();await waitFrame(resource,()=>document.querySelector('#result').textContent.includes('Сайт театра'));await resource.locator('#fail').click();await waitFrame(resource,()=>document.querySelector('#result').textContent.includes('Учебная ошибка'));checks.push('resource success and error');
  await go('js-collapse');const collapse=await frame('E76');await collapse.locator('[data-collapse-show-only="files"]').click();check('collapse switches panel',await collapse.locator('#files').isVisible()&&!await collapse.locator('#brief').isVisible());
  await go('js-field');const field=await frame('E77');await field.locator('[data-field-num-plus]').click();check('number field step',await field.locator('#quantity').inputValue()==='4');await field.locator('#quantity').fill('12');await page.locator('#theme-toggle').click();await waitFrame(field,()=>document.documentElement.dataset.theme==='dark');check('theme preserves input',await field.locator('#quantity').inputValue()==='12');await go('overview');await go('js-field');check('chapter round trip preserves input',await field.locator('#quantity').inputValue()==='12');
  await go('js-popup');const popup=await frame('E80');check('dialog keeps configured viewport when restored',await popup.evaluate(()=>innerHeight===420));await popup.locator('[data-popup-trigger]').click();await popup.locator('#project-name').fill('Проверка темы');await page.locator('#theme-toggle').click();check('dialog and input survive theme',await popup.locator('[role="dialog"]').isVisible()&&await popup.locator('#project-name').inputValue()==='Проверка темы');await frame('E80');await popup.locator('[data-popup-close]').click();checks.push('dialog closes');
  await go('start');await page.locator('#start .copy-button').first().click();await page.waitForFunction(()=>[...document.querySelectorAll('#start .copy-button')].some(b=>b.textContent==='Скопировано'));checks.push('copy code');
  for(const width of [390,720,721,997,998,1440]){
   await page.setViewportSize({width,height:1000});await go('start');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));check(`no page overflow at ${width}`,bounds.scroll<=bounds.width+1);
   check(`menu visibility at ${width}`,await page.locator('#menu-button').isVisible()===(width<=997));
   if(width===390){await page.locator('#menu-button').click();check('mobile menu opens',await page.locator('#sidebar').isVisible());await page.keyboard.press('Escape');check('mobile menu closes',await page.locator('#sidebar').isHidden());}
   await page.locator('[data-example="E01"] .demo-width[data-width="1200"]').click();const demo=await frame('E01');await waitFrame(demo,()=>innerWidth===1200);const box=await page.locator('[data-example="E01"] iframe').boundingBox();check(`full scaled viewport at ${width}`,box.width<=width&&Math.abs(await demo.evaluate(()=>innerWidth)-1200)<1);
   if([390,998,1440].includes(width))await page.screenshot({path:resolve(out,`manual-${width}.png`),fullPage:false});
  }
  await go('lists-tables');await page.locator('[data-example="E68"] .demo-width[data-width="390"]').click();const registry=await frame('E68');await waitFrame(registry,()=>innerWidth===390);check('registry single column on mobile',await registry.locator('article').first().evaluate(e=>{const boxes=[...e.children].map(n=>n.getBoundingClientRect());return boxes.every((b,i)=>!i||(Math.abs(b.x-boxes[0].x)<1&&b.y>=boxes[i-1].bottom));}));
  await page.evaluate(()=>{window.hiddenMeasures=[];addEventListener('message',e=>{if(e.data?.id==='E68'&&e.data.state==='resize')window.hiddenMeasures.push(e.data.height);});});await go('overview');await registry.evaluate(()=>{dispatchEvent(new Event('resize'));return new Promise(done=>setTimeout(done,150));});check('hidden chapter preserves last iframe height',!await page.evaluate(()=>window.hiddenMeasures.includes(64)));
  await go('interaction');const motion=await frame('E58');await page.emulateMedia({reducedMotion:'reduce'});await waitFrame(motion,()=>!document.getElementById('progress-icon').classList.contains('core-animate:spin'));checks.push('reduced motion removes animation');await page.emulateMedia({reducedMotion:'no-preference'});await waitFrame(motion,()=>document.getElementById('progress-icon').classList.contains('core-animate:spin'));checks.push('motion preference change restores animation');
  // Exact CSS assertions belong to the documented version, not the mutable alias.
  // All manual interactions above use latest; this isolated probe loads the manifest version from CDN.
  await go('start');const probe=await frame('E01');
  const versionBase=JSON.parse(read('docs/reference/source-manifest.json','utf8')).version_base;
  await probe.evaluate(async base=>{
   await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new Promise((done,fail)=>{
    link.onload=done;link.onerror=()=>fail(new Error(`Versioned CDN stylesheet failed: ${link.href}`));
    link.href=base+new URL(link.href).pathname.split('/').pop();
   })));
   document.getElementById('demo-root').innerHTML='<span id="icon" class="core-icon-plus core-icon-8x m-core-icon-6x"></span><h2 id="heading" class="core-h2">Заголовок</h2><div id="size" class="core-h-170x"></div><div id="position" class="core-fix m-core-fix-t">Позиция</div>';
  },versionBase);
  const updatedContracts=await probe.evaluate(()=>{
   const node=document.createElement('div');node.innerHTML='<span id="font-sample" class="core-text core-text-thin">Текст</span><div style="--t:40px;--b:20px;--b-r:32px"><span id="inherited-coordinates">Потомок</span></div><div id="directional-padding" class="core-p-t-4x"></div><div id="top-offset" class="core-fix core-t-64x t-core-t-56x m-core-t-64x"></div>';document.getElementById('demo-root').append(node);
   document.documentElement.style.setProperty('--f-s-base','20px');document.documentElement.style.fontSize='30px';
   return {font:getComputedStyle(document.getElementById('font-sample')).fontSize,weight:getComputedStyle(document.getElementById('font-sample')).fontWeight,padding:getComputedStyle(document.getElementById('directional-padding')).paddingTop,inherited:['--t','--b','--b-r'].map(name=>getComputedStyle(document.getElementById('inherited-coordinates')).getPropertyValue(name).trim())};
  });
  check('font scale follows Core base independently of html rem',updatedContracts.font==='20px');
  check('thin text uses weight 300',updatedContracts.weight==='300');
  check('directional padding works without a general padding token',updatedContracts.padding==='8px');
  check('coordinates and radius do not inherit into children',updatedContracts.inherited.every(value=>value===''));
  for(const width of [720,721,997,998]){await page.locator(`[data-example="E01"] .demo-width[data-width="${width}"]`).click();await waitFrame(probe,w=>innerWidth===w,width);const values=await probe.evaluate(()=>({icon:getComputedStyle(document.getElementById('icon'),'::before').width,height:getComputedStyle(document.getElementById('size')).height,top:getComputedStyle(document.getElementById('position')).top,t:getComputedStyle(document.getElementById('position')).getPropertyValue('--t').trim(),heading:getComputedStyle(document.getElementById('heading')).fontSize}));check(`icon cascade ${width}`,values.icon===(width<=720?'12px':'16px'));check(`170x resolves ${width}`,values.height==='340px');check(`mobile positioning alias ${width}`,width<=720?values.top==='0px':values.t==='');}
  for(const width of [720,721,997,998]){await page.locator(`[data-example="E01"] .demo-width[data-width="${width}"]`).click();await waitFrame(probe,w=>innerWidth===w,width);check(`56x/64x top coordinates at ${width}`,await probe.locator('#top-offset').evaluate(e=>getComputedStyle(e).top)===(width>720&&width<=997?'112px':'128px'));}
  await checkNkui(probe,versionBase,check,out);
  await page.goto('file://'+resolve('docs/index.html'),{waitUntil:'networkidle'});check('standalone file opens',await page.locator('#shell-status').isHidden());
 }
 {
  // Fresh contexts avoid Chromium's already-loaded stylesheet memory cache.
  for(const asset of ['core.css','theme-nk.css']) {
   const failureContext=await browser.newContext({viewport:{width:1440,height:1000}});let allowAsset=false,blockedRequests=0;
   await failureContext.route('https://cdn.sdelal.tech/core/latest/**',route=>{const name=new URL(route.request().url()).pathname.split('/').pop();if(name===asset&&!allowAsset){blockedRequests++;return route.abort();}return route.continue();});
   const failed=await failureContext.newPage();await failed.goto(url+'#start',{waitUntil:'networkidle'});
   check(`failure injected for ${asset}`,blockedRequests>0);
   if(asset==='core.css') {
    await failed.waitForSelector('[data-example="E01"] .demo-status[data-state="error"]');check('CDN error visible',await failed.locator('[data-example="E01"] .demo-error-actions').isVisible());
    allowAsset=true;await failed.locator('[data-example="E01"] .retry-demo').click();await failed.waitForFunction(()=>document.querySelector('[data-example="E01"]').dataset.ok==='true');checks.push('CDN retry recovers');
   } else {
    check('initial theme error is visible',(await failed.locator('#shell-status').textContent()).includes('Тема NK не загрузилась')&&await failed.locator('#shell-status').isVisible());
    allowAsset=true;await failed.reload({waitUntil:'networkidle'});check('theme recovery clears warning',await failed.locator('#shell-status').isHidden());
   }
   await failureContext.close();
  }
 }

 check('no unexpected runtime or CDN errors',errors.length===0);
 console.log(JSON.stringify({mode:'live',browser:browser.version(),passed:checks.length,errors,cdnResponses,checks},null,2));
 write(resolve(out,failuresOnly?'failures.json':'browser.json'),JSON.stringify({mode:'live',browser:browser.version(),passed:checks.length,errors,cdnResponses,checks},null,2)+'\n');
} catch(error){console.error(error);if(browser){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:resolve(out,'failure-live.png'),fullPage:false}).catch(()=>{});console.error('Recent messages',await page.evaluate(()=>window.demoMessages?.slice(-5)));console.error(await page.locator('.demo-status[data-state="error"]').evaluateAll(nodes=>nodes.map(n=>({id:n.closest('[data-example]').dataset.example,text:n.textContent})))); for(const f of page.frames()) {if(await f.locator('#log').count())console.error('Event diagnostic',await f.evaluate(()=>({text:document.getElementById('log').textContent,pending:window.EventEmitter?.pendingEvents.size,iframeWidth:innerWidth})));}}}process.exitCode=1;
} finally {await browser?.close();await new Promise(done=>server.close(done));}
