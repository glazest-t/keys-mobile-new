import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {stampAssets} from '../scripts/stamp-assets.mjs';
test('changing an imported name invalidates the child, importer and HTML entry URL',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'keys-assets-'));
 try{
  await mkdir(join(dir,'sections'));
  for(const page of ['index.html','home-calendar.html','header-concepts.html','sections/index.html'])await writeFile(join(dir,page),page.includes('/')?'':`<script type="module" src="./auth.js?v=old"></script>`);
  await writeFile(join(dir,'auth.js'),"import {name} from './benefits.js'; console.log(name);");
  await writeFile(join(dir,'benefits.js'),"export const name='Первое имя';");
  await stampAssets(dir);
  const first=await readFile(join(dir,'index.html'),'utf8'),importer=await readFile(join(dir,'auth.js'),'utf8');
  assert.match(importer,/benefits\.js\?v=[a-f0-9]{12}/);
  await writeFile(join(dir,'benefits.js'),"export const name='Юра Костин';");await stampAssets(dir);
  const second=await readFile(join(dir,'index.html'),'utf8');assert.notEqual(first,second);assert.notEqual(importer,await readFile(join(dir,'auth.js'),'utf8'));
  await stampAssets(dir);assert.equal(second,await readFile(join(dir,'index.html'),'utf8'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('iframe content changes invalidate the iframe URL and host entry',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'keys-frame-assets-'));
 try{
  await mkdir(join(dir,'sections'));
  for(const page of ['index.html','home-calendar.html','header-concepts.html'])await writeFile(join(dir,page),'<script src="./host.js?v=old"></script>');
  await writeFile(join(dir,'host.js'),"frame.src='./sections/index.html?v=old&loyalty=Silver';");
  await writeFile(join(dir,'sections/index.html'),'<script src="./find.js?v=old"></script>');
  await writeFile(join(dir,'sections/find.js'),"const title='Old search';");
  await stampAssets(dir);
  const first=await readFile(join(dir,'host.js'),'utf8'),entry=await readFile(join(dir,'index.html'),'utf8');
  assert.match(first,/index\.html\?v=[a-f0-9]{12}&loyalty=Silver/);
  await writeFile(join(dir,'sections/find.js'),"const title='New search';");
  await stampAssets(dir);
  const second=await readFile(join(dir,'host.js'),'utf8');
  assert.notEqual(first,second);
  assert.notEqual(entry,await readFile(join(dir,'index.html'),'utf8'));
  await stampAssets(dir);
  assert.equal(second,await readFile(join(dir,'host.js'),'utf8'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
