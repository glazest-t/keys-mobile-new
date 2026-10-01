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
