import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {copyLiteral} from '../src/copy/tone-of-voice.mjs';
import {rewriteHTML,rewriteJS,rewriteCSS} from './ux-copy-source.mjs';

export async function buildUXCopy(){
 const root=path.resolve(import.meta.dirname,'..'),changes=[];
 async function visit(dir){for(const ent of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,ent.name);
  if(ent.isDirectory()){if(!['copy','ui-kit','header-concepts','orbit-new'].includes(ent.name))await visit(file);continue;}
  if(!/\.(html|m?js|css)$/.test(file)||/leaflet|2gis|mapgl|lucide|header-concepts\.html/.test(file))continue;
  const before=await readFile(file,'utf8'),items=[];
  const after=(file.endsWith('.html')?rewriteHTML:file.endsWith('.css')?rewriteCSS:rewriteJS)(before,copyLiteral,(from,to)=>{if(from!==to)items.push({from,to});});
  if(after!==before){await writeFile(file,after);changes.push({file:path.relative(root,file),changes:items});}
 }}
 await visit(path.join(root,'dist'));
 await build({entryPoints:[path.join(root,'src/copy/runtime.mjs')],outfile:path.join(root,'dist/copy/guest.js'),bundle:true,format:'iife',target:'es2022',minify:true,charset:'utf8'});
 await mkdir(path.join(root,'tmp/ux-copy'),{recursive:true});
 await writeFile(path.join(root,'tmp/ux-copy/build-report.json'),JSON.stringify(changes,null,2));
 console.log(`Guest copy: ${changes.length} files, ${changes.reduce((n,x)=>n+x.changes.length,0)} edited fragments`);
 return changes;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))await buildUXCopy();
