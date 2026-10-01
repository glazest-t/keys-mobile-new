import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const engine=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const booking={id:'MD-120926',arrival:'2026-09-12',departure:'2026-09-19',adults:1,paid:56000,total:56000,room:'Премиум Кинг'};
const run=(state,action)=>engine.reducer(state,{now:Date.parse('2026-09-04T12:00:00Z'),...action});
const start=()=>run(engine.keysInitialState(),{type:'KEYS_CHANGE_START',booking});
test('booking edit opens the existing Arbana flow with current host booking',()=>{
 const s=start();assert.equal(s.navigation.screen.type,'change-booking');assert.equal(s.booking.id,booking.id);assert.equal(s.booking.paid,56000);assert.equal(s.tripContext.today,'2026-09-04');assert.equal(s.booking.keyOpened,false);assert.equal(s.booking.tariff.changesAllowed,true);
});
test('extension is previewed before confirmation, then applied exactly once',()=>{
 let s=start();s=run(s,{type:'BOOKING_CHANGE',value:{arrival:booking.arrival,departure:'2026-09-20',party:s.booking.party}});
 assert.equal(s.booking.departure,booking.departure);assert.equal(s.booking.changeRequest.difference,8000);assert.equal(s.booking.changeRequest.total,64000);
 const quoteId=s.booking.changeRequest.id;s=run(s,{type:'BOOKING_CHANGE_CONFIRM',quoteId});assert.equal(s.booking.departure,'2026-09-20');assert.equal(s.booking.paid,64000);assert.equal(s.booking.revision,1);
 const again=run(s,{type:'BOOKING_CHANGE_CONFIRM',quoteId});assert.equal(again.booking.revision,1);
});
test('shorter stay creates a refund; editing a quote retains confirmed booking',()=>{
 let s=start();s=run(s,{type:'BOOKING_CHANGE',value:{arrival:booking.arrival,departure:'2026-09-18',party:s.booking.party}});
 assert.equal(s.booking.changeRequest.difference,-8000);
 const edited=run(s,{type:'BOOKING_CHANGE_EDIT'});assert.equal(edited.booking.changeRequest,null);assert.equal(edited.booking.departure,booking.departure);
 s=run(s,{type:'BOOKING_CHANGE_CONFIRM',quoteId:s.booking.changeRequest.id});assert.equal(s.booking.refunds.at(-1).amount,8000);assert.equal(s.booking.refunds.at(-1).status,'processing');
});
test('same-price guest change, invalid dates and missing child age follow Arbana rules',()=>{
 let s=start();const party={...s.booking.party,adults:2};
 const quote=run(s,{type:'BOOKING_CHANGE',value:{arrival:booking.arrival,departure:booking.departure,party}});assert.equal(quote.booking.changeRequest.difference,0);
 for(const value of [{arrival:'2026-09-01',departure:booking.departure,party},{arrival:booking.departure,departure:booking.arrival,party},{arrival:booking.arrival,departure:booking.departure,party:{...party,childrenAges:[-1]}}])assert.equal(run(s,{type:'BOOKING_CHANGE',value}).booking.changeRequest,null);
});
test('checkin reuses host booking and returns entered guest details without changing dates',()=>{
 let s=run(engine.keysInitialState(),{type:'KEYS_CHANGE_START',booking:{...booking,guest:'Татьяна Глазырина',flow:'checkin',today:'2026-09-12'}});
 assert.equal(s.navigation.screen.type,'checkin');assert.equal(s.keysCheckinSession,true);assert.equal(s.booking.checkedIn,false);
 s=run(s,{type:'CHECKIN_COMPLETE',arrivalTime:'16:00–18:00',guestName:'Татьяна Глазырина'});
 assert.equal(s.booking.checkedIn,true);assert.equal(s.booking.arrivalTime,'16:00–18:00');assert.equal(s.booking.guestName,'Татьяна Глазырина');assert.equal(s.booking.arrival,booking.arrival);assert.equal(s.booking.revision,0);
 const reopened=run(engine.keysInitialState(),{type:'KEYS_CHANGE_START',booking:{...booking,flow:'checkin',registration:{name:'Татьяна Глазырина',time:'16:00–18:00'}}});
 assert.equal(reopened.booking.checkedIn,true);assert.equal(reopened.booking.arrivalTime,'16:00–18:00');
});
test('trip sharing preserves booking and viewers across identity refresh and reopening',()=>{
 let s=run(engine.keysInitialState(),{type:'KEYS_CHANGE_START',booking:{...booking,flow:'share'}});
 assert.equal(s.navigation.screen.type,'keys-trip-share');
 s=run(s,{type:'SOCIAL_TRIP_SHARE',friendIds:['dima']});
 assert.deepEqual(s.social.tripViewerIds,['dima']);
 const refreshed={...s,social:{...s.social,tripViewerIds:[]}};
 s=run(s,{type:'DEMO_LOAD',state:refreshed});
 assert.deepEqual(s.social.tripViewerIds,['dima']);assert.equal(s.booking.id,booking.id);
 s=run(engine.keysInitialState(),{type:'KEYS_CHANGE_START',booking:{...booking,flow:'share',social:s.social}});
 assert.deepEqual(s.social.tripViewerIds,['dima']);
 s=run(s,{type:'SOCIAL_TRIP_SHARE',friendIds:[]});assert.deepEqual(s.social.tripViewerIds,[]);
 assert.equal(s.booking.paid,56000);assert.equal(s.booking.revision,0);
});
