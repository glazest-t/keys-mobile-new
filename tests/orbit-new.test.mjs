import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../src/brand/brand.js',import.meta.url),'utf8');
function frame(initial){
 const listeners={},parent={document:{documentElement:{dataset:{keysBrand:initial}}}},html={dataset:{}};
 const window={parent,addEventListener:(type,fn)=>listeners[type]=fn};
 vm.runInNewContext(code,{window,parent,document:{documentElement:html,currentScript:{src:'https://prototype.test/brand/brand.js'}},location:{href:'https://prototype.test/sections/',origin:'https://prototype.test'},URL,localStorage:{getItem:()=>null}});
 return {html,parent,message:listeners.message};
}
test('embedded sections use the current base design for all legacy appearance choices',()=>{
 for(const value of ['orbit','orbit-new','base','unknown',undefined])assert.equal(frame(value).html.dataset.keysBrand,'orbit');
});
test('appearance changes reach a mounted section without resetting it',()=>{
 const f=frame('base');
 for(const brand of ['orbit-new','orbit','base']){
  f.message({source:f.parent,origin:'https://prototype.test',data:{type:'keys-brand',brand}});
  assert.equal(f.html.dataset.keysBrand,'orbit');
 }
});
test('an unrelated frame or origin cannot switch the appearance',()=>{
 const f=frame('orbit-new');
 f.message({source:{},origin:'https://prototype.test',data:{type:'keys-brand',brand:'base'}});
 f.message({source:f.parent,origin:'https://other.test',data:{type:'keys-brand',brand:'base'}});
 assert.equal(f.html.dataset.keysBrand,'orbit');
});
