import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/sections/hotel-details.js',import.meta.url),'utf8');
const hook=source.slice(source.indexOf('function useKeysTariffDrag('),source.indexOf('function KeysRoomInfoIcon('));
function setup(enabled=true){
 const context=vm.createContext({E:{useRef:value=>({current:value})}});
 vm.runInContext(hook,context);
 const handlers=context.useKeysTariffDrag(enabled),classes=new Set();let captured=null;
 const track={scrollWidth:900,clientWidth:350,scrollLeft:0,classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)},setPointerCapture:id=>captured=id,hasPointerCapture:id=>captured===id,releasePointerCapture:()=>captured=null};
 const event=(extra={})=>({currentTarget:track,pointerType:'mouse',pointerId:1,isPrimary:true,button:0,buttons:1,clientX:280,clientY:100,detail:1,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...extra});
 return {handlers,track,classes,event};
}
test('dragging tariffs scrolls both ways without selecting a card on release',()=>{
 const {handlers:h,track,classes,event}=setup();
 h.onPointerDown(event());h.onPointerMove(event({clientX:100}));
 assert.equal(track.scrollLeft,180);assert.equal(classes.has('is-dragging'),true);
 h.onPointerUp(event({clientX:100}));assert.equal(classes.size,0);
 const click=event();h.onClickCapture(click);assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 h.onPointerDown(event({clientX:100}));h.onPointerMove(event({clientX:200}));assert.equal(track.scrollLeft,80);
 h.onPointerCancel(event());assert.equal(classes.size,0);
});
test('a normal click or small pointer jitter still selects the tariff',()=>{
 const {handlers:h,track,event}=setup();h.onPointerDown(event());h.onPointerMove(event({clientX:277}));h.onPointerUp(event());
 const click=event();h.onClickCapture(click);assert.equal(click.prevented,undefined);assert.equal(track.scrollLeft,0);
});
test('touch, vertical gestures and desktop layout keep native behavior',()=>{
 for(const [enabled,extra] of [[true,{pointerType:'touch'}],[true,{clientY:140}],[false,{}]]){
  const {handlers:h,track,event}=setup(enabled);
  h.onPointerDown(event({pointerType:extra.pointerType||'mouse'}));h.onPointerMove(event({clientX:extra.clientY?280:100,...extra}));
  assert.equal(track.scrollLeft,0);
 }
});
