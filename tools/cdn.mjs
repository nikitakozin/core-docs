import {createHash} from 'node:crypto';

// Read official sources in memory; no cache or vendored copy is written.
export async function fetchBytes(url) {
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`CDN HTTP ${response.status}: ${url}`);
 return Buffer.from(await response.arrayBuffer());
}

export async function fetchVerified(file) {
 const bytes=await fetchBytes(file.url);
 const actual=createHash('sha256').update(bytes).digest('hex');
 if(actual!==file.sha256)throw new Error(`CDN SHA-256 mismatch: ${file.url}; expected ${file.sha256}, received ${actual}`);
 return bytes;
}
