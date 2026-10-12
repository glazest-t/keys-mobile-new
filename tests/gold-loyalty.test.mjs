import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,action)=>e.reducer(s,{now:Date.parse('2026-09-13T10:00:00Z'),...action});
const start=tier=>run(run(e.keysInitialState(),{type:'KEYS_LOYALTY',tier}),{type:'RESERVATION_START',hotelId:'more'});
test('Gold is restricted, first for each room, and selected by default',()=>{
 const gold=start('Gold'),ordinary=start('Silver');
 assert.equal(gold.reservation.tariffId,'loyalty-gold');
 for(const room of e.rooms('more')){
  const offers=e.roomOffers(gold.reservation,room);
  assert.equal(offers[0].id,'loyalty-gold');
  assert.equal(e.roomOffers(ordinary.reservation,room).some(o=>o.id==='loyalty-gold'),false);
  assert.equal(e.keysFilterRoomOffers([{room,offers}],e.keysRoomCriteriaEmpty(),'price-desc')[0].offers[0].id,'loyalty-gold');
 }
 assert.notEqual(run(ordinary,{type:'RESERVATION_TARIFF',id:'loyalty-gold'}).reservation.tariffId,'loyalty-gold');
});
test('Gold hotel price matches the room tariff and checkout without double discount',()=>{
 let state=start('Gold');
 const price=e.hotelPrice(e.hotel('more'),state.search,state.discovery.priceTick);
 assert.equal(price.total,Math.round(price.beforeGold*.8));
 assert.equal(price.goldDiscount,price.beforeGold-price.total);
 const offer=e.roomOffers(state.reservation).find(o=>o.id==='loyalty-gold');
 assert.equal(offer.price,e.checkoutTotal(state.reservation).room);
 assert.equal(offer.price,price.total);
 state=run(state,{type:'RESERVATION_NEXT'});
 assert.equal(state.navigation.screen.type,'reservation-payment');
 assert.equal(state.reservation.tariffId,'loyalty-gold');
 const base=e.roomOffers(state.reservation).find(o=>o.id==='flexible').price;
 assert.equal(offer.price,Math.round(base*.8));
});
test('switching out of Gold removes closed tariff access and its selected draft',()=>{
 let state=start('Gold');state=run(state,{type:'KEYS_LOYALTY',tier:'Silver'});
 assert.equal(state.search.keysLoyaltyTier,'Silver');
 assert.equal(state.reservation.tariffId,'flexible');
 assert.equal(e.roomOffers(state.reservation).some(o=>o.id==='loyalty-gold'),false);
 assert.equal(e.hotelPrice(e.hotel('more'),state.search).goldDiscount,undefined);
});

test('search price limits compare the displayed Gold amount',()=>{
 const gold=start('Gold'),silver=start('Silver');
 const filtered=s=>e.searchHotels({...s.search,filters:['До 6000 ₽/ночь']},s.discovery.priceTick);
 assert.ok(filtered(gold).some(h=>h.id==='more'));
 assert.equal(filtered(silver).some(h=>h.id==='more'),false);
});
test('Gold is one hotel discount; available points are not silently redeemed',()=>{
 const state=start('Gold'),price=e.hotelPrice(e.hotel('more'),state.search,state.discovery.priceTick);
 const detail=e.keysHotelDiscount(price);
 assert.equal(price.hotelTier,'Gold');
 assert.equal(detail.hotel,price.usualTotal-price.total);
 assert.equal(detail.keys,0);assert.equal(detail.hotelPoints,0);
 assert.equal(detail.hotel+detail.keys+detail.hotelPoints,detail.total);
});
test('aggregate discount combines hotel rate, hotel points and Keys points exactly once',()=>{
 let state=start('Gold');state=run(state,{type:'RESERVATION_POINTS',enabled:true});
 const quote=e.keysReservationDiscountQuote(state.reservation,state.search,state.discovery.priceTick),detail=e.keysHotelDiscount(quote);
 assert.ok(detail.hotel>0);assert.ok(detail.hotelPoints>0);assert.ok(detail.keys>0);
 assert.equal(detail.keys,state.loyalty.balance);
 assert.equal(detail.hotel+detail.hotelPoints+detail.keys,quote.usualTotal-quote.total);
 assert.equal(quote.total,e.checkoutTotal(state.reservation).accommodation);
 const off=run(state,{type:'RESERVATION_POINTS',enabled:false});
 assert.equal(e.keysReservationDiscountQuote(off.reservation,off.search).total,e.checkoutTotal(off.reservation).room);
});
