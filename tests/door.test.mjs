import test from 'node:test';
import assert from 'node:assert/strict';
import {createDoorController} from '../src/home/door-controller.mjs';

function setup(request){
 const states=[],timers=new Map();let next=0;
 const controller=createDoorController({request,onChange:state=>states.push(state),setTimer:(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;},clearTimer:id=>timers.delete(id)});
 const fire=ms=>{const entry=[...timers].find(([,t])=>t.ms===ms);assert.ok(entry);timers.delete(entry[0]);entry[1].fn();};
 return {controller,states,fire};
}
test('one click opens the door; rapid repeats do not send another request',async()=>{
 let finish,calls=0;
 const {controller,states,fire}=setup(()=>{calls++;return new Promise(resolve=>finish=resolve);});
 const pending=controller.open();await controller.open();
 assert.equal(calls,1);assert.equal(controller.state,'opening');
 finish({opened:true});await pending;
 await controller.open();assert.equal(calls,1);
 assert.deepEqual(states,['opening','success']);
 fire(6000);assert.equal(controller.state,'idle');
});
test('failed lock acknowledgement permits a successful retry',async()=>{
 let attempts=0;
 const {controller,states}=setup(async()=>({opened:++attempts>1}));
 await controller.open();assert.equal(controller.state,'error');
 await controller.open();assert.deepEqual(states,['opening','error','opening','success']);
});
test('transport rejection and missing acknowledgement never claim the door is open',async()=>{
 for(const request of [async()=>{throw new Error('Bluetooth unavailable');},async()=>undefined]){
  const {controller,states}=setup(request);await controller.open();
  assert.deepEqual(states,['opening','error']);
 }
});
test('timeout stops loading and ignores a late success response',async()=>{
 let finish,signal;
 const {controller,states,fire}=setup(options=>{signal=options.signal;return new Promise(resolve=>finish=resolve);});
 const pending=controller.open();await Promise.resolve();fire(10000);await pending;
 assert.equal(signal.aborted,true);assert.equal(controller.state,'error');
 finish({opened:true});await Promise.resolve();assert.deepEqual(states,['opening','error']);
});
test('changing the stay cancels an in-flight attempt and its stale result',async()=>{
 let finish,signal;
 const {controller,states}=setup(options=>{signal=options.signal;return new Promise(resolve=>finish=resolve);});
 const pending=controller.open();await Promise.resolve();controller.reset();
 assert.equal(signal.aborted,true);finish({opened:true});await pending;
 assert.deepEqual(states,['opening','idle']);
});
