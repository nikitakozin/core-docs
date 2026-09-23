import {checkViewer} from './viewer.mjs';
import {chromium} from 'playwright';
import {readFileSync as read, writeFileSync as write, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

// User-visible contracts: compact reading chrome, one-click demos, and an overlay
// that keeps both the reading position and keyboard access intact.
const checks=[], failures=[];
const check=(name,condition)=>{checks.push(name);if(!condition)failures.push(name);};
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 await page.goto('file://'+resolve('docs/index.html'),{waitUntil:'networkidle'});
 check('Core CSS and theme loaded from CDN',await page.locator('#shell-status').isHidden());
 await page.keyboard.press('Tab');
 check('mobile first Tab offers skip link',await page.locator('#skip-link').evaluate(e=>e===document.activeElement));
 check('mobile skip link is visible above header',await page.locator('#skip-link').evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
 await page.keyboard.press('Enter');
 check('skip link focuses current article',await page.locator('#overview--title').evaluate(e=>e===document.activeElement));
 const header=page.locator('.topbar');
 check('mobile header is at most 80px tall',(await header.boundingBox()).height<=80);
 await page.evaluate(()=>window.scrollTo({top:180,behavior:'instant'}));
 const reading=await page.locator('#overview h2').first().boundingBox();
 const scroll=await page.evaluate(()=>scrollY);
 check('header stays visible while reading',Math.abs((await header.boundingBox()).y)<=1);
 await page.locator('#menu-button').click();
 check('menu opens above the article',await page.locator('#sidebar').isVisible());
 check('menu does not move the article',Math.abs((await page.locator('#overview h2').first().boundingBox()).y-reading.y)<=1);
 check('background is inert while menu is open',await page.locator('#document-shell').evaluate(e=>e.inert));
 const links=page.locator('#sidebar a:visible, #sidebar button:visible');
 await links.last().focus();await page.keyboard.press('Tab');
 check('Tab stays in menu',await links.first().evaluate(e=>e===document.activeElement));
 await page.keyboard.press('Shift+Tab');
 check('Shift+Tab stays in menu',await links.last().evaluate(e=>e===document.activeElement));
 check('menu keeps the reading scroll position',Math.abs(await page.evaluate(()=>scrollY)-scroll)<=1);
 await page.keyboard.press('Escape');
 check('Escape closes menu',await page.locator('#sidebar').isHidden());
 check('Escape restores focus',await page.locator('#menu-button').evaluate(e=>e===document.activeElement));
 check('closing keeps the reading position',Math.abs(await page.evaluate(()=>scrollY)-scroll)<=1);
 for(const shortcut of ['Control+k','Meta+k']) {
  await page.locator('#menu-button').click();await page.keyboard.press(shortcut);
  check(`${shortcut} closes menu for search`,await page.locator('#sidebar').isHidden());
  check(`${shortcut} focuses search`,await page.locator('#search').evaluate(e=>e===document.activeElement));
  check(`${shortcut} preserves reading position`,Math.abs(await page.evaluate(()=>scrollY)-scroll)<=1);
 }
 const overlay=page.locator('#menu-overlay');
 if(await overlay.count()) {
  await page.locator('#menu-button').click();
  await overlay.click({position:{x:380,y:400}});
  check('backdrop closes menu',await page.locator('#sidebar').isHidden());
  await page.locator('#menu-button').click();
  await page.locator('#sidebar a[href="#start"]').click();
  await page.waitForFunction(()=>document.getElementById('menu-button').getAttribute('aria-expanded')==='false');
  await page.waitForFunction(()=>document.activeElement===document.getElementById('start--title'));
  check('chapter selection closes menu',await page.locator('#sidebar').isHidden());
  check('chapter selection moves focus to content',await page.locator('#start--title').evaluate(e=>e===document.activeElement));
 } else check('menu has a backdrop',false);
 await page.evaluate(()=>{location.hash='start';});
 await page.waitForFunction(()=>document.querySelector('[data-example="E01"]').dataset.ok==='true');
 check('ordinary installation code is visible',await page.locator('#start pre').first().isVisible());
 check('all 82 examples keep code inside their card',await page.locator('.example > .example-code').count()===82);
 check('all 82 examples offer seven one-click widths',await page.locator('.example .demo-width').count()===82*7&&await page.locator('select.demo-width').count()===0);
 check('all nine navigation groups are present',await page.locator('.nav-group').count()===9);
 check('all 42 chapters have previous/next navigation',await page.locator('.chapter-footer').count()===42);
 for(const width of [390,720,721,997,998,1440]) {
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>window.scrollTo({top:300,behavior:'instant'}));
  check(`header remains compact at ${width}`,(await header.boundingBox()).height<=84);
  check(`sticky header remains visible at ${width}`,Math.abs((await header.boundingBox()).y)<=1);
  if(width>=998)check(`sidebar stays fixed at ${width}`,Math.abs((await page.locator('#sidebar').boundingBox()).y)<=1);
  check(`no document overflow at ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.goto('file://'+resolve('docs/index.html'),{waitUntil:'networkidle'});
 await page.keyboard.press('Tab');
 check('desktop first Tab offers skip link',await page.locator('#skip-link').evaluate(e=>e===document.activeElement));
 check('desktop skip link is visible above sidebar',await page.locator('#skip-link').evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
 await page.locator('#search').fill('core-icon');
 await page.locator('#skip-link').focus();await page.keyboard.press('Enter');
 check('skip link reaches visible search content',await page.locator('#main-content').evaluate(e=>e===document.activeElement)&&await page.locator('#search-results').isVisible());
 await checkViewer(page,check);
 mkdirSync('test-results',{recursive:true});
 write('test-results/layout.json',JSON.stringify({passed:checks.length-failures.length,total:checks.length,failures,checks},null,2)+'\n');
 console.log(JSON.stringify({passed:checks.length-failures.length,total:checks.length,failures},null,2));
 assert.equal(failures.length,0,failures.join('\n'));
} finally {await browser.close();}
