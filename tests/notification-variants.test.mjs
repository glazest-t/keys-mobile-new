import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({setTimeout,clearTimeout});
for(const file of ['push-demo-data.js','notification-model.js'])vm.runInContext(readFileSync(new URL('../src/scenarios/'+file,import.meta.url),'utf8'),context);
const model=context.KeysNotificationModel;
const items=['checkin-guide','stay-points','demo-more-price','demo-more-review'].map((id,i)=>({...model.get(id),createdAt:`2026-10-28T12:0${i}:00Z`,readAt:null}));
test('hotel scope and notification type filters intersect without leaking another hotel',()=>{
 assert.deepEqual(Array.from(model.select(items,{hotelId:'more',category:'price'}),x=>x.id),['demo-more-price']);
 assert.equal(model.select(items,{hotelId:'maidens',category:'price'}).length,0);
 assert.equal(model.select(items,{hotelId:'more'}).length,2);
});
test('all notifications are grouped by hotel and keep newest-first order',()=>{
 const groups=model.group(model.select(items));
 assert.deepEqual(Array.from(groups,g=>g.hotel),['Swissôtel Камелия','Maidens Hotel']);
 assert.deepEqual(Array.from(groups[0].items,x=>x.id),['demo-more-review','demo-more-price']);
});
test('account notices are not attributed to a hotel',()=>{
 const account=model.legacy({id:'welcome',category:'account',createdAt:'2026-10-28T12:00:00Z'});
 assert.equal(account.hotelId,null);
 assert.equal(model.select([account],{hotelId:'maidens'}).length,0);
 assert.equal(model.group([account])[0].hotel,'Ключи');
});
test('all push examples have a filter category and hotel identity',()=>{
 for(const item of context.KeysPushCatalog.types){const enriched=model.get(item.id);assert.ok(enriched.hotelId);assert.ok(model.categories.some(([id])=>id===enriched.category));}
 assert.equal(model.get('invalid'),undefined);
});
test('timeline groups a filtered inbox chronologically across month boundaries',()=>{
 const items=[{id:'old',hotelId:'more',createdAt:'2026-09-29T12:00:00'}, {id:'yesterday',hotelId:'maidens',createdAt:'2026-09-30T21:00:00'}, {id:'today',hotelId:'maidens',createdAt:'2026-10-01T12:00:00'}];
 const groups=model.groupByDate(items,new Date('2026-10-01T15:00:00'));
 assert.deepEqual(Array.from(groups,g=>g.label),['Сегодня','Вчера','29 сентября']);
 assert.deepEqual(Array.from(groups,g=>g.items[0].id),['today','yesterday','old']);
 assert.equal(model.groupByDate(model.select(items,{hotelId:'maidens'})).flatMap(g=>g.items).length,2);
 assert.equal(model.groupByDate([]).length,0);
});
