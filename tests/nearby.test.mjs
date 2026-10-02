import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const scope={URLSearchParams};scope.window=scope;vm.runInNewContext(readFileSync('src/maps/2gis.js','utf8'),scope);vm.runInNewContext(readFileSync('src/home/nearby/nearby.js','utf8'),scope);
const {select,route,places}=scope.window.KeysNearby;
const base={filter:'for-you',interests:['food'],shortWalk:false};
test('nearby recommendations follow selected interests; all deliberately removes that constraint',()=>{
 assert.equal(select(base).map(p=>p.id).join(','),'market');
 assert.equal(select({...base,filter:'all'}).length,5);
 assert.equal(select({...base,interests:[]}).length,0);
});
test('nearby walking filter and theme intersect consistently in list and map',()=>{
 assert.equal(select({...base,filter:'all',shortWalk:true}).map(p=>p.id).join(','),'museum');
 assert.equal(select({...base,shortWalk:true}).length,0);
 assert.equal(select({...base,filter:'culture'}).map(p=>p.id).join(','),'museum,theatre');
});
test('routes start at the hotel and preserve transport mode for the selected place',()=>{
 for(const [mode,rtt] of Object.entries({walk:'pedestrian',transit:'bus',car:'car'})){
  const u=new URL(route(places.find(p=>p.id==='market'),mode));
  assert.equal(u.hostname,'2gis.ru');
  assert.equal(u.pathname,`/directions/tab/${rtt}/points/37.585621,55.737954|37.5725,55.727`);
 }
});
