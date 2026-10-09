import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const now=Date.parse('2026-09-29T10:00:00Z');
const run=(s,a)=>e.reducer(s,{now,...a});
const completeGuest=s=>run(s,{type:'RESERVATION_CONTACT',contact:{...s.reservation.contact,lastName:'Иванова',email:'guest@example.test'}});
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
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});assert.ok(s.reservation);s=run(s,{type:'RESERVATION_NEXT'});s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'sbp'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});s=run(s,{type:'MOCK_PROGRESS',now:now+600000});assert.equal(s.reservation.status,'confirmed');assert.equal(s.navigation.screen.type,'reservation-success');
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

test('editing dates and guests at payment updates the stay and preserves the selected booking',()=>{
 let s=e.keysInitialState();
 s=run(s,{type:'HOTEL_OPEN',id:'more'});
 s=run(s,{type:'RESERVATION_START'});
 s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});
 s=run(s,{type:'RESERVATION_NEXT'});
 assert.equal(s.navigation.screen.type,'reservation-payment');
 const before=structuredClone(s.reservation);
 const party={...before.party,adults:3,childrenAges:[]};
 s=run(s,{type:'SEARCH_PATCH',patch:{arrival:'2026-11-01',departure:'2026-11-06',party}});
 assert.equal(s.navigation.screen.type,'reservation-payment');
 assert.equal(s.reservation.arrival,'2026-11-01');
 assert.equal(s.reservation.departure,'2026-11-06');
 assert.equal(s.reservation.party.adults,3);
 assert.notEqual(s.reservation.baseTotal,before.baseTotal);
 for(const key of ['id','room','tariffId','contact','paymentMethod','usePoints'])assert.deepEqual(s.reservation[key],before[key]);
 assert.equal(s.reservation.extras.length,before.extras.length);
 assert.ok(s.reservation.extras.every(extra=>extra.date>='2026-11-01'&&extra.date<'2026-11-06'));
 s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'sbp'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
 assert.equal(s.reservation.status,'processing');
 const processing=structuredClone(s.reservation);
 s=run(s,{type:'SEARCH_PATCH',patch:{party:{...party,adults:2}}});
 assert.deepEqual(s.reservation,processing);
});

test('checkout requires a method but defers bank card details to the later payment step',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});
 assert.equal(s.reservation.paymentMethod,'');
 s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.match(s.reservation.error,/Выберите способ/);
 for(const method of ['card','sbp','digital-ruble','sberpay','yandexpay']){
  let other=run(completeGuest(s),{type:'RESERVATION_METHOD',method});assert.equal(other.reservation.paymentMethod,method);
  other=run(other,{type:'RESERVATION_PAY',draftId:other.reservation.id});assert.equal(other.reservation.status,'processing');
 }
});

test('points toggle spends both complete wallets, ignores a custom amount and settles once',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});
 const balance=s.loyalty.balance,original=e.checkoutTotal(s.reservation).total,hotel=1500;
 s=run(s,{type:'RESERVATION_POINTS',enabled:true,amount:2537});assert.equal(e.keysPointsUsed(s.reservation),balance);assert.equal(s.reservation.hotelPointsAmount,hotel);assert.equal(e.checkoutTotal(s.reservation).total,original-balance-hotel);
 s=run(s,{type:'RESERVATION_POINTS',enabled:false});assert.equal(e.checkoutTotal(s.reservation).total,original);assert.equal(s.loyalty.balance,balance);
 s=run(s,{type:'RESERVATION_POINTS',enabled:true});s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'sbp'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});s=run(s,{type:'MOCK_PROGRESS',now:now+600000});
 assert.equal(s.reservation.status,'confirmed');assert.equal(s.booking.pointsSpent,balance);assert.equal(s.booking.hotelPointsSpent,hotel);assert.equal(s.booking.pointsDiscount,balance+hotel);assert.equal(s.loyalty.balance,0);assert.equal(s.keysHotelPoints.more,0);assert.equal(s.booking.payment.amount,original-balance-hotel);
});
test('all-points redemption handles zero wallets and never exceeds room cost',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});
 s={...s,loyalty:{...s.loyalty,balance:0},keysHotelPoints:{more:0}};
 s=run(s,{type:'RESERVATION_POINTS',enabled:true});assert.equal(s.reservation.usePoints,false);
 s={...s,loyalty:{...s.loyalty,balance:999999}};
 s=run(s,{type:'RESERVATION_POINTS',enabled:true});assert.equal(s.reservation.usePoints,false);assert.ok(e.checkoutTotal(s.reservation).total>=0);
 s={...s,loyalty:{...s.loyalty,balance:0},keysHotelPoints:{more:500,palm:900}};
 s=run(s,{type:'RESERVATION_POINTS',enabled:true});assert.equal(s.reservation.usePoints,true);assert.equal(s.reservation.hotelPointsAmount,500);
});
test('full redemption revalidates changed wallets before confirmation',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});s=run(s,{type:'RESERVATION_POINTS',enabled:true});
 s={...s,keysHotelPoints:{more:0}};s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.equal(s.reservation.status,'editing');assert.match(s.reservation.error,/баллов/);
});

