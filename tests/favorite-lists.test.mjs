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
test('save confirmation names the chosen collection and targets the latest saved hotel',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Море'});const listId=s.keysFavoriteGroups[0].id;
 assert.equal(s.keysFavoriteNotice.listId,listId);assert.deepEqual(s.keysFavoriteNotice.hotelIds,['more']);
 const previousToken=s.keysFavoriteNotice.token;
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});
 assert.equal(s.keysFavoriteNotice.listId,listId);assert.deepEqual(s.keysFavoriteNotice.hotelIds,['park']);
 s=run(s,{type:'KEYS_FAVORITE_NOTICE_CLOSE',token:previousToken});assert.ok(s.keysFavoriteNotice);
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});assert.equal(s.keysFavoriteNotice,null);
});
test('changing the collection from confirmation moves only that hotel and updates the session',()=>{
 let s=run(initial(),{type:'KEYS_FAVORITE_LIST',name:'Город'});const city=s.keysFavoriteSession.active;
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Море'});const sea=s.keysFavoriteSession.active;
 s=run(s,{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});
 s=run(s,{type:'KEYS_FAVORITE_CHANGE',hotelIds:s.keysFavoriteNotice.hotelIds});
 assert.deepEqual(s.keysFavoriteGroups.find(g=>g.id===sea).hotelIds,['more','park']);
 s=run(s,{type:'KEYS_FAVORITE_LIST',id:city});
 assert.deepEqual(s.keysFavoriteGroups.find(g=>g.id===sea).hotelIds,['more']);
 assert.deepEqual(s.keysFavoriteGroups.find(g=>g.id===city).hotelIds,['park']);
 assert.equal(s.keysFavoriteSession.active,city);assert.equal(s.keysFavoriteNotice.listId,city);
 s=run(s,{type:'FAVORITE_TOGGLE',id:'forest'});
 assert.deepEqual(s.keysFavoriteGroups.find(g=>g.id===city).hotelIds,['park','forest']);
});
test('cancelling a collection change preserves membership and the session destination',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Лето'});
 const groups=s.keysFavoriteGroups,session=s.keysFavoriteSession;
 s=run(s,{type:'KEYS_FAVORITE_CHANGE',hotelIds:['more']});s=run(s,{type:'KEYS_FAVORITE_CANCEL'});
 assert.deepEqual(s.keysFavoriteGroups,groups);assert.deepEqual(s.keysFavoriteSession,session);assert.equal(s.keysFavoriteEditing,null);
 s=run(s,{type:'KEYS_FAVORITE_CHANGE',hotelIds:['more']});s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Осень'});
 assert.deepEqual(s.keysFavoriteGroups.map(g=>g.hotelIds),[[],['more']]);assert.equal(s.keysFavoriteGroups[1].name,'Осень');
});
test('remote acknowledgement cannot overwrite the collection chooser or actionable confirmation',()=>{
 let s=run(initial(),{type:'KEYS_FAVORITE_INTENT',id:'more'});s=run(s,{type:'FAVORITES_REPLACE',ids:['more']});
 s=run(s,{type:'TOAST',message:'Отель сохранён'});assert.deepEqual(s.keysFavoritePending,['more']);assert.equal(s.ui.toast,'');
 s=run(s,{type:'KEYS_FAVORITE_LIST',name:'Море'});const notice=s.keysFavoriteNotice;
 s=run(s,{type:'TOAST',message:'Отель сохранён'});assert.deepEqual(s.keysFavoriteNotice,notice);assert.equal(s.ui.toast,'');
 s=run(s,{type:'TOAST',message:'Другая операция'});assert.equal(s.keysFavoriteNotice,null);assert.equal(s.ui.toast,'Другая операция');
});
test('closing the first chooser does not silently create a collection',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_CANCEL'});
 assert.deepEqual(s.discovery.savedIds,['more']);assert.equal(s.keysFavoriteGroups.length,0);assert.equal(s.keysFavoritePending,null);
 s=run(s,{type:'FAVORITE_TOGGLE',id:'park'});assert.deepEqual(s.keysFavoritePending,['park']);
});
test('collection map includes only its saved hotels regardless of search city and filters',()=>{
 const base=initial(),first=e.hotels[0],other=e.hotels.find(h=>h.city!==first.city)||e.hotel('maidens'),outside=e.hotels.find(h=>h.id!==first.id&&h.id!==other.id);
 let s={...base,discovery:{...base.discovery,savedIds:[first.id,other.id,outside.id]},keysFavoriteGroups:[{id:'trip',name:'Поездка',hotelIds:[first.id,other.id,'removed',first.id]},{id:'other',name:'Другое',hotelIds:[outside.id]}]};
 s=run(s,{type:'SEARCH_PATCH',patch:{city:'Казань',filters:['Бассейн'],sort:'price'}});
 assert.deepEqual(e.keysFavoriteCollection(s,'trip').hotelIds,[first.id,other.id]);
 assert.equal(e.keysFavoriteCollection(s,'missing'),null);
 s={...s,discovery:{...s.discovery,savedIds:[outside.id]}};
 assert.deepEqual(e.keysFavoriteCollection(s,'trip').hotelIds,[]);
});
test('ungrouped map and return path retain the exact favorite collection',()=>{
 let s=run(initial(),{type:'FAVORITE_TOGGLE',id:'more'});s=run(s,{type:'KEYS_FAVORITE_CANCEL'});
 assert.deepEqual(e.keysFavoriteCollection(s,'__unassigned').hotelIds,['more']);
 s=run(s,{type:'OPEN',screen:{type:'saved'}});s=run(s,{type:'OPEN',screen:{type:'saved',collectionId:'__unassigned'}});
 s=run(s,{type:'OPEN',screen:{type:'hotel-map',collectionId:'__unassigned'}});assert.equal(e.keysShowBottomNav(s),true);
 s=run(s,{type:'HOTEL_OPEN',id:'more'});assert.equal(e.keysShowBottomNav(s),false);
 s=run(s,{type:'BACK'});assert.deepEqual(s.navigation.screen,{type:'hotel-map',collectionId:'__unassigned'});
 s=run(s,{type:'BACK'});assert.deepEqual(s.navigation.screen,{type:'saved',collectionId:'__unassigned'});
});
