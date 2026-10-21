import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,hydrate,validateTraveler,saveTraveler,removeTraveler,filterTrips,trips} from '../src/profile/model.mjs';
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
