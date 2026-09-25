import {chromium} from 'playwright';
import {mkdirSync,readFileSync as read,writeFileSync as write} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

export async function checkMediaCrops(page,check) {
 await page.goto(new URL('#media',page.url()).href,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>['E52','E53'].every(id=>document.querySelector(`[data-example="${id}"]`).dataset.ok==='true'));
 for(const width of [390,1200]) {
  for(const id of ['E52','E53']) {
   const card=page.locator(`[data-example="${id}"]`);
   await card.locator(`.demo-width[data-width="${width}"]`).click();
   const frame=await card.locator('iframe').elementHandle().then(e=>e.contentFrame());
   await frame.waitForFunction(width=>innerWidth===width,width,{polling:100});
   const images=await frame.locator('.core-bg-img').evaluateAll(nodes=>nodes.map(img=>{
    const image=img.getBoundingClientRect(),box=img.parentElement.getBoundingClientRect();
    return {x:image.x,y:image.y,width:image.width,height:image.height,boxX:box.x,boxY:box.y,boxWidth:box.width,boxHeight:box.height,fit:getComputedStyle(img).objectFit};
   }));
   check(`${id} images fill their crop areas at ${width}`,images.length===(id==='E52'?3:1)&&images.every(img=>img.width>0&&img.height>0&&Math.abs(img.x-img.boxX)<1&&Math.abs(img.y-img.boxY)<1&&Math.abs(img.width-img.boxWidth)<1&&Math.abs(img.height-img.boxHeight)<1&&img.fit==='cover'));
   if(id==='E52')check(`media crop ratios at ${width}`,images.every((img,i)=>Math.abs(img.boxWidth/img.boxHeight-[1,4/3,16/9][i])<.01));
   else check(`natural image retains its ratio at ${width}`,await frame.locator('.core-img').evaluate(img=>Math.abs(img.getBoundingClientRect().width/img.getBoundingClientRect().height-img.naturalWidth/img.naturalHeight)<.01));
  }
 }
}

