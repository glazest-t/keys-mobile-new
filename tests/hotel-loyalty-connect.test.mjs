import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,a)=>e.reducer(s,{now:Date.parse('2026-09-13T10:00:00Z'),...a});
test('connecting hotel loyalty applies ten percent once and preserves the booking',()=>{
 let s=run(e.keysInitialState(),{type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:true});
 s=run(s,{type:'RESERVATION_START',hotelId:'more'});
 const before=s.reservation,price=e.checkoutTotal(before);
 s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',email:'guest@example.ru'});
 assert.equal(e.checkoutTotal(s.reservation).room,Math.round(price.room*.9));
 assert.equal(s.reservation.id,before.id);assert.deepEqual(s.reservation.party,before.party);assert.equal(s.reservation.tariffId,before.tariffId);
 const connected=e.checkoutTotal(s.reservation);
 s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',email:'guest@example.ru'});
 assert.deepEqual(e.checkoutTotal(s.reservation),connected);
 assert.equal(s.keysConnectedHotelCards.more.discount,10);
 s=run(s,{type:'RESERVATION_TARIFF',id:'flexible'});
 assert.equal(e.checkoutTotal(s.reservation).room,Math.round(e.checkoutTotal({...s.reservation,hotelLoyaltyDiscount:0}).room*.9));
 s=run(s,{type:'RESERVATION_START',hotelId:'more'});assert.equal(s.reservation.hotelLoyaltyDiscount,.1);
 s=run(s,{type:'RESERVATION_START',hotelId:'maidens'});assert.equal(s.reservation.hotelLoyaltyDiscount,0);
});
test('ordinary scenarios do not get hotel-connection discounts',()=>{
 let s=run(e.keysInitialState(),{type:'RESERVATION_START',hotelId:'more'});
 const before=e.checkoutTotal(s.reservation);s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',email:'guest@example.ru'});
 assert.deepEqual(e.checkoutTotal(s.reservation),before);
 s=run(s,{type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:true});s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',email:'guest@example.ru'});
 s=run(s,{type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:false});assert.equal(s.reservation.hotelLoyaltyDiscount,0);
});
test('benefits can connect a hotel card before a booking and apply it to a future draft',()=>{
 let s=run(e.keysInitialState(),{type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:true});
 const reservation=s.reservation;
 s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',hotelId:'maidens',email:'guest@example.ru'});
 assert.equal(s.reservation,reservation);
 assert.equal(s.keysConnectedHotelCards.maidens.discount,10);
 s=run(s,{type:'RESERVATION_START',hotelId:'maidens'});
 assert.equal(s.reservation.hotelLoyaltyDiscount,.1);
 s=run(s,{type:'RESERVATION_START',hotelId:'more'});
 assert.equal(s.reservation.hotelLoyaltyDiscount,0);
 const other=s.reservation;
 s=run(s,{type:'KEYS_CONNECT_HOTEL_LOYALTY',hotelId:'maidens',email:'guest@example.ru'});
 assert.equal(s.reservation,other);
});
test('benefits connection cannot enable a discount outside the missing-loyalty scenario',()=>{
 const state=e.keysInitialState();
 assert.equal(run(state,{type:'KEYS_CONNECT_HOTEL_LOYALTY',hotelId:'maidens',email:'guest@example.ru'}),state);
});
