import test from 'node:test';
import assert from 'node:assert/strict';
import {highlightCode} from '../tools/highlight.mjs';
const plain=html=>html.replace(/<[^>]+>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&#39;',"'").replaceAll('&amp;','&');
test('syntax coloring preserves source text and escapes executable markup',()=>{
 for(const [lang,code] of [['HTML','<script>alert("<&")</script>\n<button disabled>A & B</button>'],['JavaScript','const name = "<b>"; // comment\nconsole.log(name);'],['css','.core { --size: 12px; color: red; }'],['md','# Header\n**bold** and `code`']]) {
  const html=highlightCode(code,lang);
  assert.equal(plain(html),code);
  assert.match(html,/<span class="core-/);
  assert.doesNotMatch(html,/<script>|<button|hljs-/);
 }
});
test('plain text and unknown languages are escaped without guessing',()=>{
 for(const lang of ['text','unknown'])assert.equal(highlightCode('<tag>&',lang),'&lt;tag&gt;&amp;');
});
