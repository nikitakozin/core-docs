/* Общий контроллер оболочки и sandbox-примеров. Только штатные CDN-темы. */
function createDocsThemeController(doc,linkId) {
 const root=doc.documentElement;
 const names=['core','nk','ss','nkui'];
 let design='nk',mode='light',revision=0;
 const apply=()=>{
  const scope=(node,value)=>{
   node.classList.remove('core-theme-light','core-theme-dark','core-theme-ss-light','core-theme-ss-dark');
   node.classList.add(design==='ss'?`core-theme-ss-${value}`:`core-theme-${value}`);
  };
  scope(root,mode);
  // This document owns the chrome; sandbox documents keep their selected mode.
  doc.querySelectorAll('[data-docs-inverse]').forEach(node=>scope(node,mode==='light'?'dark':'light'));
  root.dataset.theme=mode;root.dataset.design=design;
 };
 return {
  mode(value){if(value==='light'||value==='dark'){mode=value;apply();}},
  async design(value){
   if(!names.includes(value))return false;
   const request=++revision;
   if(value===design){apply();return doc.getElementById(linkId).dataset.state!=='error';}
   let candidate;
   if(value!=='core') {
    candidate=doc.createElement('link');candidate.rel='stylesheet';candidate.media='not all';
    candidate.href=`https://cdn.sdelal.tech/core/latest/theme-${value}.css`;
    const loaded=await new Promise(resolve=>{
     const timer=setTimeout(()=>finish(false),10000);
     const finish=ok=>{clearTimeout(timer);candidate.onload=null;candidate.onerror=null;resolve(ok);};
     candidate.onload=()=>finish(true);candidate.onerror=()=>finish(false);
     doc.getElementById(linkId).after(candidate);
    });
    if(request!==revision){candidate.remove();return null;}
    if(!loaded){candidate.remove();return false;}
   }
   if(request!==revision)return null;
   const current=doc.getElementById(linkId);
   if(candidate){candidate.id=linkId;candidate.dataset.state='ok';candidate.media='all';current.replaceWith(candidate);}
   else {current.removeAttribute('href');current.dataset.state='ok';}
   design=value;apply();return true;
  }
 };
}
