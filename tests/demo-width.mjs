import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';

export async function checkDemoWidths(browser,url,check) {
 mkdirSync('test-results',{recursive:true});
 async function open(context) {
  const page=await context.newPage();
  await page.goto(new URL('#js-field',url).href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('[data-example="E77"]').dataset.ok==='true');
  const card=page.locator('[data-example="E77"]'),node=card.locator('iframe');
  const frame=await node.elementHandle().then(e=>e.contentFrame());
  const button=width=>card.locator(`.demo-width[data-width="${width}"]`);
  const waitWidth=width=>frame.waitForFunction(width=>innerWidth===width,width,{polling:100,timeout:5000});
  return {page,card,node,frame,button,waitWidth};
 }
 const desktop=await browser.newContext({viewport:{width:1440,height:1000}});
 try {
  const {page,card,node,frame,button,waitWidth}=await open(desktop);
  await frame.locator('#quantity').fill('15');
  for(const width of [390,720,721,997,998,1200,'auto']) {
   await button(width).hover();
   check(`hover selects ${width} without a click`,await card.getAttribute('data-width')===String(width)&&await button(width).getAttribute('aria-pressed')==='true');
   const expected=width==='auto'?await card.locator('.demo-viewport').evaluate(e=>e.clientWidth):width;
   await waitWidth(expected);
  }
  await button(720).hover();await waitWidth(720);
  await page.screenshot({path:'test-results/demo-width-hover.png'});
  await page.mouse.move(0,0);
  check('selected width remains after pointer leaves',await card.getAttribute('data-width')==='720'&&await frame.evaluate(()=>innerWidth===720));
  check('width hover preserves the iframe and entered data',await node.elementHandle().then(e=>e.contentFrame())===frame&&await frame.locator('#quantity').inputValue()==='15');
  check('width hover affects only its own example',await page.locator('[data-example="E78"]').getAttribute('data-width')==='auto');
  await button(997).focus();
  check('keyboard focus alone does not change selected width',await card.getAttribute('data-width')==='720');
  await button(997).press('Enter');await waitWidth(997);
  check('Enter selects a width',await button(997).getAttribute('aria-pressed')==='true');
  await button(998).focus();await button(998).press('Space');await waitWidth(998);
  check('Space selects a width',await button(998).getAttribute('aria-pressed')==='true');
 } finally {await desktop.close();}
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try {
  const {page,card,button,waitWidth}=await open(touch);
  await button(390).scrollIntoViewIfNeeded();
  const box=await button(390).boundingBox(),session=await touch.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
  check('touch entry does not activate the hover path',await card.getAttribute('data-width')==='auto');
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await waitWidth(390);
  check('touch tap selects a width',await button(390).getAttribute('aria-pressed')==='true');
  await button(720).tap();await waitWidth(720);
  check('subsequent touch tap selects another width',await button(720).getAttribute('aria-pressed')==='true');
  await page.screenshot({path:'test-results/demo-width-touch.png'});
 } finally {await touch.close();}
}

if(import.meta.url===pathToFileURL(process.argv[1]).href) {
 const browser=await chromium.launch({headless:true});let passed=0;
 try {
  await checkDemoWidths(browser,pathToFileURL(resolve('docs/index.html')).href,(name,condition)=>{assert.ok(condition,name);passed++;});
  console.log(JSON.stringify({passed,errors:[]}));
 } finally {await browser.close();}
}
