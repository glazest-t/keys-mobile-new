import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
test('catalogue filtering composes chains, star alternatives, prices and existing sort',()=>{
 const state=e.keysInitialState();
 const search={...state.search,city:'Сочи',filters:['Звёздность объекта: 4 звезды','Звёздность объекта: 5 звёзд','Сеть отеля: Cosmos Hotel Group'],sort:'price-desc'};
 const results=e.searchHotels(search);
 assert.deepEqual(results.map(h=>h.id),['atlas']);
 const empty=e.searchHotels({...search,filters:[...search.filters,'Спальни: 10']});
 assert.equal(empty.length,0);
 const reset=e.searchHotels({...search,filters:[]});
 assert.ok(reset.length>results.length);
 const totals=reset.map(h=>e.hotelPrice(h,search,0).total);
 assert.deepEqual(totals,[...totals].sort((a,b)=>b-a));
});

test('price filter compares the displayed stay total rather than a single night',()=>{
 const state=e.keysInitialState();
 const search={...state.search,city:'Сочи',arrival:'2026-10-01',departure:'2026-10-05',filters:[],sort:'recommended'};
 const all=e.searchHotels(search);
 const price=e.hotelPrice(all[0],search,0).total;
 const filtered=e.searchHotels({...search,filters:['От '+price+' до '+price+' ₽ за проживание']});
 assert.ok(filtered.some(h=>h.id===all[0].id));
 assert.ok(filtered.every(h=>e.hotelPrice(h,search,0).total===price));
 const nightly=e.hotelPrice(all[0],search,0).nightly;
 assert.ok(!e.searchHotels({...search,filters:['До '+nightly+' ₽ за проживание']}).some(h=>h.id===all[0].id));
});

test('hotel star ordering works in both directions on the search catalogue',()=>{
 const search={...e.keysInitialState().search,city:'Сочи',filters:[]};
 for(const [sort,direction] of [['stars-desc',-1],['stars-asc',1]]){
  const stars=e.searchHotels({...search,sort}).map(h=>h.stars);
  assert.deepEqual(stars,[...stars].sort((a,b)=>(a-b)*direction));
 }
});

test('nightly price mode filters nightly rates and persists with the search draft',()=>{
 const state=e.keysInitialState();
 const search={...state.search,city:'Сочи',arrival:'2026-10-01',departure:'2026-10-05',filters:[],keysPricePerNight:true};
 const hotel=e.searchHotels(search)[0],nightly=e.hotelPrice(hotel,search,0).nightly;
 const filters=['От '+nightly+' до '+nightly+' ₽/ночь'];
 const matches=e.searchHotels({...search,filters});
 assert.ok(matches.some(h=>h.id===hotel.id));
 assert.ok(matches.every(h=>e.hotelPrice(h,search,0).nightly===nightly));
 const next=e.reducer(state,{type:'SEARCH_PATCH',patch:{filters,keysPricePerNight:true}});
 assert.equal(next.search.keysPricePerNight,true);
 assert.deepEqual(next.search.filters,filters);
});
