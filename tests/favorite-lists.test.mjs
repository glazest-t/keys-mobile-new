import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
let now=1792082400000;
const run=(s,a)=>e.reducer(s,{now:++now,...a});
const initial=()=>{const s=e.keysInitialState();return {...s,discovery:{...s.discovery,savedIds:[]}};};
test('one naming prompt, then automatic grouping; removal and swipe undo stay consistent',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});
 assert.deepEqual(s.keysFavoritePending,['more']);
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'  Море  '});
 assert.equal(s.keysFavoriteGroups[0].name,'Море');
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});
 assert.equal(s.keysFavoritePending,null);assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['more','park']);
 s=run(s,{type:'FAVORITE_TOGGLE',id:'more'});assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['park']);
 s=run(s,{type:'SWIPE',id:'more',liked:true});assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['park','more']);
 s=run(s,{type:'SWIPE_UNDO'});assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['park']);
});
test('server hydration does not prompt, explicit remote saving does',()=>{
 let s=run(initial(),{type:'FAVORITES_REPLACE',ids:['more']});assert.equal(s.keysFavoritePending,null);
 s=run(s,{type:'KEYS_FAVORITE_INTENT',id:'park'});
 s=run(s,{type:'FAVORITES_REPLACE',ids:['more','park']});assert.deepEqual(s.keysFavoritePending,['park']);
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:''});assert.equal(s.keysFavoriteGroups[0].name,'Моя поездка');
 s=run(s,{type:'KEYS_FAVORITE_INTENT',id:'forest'});s=run(s,{type:'FAVORITES_REPLACE',ids:['more','park','forest']});
 assert.equal(s.keysFavoritePending,null);assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['park','forest']);
});
test('moving hotels preserves favorites; creating a list changes the session default',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Море'});
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Город'});const target=s.keysFavoriteGroups[1].id;
 s=run(s,{type:'KEYS_FAVORITE_MOVE',hotelId:'more',listId:target});
 assert.deepEqual(s.discovery.savedIds,['more']);assert.deepEqual(s.keysFavoriteGroups.map(g=>g.hotelIds),[[],['more']]);
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});assert.deepEqual(s.keysFavoriteGroups[1].hotelIds,['more','park']);
});
test('saved hotel quote responds to both stay dates and guest count without losing groups',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Отдых'});
 const groups=s.keysFavoriteGroups,hotel=e.hotel('more');
 s=run(s,{type:'SEARCH_PATCH',patch:{arrival:'2026-10-20',departure:'2026-10-21',party:{adults:1,childrenAges:[],pet:false,business:false}}});
 const first=e.hotelPrice(hotel,s.search,0).total;
 s=run(s,{type:'SEARCH_PATCH',patch:{departure:'2026-10-23'}});const longer=e.hotelPrice(hotel,s.search,0).total;assert.ok(longer>first);
 s=run(s,{type:'SEARCH_PATCH',patch:{party:{...s.search.party,adults:3}}});assert.ok(e.hotelPrice(hotel,s.search,0).total>longer);assert.deepEqual(s.keysFavoriteGroups,groups);
});
test('lists survive reload; the naming prompt resets only with a new session',()=>{
 const local=new Map(),session=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>local.get(k)||null}});
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:k=>session.get(k)||null}});
 local.set('keys-favorite-lists-v1',JSON.stringify({ids:['more'],groups:[{id:'summer',name:'Лето',hotelIds:['more']}]}));
 session.set('keys-favorite-session-v1',JSON.stringify({asked:true,active:'summer'}));
 let s=run(e.keysInitialState(),{type:'FAVORITE_TOGGLE',id:'park'});
 assert.equal(s.keysFavoritePending,null);assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['more','park']);
 session.clear();s=run(e.keysInitialState(),{type:'FAVORITE_TOGGLE',id:'park'});
 assert.deepEqual(s.keysFavoritePending,['park']);assert.equal(s.keysFavoriteGroups[0].name,'Лето');
 delete globalThis.localStorage;delete globalThis.sessionStorage;
});
test('two quick remote saves both join the same pending collection',()=>{
 let s=run(initial(),{type:'KEYS_FAVORITE_INTENT',id:'more'});s=run(s,{type:'KEYS_FAVORITE_INTENT',id:'park'});
 s=run(s,{type:'FAVORITES_REPLACE',ids:['more']});s=run(s,{type:'FAVORITES_REPLACE',ids:['more','park']});
 assert.deepEqual(s.keysFavoritePending,['more','park']);s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Лето'});assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['more','park']);
});
test('hotel notes are independent, editable and retained when moving a hotel',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Море'});
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});
 s=run(s,{type:'KEYS_FAVORITE_NOTE',hotelId:'more',text:'  Тихий номер\nУточнить вид из окна  '});
 s=run(s,{type:'KEYS_FAVORITE_NOTE',hotelId:'park',text:'Рядом с вокзалом'});
 assert.equal(s.keysFavoriteNotes.more,'Тихий номер\nУточнить вид из окна');
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Отпуск'});s=run(s,{type:'KEYS_FAVORITE_MOVE',hotelId:'more',listId:s.keysFavoriteGroups[1].id});
 assert.equal(s.keysFavoriteNotes.more,'Тихий номер\nУточнить вид из окна');
 s=run(s,{type:'KEYS_FAVORITE_NOTE',hotelId:'more',text:'Попросить высокий этаж'});assert.equal(s.keysFavoriteNotes.more,'Попросить высокий этаж');
 s=run(s,{type:'KEYS_FAVORITE_NOTE',hotelId:'more',text:''});assert.equal(s.keysFavoriteNotes.more,undefined);assert.equal(s.keysFavoriteNotes.park,'Рядом с вокзалом');
});
test('stored hotel notes reload as plain text; old collections without notes still load',()=>{
 const saved={ids:['more'],groups:[],notes:{more:'Тихий номер <b>не HTML</b>',invalid:42}};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>k==='keys-favorite-lists-v1'?JSON.stringify(saved):null}});
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:()=>null}});
 assert.deepEqual(e.keysInitialState().keysFavoriteNotes,{more:'Тихий номер <b>не HTML</b>'});
 delete saved.notes;assert.deepEqual(e.keysInitialState().discovery.savedIds,['more']);
 delete globalThis.localStorage;delete globalThis.sessionStorage;
});
test('remote bootstrap does not erase collection membership or hotel notes on reload',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Лето'});
 s=run(s,{type:'KEYS_FAVORITE_NOTE',hotelId:'more',text:'Вид на море'});
 s=run(s,{type:'FAVORITES_REPLACE',ids:[]});s=run(s,{type:'FAVORITES_REPLACE',ids:['more']});
 assert.deepEqual(s.keysFavoriteGroups[0].hotelIds,['more']);assert.equal(s.keysFavoriteNotes.more,'Вид на море');assert.equal(s.keysFavoritePending,null);
});
test('collection opens as a separate screen and Back returns hotel → collection → overview',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Лето'});const id=s.keysFavoriteGroups[0].id;
 s=run(s,{type:'OPEN',screen:{type:'saved'}});s=run(s,{type:'OPEN',screen:{type:'saved',collectionId:id}});
 s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'BACK'});
 assert.equal(s.navigation.screen.collectionId,id);assert.equal(e.keysReturnsToHost(s,{type:'BACK'},{kind:'screen',screen:'saved'}),false);
 s=run(s,{type:'BACK'});assert.deepEqual(s.navigation.screen,{type:'saved'});
});
