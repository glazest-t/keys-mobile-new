import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartnerVerification} from '../src/scenarios/partner-model.mjs';
test('partner verification requires a verified phone and valid work email',()=>{
 const m=createPartnerVerification();assert.ok(m.request('name@hotel.ru'));
 m.start('+79001234567');assert.ok(m.request('wrong'));assert.equal(m.state.status,'intro');
 assert.equal(m.request(' Name@Hotel.ru '),null);assert.equal(m.state.email,'name@hotel.ru');assert.equal(m.state.status,'pending');
});
test('TravelLine rejection does not unlock access; retry can be approved',()=>{
 const m=createPartnerVerification();m.start('+79001234567');m.request('name@hotel.ru');
 assert.equal(m.decide(m.state.requestId,false),true);assert.equal(m.state.status,'rejected');
 assert.equal(m.decide(m.state.requestId,true),false);
 m.request(m.state.email);assert.equal(m.decide(m.state.requestId,true),true);assert.equal(m.state.status,'approved');
});
test('changing email or resetting invalidates old account linking notifications',()=>{
 const m=createPartnerVerification();m.start('+79001234567');m.request('first@hotel.ru');const first=m.state.requestId;
 m.edit();m.request('second@hotel.ru');assert.equal(m.decide(first,true),false);assert.equal(m.state.status,'pending');
 const second=m.state.requestId;m.reset();assert.equal(m.decide(second,true),false);assert.equal(m.state.email,'');
});
test('skipping keeps the verified phone but does not approve hotelier access',()=>{
 const m=createPartnerVerification();assert.equal(m.defer(),false);
 m.start('+79001234567');assert.equal(m.defer(),true);assert.equal(m.state.status,'deferred');assert.equal(m.state.phone,'+79001234567');
 assert.equal(m.decide(m.state.requestId,true),false);
 m.edit();m.request('name@hotel.ru');assert.equal(m.defer(),false);
 assert.equal(m.decide(m.state.requestId,true),true);assert.equal(m.defer(),false);
});
test('pending and rejected requests survive leaving and restoring the app',()=>{
 const m=createPartnerVerification();m.start('+79001234567');m.request('work@hotel.ru');
 const pending={...m.state},restored=createPartnerVerification();restored.restore(pending.phone,pending);
 assert.equal(restored.state.status,'pending');assert.equal(restored.state.email,'work@hotel.ru');
 assert.equal(restored.decide(pending.requestId,false),true);
 const rejected={...restored.state};restored.restore(rejected.phone,rejected);assert.equal(restored.state.status,'rejected');
 restored.request(rejected.email);assert.equal(restored.decide(pending.requestId,true),false);
 assert.equal(restored.decide(restored.state.requestId,true),true);
 const approved={...restored.state};restored.restore(approved.phone,approved);assert.equal(restored.state.status,'approved');
});
test('a fresh linking request gets a unique tab token and preserves it on restore',()=>{
 const m=createPartnerVerification();m.start('+79001234567');m.request('work@hotel.ru');const old={...m.state};
 m.restore(old.phone,old);assert.equal(m.state.requestToken,old.requestToken);
 m.request(old.email);assert.notEqual(m.state.requestToken,old.requestToken);
});
