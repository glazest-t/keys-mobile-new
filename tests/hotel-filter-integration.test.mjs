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