test('created booking details retain the exact confirmed record when another draft is started',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_TARIFF',id:'saving'});s=run(s,{type:'RESERVATION_NEXT'});s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'sbp'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});s=run(s,{type:'MOCK_PROGRESS',now:now+600000});
 const id=s.booking.id,record=structuredClone(s.keysCreatedBookings[id]);
 assert.equal(record.booking.hotelId,'more');assert.equal(record.draft.tariffId,'saving');assert.equal(record.booking.payment.amount,e.checkoutTotal(record.draft).total);
 s=run(s,{type:'HOTEL_OPEN',id:'palm'});s=run(s,{type:'RESERVATION_START',hotelId:'palm'});
 s=run(s,{type:'OPEN',screen:{type:'created-booking',bookingId:id}});
 assert.equal(s.navigation.screen.bookingId,id);assert.deepEqual(s.keysCreatedBookings[id],record);
});

test('pay at arrival confirms once without a bank payment and preserves the hotel amount due',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});s=run(s,{type:'RESERVATION_NEXT'});
 const balance=s.loyalty.balance;
 s=run(s,{type:'RESERVATION_POINTS',enabled:true,amount:753});
 s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});
 const due=e.checkoutTotal(s.reservation).total,id=s.reservation.id;
 s=run(s,{type:'RESERVATION_PAY',draftId:id});
 assert.equal(s.reservation.status,'confirmed');assert.equal(s.navigation.screen.type,'reservation-success');
 assert.equal(s.booking.payment.method,'arrival');assert.equal(s.booking.payment.status,'pending');assert.equal(s.booking.payment.amount,0);assert.equal(s.booking.paid,0);assert.equal(s.booking.dueAtHotel,due);
 assert.equal(s.booking.pointsSpent,balance);assert.equal(s.booking.hotelPointsSpent,1500);assert.equal(s.loyalty.balance,0);assert.equal(s.keysHotelPoints.more,0);
 assert.ok(s.orders.length);assert.ok(s.orders.every(order=>!order.paid));assert.equal(s.keysCreatedBookings[s.booking.id].booking.dueAtHotel,due);
 const confirmed=s;s=run(s,{type:'RESERVATION_PAY',draftId:id});s=run(s,{type:'MOCK_PROGRESS',now:now+600000});assert.equal(s.booking.id,confirmed.booking.id);assert.equal(s.loyalty.balance,confirmed.loyalty.balance);
});


test('checkout starts with login name and phone and requires surname and email',()=>{
 let s=e.keysInitialState();assert.equal(s.profile.lastName,'');assert.equal(s.profile.email,'');assert.ok(s.profile.firstName);assert.ok(s.profile.phone);
 s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});
 for(const contact of [{...s.reservation.contact},{...s.reservation.contact,lastName:'Иванова',email:'invalid'},{...s.reservation.contact,email:'guest@example.test'}]){
  s=run(s,{type:'RESERVATION_CONTACT',contact});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.notEqual(s.reservation.status,'confirmed');assert.ok(s.reservation.error);
 }
 s=completeGuest(s);s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.equal(s.reservation.status,'confirmed');
});
test('only explicit profile saving reuses completed contacts in a future booking',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});
 const before=s.profile;s=run(s,{type:'KEYS_CHECKOUT_PROFILE_SAVE',contact:s.reservation.contact});assert.equal(s.profile,before);
 s=completeGuest(s);assert.equal(s.profile.email,'');assert.equal(s.profile.lastName,'');
 s=run(s,{type:'KEYS_CHECKOUT_PROFILE_SAVE',contact:s.reservation.contact});assert.equal(s.profile.email,'guest@example.test');assert.equal(s.keysProfileSaved,1);
 s=run(s,{type:'RESERVATION_START',hotelId:'palm'});assert.equal(s.reservation.contact.email,'guest@example.test');assert.equal(s.reservation.contact.lastName,'Иванова');
 s=run(s,{type:'KEYS_LOGIN_CONTACT',contact:{firstName:'Ольга',phone:'+7 (900) 111-22-33'}});assert.equal(s.reservation,null);assert.equal(s.profile.lastName,'');assert.equal(s.profile.email,'');assert.equal(s.profile.firstName,'Ольга');
});

