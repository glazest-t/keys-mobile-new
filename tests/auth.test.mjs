import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthFlow,normalizePhone} from '../src/scenarios/auth-model.mjs';
test('phone supports local input and formatted pasted numbers, rejects incomplete or wrong country',()=>{
 assert.equal(normalizePhone('+7 (999) 123-45-67'),'+79991234567');
 assert.equal(normalizePhone('8 999 123 45 67'),'+79991234567');
 assert.equal(normalizePhone('9991234567'),'+79991234567');
 assert.equal(normalizePhone('+1 999 123 45 67'),null);assert.equal(normalizePhone('123'),null);
});
test('cannot enter app without verifying, wrong code stays on verification',()=>{
 const f=createAuthFlow();assert.ok(f.complete('Анна'));f.send('9991234567');
 assert.ok(f.verify('000000'));assert.equal(f.state.step,'code');assert.ok(f.complete('Анна'));
 assert.equal(f.verify('123456'),null);assert.ok(f.complete('<script>'));
 assert.equal(f.complete('  Анна-Мария  '),null);assert.equal(f.state.name,'Анна-Мария');assert.equal(f.state.step,'done');
});
test('resend is throttled, expired codes rejected, changing phone invalidates verification',()=>{
 let clock=1000;const f=createAuthFlow(()=>clock);f.send('9991234567');assert.equal(f.resend(),false);
 clock+=30000;assert.equal(f.resend(),true);clock+=300001;assert.ok(f.verify('123456'));assert.equal(f.resend(),true);
 f.verify('123456');f.back();f.back();assert.equal(f.state.verified,false);
 f.send('9997654321');assert.ok(f.complete('Анна'));assert.equal(f.state.phone,'+79997654321');
});
