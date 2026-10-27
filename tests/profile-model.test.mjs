import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,hydrate,validateTraveler,saveTraveler,removeTraveler,filterTrips,trips,collectTrips} from '../src/profile/model.mjs';
test('traveler validation catches impossible dates and invalid contact data without requiring optional fields',()=>{
 assert.deepEqual(validateTraveler({firstName:'Анна',lastName:'Иванова'}),{});
 const errors=validateTraveler({firstName:'',lastName:'123',birthDate:'2026-02-30',email:'test',phone:'123'});
 assert.deepEqual(Object.keys(errors),['firstName','lastName','birthDate','email','phone']);
 assert.ok(validateTraveler({firstName:'Анна',lastName:'Иванова',birthDate:'2099-01-01'}).birthDate);
});
test('traveler edits preserve identity, additions have independent IDs, and primary traveler cannot be removed',()=>{
 const state=initialState();const values={...state.travelers[0],firstName:'Анна'};
 const edited=saveTraveler(state,values,'primary');assert.equal(edited.state.travelers.length,1);assert.equal(edited.traveler.id,'primary');assert.equal(edited.traveler.primary,true);assert.equal(state.travelers[0].firstName,'Татьяна');
 const added=saveTraveler(edited.state,{firstName:'Мария',lastName:'Тестовая'});assert.equal(added.state.travelers.length,2);assert.notEqual(added.traveler.id,'primary');
 assert.equal(removeTraveler(added.state,'primary'),added.state);assert.equal(removeTraveler(added.state,added.traveler.id).travelers.length,1);
 assert.equal(saveTraveler(state,{firstName:'',lastName:''}).state,state);
});
test('stored settings restore valid state and reject malformed legacy payloads',()=>{
 assert.deepEqual(hydrate(null),initialState());assert.deepEqual(hydrate({version:0}),initialState());
 const state=initialState();state.notifications.offers=true;state.security.otherDevices=[];state.travelers.push({id:'guest',firstName:'Анна',lastName:'Иванова',primary:true});
 const restored=hydrate(JSON.parse(JSON.stringify(state)));assert.equal(restored.notifications.offers,true);assert.equal(restored.security.otherDevices.length,0);assert.equal(restored.travelers[1].primary,false);
 assert.equal(hydrate({version:1,notifications:{push:'yes'}}).notifications.push,true);
});
test('trip history combines text, status and year filters without modifying the original trips',()=>{
 assert.equal(filterTrips(trips,{query:'  сочИ ',year:'2026',status:'completed'})[0].id,'sochi-2026');
 assert.equal(filterTrips(trips,{query:'Сочи',status:'cancelled'}).length,0);assert.equal(filterTrips(trips,{year:'2025'}).length,1);assert.equal(trips.length,4);
});

test('multiple future bookings retain separate IDs and sort by nearest arrival',()=>{
 const created=[{id:'later',hotel:'Same hotel',city:'Сочи',arrival:'2026-12-10',departure:'2026-12-12'},{id:'soon',hotel:'Same hotel',city:'Сочи',arrival:'2026-10-01',departure:'2026-10-03'}];
 const result=filterTrips(collectTrips({scenario:'search',created,today:'2026-09-13'}),{status:'upcoming'});
 assert.deepEqual(result.map(t=>t.id),['soon','later']);
 assert.equal(filterTrips(result,{query:'сочи'}).length,2);
 assert.equal(collectTrips({scenario:'search',created:[...created,created[0]]}).filter(t=>t.id==='later').length,1);
});
test('host and created reservations move into the correct status without duplicating the host stay',()=>{
 const host={arrival:'2026-09-12',departure:'2026-09-19',adults:1,total:56000};
 for(const [scenario,status] of [['booked','upcoming'],['stay','active'],['after','completed']]){
  const items=collectTrips({scenario,host});const current=items.find(t=>t.source==='host');assert.equal(current.status,status);assert.equal(items.length,trips.length+1);
  assert.equal(current.points,status==='completed'?2240:0);
 }
 assert.equal(collectTrips({scenario:'search',host}).length,trips.length);
 assert.equal(collectTrips({scenario:'booked',host:{...host,cancellation:{refund:56000}}}).find(t=>t.source==='host').status,'cancelled');
 const created=[{id:'current',arrival:'2026-09-12',departure:'2026-09-19'},{id:'done',arrival:'2026-09-10',departure:'2026-09-13'},{id:'cancel',arrival:'2026-12-01',departure:'2026-12-02',model:{cancellation:{refund:1}}}];
 const items=collectTrips({created,today:'2026-09-13'});
 assert.equal(items.find(t=>t.id==='current').status,'active');assert.equal(items.find(t=>t.id==='done').status,'completed');assert.equal(items.find(t=>t.id==='cancel').status,'cancelled');
 assert.ok(trips.every(t=>t.photo));
});