test('auth bootstrap does not replace checkout identity with the fully filled demo persona',()=>{
 const initial=e.keysInitialState();const next=e.hydrateIdentity(initial,{personaId:'anya',firstName:'Татьяна',lastName:'Глазырина',phone:'+79000000000',email:'demo@example.test'});
 assert.deepEqual(next.profile,initial.profile);assert.equal(next.profile.lastName,'');assert.equal(next.profile.email,'');assert.ok(next.profile.phone);
});

test('profile checkbox saves only after confirmation and can be unchecked',()=>{
 for(const save of [false,true]){
  let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=completeGuest(s);
  s=run(s,{type:'KEYS_CHECKOUT_SAVE_CONTACT',enabled:true});assert.equal(s.profile.email,'');
  if(!save)s=run(s,{type:'KEYS_CHECKOUT_SAVE_CONTACT',enabled:false});
  s=run(s,{type:'RESERVATION_NEXT'});s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
  assert.equal(s.reservation.status,'confirmed');assert.equal(s.profile.email,save?'guest@example.test':'');assert.equal(s.keysProfileSaved||0,save?1:0);
 }
});
test('second guest is autosaved, survives reopening and cannot silently lose partial input',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=completeGuest(s);
 s=run(s,{type:'KEYS_RESERVATION_GUEST_PATCH',guest:{firstName:'Олег',lastName:''}});
 assert.equal(s.reservation.additionalGuestDraft.firstName,'Олег');assert.deepEqual(s.reservation.additionalGuests,[]);
 s=run(s,{type:'RESERVATION_NEXT'});s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.match(s.reservation.error,/второго гостя/);assert.equal(s.reservation.status,'editing');
 s=run(s,{type:'KEYS_RESERVATION_GUEST_PATCH',guest:{firstName:'Олег',lastName:'Иванов'}});assert.equal(s.reservation.additionalGuests[0].lastName,'Иванов');
 s=run(s,{type:'KEYS_RESERVATION_GUEST_PATCH',guest:{firstName:'',lastName:''}});assert.deepEqual(s.reservation.additionalGuests,[]);
 s=run(s,{type:'KEYS_RESERVATION_GUEST_PATCH',guest:{firstName:'Олег',lastName:'Петров'}});
 s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});assert.equal(s.reservation.status,'confirmed');assert.equal(s.booking.additionalGuests[0].lastName,'Петров');
});

test('payment timing filters separate arrival from all online methods',()=>{
 for(const id of ['arrival','card','sbp','digital-ruble','sberpay','yandexpay']){
  assert.equal(e.keysPaymentMethodMatches(id,'all'),true);
  assert.equal(e.keysPaymentMethodMatches(id,'later'),id==='arrival');
  assert.equal(e.keysPaymentMethodMatches(id,'now'),id!=='arrival');
 }
});
test('checkout service toggle adds once and removes without selecting a time',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});
 const initial=e.checkoutTotal(s.reservation).total;
 for(const id of ['dinner','spa','breakfast']){
  s=run(s,{type:'RESERVATION_EXTRA',id,selected:true});assert.equal(s.reservation.extras.length,1);const price=s.reservation.extras[0].price;assert.equal(e.checkoutTotal(s.reservation).total,initial+price);
  s=run(s,{type:'RESERVATION_EXTRA',id,selected:true});assert.equal(s.reservation.extras.length,1);
  s=run(s,{type:'RESERVATION_EXTRA',id,selected:false});assert.equal(s.reservation.extras.length,0);assert.equal(e.checkoutTotal(s.reservation).total,initial);
 }
});

test('five Swissotel rates keep meals, price and cancellation in sync with selected booking',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});
 const offers=e.roomOffers(s.reservation);assert.equal(offers.length,5);assert.equal(new Set(offers.map(o=>o.id)).size,5);
 for(const offer of offers){
  s=run(s,{type:'RESERVATION_TARIFF',id:offer.id});
  assert.equal(s.reservation.tariffId,offer.id);
  assert.equal(e.checkoutTotal(s.reservation).room,offer.price);
  const selected=e.roomOffers(s.reservation).filter(o=>o.selected);assert.equal(selected.length,1);assert.equal(selected[0].id,offer.id);
 }
 assert.equal(e.tariff('more','room-only').includesBreakfast,false);
 assert.equal(e.tariff('more','breakfast-arrival').includesBreakfast,true);
 assert.equal(e.tariff('more','room-flexible').requiresPrepayment,false);
 assert.match(offers.find(o=>o.id==='breakfast-arrival').terms.join(' '),/оплата при заселении/);
 assert.equal(offers.find(o=>o.id==='room-only').discountLabel,'');
 s=run(s,{type:'RESERVATION_NEXT'});assert.equal(s.navigation.screen.type,'reservation-payment');assert.equal(s.reservation.tariffId,'breakfast-arrival');
});

