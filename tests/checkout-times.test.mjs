import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(state,action)=>e.reducer(state,{now:Date.parse('2026-09-13T10:00:00Z'),...action});
const start=(hotelId='more')=>run(e.keysInitialState(),{type:'RESERVATION_START',hotelId});
const choose=(state,kind,time)=>run(state,{type:'KEYS_STAY_TIME',kind,time});
test('standard hotel times have no surcharge, including different hotel defaults',()=>{
 for(const id of ['more','maidens','quiet-coast']){
  const s=start(id),q=e.keysStayTimeQuote(s.reservation),t=e.checkoutTotal(s.reservation);
  assert.equal(q.total,0);assert.equal(q.checkIn,q.policy.checkIn);assert.equal(q.checkOut,q.policy.checkOut);
  assert.equal(t.total,t.room+t.extras-t.discount);
 }
});
test('hourly early check-in and tiered late checkout are charged once and removable',()=>{
 let s=start();const initial=e.checkoutTotal(s.reservation);
 s=choose(s,'early','12:00');assert.equal(e.checkoutTotal(s.reservation).total,initial.total+2400);
 s=choose(s,'early','09:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,4800);
 s=choose(s,'late','18:00');const nightly=initial.room/4;
 assert.equal(e.checkoutTotal(s.reservation).stayTimes,4800+Math.round(nightly*.5));
 s=choose(s,'late','22:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,4800+Math.round(nightly));
 s=choose(choose(s,'early','15:00'),'late','14:00');assert.equal(e.checkoutTotal(s.reservation).total,initial.total);
});
test('fixed hotel supplements do not scale with hours and unavailable times cannot be selected',()=>{
 let s=start('maidens');
 s=choose(s,'early','09:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,2500);
 s=choose(s,'early','12:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,2500);
 s=choose(s,'late','22:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,5500);
 for(const [kind,time] of [['early','06:00'],['late','25:00'],['unknown','12:00']])assert.deepEqual(choose(s,kind,time),s);
});
test('percentage updates after room or tariff changes; points do not lower the time fee',()=>{
 let s=choose(start(),'late','18:00');
 const rooms=e.rooms('more');s=run(s,{type:'RESERVATION_ROOM',id:rooms.at(-1).id});
 let t=e.checkoutTotal(s.reservation);assert.equal(t.stayTimes,Math.round(t.room/4*.5));
 s=run(s,{type:'RESERVATION_TARIFF',id:'flexible'});t=e.checkoutTotal(s.reservation);assert.equal(t.stayTimes,Math.round(t.room/4*.5));
 const fee=t.stayTimes;s=run(s,{type:'RESERVATION_POINTS',enabled:true});assert.equal(e.checkoutTotal(s.reservation).stayTimes,fee);
 const changed=run(s,{type:'RESERVATION_DATES',arrival:'2026-09-23',departure:'2026-09-25'}),short=e.checkoutTotal(changed.reservation);
 assert.equal(short.stayTimes,Math.round(short.room/2*.5));
});
test('time selections survive checkout navigation and are recorded in confirmed booking',()=>{
 let s=choose(choose(start(),'early','12:00'),'late','18:00');
 s=run(s,{type:'RESERVATION_CONTACT',contact:{firstName:'Анна',lastName:'Иванова',phone:'+79001234567',email:'anna@example.ru'}});
 s=run(s,{type:'RESERVATION_NEXT'});
 const times=s.reservation.keysStayTimes;
 for(const step of ['services','details','payment'])s=run(s,{type:'KEYS_CHECKOUT_STEP',step});
 assert.deepEqual(s.reservation.keysStayTimes,times);
 s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});const total=e.checkoutTotal(s.reservation);
 s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
 assert.equal(s.reservation.status,'confirmed');assert.equal(s.booking.checkInTime,'12:00');assert.equal(s.booking.checkOutTime,'18:00');
 assert.equal(s.booking.dueAtHotel,total.total);assert.equal(s.booking.keysStayTimeCharge,total.stayTimes);
 assert.deepEqual(choose(s,'early','09:00'),s);
});
test('a new hotel starts with its own standard times',()=>{
 let s=choose(start(),'early','09:00');s=run(s,{type:'RESERVATION_START',hotelId:'maidens'});
 assert.equal(e.keysStayTimeQuote(s.reservation).checkIn,'14:00');assert.equal(e.checkoutTotal(s.reservation).stayTimes,0);
});
test('compact extras summary matches the total for services and both timing supplements',()=>{
 let s=choose(choose(start(),'early','12:00'),'late','18:00');
 s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});
 s=run(s,{type:'RESERVATION_EXTRA',id:'spa',selected:true});
 const summary=e.keysCheckoutAdditions(s.reservation),total=e.checkoutTotal(s.reservation);
 assert.equal(summary.items.length,4);assert.equal(summary.total,total.stayTimes+total.extras);
 assert.equal(total.total,total.room-total.discount+summary.total);
 s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:false});
 assert.equal(e.keysCheckoutAdditions(s.reservation).items.length,3);
 assert.equal(e.keysCheckoutAdditions(s.reservation).total,summary.total-1200);
});
test('standard times without extra services leave the compact summary empty',()=>{
 assert.deepEqual(e.keysCheckoutAdditions(start().reservation),{items:[],total:0});
});
