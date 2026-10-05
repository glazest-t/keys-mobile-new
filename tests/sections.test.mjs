import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const now=Date.parse('2026-09-29T10:00:00Z');
const run=(s,a)=>e.reducer(s,{now,...a});
test('host stay stays Maidens, catalogue retains original 30 hotels',()=>{
 const s=e.keysInitialState();assert.equal(s.booking.hotelId,'maidens');assert.equal(s.booking.arrival,'2026-09-12');assert.equal(s.booking.party.adults,1);assert.equal(e.hotels.filter(h=>h.id!=='maidens').length,30);assert.equal(s.chat.conversations.maidens.hotelId,'maidens');
});
test('search parameters and results survive Find → Chats → Find',()=>{
 let s=e.keysInitialState();s=run(s,{type:'SEARCH_PATCH',patch:{city:'Сочи',party:{adults:1,childrenAges:[7],pet:true,business:false},filters:['spa']}});s=run(s,{type:'SEARCH_SUBMIT',city:'Сочи'});s=run(s,{type:'NAV_TAB',tab:'chats'});s=run(s,{type:'NAV_TAB',tab:'find'});assert.equal(s.search.results,true);assert.deepEqual(s.search.filters,['spa']);assert.deepEqual(s.search.party.childrenAges,[7]);
});
test('map → hotel → back returns to map',()=>{
 let s=e.keysInitialState();s=run(s,{type:'OPEN',screen:{type:'hotel-map'}});s=run(s,{type:'OPEN',screen:{type:'hotel',hotelId:'more'}});s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.type,'hotel-map');
});
test('saved hotels and price watches survive navigation',()=>{
 let s=e.keysInitialState();s=run(s,{type:'FAVORITE_TOGGLE',id:'more'});assert.ok(s.discovery.savedIds.includes('more'));s=run(s,{type:'WATCH_SAVE',hotelId:'more',targetPrice:5000});s=run(s,{type:'PRICES_REFRESH'});s=run(s,{type:'NAV_TAB',tab:'chats'});assert.ok(s.discovery.savedIds.includes('more'));assert.ok(JSON.stringify(s.discovery).includes('5000'));
});
test('assistant answers and dialogue can be reset and restored',()=>{
 let s=e.keysInitialState();s=run(s,{type:'CHAT_SEND',text:'Хочу тихий отель со спа у моря'});assert.ok(s.chat.discovery.some(m=>m.sender==='ai'));s=run(s,{type:'CHAT_RESET'});assert.equal(s.chat.discovery.length,0);assert.ok(s.chat.discoveryHistory.length);s=run(s,{type:'CHAT_RESTORE',id:s.chat.discoveryHistory[0].id});assert.ok(s.chat.discovery.length);
});
test('Maidens reply uses current tariff and breakfast, never Swissotel context',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_CHAT_SEND',hotelId:'maidens',text:'Во сколько завтрак?'});const answer=s.chat.conversations.maidens.messages.at(-1).text;assert.match(answer,/07:00/);assert.match(answer,/12:00/);assert.match(answer,/680/);assert.match(answer,/не включён/);assert.doesNotMatch(answer,/моря|обоих гостей/);
});
test('new hotel conversation supports drafts, send, unread and handoff',()=>{
 let s=e.keysInitialState();s=run(s,{type:'OPEN',screen:{type:'chat',hotelId:'palm'}});s=run(s,{type:'HOTEL_CHAT_DRAFT',hotelId:'palm',text:'Есть завтрак?'});assert.equal(s.chat.conversations.palm.draft,'Есть завтрак?');s=run(s,{type:'HOTEL_CHAT_SEND',hotelId:'palm',text:'Есть завтрак?'});assert.equal(s.chat.conversations.palm.draft,'');assert.ok(s.chat.conversations.palm.messages.some(m=>m.sender==='ai'));s=run(s,{type:'HANDOFF',hotelId:'palm'});assert.equal(s.chat.conversations.palm.human,true);
});
test('booking, payment and success remain original working flow',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});assert.ok(s.reservation);s=run(s,{type:'RESERVATION_NEXT'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});s=run(s,{type:'MOCK_PROGRESS',now:now+600000});assert.equal(s.reservation.status,'confirmed');assert.equal(s.navigation.screen.type,'reservation-success');
});
test('Trips, Benefits and Profile return to host, Find and Chats remain in original reducer',()=>{
 const messages=[];globalThis.window={parent:{postMessage:m=>messages.push(m)},location:{origin:'http://127.0.0.1:8765'}};
 for(const [action,target] of [[{type:'NAV_TAB',tab:'trips'},'trips'],[{type:'NAV_TAB',tab:'bonuses'},'benefits'],[{type:'OPEN',screen:{type:'profile'}},'profile'],[{type:'OPEN',screen:{type:'stay-feedback'}},'feedback']]){assert.equal(e.keysRouteToHost(action),true);assert.equal(messages.at(-1).target,target);}
 assert.equal(e.keysRouteToHost({type:'NAV_TAB',tab:'find'}),false);assert.equal(e.keysRouteToHost({type:'NAV_TAB',tab:'chats'}),false);
});
test('base prototype retains logic and approved home edits',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../design/sections-migration.json',import.meta.url),'utf8'));
 const baseline=await readFile(new URL('../'+manifest.backup+'/src/prototype.html',import.meta.url),'utf8');
 // User-approved removal of the route block from the home screen.
 const expected=baseline.replace(/      <div class="k3-section-head"><h2>Маршрут поездки<\/h2><button data-info="route">Целиком<\/button><\/div>\n      <section class="k3-route">[\s\S]*?      <\/section>\n/, '');
 assert.equal(await readFile(new URL('../src/prototype.html',import.meta.url),'utf8'),expected);
});

