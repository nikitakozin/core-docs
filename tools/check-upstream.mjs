// Read-only: run explicitly when the owner asks to check Core updates.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('docs/reference/source-manifest.json','utf8'));
const base='https://cdn.sdelal.tech/core/';
async function fetchBytes(url){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`${response.status}: ${url}`);return Buffer.from(await response.arrayBuffer());}
try {
 const [catalog,listing]=await Promise.all([fetchBytes(base),fetchBytes(base+'latest/')]);
 const versions=[...catalog.toString().matchAll(/\bv(\d+)\//g)].map(m=>Number(m[1]));
 if(!versions.length)throw new Error('Version catalog has no recognizable versions');
 const highest=Math.max(...versions);
 const files=new Set(['.readme.html',...[...listing.toString().matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]).filter(name=>/^[a-z][a-z0-9.-]*\.(css|js|html)$/.test(name))]);
 if(!files.has('core.css')||!files.has('state.js'))throw new Error('Unexpected latest listing');
 const previous=new Map(manifest.files.map(f=>[f.file,f.sha256]));const pending=[...files].sort(),changed=[],added=[],removed=[...previous.keys()].filter(name=>!files.has(name));
 const worker=async()=>{while(pending.length){const name=pending.shift(),bytes=await fetchBytes(base+'latest/'+name),hash=createHash('sha256').update(bytes).digest('hex');if(!previous.has(name))added.push(name);else if(previous.get(name)!==hash)changed.push(name);}};
 await Promise.all(Array.from({length:4},worker));
 const updateAvailable=highest!==manifest.version||changed.length>0||added.length>0||removed.length>0;
 console.log(JSON.stringify({checked_at:new Date().toISOString(),snapshot_version:manifest.version,catalog_version:highest,update_available:updateAvailable,checked_files:files.size,changed:changed.sort(),added:added.sort(),removed:removed.sort(),action:updateAvailable?'Review changes and update documentation on request':'No changes',read_only:true},null,2));process.exitCode=updateAvailable?2:0;
} catch(error){console.error(error.message);process.exitCode=1;}
