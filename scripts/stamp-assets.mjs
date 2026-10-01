import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';

// Changed assets receive a new URL, including when the page URL stays the same.
export async function stampAssets(root) {
 for (const page of ['index.html','home-calendar.html','header-concepts.html','sections/index.html']) {
  const path=resolve(root,page);
  let html=await readFile(path,'utf8');
  const refs=[...html.matchAll(/(?:src|href)="(\.\.?\/[^"?]+\.(?:js|css))(?:\?[^"#]*)?"/g)];
  for (const [attribute,url] of refs) {
   const content=await readFile(resolve(dirname(path),url));
   const version=createHash('sha256').update(content).digest('hex').slice(0,12);
   html=html.replace(attribute,attribute.slice(0,attribute.indexOf('="')+2)+url+'?v='+version+'"');
  }
  await writeFile(path,html);
 }
}
