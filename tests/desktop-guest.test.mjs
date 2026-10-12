import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(state,action)=>e.reducer(state,{now:Date.parse('2026-09-13T10:00:00Z'),...action});
test('entering guest browsing clears private profile and loyalty without changing search',()=>{
 const initial=run(e.keysInitialState(),{type:'RESERVATION_START',hotelId:'more'});
 const state=run(initial,{type:'KEYS_GUEST_START'});
 assert.equal(state.profile.firstName,'');assert.equal(state.profile.phone,'');assert.equal(state.loyalty.balance,0);assert.equal(state.keysHotelPoints.more,0);assert.equal(state.reservation,null);assert.deepEqual(state.search,initial.search);
});
test('checkout login preserves room, tariff, dates, party and price, replacing only contact',()=>{
 let state=run(e.keysInitialState(),{type:'KEYS_GUEST_START'});
 state=run(state,{type:'RESERVATION_START',hotelId:'more'});
 state=run(state,{type:'RESERVATION_TARIFF',id:'flexible'});
 const original=state.reservation;
 state=run(state,{type:'KEYS_LOGIN_CONTACT',preserveReservation:true,contact:{firstName:'Анна',phone:'+7 (916) 555-44-33'}});
 assert.deepEqual({...state.reservation,contact:original.contact},original);
 assert.equal(state.reservation.contact.firstName,'Анна');assert.equal(state.reservation.contact.email,'');
 assert.deepEqual(e.checkoutTotal(state.reservation),e.checkoutTotal(original));
 state=run(state,{type:'RESERVATION_NEXT'});assert.equal(state.navigation.screen.type,'reservation-payment');
});
test('ordinary standalone login keeps its existing draft reset behavior',()=>{
 const state=run(e.keysInitialState(),{type:'RESERVATION_START',hotelId:'more'});
 assert.equal(run(state,{type:'KEYS_LOGIN_CONTACT',contact:{firstName:'Анна',phone:'+7 (916) 555-44-33'}}).reservation,null);
});
test('anonymous registration offer previews the member price and survives login unchanged',()=>{
 globalThis.keysGuestMode=true;globalThis.keysGuestAuthorized=false;
 try{
  let state=run(e.keysInitialState(),{type:'KEYS_GUEST_START'});
  const quote=e.hotelPrice(e.hotel('more'),state.search,state.discovery.priceTick);
  assert.ok(quote.registrationDiscount>0);
  assert.equal(quote.registrationDiscount,quote.usualTotal-quote.total);
  state=run(state,{type:'RESERVATION_START',hotelId:'more'});
  state=run(state,{type:'RESERVATION_TARIFF',id:'flexible'});
  assert.equal(e.checkoutTotal(state.reservation).room,quote.total);
  state=run(state,{type:'KEYS_LOGIN_CONTACT',preserveReservation:true,contact:{firstName:'Анна',phone:'+79165554433'}});
  globalThis.keysGuestAuthorized=true;
  const signedIn=e.hotelPrice(e.hotel('more'),state.search,state.discovery.priceTick);
  assert.equal(signedIn.registrationDiscount,undefined);
  assert.equal(signedIn.total,quote.total);
  assert.equal(e.checkoutTotal(state.reservation).room,quote.total);
 }finally{globalThis.keysGuestMode=false;globalThis.keysGuestAuthorized=false;}
});
