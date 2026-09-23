import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';

for(const [name,grammar] of Object.entries({xml,javascript,css,json,markdown}))hljs.registerLanguage(name,grammar);
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

// Only the build uses Highlight.js. The browser receives spans styled by Core.
export function highlightCode(text,language='text') {
 const lang=language.toLowerCase().split(/\s+/)[0];
 if(!hljs.getLanguage(lang))return escape(text);
 return hljs.highlight(text,{language:lang,ignoreIllegals:true}).value.replace(/class="([^"]+)"/g,(_,scopes)=>{
  if(/hljs-(comment|quote)/.test(scopes))return 'class="core-text-mono core-muted-4x"';
  const token=/hljs-(string|regexp)/.test(scopes)?'success':/hljs-(attr|attribute|number|literal)/.test(scopes)?'danger':'link';
  return `class="core-text-mono core-color" style="--tc:color-mix(in srgb,var(--color-${token}),var(--color-text-primary) 55%)"`;
 });
}
