import test from 'node:test';
import assert from 'node:assert/strict';
import {distributeOtp} from '../src/scenarios/otp-fields.mjs';
test('typing a digit replaces only the selected slot and advances',()=>{
 assert.deepEqual(distributeOtp(['1','2','','','',''],1,'9'),{digits:['1','9','','','',''],next:2});
});
test('pasting or autofilling a whole code replaces all six slots from any position',()=>{
 assert.deepEqual(distributeOtp(['9','9','9','9','9','9'],3,'123 456'),{digits:['1','2','3','4','5','6'],next:5});
});
test('partial paste starts at the current slot and stops at the last field',()=>{
 assert.deepEqual(distributeOtp(['1','2','3','4','',''],4,'5-67'),{digits:['1','2','3','4','5','6'],next:5});
});
