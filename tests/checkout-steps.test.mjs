import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,a)=>e.reducer(s,{now:Date.parse('2026-09-13T10:00:00Z'),...a});
const start=()=>run(e.keysInitialState(),{type:'RESERVATION_START',hotelId:'more'});
test('guest citizenship survives navigation, profile saving and booking confirmation',()=>{
 let s=start();
 const contact={firstName:'Анна',lastName:'Иванова',phone:'+79001234567',email:'anna@example.ru',citizenship:'Казахстан'};
 s=run(s,{type:'RESERVATION_CONTACT',contact});
 s=run(s,{type:'KEYS_RESERVATION_GUEST_PATCH',guest:{firstName:'Иван',lastName:'Петров',citizenship:' Беларусь '}});
 s=run(s,{type:'KEYS_CHECKOUT_PROFILE_SAVE',contact});
 assert.equal(s.profile.citizenship,'Казахстан');
 s=run(s,{type:'RESERVATION_NEXT'});
 for(const step of ['services','details','payment'])s=run(s,{type:'KEYS_CHECKOUT_STEP',step});
 assert.equal(s.reservation.contact.citizenship,'Казахстан');
 assert.equal(s.reservation.additionalGuests[0].citizenship,'Беларусь');
 s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});
 s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
 assert.equal(s.reservation.status,'confirmed');
 assert.equal(s.booking.contact.citizenship,'Казахстан');
 assert.equal(s.booking.additionalGuests[0].citizenship,'Беларусь');
});
test('payment step requires valid contacts and preserves the entire draft on back',()=>{
 let s=start();s=run(s,{type:'RESERVATION_CONTACT',contact:{firstName:'Анна',lastName:'',phone:'+79001234567',email:''}});
 s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'payment'});assert.notEqual(s.reservation.keysCheckoutStep,'payment');
 s=run(s,{type:'RESERVATION_CONTACT',contact:{firstName:'Анна',lastName:'Иванова',phone:'+79001234567',email:'anna@example.ru'}});
 s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'services'});s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});
 const before=s.reservation;const total=e.checkoutTotal(before);
 s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'details'});s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'payment'});assert.equal(s.reservation.keysCheckoutStep,'payment');
 s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'details'});assert.deepEqual({...s.reservation,keysCheckoutStep:before.keysCheckoutStep},before);assert.deepEqual(e.checkoutTotal(s.reservation),total);
});
test('loyalty discount, full points and extras stay correct between steps',()=>{
 let s=run(start(),{type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:true});
 s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});const base=e.checkoutTotal(s.reservation);
 s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',email:'guest@example.ru'});s=run(s,{type:'RESERVATION_POINTS',enabled:true});
 const total=e.checkoutTotal(s.reservation);assert.equal(total.room,Math.round(base.room*.9));assert.equal(total.extras,base.extras);assert.equal(total.total,total.room+total.extras-total.discount);
 s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'services'});s=run(s,{type:'KEYS_CHECKOUT_STEP',step:'details'});assert.deepEqual(e.checkoutTotal(s.reservation),total);
});
