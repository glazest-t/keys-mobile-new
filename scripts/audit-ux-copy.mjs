import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {rewriteHTML,rewriteJS} from './ux-copy-source.mjs';
const root=path.resolve(import.meta.dirname,'..'),texts=new Map();
async function scan(dir){for(const ent of await readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,ent.name);
 if(ent.isDirectory()){if(!['copy','ui-kit','header-concepts','orbit-new','node_modules'].includes(ent.name))await scan(file);continue;}
 if(!/\.(?:html|m?js)$/.test(file)||/leaflet|2gis|mapgl|lucide/.test(file))continue;
 const capture=t=>{if(!/[а-яё]/i.test(t))return;for(const s of t.split(/<[^>]*>/).map(x=>x.trim()).filter(x=>/[а-яё]/i.test(x)&&x.length<1600)){
  if(!texts.has(s))texts.set(s,new Set());texts.get(s).add(path.relative(root,file));
 }};
 try{const s=await readFile(file,'utf8');(file.endsWith('.html')?rewriteHTML:rewriteJS)(s,x=>x,capture);}catch(e){console.error(file,e.message);throw e;}
}}
await scan(path.join(root,process.argv[2]||'dist'));
await mkdir(path.join(root,'tmp/ux-copy'),{recursive:true});
const list=[...texts].map(([text,files])=>({text,files:[...files]}));
await writeFile(path.join(root,'tmp/ux-copy/inventory.json'),JSON.stringify(list,null,2));
await writeFile(path.join(root,'tmp/ux-copy/inventory.txt'),list.map((x,i)=>`${i}\t${x.text.replace(/\n/g,' ')}\t${x.files[0]}`).join('\n'));
console.log(`${list.length} unique text fragments`);
