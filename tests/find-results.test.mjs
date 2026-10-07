import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../src/sections/find-results.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(code,context);
test('hotel location chooses sea for resorts and center for cities without inventing missing distances',()=>{
 const label=context.keysHotelLocation;
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:100,centerDistance:2500}),'Сочи · 100 м до моря');
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:1400}),'Сочи · 1,4 км до моря');
 assert.equal(label('Москва',{city:'Москва',seaDistance:null,centerDistance:2200}),'Москва · 2,2 км до центра');
 assert.equal(label('Москва',{centerDistance:0}),'Москва · 0 м до центра');
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:null,centerDistance:2200}),'Сочи');
 assert.equal(label('Москва',{centerDistance:NaN}),'Москва');
});
test('quick filters toggle independently and four-star range replaces five-star constraint',()=>{
 const toggle=context.keysQuickFilters;
 assert.deepEqual(Array.from(toggle(['Со спа'],'С бассейном')),['Со спа','С бассейном']);
 assert.deepEqual(Array.from(toggle(['Со спа','С бассейном'],'Со спа')),['С бассейном']);
 assert.deepEqual(Array.from(toggle(['5 звёзд','С завтраком'],'От 4 звёзд')),['С завтраком','От 4 звёзд']);
});
test('map collapses on a deliberate upward swipe, not a tap or horizontal/downward movement',()=>{
 const swipe=context.keysIsMapCollapseSwipe,start={x:100,y:200};
 assert.equal(swipe(start,{x:105,y:140}),true);
 for(const end of [{x:100,y:195},{x:160,y:190},{x:100,y:260},{x:180,y:145}])assert.equal(swipe(start,end),false);
 assert.equal(swipe(null,{x:100,y:100}),false);
});
test('search sorting uses displayed total, supports both price directions and keeps unknown prices last',()=>{
 context.tx=(hotel,search,tick)=>({total:hotel.total+tick});
 const hotels=[{id:'a',total:300,stars:3},{id:'b',total:100,stars:5},{id:'c',total:200,stars:4},{id:'d',total:NaN}];
 const ids=sort=>Array.from(context.keysSortHotels(hotels,{sort},20),hotel=>hotel.id);
 assert.deepEqual(ids('price'),['b','c','a','d']);
 assert.deepEqual(ids('price-desc'),['a','c','b','d']);
 assert.deepEqual(ids('stars-desc'),['b','c','a','d']);
 assert.deepEqual(ids('recommended'),['a','b','c','d']);
 assert.deepEqual(hotels.map(hotel=>hotel.id),['a','b','c','d']);
});
test('district filter derives districts from the selected city, combines with filters and can be cleared',()=>{
 const hotels=[{city:'Сочи',area:'Центр',id:1},{city:'Сочи',district:'Бытха',area:'other',id:2},{city:'Сочи',area:'Центр',id:3},{city:'Москва',area:'Арбат',id:4}];
 assert.deepEqual(Array.from(context.keysDistrictOptions(hotels,'Сочи')),['Бытха','Центр']);
 assert.deepEqual(Array.from(context.keysDistrictOptions(hotels,'')),[]);
 const search={city:'Сочи',filters:['Со спа']};
 search.filters=context.keysSetDistrict(search,'Центр');
 assert.deepEqual(Array.from(search.filters),['Со спа','Район: Сочи · Центр']);
 assert.deepEqual(Array.from(context.keysFilterDistrict(hotels,search),hotel=>hotel.id),[1,3]);
 assert.equal(context.keysDistrictValue({...search,city:'Москва'}),'');
 assert.deepEqual(Array.from(context.keysSetDistrict(search,'')),['Со спа']);
 assert.deepEqual(Array.from(context.keysSetDistrict(search,'Бытха')),['Со спа','Район: Сочи · Бытха']);
});
test('nightly price bounds preserve other filters, round-trip, and replace presets',()=>{
 const f=context.keysSetNightlyPrice(['Со спа','До 6 000 ₽/ночь'],5000,8000);
 assert.equal(f.length,2);
 assert.equal(f[0],'Со спа');
 assert.equal(context.keysNightlyPriceRange(f).min,5000);
 assert.equal(context.keysNightlyPriceRange(f).max,8000);
 assert.deepEqual(Array.from(context.keysSetNightlyPrice(f,null,null)),['Со спа']);
 assert.equal(context.keysNightlyPriceRange(context.keysSetNightlyPrice(f,'',9000)).min,null);
 assert.equal(context.keysNightlyPriceRange(context.keysSetNightlyPrice(f,4000,'')).max,null);
});
test('nightly filtering includes boundary prices and handles one-sided, empty and reversed ranges',()=>{
 const set=(min,max)=>context.keysSetNightlyPrice([],min,max),match=context.keysNightlyPriceMatches;
 assert.equal(match(5000,set(5000,8000)),true);
 assert.equal(match(8000,set(5000,8000)),true);
 assert.equal(match(4999,set(5000,8000)),false);
 assert.equal(match(8001,set(5000,8000)),false);
 assert.equal(match(10000,set(5000,null)),true);
 assert.equal(match(1000,set(null,5000)),true);
 assert.equal(match(6000,set(8000,5000)),false);
 assert.equal(match(NaN,set(5000,8000)),false);
 assert.equal(match(100000,[]),true);
 assert.equal(match(1,set(null,0)),false);
});
