import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {mkdirSync, writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

// Shared header and repeated next/previous clicks are reading contracts.
export async function checkChrome(page,check) {
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(page.url().split('#')[0],{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!document.getElementById('theme-select').disabled);
 await page.evaluate(()=>document.fonts.ready);
 const header=page.locator('.topbar'),brand=header.locator('a[href="#overview"]');
 check('one header contains brand and search',await header.count()===1&&await brand.count()===1&&await header.locator('#search').count()===1);
 if(await brand.count()) {
  const b=await brand.boundingBox(),s=await page.locator('[role=search]').boundingBox(),h=await header.boundingBox();
  check('brand and search are adjacent in a full-width header',s.x-b.x-b.width>=0&&s.x-b.x-b.width<=24&&h.x===0&&Math.abs(h.width-await page.evaluate(()=>document.documentElement.clientWidth))<=1);
 }
 const count=await page.locator('.chapter-top-nav').count();
 check('every chapter has matching top and footer destinations',await page.locator('.chapter').evaluateAll(articles=>articles.every(a=>{
  const destinations=selector=>[...a.querySelectorAll(selector)].map(e=>e.getAttribute('href')).join(',');
  return a.querySelector('.chapter-top-nav')&&destinations('.chapter-top-nav a')===destinations('.chapter-footer a');
 })));
 if(!count)return;
 const next=page.locator('#overview .chapter-top-nav a'),first=await next.boundingBox(),point={x:first.x+first.width/2,y:first.y+first.height/2};
 for(const id of ['start','architecture','inheritance']) {
  await page.mouse.click(point.x,point.y);
  await page.waitForFunction(id=>location.hash==='#'+id&&!document.getElementById(id).classList.contains('core-hide'),id);
  await page.waitForFunction(()=>scrollY===0);
  check(`same-position next click reaches ${id}`,await page.locator(`#${id} h1`).isVisible());
 }
 await page.locator('#inheritance .chapter-top-nav a').first().click();
 await page.waitForFunction(()=>location.hash==='#architecture'&&!document.getElementById('architecture').classList.contains('core-hide'));
 check('top previous link goes back one chapter',await page.locator('#architecture h1').isVisible());
 for(const design of ['core','ss','nkui','nk']) {
 await page.locator('#theme-select').selectOption(design);
 await page.waitForFunction(design=>document.documentElement.dataset.design===design&&!document.getElementById('theme-select').disabled,design);
 await page.evaluate(()=>document.fonts.ready);
 for(const width of [320,390,720,721,997,998,1200,1440]) {
  await page.setViewportSize({width,height:1000});
  const failures=await page.evaluate(()=>{
   const articles=[...document.querySelectorAll('.chapter')],active=articles.filter(e=>!e.classList.contains('core-hide')),failures=[];
   articles.forEach(e=>e.classList.add('core-hide'));
   for(const a of articles){
    a.classList.remove('core-hide');
    const nav=a.querySelector('.chapter-top-nav'),title=a.querySelector('.chapter-heading'),n=nav.getBoundingClientRect(),t=title.getBoundingClientRect();
    const stacked=innerWidth<=997;
    if(stacked?n.top<t.bottom-1:n.left<t.right-1||Math.abs(n.top-t.top)>1)failures.push(a.id+': alignment');
    for(const link of nav.querySelectorAll('a')){
     const r=link.getBoundingClientRect();
     if(link.scrollWidth>link.clientWidth+1||link.scrollHeight>link.clientHeight+1||[...link.querySelectorAll('span')].some(e=>{const b=e.getBoundingClientRect();return b.right>r.right+1||b.bottom>r.bottom+1;}))failures.push(a.id+': clipped card');
    }
    if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)failures.push(a.id+': overflow');
    a.classList.add('core-hide');
   }
   active.forEach(e=>e.classList.remove('core-hide'));return failures;
  });
  check(`${design} chapter headers fit and align at ${width}: ${failures.join(', ')}`,failures.length===0);
 }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>scrollTo({top:300,behavior:'instant'}));
 check('shared header stays above the sidebar while scrolling',await page.evaluate(()=>{
  const h=document.querySelector('.topbar').getBoundingClientRect(),n=document.getElementById('chapter-nav').getBoundingClientRect();
  return Math.abs(h.top)<1&&n.top>=h.bottom-1;
 }));
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:'test-results/chrome-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/chrome-mobile.png'});
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
 const checks=[],failures=[];mkdirSync('test-results',{recursive:true});
 try {
  const page=await browser.newPage();await page.goto(pathToFileURL(resolve('docs/index.html')).href,{waitUntil:'networkidle'});
  await checkChrome(page,(name,ok)=>{checks.push(name);if(!ok)failures.push(name);});
  const result={passed:checks.length-failures.length,total:checks.length,failures};
  writeFileSync('test-results/chrome.json',JSON.stringify(result,null,2)+'\n');console.log(result);
  assert.equal(failures.length,0,failures.join('\n'));
 } finally {await browser.close();}
}
