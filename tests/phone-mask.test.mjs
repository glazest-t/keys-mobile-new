import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/scenarios/phone-mask.js';
const {format,digits,erase}=globalThis.KeysPhoneMask;
test('phone mask accepts pasted country code, domestic prefix, and ten local digits',()=>{
 for(const input of ['+7 (900) 123-45-67','8 900 123 45 67','79001234567','9001234567']){
  assert.equal(format(input),'+7 (900) 123-45-67');
  assert.equal(format(input,true),'(900) 123-45-67');
  assert.equal(digits(input),'9001234567');
 }
 assert.equal(format('7991234567'),'+7 (799) 123-45-67');
});
test('incremental input, extra characters, and empty values remain editable',()=>{
 assert.equal(format('9'),'+7 (9');
 assert.equal(format('+7 (90'),'+7 (90');
 assert.equal(format('+7 (900) 123-45-67890'),'+7 (900) 123-45-67');
 assert.equal(format('abc'), '');
 assert.equal(format('+7'), '');
});
test('deleting around formatting removes a digit, not only a separator',()=>{
 const full='+7 (900) 123-45-67',local='(900) 123-45-67';
 assert.deepEqual(erase(full,9,9,true),{value:'+7 (901) 234-56-7',caret:6});
 assert.deepEqual(erase(local,6,6,true,true),{value:'(901) 234-56-7',caret:3});
 assert.equal(erase(full,12,12,false).value,'+7 (900) 123-56-7');
 assert.equal(erase(full,0,full.length,true).value,'');
 assert.equal(erase(full,4,7,true).value,'+7 (123) 456-7');
});
test('switching brand representation does not change the phone',()=>{
 assert.equal(format(format('89001234567'),true),'(900) 123-45-67');
 assert.equal(format(format('9001234567',true)),'+7 (900) 123-45-67');
});
