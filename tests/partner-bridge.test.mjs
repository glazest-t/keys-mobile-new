import test from 'node:test';import assert from 'node:assert/strict';
import {matchingPartnerDecision,readPartnerRequest,writePartnerRequest} from '../src/scenarios/partner-bridge.mjs';
test('external decisions are limited to the current request and account',()=>{
 const state={status:'pending',requestToken:crypto.randomUUID(),requestId:2,email:'work@hotel.ru',phone:'+79001234567'};
 const decision={...state,token:state.requestToken,status:'approved'};
 assert.equal(matchingPartnerDecision(state,decision),true);
 for(const change of [{token:crypto.randomUUID()},{requestId:1},{email:'other@hotel.ru'},{phone:'+79000000000'},{status:'pending'},{status:'expired'}])assert.equal(matchingPartnerDecision(state,{...decision,...change}),false);
 assert.equal(matchingPartnerDecision({...state,status:'rejected'},decision),false);
});
test('demo bridge safely reads shared decisions and handles unavailable storage',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 const token=crypto.randomUUID(),request={token,requestId:1,email:'work@hotel.ru',phone:'+79001234567',status:'pending'};
 assert.equal(writePartnerRequest(storage,request),true);assert.deepEqual(readPartnerRequest(storage,token),request);
 assert.equal(readPartnerRequest(storage,'bad'),null);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(readPartnerRequest(blocked,token),null);assert.equal(writePartnerRequest(blocked,request),false);
});
