import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,a)=>e.reducer(s,{now:Date.parse('2026-09-13T10:00:00Z'),...a});
const start=approved=>run(run(e.keysInitialState(),{type:'KEYS_PARTNER',approved}),{type:'RESERVATION_START',hotelId:'more'});
test('Friendly Rate is restricted to confirmed hotelier status and first for every room',()=>{
 for(const value of [false,undefined,'pending','approved']){
  const s=start(value);assert.equal(e.roomOffers(s.reservation).some(o=>o.id==='friendly-rate'),false);
  assert.notEqual(run(s,{type:'RESERVATION_TARIFF',id:'friendly-rate'}).reservation.tariffId,'friendly-rate');
 }
 const s=start(true);assert.equal(s.reservation.tariffId,'friendly-rate');
 for(const room of e.rooms('more')){
  const offers=e.roomOffers(s.reservation,room);assert.equal(offers[0].id,'friendly-rate');
  assert.equal(e.keysFilterRoomOffers([{room,offers}],e.keysRoomCriteriaEmpty(),'price-desc')[0].offers[0].id,'friendly-rate');
 }
});
test('partner discount is consistent between results, tariff and payment, with no double discount',()=>{
 let s=start(true);const price=e.hotelPrice(e.hotel('more'),s.search,s.discovery.priceTick);
 const offer=e.roomOffers(s.reservation)[0],standard=e.roomOffers(s.reservation).find(o=>o.id==='flexible');
 assert.equal(offer.price,Math.round(standard.price*.65));assert.equal(offer.price,price.total);
 assert.equal(offer.discountLabel.replace(/\s/g,''),'−35%');assert.equal(price.friendlyRate,true);
 s=run(s,{type:'RESERVATION_NEXT'});assert.equal(s.reservation.tariffId,'friendly-rate');
 assert.equal(e.checkoutTotal(s.reservation).room,offer.price);
 assert.equal(e.keysReservationDiscountQuote(s.reservation,s.search).friendlyRate,true);
});
test('revoked or reset partner status removes access and resets an unconfirmed tariff',()=>{
 let s=start(true);s=run(s,{type:'KEYS_PARTNER',approved:false});
 assert.equal(s.reservation.tariffId,'flexible');assert.equal(s.search.keysPartnerApproved,false);
 assert.equal(e.roomOffers(s.reservation).some(o=>o.id==='friendly-rate'),false);
 assert.equal(e.hotelPrice(e.hotel('more'),s.search).friendlyRate,undefined);
});
test('hotel loyalty tier and hotelier status are independent',()=>{
 let s=run(start(true),{type:'KEYS_LOYALTY',tier:'Gold'});
 assert.equal(s.keysPartnerApproved,true);assert.equal(e.roomOffers(s.reservation)[0].id,'friendly-rate');
 assert.equal(e.roomOffers(s.reservation).some(o=>o.id==='loyalty-gold'),true);
 s=run(s,{type:'KEYS_PARTNER',approved:false});assert.equal(s.keysLoyaltyTier,'Gold');
 assert.equal(e.roomOffers(s.reservation)[0].id,'loyalty-gold');
});
