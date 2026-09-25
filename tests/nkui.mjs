// The documented CDN theme must retain native controls and nested color scopes.
export async function checkNkui(frame,versionBase,check,out) {
 await frame.evaluate(async base=>{
  const root=document.documentElement;root.removeAttribute('style');root.className='core-solo core-theme-light';
  const link=document.getElementById('nk-css');
  await new Promise((done,fail)=>{link.onload=done;link.onerror=()=>fail(new Error('NKUI stylesheet failed'));link.href=base+'theme-nkui.css';});
  document.getElementById('demo-root').innerHTML=`<div class="core-col core-g-8x">
   <div class="core-row core-y-center">${['xs','s','','l'].map(size=>`<button class="core-button ${size?'core-button-'+size:''}" data-size="${size||'m'}">Кнопка</button><input class="core-input ${size?'core-input-'+size:''}" data-size="${size||'m'}" aria-label="Поле ${size||'m'}">`).join('')}</div>
   <div class="core-row"><select id="disabled-select" class="core-select" disabled aria-label="Недоступный выбор"><option>Недоступно</option></select><input id="calendar" type="date" class="core-date" aria-label="Дата"></div>
   ${['','-inline','-xs','-s','-l'].map((size,i)=>`<div id="group-${i}" class="core-radio-group${size==='-inline'?'-inline':size?' core-radio-group'+size:''} core-w-140x">${['Длинная подпись первого варианта','Второй','Недоступно'].map((label,n)=>`<label class="core-button-radio"><input type="radio" name="group-${i}" ${n===0?'checked':''} ${n===2?'disabled':''}><span class="core-radio-label">${label}</span></label>`).join('')}</div>`).join('')}
   <section class="core-theme-dark core-card core-bg core-color"><input id="nested-dark" class="core-input" aria-label="Тёмное поле"><section class="core-theme-light core-card core-bg core-color"><input id="nested-light" class="core-input" aria-label="Светлое поле"></section></section>
  </div>`;
 },versionBase);
 const expected={xs:24,s:28,m:36,l:44};
 for(const mode of ['light','dark']) {
  await frame.evaluate(mode=>document.documentElement.className=`core-solo core-theme-${mode}`,mode);
  const values=await frame.evaluate(()=>{
   const style=id=>getComputedStyle(document.getElementById(id));
   const color=document.createElement('canvas').getContext('2d');color.fillStyle=getComputedStyle(document.body).backgroundColor;color.fillRect(0,0,1,1);
   return {background:[...color.getImageData(0,0,1,1).data],font:style('nested-dark').fontFamily,
    sizes:[...document.querySelectorAll('[data-size]')].map(e=>({size:e.dataset.size,height:e.getBoundingClientRect().height})),
    caret:style('disabled-select').backgroundImage,calendar:getComputedStyle(document.getElementById('calendar'),'::after').filter,
    nested:[style('nested-dark').backgroundColor,style('nested-light').backgroundColor],
    groups:[...document.querySelectorAll('[id^="group-"]')].map(e=>({fits:e.scrollWidth<=e.clientWidth+1,minimum:getComputedStyle(e.querySelector('.core-radio-label')).minHeight,opacity:getComputedStyle(e.querySelector('input:disabled + span')).opacity}))};
  });
  // Core converts the surface through color spaces; compare rendered sRGB with rounding tolerance.
  check(`NKUI ${mode} palette`,values.background.every((value,i)=>Math.abs(value-(mode==='light'?[255,255,255,255]:[45,45,43,255])[i])<=3));
  check(`NKUI ${mode} button and input sizes`,values.sizes.every(e=>e.height===expected[e.size]));
  check(`NKUI ${mode} disabled select keeps its arrow`,values.caret.includes('data:image/svg+xml'));
  check(`NKUI ${mode} calendar contrast`,values.calendar===(mode==='light'?'none':'invert(1)'));
  check(`NKUI ${mode} nested scopes retain colors and Inter`,values.nested[0]==='rgba(255, 255, 255, 0.06)'&&values.nested[1]==='rgba(0, 0, 0, 0.03)'&&values.font.includes('Inter'));
  check(`NKUI ${mode} segments wrap and fit`,values.groups.every(e=>e.fits)&&values.groups.map(e=>e.minimum).join(',')==='40px,40px,24px,28px,44px');
  check(`NKUI ${mode} disabled segments stay muted`,values.groups.every(e=>e.opacity==='0.55'));
  const radios=frame.locator('#group-0 input');await radios.nth(0).focus();await radios.nth(0).press('ArrowRight');
  check(`NKUI ${mode} arrow selects the next radio`,await radios.nth(1).isChecked());
  await radios.nth(1).press('ArrowRight');
  check(`NKUI ${mode} arrow skips disabled radio`,await radios.nth(0).isChecked()&&!await radios.nth(2).isChecked());
  const focus=await frame.locator('#group-0 input:checked + span').evaluate(e=>getComputedStyle(e).outlineWidth);
  check(`NKUI ${mode} radio keyboard focus is visible`,focus==='2px');
  await frame.locator('button').first().focus();await frame.locator('button').first().hover();
  check(`NKUI ${mode} focus survives hover`,await frame.locator('button').first().evaluate(e=>getComputedStyle(e).outlineWidth==='2px'));
  await frame.locator('#demo-root').screenshot({path:`${out}/nkui-${mode}.png`});
 }
 const unselected=frame.locator('#group-0 input:not(:checked):not(:disabled) + span');
 check('NKUI unselected segment has a normal transition',await unselected.evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(value=>value.trim()==='0.16s')));
 await frame.page().emulateMedia({reducedMotion:'reduce'});
 check('NKUI reduced motion removes control transitions',await unselected.evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(value=>value.trim()==='0s')));
 await frame.page().emulateMedia({reducedMotion:'no-preference'});
}
