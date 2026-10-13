import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {adaptLightTheme} from '../scripts/adapt-light-theme.mjs';
const original=(await transform(await readFile(new URL('../vendor/arbana/source/index-C4VobzN0.js',import.meta.url),'utf8'),{minify:false,charset:'utf8'})).code;
const adapted=adaptLightTheme(original);
const themeCode=adapted.slice(adapted.indexOf('const Px ='),adapted.indexOf('function tk()'));
test('system dark, saved preference and query cannot change the light theme',()=>{
 for(const query of ['', '?theme=dark','?theme=system']){
  const root={dataset:{}},mediaCallbacks=[],storageCallbacks=[];
  const context=vm.createContext({
   document:{documentElement:root,querySelector:()=>null},
   window:{location:{search:query},localStorage:{getItem:()=> 'dark',setItem:()=>assert.fail('Must not change shared theme storage')},
    addEventListener:(name,fn)=>storageCallbacks.push(fn),
    matchMedia:()=>({matches:true,addEventListener:(_,fn)=>mediaCallbacks.push(fn)})},
   J4:'(prefers-color-scheme: dark)',jF:{light:'#2C5DEB',dark:'#0e0f11'},yw:()=>false
  });
  vm.runInContext(themeCode,context);
  assert.equal(vm.runInContext('LF().theme',context),'light');
  assert.equal(vm.runInContext('LF().fixed',context),true);
  vm.runInContext('RF();PF("dark")',context);
  [...mediaCallbacks,...storageCallbacks].forEach(fn=>fn());
  assert.equal(root.dataset.theme,'light');
  assert.equal(vm.runInContext('LF().choice',context),'light');
 }
});
test('both generated documents declare light before application mounts',async()=>{
 for(const page of ['index.html','sections/index.html']){
  const html=await readFile(new URL('../dist/'+page,import.meta.url),'utf8');
  assert.match(html,/<html[^>]*data-theme="light"/);
  assert.match(html,/<meta name="color-scheme" content="light(?: only)?"/);
 }
});

test('embedded first paint ignores dark system, saved and URL preferences',async()=>{
 const html=await readFile(new URL('../dist/sections/index.html',import.meta.url),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(code=>code.includes('document.documentElement.dataset.theme'));
 assert.equal(scripts.length,1,'Exactly one light-only bootstrap before the deferred app');
 for(const query of ['', '?theme=dark', '?theme=system']){
  const root={dataset:{},style:{}},meta={content:'#0e0f11'};
  const context=vm.createContext({document:{documentElement:root,querySelector:()=>meta},location:{search:query},URLSearchParams,
   localStorage:{getItem:()=> 'dark'},matchMedia:()=>({matches:true})});
  vm.runInContext(scripts[0],context);
  assert.equal(root.dataset.theme,'light');
  assert.equal(root.style.colorScheme,'light only');
  assert.equal(meta.content,'#2C5DEB');
 }
});