test('room filters combine bed, price, rate conditions and features without losing grouping',()=>{
 const catalogue=[{room:{id:'double',bedType:'double',area:33,description:'Окна во двор'},offers:[{id:'cheap',price:100,includesBreakfast:false},{id:'meal',price:150,includesBreakfast:true,requiresPrepayment:false}]},{room:{id:'twin',bedType:'twin',area:45,description:'Вид на море'},offers:[{id:'cheap',price:200,includesBreakfast:false},{id:'meal',price:300,includesBreakfast:true,requiresPrepayment:false}]}];
 const value=e.keysRoomCriteriaEmpty();
 assert.equal(e.keysFilterRoomOffers(catalogue,value).length,2);
 let result=e.keysFilterRoomOffers(catalogue,{...value,filters:['breakfast'],max:'250'});
 assert.equal(result.length,1);assert.equal(result[0].room.id,'double');assert.deepEqual(result[0].offers.map(o=>o.id),['meal']);
 result=e.keysFilterRoomOffers(catalogue,{...value,bed:'twin',features:['sea','spacious'],filters:['no-prepayment']});
 assert.equal(result.length,1);assert.equal(result[0].room.id,'twin');assert.equal(result[0].offers[0].price,300);
 assert.equal(e.keysFilterRoomOffers(catalogue,{...value,min:'300',max:'100'}).length,0);
 assert.equal(e.keysRoomCriteriaInvalid({...value,min:'300',max:'100'}),true);
 assert.equal(e.keysFilterRoomOffers(catalogue,{...value,max:'0'}).length,0);
 const descending=e.keysFilterRoomOffers(catalogue,value,'price-desc');assert.equal(descending[0].room.id,'twin');assert.equal(descending[0].offers[0].price,300);
 assert.equal(catalogue[1].offers[0].price,200);
});

test('cancellation quotes respect free deadline, first-night fee and non-refundable tariff',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});
 const draft=s.reservation,total=e.checkoutTotal(draft),booking={id:'test-cancel',tariff:e.tariff(draft.hotelId,draft.tariffId),payment:{amount:total.total},pointsSpent:500};
 const free=e.keysBookingCancellationQuote(draft,booking,'2020-01-01');assert.equal(free.fee,0);assert.equal(free.refund,total.total);assert.equal(free.points,500);
 const late=e.keysBookingCancellationQuote(draft,booking,draft.arrival);assert.ok(late.fee>0);assert.equal(late.refund+late.fee,total.total);assert.equal(late.points,0);
 const nonref=e.keysBookingCancellationQuote(draft,{...booking,tariff:{...booking.tariff,refundable:false},payment:{amount:0}},'2020-01-01');assert.equal(nonref.refund,0);assert.equal(nonref.due,total.total);
});
test('cancelling a created booking updates its details and returns points only once',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});s=completeGuest(s);s=run(s,{type:'RESERVATION_POINTS',enabled:true,amount:500});s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
 const id=s.booking.id,balance=s.loyalty.balance,action={type:'KEYS_BOOKING_CANCELLED',bookingId:id,result:{status:'cancelled',fee:0,refund:0,points:500,due:0}};
 const cancelled=run(s,action);assert.equal(cancelled.booking.keysCancellation.status,'cancelled');assert.equal(cancelled.keysCreatedBookings[id].booking.keysCancellation.status,'cancelled');assert.equal(cancelled.loyalty.balance,balance+500);assert.equal(run(cancelled,action),cancelled);assert.equal(run(s,{...action,bookingId:'missing'}),s);
});

test('free cancellation returns each wallet to its source exactly once',()=>{
 let s=e.keysInitialState();s=run(s,{type:'HOTEL_OPEN',id:'more'});s=run(s,{type:'RESERVATION_START'});s=run(s,{type:'RESERVATION_NEXT'});s=completeGuest(s);s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});const balance=s.loyalty.balance;
 s=run(s,{type:'RESERVATION_POINTS',enabled:true});s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
 const quote=e.keysBookingCancellationQuote(s.reservation,s.booking,'2020-01-01');assert.equal(quote.points,balance+1500);
 const action={type:'KEYS_BOOKING_CANCELLED',bookingId:s.booking.id,result:{...quote,status:'cancelled'}};s=run(s,action);assert.equal(s.loyalty.balance,balance);assert.equal(s.keysHotelPoints.more,1500);assert.equal(run(s,action),s);
});
