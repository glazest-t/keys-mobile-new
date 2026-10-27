import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const run=(s,a)=>e.reducer(s,{now:1790000000000,...a});
test('first swipe visit allows multiple preferences, deselection and returns directly after completion',()=>{
 let s=e.keysInitialState();
 s=run(s,{type:'OPEN',screen:{type:'swipe'}});
 assert.equal(e.keysSwipePreferences(s).completed,false);
 assert.equal(e.keysShowBottomNav(s),false);
 for(const id of ['family','wellness','family'])s=run(s,{type:'KEYS_SWIPE_PREFERENCE',id});
 assert.deepEqual(e.keysSwipePreferences(s).selected,['wellness']);
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_DONE'});
 s=run(s,{type:'BACK'});
 assert.equal(e.keysShowBottomNav(s),true);
 s=run(s,{type:'OPEN',screen:{type:'swipe'}});
 assert.equal(e.keysSwipePreferences(s).completed,true);
 assert.deepEqual(e.keysSwipePreferences(s).selected,['wellness']);
});
test('first-run demo resets only on a new scenario run and preserves regular preferences',()=>{
 let s=run(run(e.keysInitialState(),{type:'KEYS_SWIPE_PREFERENCE',id:'family'}),{type:'KEYS_SWIPE_PREFERENCES_DONE'});
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:'demo-1'});
 assert.equal(e.keysSwipePreferences(s).completed,false);
 assert.deepEqual(e.keysSwipePreferences(s).selected,[]);
 s=run(run(s,{type:'KEYS_SWIPE_PREFERENCE',id:'food'}),{type:'KEYS_SWIPE_PREFERENCES_DONE'});
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:'demo-1'});
 assert.equal(e.keysSwipePreferences(s).completed,true);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:'demo-2'});
 assert.equal(e.keysSwipePreferences(s).completed,false);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:null});
 assert.deepEqual(e.keysSwipePreferences(s),{completed:true,selected:['family']});
});
test('saved preferences restore safely, and continuing without tags is supported',()=>{
 const previous=globalThis.localStorage;
 try{
  globalThis.localStorage={getItem:()=>JSON.stringify({completed:true,selected:['wellness','wellness','unknown']})};
  assert.deepEqual(e.keysSwipePreferences(e.keysRestoreSwipePreferences({})),{completed:true,selected:['wellness']});
  globalThis.localStorage={getItem:()=>'{broken'};
  let s=e.keysInitialState();
  assert.equal(e.keysSwipePreferences(s).completed,false);
  s=run(s,{type:'KEYS_SWIPE_PREFERENCES_DONE'});
  assert.deepEqual(e.keysSwipePreferences(s),{completed:true,selected:[]});
 }finally{globalThis.localStorage=previous;}
});
test('preferences promote matching hotels without excluding or destabilizing other matches',()=>{
 const hotels=[{id:'a',family:false},{id:'b',family:true},{id:'c',family:true}];
 assert.deepEqual(e.keysRankSwipeHotels(hotels,{selected:['family']}).map(h=>h.id),['b','c','a']);
 assert.deepEqual(hotels.map(h=>h.id),['a','b','c']);
 assert.equal(e.keysRankSwipeHotels(hotels,{selected:[]}),hotels);
 assert.equal(e.keysSwipePreferenceOptions.length,10);
});

test('only the explicit first-run scenario asks preferences, and re-entry opens hotels',()=>{
 let s=e.keysInitialState();
 s=run(s,{type:'OPEN',screen:{type:'swipe'}});
 assert.equal(e.keysSwipeNeedsPreferences(s),false);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:'first-visit'});
 assert.equal(e.keysSwipeNeedsPreferences(s),true);
 s=run(s,{type:'KEYS_SWIPE_PREFERENCE',id:'family'});
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_DONE'});
 s=run(s,{type:'BACK'});
 s=run(s,{type:'OPEN',screen:{type:'swipe'}});
 assert.equal(e.keysSwipeNeedsPreferences(s),false);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:'restart-first-visit'});
 assert.equal(e.keysSwipeNeedsPreferences(s),true);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:null});
 assert.equal(e.keysSwipeNeedsPreferences(s),false);
});

test('editing preferences saves a sanitized selection and returns to the same hotel',()=>{
 let s=run(e.keysInitialState(),{type:'HOTEL_OPEN',id:'azimut'});
 const hotelScreen=s.navigation.screen,search=s.search;
 s=run(s,{type:'OPEN',screen:{type:'hotel-preferences',hotelId:'azimut'}});
 assert.equal(s.navigation.screen.type,'hotel-preferences');
 assert.equal(e.keysShowBottomNav(s),false);
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_SAVE',selected:['food','family','food','unknown']});
 assert.deepEqual(s.keysSwipePreferences,{completed:true,selected:['family','food']});
 s=run(s,{type:'BACK'});
 assert.deepEqual(s.navigation.screen,hotelScreen);
 assert.deepEqual(s.search,search);
});
test('saving preferences during a first-run demo updates both the demo and persistent choice',()=>{
 let s=run(e.keysInitialState(),{type:'KEYS_SWIPE_SCENARIO',firstRun:'demo-edit'});
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_SAVE',selected:['wellness']});
 assert.deepEqual(e.keysSwipePreferences(s).selected,['wellness']);
 assert.equal(e.keysSwipeNeedsPreferences(s),false);
 s=run(s,{type:'KEYS_SWIPE_SCENARIO',firstRun:null});
 assert.deepEqual(e.keysSwipePreferences(s),{completed:true,selected:['wellness']});
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_SAVE',selected:[]});
 assert.deepEqual(e.keysSwipePreferences(s),{completed:true,selected:[]});
});

test('swipe settings preserve the deck and saved choices when saving or leaving without changes',()=>{
 let s=run(e.keysInitialState(),{type:'KEYS_SWIPE_PREFERENCES_SAVE',selected:['family','food']});
 s=run(s,{type:'OPEN',screen:{type:'swipe'}});
 const discovery=s.discovery, search=s.search;
 s=run(s,{type:'OPEN',screen:{type:'hotel-preferences'}});
 assert.deepEqual(e.keysSwipePreferences(s).selected,['family','food']);
 assert.equal(e.keysShowBottomNav(s),false);
 s=run(s,{type:'BACK'});
 assert.equal(s.navigation.screen.type,'swipe');
 assert.deepEqual(e.keysSwipePreferences(s).selected,['family','food']);
 s=run(s,{type:'OPEN',screen:{type:'hotel-preferences'}});
 s=run(s,{type:'KEYS_SWIPE_PREFERENCES_SAVE',selected:['nature','wellness']});
 s=run(s,{type:'BACK'});
 assert.equal(s.navigation.screen.type,'swipe');
 assert.equal(s.discovery,discovery);
 assert.equal(s.search,search);
 s=run(s,{type:'OPEN',screen:{type:'hotel-preferences'}});
 assert.deepEqual(e.keysSwipePreferences(s).selected,['nature','wellness']);
 const previous=globalThis.localStorage;
 try{
  globalThis.localStorage={getItem:()=>JSON.stringify(s.keysSwipePreferences)};
  assert.deepEqual(e.keysSwipePreferences(e.keysRestoreSwipePreferences({})).selected,['nature','wellness']);
 }finally{globalThis.localStorage=previous;}
});