export async function checkCatalogue(page,check,out='test-results') {
 page.on('pageerror',error=>console.error('Catalogue page error',error.message));
 const examples=JSON.parse(read('docs/reference/examples.json','utf8')).examples;
 const ids=['E07','E08','E09','E10','E11','E18','E19','E20','E21','E23','E24','E26','E29','E30','E31','E32','E33','E34','E35','E36','E37','E38','E39','E40','E41','E42','E43','E44','E45','E46','E47','E48','E49','E52','E53','E54','E83','E84','E85','E86','E87'];
 const screenshots=new Set(['E23','E29','E35','E37','E48','E52','E54','E83','E84']);
 const frames=new Map(),geometry=[];
 mkdirSync(out,{recursive:true});
 async function go(chapter) {
  await page.evaluate(chapter=>{location.hash=chapter;},chapter);
  await page.waitForFunction(chapter=>!document.getElementById(chapter).classList.contains('core-hide'),chapter);
  const required=examples.filter(e=>e.chapter===chapter).map(e=>e.id);
  await page.waitForFunction(ids=>ids.every(id=>document.querySelector(`[data-example="${id}"]`).dataset.ok==='true'),required);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('#theme-select').selectOption('nkui');
 for(const mode of ['light','dark']) {
  if(await page.locator('html').getAttribute('data-theme')!==mode)await page.locator('#theme-toggle').click();
  for(const id of ids) {
   const example=examples.find(e=>e.id===id);await go(example.chapter);
   const card=page.locator(`[data-example="${id}"]`);
   console.log('Catalogue',id,mode);
   await card.locator('iframe').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   const frame=await card.locator('iframe').elementHandle().then(e=>e.contentFrame());frames.set(id,frame);
   await frame.waitForFunction(mode=>document.documentElement.dataset.theme===mode&&document.documentElement.dataset.design==='nkui',mode,{polling:100});
   // Narrow auto width exercises actual phone layout, not only a scaled desktop.
   await page.setViewportSize({width:390,height:844});
   await card.locator('.demo-width[data-width="auto"]').click();
   await frame.waitForFunction(()=>innerWidth<390,null,{polling:100});
   for(const size of ['mobile','desktop']) {
    if(size==='desktop') {
     await page.setViewportSize({width:1440,height:1000});
     await card.locator('.demo-width[data-width="1200"]').click();
     await frame.waitForFunction(()=>innerWidth===1200,null,{polling:100});
    }
    await card.locator('iframe').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    if(!example.fixedHeight)await frame.waitForFunction(()=>Math.ceil(document.getElementById('demo-root').getBoundingClientRect().height)<=innerHeight+1,null,{polling:100});
    const bounds=await frame.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:innerHeight,content:Math.ceil(document.getElementById('demo-root').getBoundingClientRect().height)}));
    geometry.push({id,mode,size,...bounds});
    if(bounds.scroll>bounds.width+1)console.error('Overflow',id,mode,size,bounds);
    check(`${id} ${mode} ${size} fits its frame`,bounds.scroll<=bounds.width+1);
    if(!example.fixedHeight)check(`${id} ${mode} ${size} has room for every row`,bounds.content<=bounds.height+1);
    if(mode==='light'&&screenshots.has(id))await frame.locator('#demo-root').screenshot({path:`${out}/catalogue-${id}-${size}.png`});
   }
  }
 }
 // These dense controls and galleries also exercise the other designs' metrics.
 await page.setViewportSize({width:390,height:844});
 for(const design of ['core','nk','ss'])for(const mode of ['light','dark']) {
  await page.locator('#theme-select').selectOption(design);
  if(await page.locator('html').getAttribute('data-theme')!==mode)await page.locator('#theme-toggle').click();
  for(const id of ['E29','E35','E41','E48','E83','E84']) {
   await go(examples.find(e=>e.id===id).chapter);
   const card=page.locator(`[data-example="${id}"]`),frame=frames.get(id);
   await card.locator('.demo-width[data-width="auto"]').click();
   await card.locator('iframe').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   await frame.waitForFunction(({design,mode})=>document.documentElement.dataset.design===design&&document.documentElement.dataset.theme===mode&&innerWidth<390,{design,mode},{polling:100});
   await frame.waitForFunction(()=>Math.ceil(document.getElementById('demo-root').getBoundingClientRect().height)<=innerHeight+1,null,{polling:100});
   const bounds=await frame.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:innerHeight,content:Math.ceil(document.getElementById('demo-root').getBoundingClientRect().height)}));
   geometry.push({id,design,mode,size:'mobile',...bounds});
   check(`${id} ${design}/${mode} fits on mobile`,bounds.scroll<=bounds.width+1&&bounds.content<=bounds.height+1);
  }
 }
 await page.locator('#theme-select').selectOption('nkui');
 write(`${out}/catalogue-geometry.json`,JSON.stringify(geometry,null,2)+'\n');
 await page.setViewportSize({width:1440,height:1000});
 await go('js-collapse');const collapse=frames.get('E85');
 await collapse.locator('#e85-files-toggle').click();
 check('independent collapses can both stay open',await collapse.locator('#e85-files').isVisible()&&await collapse.locator('#e85-note').isVisible());
 check('collapse exposes its expanded state',await collapse.locator('#e85-files-toggle').getAttribute('aria-expanded')==='true');
 await collapse.locator('#e85-note-toggle').click();
 check('independent collapse does not close its neighbor',await collapse.locator('#e85-files').isVisible()&&!await collapse.locator('#e85-note').isVisible());
 await collapse.locator('#e85-delivery-toggle').click();
 check('accordion opens one panel and closes the previous one',await collapse.locator('#e85-delivery').isVisible()&&!await collapse.locator('#e85-review').isVisible());
 await collapse.locator('#e85-delivery-toggle').click();
 check('repeated accordion click closes the active panel',!await collapse.locator('#e85-delivery').isVisible()&&await collapse.locator('#e85-delivery-toggle').getAttribute('aria-expanded')==='false');
 await collapse.locator('#e85-review-toggle').focus();await collapse.locator('#e85-review-toggle').press('Enter');
 check('accordion responds to the keyboard',await collapse.locator('#e85-review').isVisible());
 await page.emulateMedia({reducedMotion:'reduce'});
 await go('js-slider');const slider=frames.get('E86');
 await page.locator('[data-example="E86"] .demo-width[data-width="390"]').click();await slider.waitForFunction(()=>innerWidth===390);
 await slider.locator('[data-slider-next]').click();
 await slider.waitForFunction(()=>document.getElementById('e86-widths').scrollLeft>0);
 check('varied-width slider advances',await slider.locator('#e86-widths').evaluate(e=>e.scrollLeft>0));
 await slider.locator('[data-slider-goto="end"]').click();
 await slider.waitForFunction(()=>{const e=document.getElementById('e86-widths');return e.scrollLeft>=e.scrollWidth-e.clientWidth-2;});
 check('varied-width slider reaches the last card',await slider.locator('#e86-widths').evaluate(e=>e.scrollLeft>=e.scrollWidth-e.clientWidth-2));
 await slider.locator('[data-slider-goto="start"]').click();await slider.waitForFunction(()=>document.getElementById('e86-widths').scrollLeft<=1);
 check('varied-width slider returns to its start',await slider.locator('#e86-widths').evaluate(e=>e.scrollLeft<=1));
 await slider.locator('[data-slider-prev]').click();
 check('slider has no boundary animation with reduced motion',await slider.locator('#e86-widths').evaluate(e=>getComputedStyle(e).animationName==='none'));
 await go('choices');const checkbox=frames.get('E46'),radio=frames.get('E48');
 await checkbox.locator('label:has(input[name="notify-0"])').click();
 check('checkbox catalogue uses interactive native states',await checkbox.locator('input[name="notify-0"]').isChecked());
 await radio.locator('input[name="view-m"][value="list"]').focus();await radio.locator('input[name="view-m"][value="list"]').press('ArrowRight');
 check('segmented keyboard selection changes the native value',await radio.locator('input[name="view-m"][value="cards"]').isChecked());
 await radio.locator('input[name="view-m"][value="cards"]').press('ArrowRight');
 check('segmented keyboard selection skips disabled options',await radio.locator('input[name="view-m"][value="list"]').isChecked());
 await go('js-popup');const popup=frames.get('E87');
 await page.locator('[data-example="E87"] .demo-width[data-width="390"]').click();await popup.waitForFunction(()=>innerWidth===390);
 await popup.locator('#e87-open').click();await popup.waitForFunction(()=>document.activeElement===document.getElementById('e87-name'));
 check('side panel opens with dialog semantics and an inert background',await popup.locator('[role="dialog"]').isVisible()&&await popup.locator('#e87-background').evaluate(e=>e.inert));
 await popup.locator('#e87-name').fill('Локальный проект');
 await popup.locator('[data-popup-close]').focus();await popup.locator('[data-popup-close]').press('Tab');
 check('side panel keeps Tab inside the dialog',await popup.locator('#e87-name').evaluate(e=>e===document.activeElement));
 await page.locator('#theme-toggle').click();
 await popup.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 check('side panel retains its state during a theme switch',await popup.locator('[role="dialog"]').isVisible()&&await popup.locator('#e87-name').inputValue()==='Локальный проект');
 await popup.locator('#e87-name').focus();await popup.locator('#e87-name').press('Escape');
 await popup.waitForFunction(()=>document.activeElement===document.getElementById('e87-open'));
 check('side panel Escape restores focus and the background',!await popup.locator('[role="dialog"]').isVisible()&&!await popup.locator('#e87-background').evaluate(e=>e.inert));
 await popup.locator('#e87-open').click();
 check('side panel retains entered data when reopened',await popup.locator('#e87-name').inputValue()==='Локальный проект');
 await popup.locator('[role="dialog"]').screenshot({path:`${out}/catalogue-side-panel.png`});
 await popup.locator('[data-popup-close]').click();
 await page.locator('#theme-select').selectOption('nk');
 await popup.waitForFunction(()=>document.documentElement.dataset.design==='nk');
 await page.emulateMedia({reducedMotion:'no-preference'});
}

if(import.meta.url===pathToFileURL(process.argv[1]).href) {
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),checks=[],failures=[];
  await page.goto(pathToFileURL(resolve('docs/index.html')).href,{waitUntil:'networkidle'});
  const check=(name,condition)=>{checks.push(name);if(!condition)failures.push(name);};
  if(process.argv.includes('--media'))await checkMediaCrops(page,check);
  else await checkCatalogue(page,check);
  console.log(JSON.stringify({passed:checks.length-failures.length,failures,checks},null,2));
  assert.equal(failures.length,0,failures.join("\n"));
 } finally {await browser.close();}
}
