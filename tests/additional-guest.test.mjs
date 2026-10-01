import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../src/sections/additional-guest.js',import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(0,source.indexOf('function KeysPaymentGuestPanel(')),context);
const state=(party,status='editing')=>({reservation:{id:'one',status,party,contact:{firstName:'Татьяна'},additionalGuests:[]}});
test('second traveller is available for multiple people, not a pet',()=>{
 assert.equal(context.keysHasAdditionalGuest({adults:1,childrenAges:[],pet:true}),false);
 assert.equal(context.keysHasAdditionalGuest({adults:2,childrenAges:[]}),true);
 assert.equal(context.keysHasAdditionalGuest({adults:1,childrenAges:[8]}),true);
});
test('save, edit and remove companion independently of the main contact',()=>{
 const original=state({adults:2,childrenAges:[]});
 const saved=context.keysSaveAdditionalGuest(original,{guest:{firstName:' Александр ',lastName:' Иванов '}});
 assert.equal(saved.reservation.additionalGuests[0].firstName,'Александр');
 assert.equal(saved.reservation.contact,original.reservation.contact);
 assert.equal(original.reservation.additionalGuests.length,0);
 const edited=context.keysSaveAdditionalGuest(saved,{guest:{firstName:'Александр',lastName:'Петров'}});
 assert.equal(edited.reservation.additionalGuests[0].lastName,'Петров');
 assert.equal(context.keysSaveAdditionalGuest(edited,{guest:null}).reservation.additionalGuests.length,0);
});
test('reject blank names, a single traveller and changes during payment',()=>{
 const draft=state({adults:2,childrenAges:[]});
 assert.equal(context.keysSaveAdditionalGuest(draft,{guest:{firstName:' ',lastName:'Иванов'}}),draft);
 for(const original of [state({adults:1,childrenAges:[]}),state({adults:2,childrenAges:[]},'processing'),state({adults:2,childrenAges:[]},'confirmed')]){
  assert.equal(context.keysSaveAdditionalGuest(original,{guest:{firstName:'Александр',lastName:'Иванов'}}),original);
 }
});
