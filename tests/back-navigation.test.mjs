import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,a)=>e.reducer(s,{now:Date.parse('2026-09-13T10:00:00Z'),...a});
const search=()=>run(run(e.keysInitialState(),{type:'NAV_TAB',tab:'find'}),{type:'SEARCH_SUBMIT',city:'Сочи'});
test('desktop hotel → checkout → back preserves the draft and then returns to filtered results',()=>{
 let s=run(search(),{type:'SEARCH_PATCH',patch:{filters:['С завтраком'],sort:'price-desc'}});
 s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START',hotelId:'more'});
 s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});s=run(s,{type:'RESERVATION_POINTS',enabled:true});
 const draft=s.reservation,query=s.search;
 s=run(s,{type:'RESERVATION_NEXT'});assert.equal(s.navigation.screen.type,'reservation-payment');
 s=run(s,{type:'BACK'});assert.deepEqual(s.navigation.screen,{type:'hotel',hotelId:'more'});assert.deepEqual(s.reservation,draft);
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen,null);assert.deepEqual(s.search,query);
});
test('mobile checkout returns to rooms, hotel, then the original swipe page',()=>{
 let s=run(search(),{type:'OPEN',screen:{type:'swipe'}});
 s=run(s,{type:'HOTEL_OPEN',id:'more'});
 s=run(s,{type:'OPEN',screen:{type:'hotel',hotelId:'more',rooms:true}});
 s=run(s,{type:'RESERVATION_START',hotelId:'more'});s=run(s,{type:'RESERVATION_NEXT'});
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.rooms,true);
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.type,'hotel');assert.equal(s.navigation.screen.rooms,undefined);
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.type,'swipe');
});
test('repeated favorites/notifications open does not trap Back on the same page',()=>{
 for(const type of ['saved','notifications']){
  let s=run(search(),{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'OPEN',screen:{type}});
  const depth=s.navigation.history.length;
  s=run(s,{type:'OPEN',screen:{type}});assert.equal(s.navigation.history.length,depth);
  s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.hotelId,'more');
 }
});
test('host entry returns only at its boundary, not from a nested hotel or checkout',()=>{
 const entry={kind:'screen',screen:'saved'},back={type:'BACK'};
 let s=run(run(search(),{type:'NAV_TAB',tab:'find'}),{type:'OPEN',screen:{type:'saved'}});
 assert.equal(e.keysReturnsToHost(s,back,entry),true);
 s=run(s,{type:'HOTEL_OPEN',id:'more'});assert.equal(e.keysReturnsToHost(s,back,entry),false);
 s=run(s,back);assert.equal(e.keysReturnsToHost(s,back,entry),true);
 assert.equal(e.keysReturnsToHost(s,back,null),false);
});
test('results opened from home return home; ordinary search returns to its form without losing settings',()=>{
 let s=search();const query=s.search;
 assert.equal(e.keysReturnsToHost(s,{type:'KEYS_SEARCH_BACK'},{kind:'results'}),true);
 assert.equal(e.keysReturnsToHost(s,{type:'KEYS_SEARCH_BACK'},null),false);
 s=run(s,{type:'KEYS_SEARCH_BACK'});assert.equal(s.search.results,false);assert.equal(s.search.city,query.city);assert.deepEqual(s.search.party,query.party);
});

test('bottom menu is available in search, hides from hotel details through checkout, and returns on exit',()=>{
 let s=search();
 assert.equal(e.keysShowBottomNav(s),true);
 s=run(s,{type:'OPEN',screen:{type:'hotel-map'}});
 assert.equal(e.keysShowBottomNav(s),true);
 s=run(s,{type:'HOTEL_OPEN',id:'more'});
 assert.equal(e.keysShowBottomNav(s),false);
 for(const screen of [{type:'hotel-reviews',hotelId:'more'},{type:'hotel-map',hotelId:'more',selectedOnly:true},{type:'price-watch',hotelId:'more'}]){
  const nested=run(s,{type:'OPEN',screen});
  assert.equal(e.keysShowBottomNav(nested),false);
  assert.equal(e.keysShowBottomNav(run(nested,{type:'BACK'})),false);
 }
 s=run(s,{type:'OPEN',screen:{type:'hotel',hotelId:'more',rooms:true}});
 s=run(s,{type:'RESERVATION_START',hotelId:'more'});
 assert.equal(e.keysShowBottomNav(s),false);
 s=run(s,{type:'RESERVATION_NEXT'});
 assert.equal(s.navigation.screen.type,'reservation-payment');
 assert.equal(e.keysShowBottomNav(s),false);
 for(let step=0;step<3;step++)s=run(s,{type:'BACK'});
 assert.equal(s.navigation.screen.type,'hotel-map');
 assert.equal(e.keysShowBottomNav(s),true);
 for(const tab of ['trips','find','chats','bonuses'])assert.equal(e.keysShowBottomNav(run(s,{type:'NAV_TAB',tab})),true);
});

test('direct booking routes hide the menu without relying on prior navigation history',()=>{
 const state=search();
 for(const type of ['hotel','hotel-reviews','hotel-loyalty-connect','shopping-checkout','reservation-payment','reservation-success']){
  assert.equal(e.keysShowBottomNav({...state,navigation:{...state.navigation,screen:{type},history:[]}}),false,type);
 }
 for(const type of ['saved','chat','profile','checkin','booking','created-booking','notifications','describe']){
  assert.equal(e.keysShowBottomNav({...state,navigation:{...state.navigation,screen:{type},history:[]}}),true,type);
 }
});
