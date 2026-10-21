import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';

// Version the whole local module chain: an edited child also invalidates its importer.
export async function stampAssets(root) {
 const versions=new Map(),visiting=new Set();
 const hash=content=>createHash('sha256').update(content).digest('hex').slice(0,12);
 async function assetVersion(path){
  if(versions.has(path))return versions.get(path);
  let content=await readFile(path);
  if(visiting.has(path))return hash(content);
  visiting.add(path);
  if(/\.m?js$/.test(path)){
   let js=content.toString();
   // The search UI lives in an iframe. Version its HTML too, otherwise an
   // existing browser cache can keep the old module URLs after a page reload.
   if(js.includes('./sections/index.html?v=')){
    const sectionVersion=hash(await readFile(resolve(root,'sections/index.html')));
    js=js.replace(/(\.\/sections\/index\.html\?v=)[^&'"\s]+/g,'$1'+sectionVersion);
   }
   const imports=[...js.matchAll(/((?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"])(\.{1,2}\/[^'"?]+\.m?js)(?:\?[^'"]*)?(['"])/g)];
   for(const [reference,prefix,url,quote] of imports){
    const version=await assetVersion(resolve(dirname(path),url));
    js=js.replace(reference,prefix+url+'?v='+version+quote);
   }
   if(js!==content.toString()){await writeFile(path,js);content=Buffer.from(js);}
  }
  visiting.delete(path);
  const version=hash(content);versions.set(path,version);return version;
 }
 // Stamp the iframe's dependencies before hashing its HTML in the host script.
 for (const page of ['sections/index.html','index.html','home-calendar.html','header-concepts.html']) {
  const path=resolve(root,page);
  let html=await readFile(path,'utf8');
  const refs=[...html.matchAll(/(?:src|href)="(\.\.?\/[^"?]+\.(?:js|css))(?:\?[^"#]*)?"/g)];
  for (const [attribute,url] of refs) {
   const version=await assetVersion(resolve(dirname(path),url));
   html=html.replace(attribute,attribute.slice(0,attribute.indexOf('="')+2)+url+'?v='+version+'"');
  }
  await writeFile(path,html);
 }
}
