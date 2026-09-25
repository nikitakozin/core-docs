import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

// Measure actual composited paint, including the translucent Core pre surface.
function paint(selector) {
 const node=document.querySelector(selector),canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d'),ancestors=[];
 for(let item=node;item;item=item.parentElement)ancestors.unshift(item);
 ctx.fillStyle='white';ctx.fillRect(0,0,1,1);
 for(const item of ancestors){ctx.fillStyle=getComputedStyle(item).backgroundColor;ctx.fillRect(0,0,1,1);}
 const background=[...ctx.getImageData(0,0,1,1).data].slice(0,3);
 ctx.fillStyle=getComputedStyle(node).color;ctx.fillRect(0,0,1,1);
 const foreground=[...ctx.getImageData(0,0,1,1).data].slice(0,3);
 const luminance=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
 const bg=luminance(background),fg=luminance(foreground),style=getComputedStyle(node);
 const codeColors=[...node.querySelectorAll('code span')].map(span=>{
  ctx.globalAlpha=1;ctx.fillStyle=`rgb(${background.join(',')})`;ctx.fillRect(0,0,1,1);
  let opacity=1;for(let item=span;item&&item!==node;item=item.parentElement)opacity*=Number(getComputedStyle(item).opacity);
  ctx.globalAlpha=opacity;ctx.fillStyle=getComputedStyle(span).color;ctx.fillRect(0,0,1,1);
  const color=luminance([...ctx.getImageData(0,0,1,1).data].slice(0,3));
  return (Math.max(bg,color)+.05)/(Math.min(bg,color)+.05);
 });
 return {background,luminance:bg,contrast:(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05),syntaxContrast:Math.min(...codeColors),font:style.fontFamily,base:style.getPropertyValue('--f-s-base').trim()};
}

export async function checkInverseTheme(page,check) {
 await page.goto(new URL('#js-field',page.url()).href,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('[data-example="E77"]').dataset.ok==='true');
 const iframe=await page.locator('[data-example="E77"] iframe').elementHandle().then(e=>e.contentFrame());
 await iframe.locator('#quantity').fill('15');
 for(const design of ['core','nk','ss','nkui'])for(const mode of ['light','dark']) {
  await page.locator('#theme-select').selectOption(design);
  if(await page.locator('html').getAttribute('data-theme')!==mode)await page.locator('#theme-toggle').click();
  await page.waitForFunction(({design,mode})=>document.documentElement.dataset.design===design&&document.documentElement.dataset.theme===mode,{design,mode});
  await iframe.waitForFunction(({design,mode})=>document.documentElement.dataset.design===design&&document.documentElement.dataset.theme===mode,{design,mode});
  const shell=await page.evaluate(paint,'body'),chrome=await page.evaluate(paint,'[data-example="E77"]'),demo=await iframe.evaluate(paint,'body');
  const standalone=await page.evaluate(paint,'#start .code-block pre'),embedded=await page.evaluate(paint,'[data-example="E77"] pre');
  check(`${design}/${mode} iframe retains the selected surface`,JSON.stringify(shell.background)===JSON.stringify(demo.background));
  check(`${design}/${mode} example chrome is inverse`,mode==='light'?chrome.luminance<shell.luminance-.2:chrome.luminance>shell.luminance+.2);
  check(`${design}/${mode} standalone and embedded code are inverse`,[standalone,embedded].every(code=>mode==='light'?code.luminance<shell.luminance-.2:code.luminance>shell.luminance+.2));
  check(`${design}/${mode} code text has readable contrast`,[standalone,embedded].every(code=>code.contrast>=4.5));
  check(`${design}/${mode} syntax colors have readable contrast`,[standalone,embedded].every(code=>code.syntaxContrast>=4.5));
  check(`${design}/${mode} inverse scope preserves typography`,chrome.font===shell.font&&chrome.base===shell.base);
  check(`${design}/${mode} changing theme preserves the existing iframe and input`,!iframe.isDetached()&&await iframe.locator('#quantity').inputValue()==='15');
  const expected=design==='ss'?`core-theme-ss-${mode==='light'?'dark':'light'}`:`core-theme-${mode==='light'?'dark':'light'}`;
  check(`${design}/${mode} every frame and standalone code scope changes`,await page.evaluate(expected=>[...document.querySelectorAll('.example,.code-block')].filter(e=>e.matches('.example')||!e.closest('.example')).every(e=>e.classList.contains(expected)),expected));
 }
 await page.locator('#theme-select').selectOption('nk');
 if(await page.locator('html').getAttribute('data-theme')!=='light')await page.locator('#theme-toggle').click();
 await iframe.waitForFunction(()=>document.documentElement.dataset.design==='nk'&&document.documentElement.dataset.theme==='light');
}

if(import.meta.url===pathToFileURL(process.argv[1]).href) {
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),checks=[];
  await page.goto(pathToFileURL(resolve('docs/index.html')).href,{waitUntil:'networkidle'});
  await checkInverseTheme(page,(name,condition)=>{assert.ok(condition,name);checks.push(name);});
  console.log(JSON.stringify({passed:checks.length,checks},null,2));
 } finally {await browser.close();}
}
