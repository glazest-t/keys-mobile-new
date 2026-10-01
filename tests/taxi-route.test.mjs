import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/scenarios/taxi-route.js',import.meta.url),'utf8');
function api(geolocation){const context={URL,setTimeout,clearTimeout,navigator:{geolocation}};vm.runInNewContext(source,context);return context.KeysTaxiRoute;}
test('Go link carries the actual origin and fixed hotel destination',()=>{
 const url=new URL(api().createUrl({latitude:55.75,longitude:37.61}));
 assert.equal(url.origin,'https://3.redirect.appmetrica.yandex.com');assert.equal(url.searchParams.get('start-lat'),'55.75');assert.equal(url.searchParams.get('start-lon'),'37.61');assert.equal(url.searchParams.get('end-lat'),'55.737954');assert.equal(url.searchParams.get('end-lon'),'37.585621');assert.equal(url.searchParams.get('appmetrica_tracking_id'),'25395763362139037');
});
test('missing or invalid location never becomes a fabricated pickup point',()=>{
 for(const p of [undefined,{latitude:NaN,longitude:0},{latitude:91,longitude:181}]){const u=new URL(api().createUrl(p));assert.equal(u.searchParams.has('start-lat'),false);assert.equal(u.searchParams.has('start-lon'),false);assert.equal(u.searchParams.has('end-lat'),true);}
 assert.equal(new URL(api().createUrl({latitude:0,longitude:0})).searchParams.get('start-lat'),'0');
});
test('location is requested with bounded timeout and only coordinates are returned',async()=>{
 const value=await api({getCurrentPosition(ok,fail,options){assert.equal(options.timeout,10000);ok({coords:{latitude:1,longitude:2,accuracy:10},timestamp:123});}}).locate();
 assert.deepEqual(JSON.parse(JSON.stringify(value)),{latitude:1,longitude:2});
});
test('permission denial, timeout and unavailable geolocation reach fallback',async()=>{
 for(const code of [1,2,3])await assert.rejects(api({getCurrentPosition(ok,fail){fail({code});}}).locate(),e=>e.code===code);
 await assert.rejects(api().locate(),e=>e.code===0);
});