test('recent searches restore guests, car preference, filters and sorting without inheriting another search',()=>{
 const user='find-history-test';
 const search={...e.keysInitialState().search,city:'Сочи',arrival:'2026-10-01',departure:'2026-10-20',party:{adults:2,childrenAges:[8],pet:false,business:true,car:true},filters:['Со спа','Отчётные документы'],sort:'price'};
 e.recordSearch(user,search,100);
 e.recordHotel(user,{id:'more',name:'Swissôtel Камелия'},110);
 let saved=e.recentHistory(user);
 assert.equal(saved.searches.length,1);assert.equal(saved.hotels.length,1);
 assert.equal(saved.searches[0].party.car,true);
 let state=e.keysInitialState();
 e.keysRepeatSearch(action=>{state=run(state,action)},saved.searches[0]);
 assert.equal(state.search.city,'Сочи');assert.equal(state.search.departure,'2026-10-20');
 assert.deepEqual(state.search.party,search.party);assert.deepEqual(state.search.filters,search.filters);
 assert.equal(state.search.sort,'price');assert.equal(state.search.results,true);
 // Repeating a search moves it up without adding duplicate cards; different filters remain distinct.
 e.recordSearch(user,search,120);assert.equal(e.recentHistory(user).searches.length,1);
 e.recordSearch(user,{...search,filters:['С бассейном']},130);assert.equal(e.recentHistory(user).searches.length,2);
 assert.equal(e.recentHistory(user).hotels.length,1);
 const legacy=e.parseRecent(JSON.stringify({searches:[{...search,party:{adults:1,childrenAges:[],pet:false,business:false},filters:undefined,at:1}],hotels:[]}));
 assert.equal(legacy.searches[0].party.car,false);assert.deepEqual(legacy.searches[0].filters,[]);
});

test('hotel inner screens unwind to saved list and preserve the selected search',()=>{
 let s=e.keysInitialState();
 s=run(s,{type:'SEARCH_SUBMIT',city:'Сочи'});
 s=run(s,{type:'OPEN',screen:{type:'saved'}});
 s=run(s,{type:'HOTEL_OPEN',id:'more'});
 const hotel={...s.navigation.screen};
 for(const screen of [{type:'hotel-reviews',hotelId:'more'},{type:'hotel-map',hotelId:'more'},{type:'price-watch',hotelId:'more'},{type:'hotel',hotelId:'more',rooms:true}]){
  s=run(s,{type:'OPEN',screen});s=run(s,{type:'BACK'});
  assert.deepEqual(s.navigation.screen,hotel);
 }
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen.type,'saved');
 s=run(s,{type:'BACK'});assert.equal(s.navigation.screen,null);
 assert.equal(s.search.results,true);assert.equal(s.search.city,'Сочи');
});
