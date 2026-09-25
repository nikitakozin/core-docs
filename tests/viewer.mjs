// Behavior regressions: retained theme/input state, real hover, and content overflow.
export async function checkViewer(page,check) {
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(page.url().split('#')[0],{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!document.getElementById('theme-select').disabled);
 const box=await page.locator('[role=search]').boundingBox(),kbd=await page.locator('kbd').boundingBox();
 check('search is compact on desktop',box.width<=340);
 check('shortcut has a right inset and is vertically centered',box.x+box.width-kbd.x-kbd.width>=8&&Math.abs(kbd.y+kbd.height/2-box.y-box.height/2)<2);
 for(const selector of ['.nav-link[href="#start"]','.nav-sublink','.chapter:not(.core-hide) .chapter-footer a']) {
  const link=page.locator(selector).first();await link.scrollIntoViewIfNeeded();await page.mouse.move(1400,900);
  const box=await link.boundingBox();
  const before=await link.evaluate(e=>getComputedStyle(e).backgroundColor);await link.hover();
  check(`${selector} has a filled hover`,await link.evaluate(e=>getComputedStyle(e).backgroundColor)!==before);
  check(`${selector} hover keeps its height`,Math.abs((await link.boundingBox()).height-box.height)<0.5);
  await link.focus();check(`${selector} retains visible focus`,await link.evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));
  check(`${selector} focus keeps its height`,Math.abs((await link.boundingBox()).height-box.height)<0.5);
  await page.mouse.down();
  check(`${selector} press keeps its height`,Math.abs((await link.boundingBox()).height-box.height)<0.5);
  await page.mouse.move(1400,900);await page.mouse.up();await link.evaluate(e=>e.blur());
 }
 await page.evaluate(()=>location.hash='buttons--e31');
 await page.waitForFunction(()=>document.querySelector('.nav-sublink[aria-current="location"]')?.dataset.target==='buttons--e31');
 check('long menu labels fit without horizontal scrolling',await page.locator('#chapter-nav').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await page.evaluate(()=>location.hash='js-field');
 await page.waitForFunction(()=>document.querySelector('[data-example="E77"]').dataset.ok==='true');
 check('HTML and JavaScript are visible without expanding the example',await page.locator('[data-example="E77"] pre').first().isVisible()&&await page.locator('[data-example="E77"] pre').last().isVisible());
 for(const name of ['core','ss','nk','nkui']) {
  const frame=await page.locator('[data-example="E77"] iframe').elementHandle().then(e=>e.contentFrame());
  await frame.locator('#quantity').fill('12');
  await page.locator('#theme-select').selectOption(name);
  await page.waitForFunction(name=>document.documentElement.dataset.design===name&&!document.getElementById('theme-select').disabled,name);
  await frame.waitForFunction(name=>document.documentElement.dataset.design===name,name,{polling:100});
  check(`${name} syntax tokens keep the code font`,await page.evaluate(()=>[...document.querySelectorAll('pre code span')].every(e=>getComputedStyle(e).fontFamily===getComputedStyle(e.closest('code')).fontFamily)));
  check(`${name} preserves live demo input`,await frame.locator('#quantity').inputValue()==='12');
  await page.locator('#theme-toggle').click();
  await frame.waitForFunction(()=>document.documentElement.dataset.theme==='dark',null,{polling:100});
  const dark=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(name=>document.documentElement.dataset.design===name,name,{polling:100});
  check(`${name} and dark mode survive reload`,await page.evaluate(dark=>document.documentElement.dataset.theme==='dark'&&getComputedStyle(document.body).backgroundColor===dark,dark));
  await page.locator('#theme-toggle').click();
  await page.waitForFunction(()=>document.querySelector('[data-example="E77"]').dataset.ok==='true');
 }
 // SS requires its own mode classes, not the generic Core light/dark class.
 await page.locator('#theme-select').selectOption('ss');
 await page.waitForFunction(()=>document.documentElement.classList.contains('core-theme-ss-light'));
 await page.locator('#theme-toggle').click();
 await page.reload({waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.documentElement.classList.contains('core-theme-ss-dark'));
 check('SS uses its own dark scope after reload',await page.evaluate(()=>!document.documentElement.classList.contains('core-theme-dark')));
 await page.locator('#theme-select').selectOption('nk');
 await page.waitForFunction(()=>document.documentElement.dataset.design==='nk');
 await page.locator('#theme-toggle').click();
 await page.route('**/theme-ss.css',route=>route.abort());
 await page.locator('#theme-select').selectOption('ss');
 await page.waitForFunction(()=>!document.getElementById('theme-select').disabled);
 check('failed theme keeps the last working design and preference',await page.evaluate(()=>document.documentElement.dataset.design==='nk'&&localStorage.getItem('core-docs-design')==='nk'&&document.getElementById('theme-select').value==='nk'));
 await page.unroute('**/theme-ss.css');
 await page.reload({waitUntil:'networkidle'});
 await page.waitForFunction(()=>!document.getElementById('theme-select').disabled);
 // A frame can fail independently of the shell, then recover without reload.
 await page.evaluate(()=>location.hash='js-field');
 await page.waitForFunction(()=>document.querySelector('[data-example="E77"]').dataset.ok==='true');
 const demoFrame=await page.locator('[data-example="E77"] iframe').elementHandle().then(e=>e.contentFrame());
 await page.route('**/theme-ss.css',route=>route.request().frame().parentFrame()?route.abort():route.continue());
 await page.locator('#theme-select').selectOption('ss');
 await page.waitForFunction(()=>document.querySelector('[data-example="E77"] .demo-status').dataset.state==='warning');
 await page.locator('#theme-select').selectOption('core');
 await demoFrame.waitForFunction(()=>document.documentElement.dataset.design==='core',null,{polling:100});
 check('successful theme clears only the previous theme warning',await page.locator('[data-example="E77"] .demo-status').isHidden());
 await page.unroute('**/theme-ss.css');
 await page.route('**/theme-ss.css',async route=>{if(route.request().frame().parentFrame())await new Promise(r=>setTimeout(r,300));await route.continue();});
 await page.locator('#theme-select').selectOption('ss');
 await page.waitForFunction(()=>document.documentElement.dataset.design==='ss');
 await page.locator('#theme-toggle').click();
 await demoFrame.waitForFunction(()=>document.documentElement.dataset.design==='ss',null,{polling:100});
 await page.waitForTimeout(500);
 check('superseded theme loads do not show a CDN error',await page.locator('[data-example="E77"] .demo-status').isHidden());
 await page.unroute('**/theme-ss.css');
 await page.locator('#theme-select').selectOption('nk');
 await page.waitForFunction(()=>document.documentElement.dataset.design==='nk');
 await page.locator('#theme-toggle').click();
 for(const width of [390,720,721,997,998,1200,1440]) {
  await page.setViewportSize({width,height:1000});
  const overflow=await page.evaluate(()=>{
   const articles=[...document.querySelectorAll('.chapter')],active=articles.filter(e=>!e.classList.contains('core-hide'));
   const failures=[];articles.forEach(e=>e.classList.add('core-hide'));
   for(const article of articles){article.classList.remove('core-hide');
    const main=document.getElementById('main-content');
    if(main.scrollWidth>main.clientWidth+1||article.scrollWidth>article.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1)failures.push(article.id);
    article.classList.add('core-hide');
   }
   active.forEach(e=>e.classList.remove('core-hide'));return failures;
  });
  check(`all chapters fit at ${width}: ${overflow.join(',')}`,overflow.length===0);
 }
 check('all HTML and JS demo sources have highlighted tokens',await page.evaluate(()=>[...document.querySelectorAll('.example pre code')].every(e=>e.querySelector('span'))));
 await page.evaluate(()=>location.hash='start');
 await page.waitForFunction(()=>!document.getElementById('start').classList.contains('core-hide'));
 await page.screenshot({path:'test-results/viewer-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/viewer-mobile.png'});
 // Storage may be denied; both controls must remain usable.
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
 await page.reload({waitUntil:'networkidle'});
 await page.locator('#theme-toggle').click();
 check('denied localStorage does not break mode switching',await page.evaluate(()=>document.documentElement.dataset.theme==='dark'));
}
