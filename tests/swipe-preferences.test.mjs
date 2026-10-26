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
