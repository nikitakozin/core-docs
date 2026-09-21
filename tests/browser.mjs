import {chromium} from 'playwright';
import {readFileSync as read,writeFileSync as write,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const live=process.argv.includes('--live'),failuresOnly=process.argv.includes('--failures'),root=resolve('manual'),out=resolve('test-results');mkdirSync(out,{recursive:true});
const data=JSON.parse(read('manual/reference/examples.json','utf8')).examples;
const chapters=JSON.parse(read('manual/chapters.json','utf8'));
const checks=[],errors=[],intercepted={shell:0,iframe:0,modules:0};let browser;
const server=createServer((req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+sep))throw new Error('outside manual');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8'})[extname(path)]||'text/plain');res.end(read(path));}catch{res.writeHead(404).end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const url=`http://127.0.0.1:${server.address().port}/index.html`;
try {
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 if(!live){
  await context.route('https://cdn.sdelal.tech/core/latest/**',route=>{intercepted[route.request().frame().parentFrame()?'iframe':'shell']++;if(route.request().url().endsWith('.js'))intercepted.modules++;const name=new URL(route.request().url()).pathname.split('/').pop();try{return route.fulfill({body:read(`upstream/latest/${name}`),contentType:name.endsWith('.css')?'text/css':'text/javascript',headers:{'access-control-allow-origin':'*'}});}catch{return route.abort();}});
  await context.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//,route=>route.abort());
 }
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle',timeout:45000});
 await page.evaluate(()=>{window.demoMessages=[];addEventListener('message',e=>{if(e.data?.type==='core-docs-demo'&&e.data.state!=='resize')window.demoMessages.push({...e.data,at:Math.round(performance.now())});});});
 const waitFrame=async(target,predicate,arg)=>{try{return await target.waitForFunction(predicate,arg,{polling:100});}catch(error){console.error('Frame wait diagnostic',predicate.toString(),await target.evaluate(()=>({width:innerWidth,height:innerHeight,hidden:document.hidden})),await (await target.frameElement()).evaluate(e=>({style:e.getAttribute('style'),width:e.clientWidth,rect:e.getBoundingClientRect().toJSON(),card:e.closest('.example')?.dataset.width,active:e.closest('.chapter')?.className})));throw error;}};
 const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
 async function go(id){console.log("Chapter",id);await page.evaluate(id=>{location.hash=id;},id);await page.waitForFunction(id=>!document.getElementById(id).classList.contains('core-hide'),id);const ids=data.filter(e=>e.chapter===id).map(e=>e.id);if(ids.length)await page.waitForFunction(ids=>ids.every(id=>document.querySelector(`[data-example="${id}"]`).dataset.ok==='true'),ids,{timeout:25000});}
 const frame=async id=>{const node=page.locator(`[data-example="${id}"] iframe`);await node.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));return await node.elementHandle().then(e=>e.contentFrame());};
 check('shell CSS loaded',await page.locator('#shell-status').isHidden());
 check('42 chapters / 82 cards',await page.locator('.chapter').count()===42&&await page.locator('.example').count()===82);
 if(live){
  await go('js-state');check('live CDN module initializes',(await frame('E73'))!==null);
  await (await frame('E73')).locator('#plus').click();await waitFrame(await frame('E73'),()=>document.querySelector('#count').textContent==='1');checks.push('live state counter');
  await page.screenshot({path:resolve(out,'live-cdn.png'),fullPage:false});
 } else if(!failuresOnly) {
  await go('start');check('iframe CDN requests really use snapshot interception',intercepted.iframe>0);
  for(const c of chapters){await go(c.id);for(const e of data.filter(e=>e.chapter===c.id))checks.push(`${e.id} loads Core and initializes`);}
  check('all examples boot without runtime errors',errors.length===0);check('ESM requests really use snapshot interception',intercepted.modules>=8);
  await page.locator('#search').fill('core-icon-chevron');await page.waitForSelector('#search-results .search-item');check('search finds current API',await page.locator('#search-results .search-item').count()>0);await page.locator('#search-results .search-item').first().click();check('search opens section anchor',page.url().includes('--'));
  await go('js-state');const state=await frame('E73');await state.locator('#plus').click();await waitFrame(state,()=>document.querySelector('#count').textContent==='1');checks.push('state counter');
  await go('js-event');const event=await frame('E74');await event.locator('#send').click();await waitFrame(event,()=>document.querySelector('#log').textContent==='Первое → Второе');checks.push('event queue preserves both events');
  await go('js-resource');const resource=await frame('E75');await resource.locator('#load').click();await waitFrame(resource,()=>document.querySelector('#result').textContent.includes('Сайт театра'));await resource.locator('#fail').click();await waitFrame(resource,()=>document.querySelector('#result').textContent.includes('Учебная ошибка'));checks.push('resource success and error');
  await go('js-collapse');const collapse=await frame('E76');await collapse.locator('[data-collapse-show-only="files"]').click();check('collapse switches panel',await collapse.locator('#files').isVisible()&&!await collapse.locator('#brief').isVisible());
  await go('js-field');const field=await frame('E77');await field.locator('[data-field-num-plus]').click();check('number field step',await field.locator('#quantity').inputValue()==='4');await field.locator('#quantity').fill('12');await page.locator('#theme-toggle').click();await waitFrame(field,()=>document.documentElement.dataset.theme==='dark');check('theme preserves input',await field.locator('#quantity').inputValue()==='12');await go('overview');await go('js-field');check('chapter round trip preserves input',await field.locator('#quantity').inputValue()==='12');
  await go('js-popup');const popup=await frame('E80');check('dialog keeps configured viewport when restored',await popup.evaluate(()=>innerHeight===420));await popup.locator('[data-popup-trigger]').click();await popup.locator('#project-name').fill('Проверка темы');await page.locator('#theme-toggle').click();check('dialog and input survive theme',await popup.locator('[role="dialog"]').isVisible()&&await popup.locator('#project-name').inputValue()==='Проверка темы');await frame('E80');await popup.locator('[data-popup-close]').click();checks.push('dialog closes');
  await go('start');await page.locator('#start details').first().locator('summary').click();await page.locator('#start .copy-button').first().click();await page.waitForFunction(()=>[...document.querySelectorAll('#start .copy-button')].some(b=>b.textContent==='Скопировано'));checks.push('copy code');
  for(const width of [390,720,721,997,998,1440]){
   await page.setViewportSize({width,height:1000});await go('start');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));check(`no page overflow at ${width}`,bounds.scroll<=bounds.width+1);
   check(`menu visibility at ${width}`,await page.locator('#menu-button').isVisible()===(width<=997));
   if(width===390){await page.locator('#menu-button').click();check('mobile menu opens',await page.locator('#sidebar').isVisible());await page.keyboard.press('Escape');check('mobile menu closes',await page.locator('#sidebar').isHidden());}
   await page.locator('[data-example="E01"] .demo-width').selectOption('1200');const demo=await frame('E01');await waitFrame(demo,()=>innerWidth===1200);const box=await page.locator('[data-example="E01"] iframe').boundingBox();check(`full scaled viewport at ${width}`,box.width<=width&&Math.abs(await demo.evaluate(()=>innerWidth)-1200)<1);
   if([390,998,1440].includes(width))await page.screenshot({path:resolve(out,`manual-${width}.png`),fullPage:false});
  }
  await go('lists-tables');await page.locator('[data-example="E68"] .demo-width').selectOption('390');const registry=await frame('E68');await waitFrame(registry,()=>innerWidth===390);check('registry single column on mobile',await registry.locator('article').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length===1));
  await page.evaluate(()=>{window.hiddenMeasures=[];addEventListener('message',e=>{if(e.data?.id==='E68'&&e.data.state==='resize')window.hiddenMeasures.push(e.data.height);});});await go('overview');await registry.evaluate(()=>{dispatchEvent(new Event('resize'));return new Promise(done=>setTimeout(done,150));});check('hidden chapter preserves last iframe height',!await page.evaluate(()=>window.hiddenMeasures.includes(64)));
  await go('interaction');const motion=await frame('E58');await page.emulateMedia({reducedMotion:'reduce'});await waitFrame(motion,()=>!document.getElementById('progress-icon').classList.contains('core-animate:spin'));checks.push('reduced motion removes animation');await page.emulateMedia({reducedMotion:'no-preference'});await waitFrame(motion,()=>document.getElementById('progress-icon').classList.contains('core-animate:spin'));checks.push('motion preference change restores animation');
  // Verify changed upstream contracts in a real CSS engine, including the known mixed prefix.
  await go('start');const probe=await frame('E01');await probe.evaluate(()=>{document.getElementById('demo-root').innerHTML='<span id="icon" class="core-icon-plus core-icon-m m-core-icon-6x"></span><h2 id="heading" class="core-h core-h2">Заголовок</h2><div id="size" class="core-h-170x"></div><div id="position" class="core-fix m-core-fix-t">Позиция</div>';});
  for(const width of [720,721,997,998]){await page.locator('[data-example="E01"] .demo-width').selectOption(String(width));await waitFrame(probe,w=>innerWidth===w,width);const values=await probe.evaluate(()=>({icon:getComputedStyle(document.getElementById('icon'),'::before').width,height:getComputedStyle(document.getElementById('size')).height,top:getComputedStyle(document.getElementById('position')).top,t:getComputedStyle(document.getElementById('position')).getPropertyValue('--t').trim(),heading:getComputedStyle(document.getElementById('heading')).fontSize}));check(`icon cascade ${width}`,values.icon===(width<=720?'12px':'16px'));check(`170x resolves ${width}`,values.height==='340px');check(`mixed mobile alias ${width}`,width<=997?values.top==='0px':values.t==='');}
  await page.goto('file://'+resolve('manual/index.html'),{waitUntil:'networkidle'});check('standalone file opens',await page.locator('#shell-status').isHidden());
 }
 if(!live) {
  // Fresh contexts avoid Chromium's already-loaded stylesheet memory cache.
  for(const asset of ['core.css','theme-nk.css']) {
   const failureContext=await browser.newContext({viewport:{width:1440,height:1000}});let allowAsset=false,blockedRequests=0;
   await failureContext.route('https://cdn.sdelal.tech/core/latest/**',route=>{const name=new URL(route.request().url()).pathname.split('/').pop();if(name===asset&&!allowAsset){blockedRequests++;return route.abort();}return route.fulfill({body:read(`upstream/latest/${name}`),contentType:name.endsWith('.css')?'text/css':'text/javascript',headers:{'access-control-allow-origin':'*'}});});
   await failureContext.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//,route=>route.abort());const failed=await failureContext.newPage();await failed.goto(url+'#start',{waitUntil:'networkidle'});
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

 console.log(JSON.stringify({mode:live?'live':'snapshot',browser:browser.version(),passed:checks.length,errors,intercepted,checks},null,2));
 write(resolve(out,live?'live.json':failuresOnly?'failures.json':'browser.json'),JSON.stringify({mode:live?'live':'snapshot',browser:browser.version(),passed:checks.length,errors,intercepted,checks},null,2)+'\n');
} catch(error){console.error(error);if(browser){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:resolve(out,live?'failure-live.png':'failure-snapshot.png'),fullPage:false}).catch(()=>{});console.error('Recent messages',await page.evaluate(()=>window.demoMessages?.slice(-5)));console.error(await page.locator('.demo-status[data-state="error"]').evaluateAll(nodes=>nodes.map(n=>({id:n.closest('[data-example]').dataset.example,text:n.textContent})))); for(const f of page.frames()) {if(await f.locator('#log').count())console.error('Event diagnostic',await f.evaluate(()=>({text:document.getElementById('log').textContent,pending:window.EventEmitter?.pendingEvents.size,iframeWidth:innerWidth})));}}}process.exitCode=1;
} finally {await browser?.close();await new Promise(done=>server.close(done));}
