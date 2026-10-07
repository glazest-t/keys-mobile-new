import test from 'node:test';
import assert from 'node:assert/strict';
import {keysPhotoGesture as gesture} from '../src/sections/photo-gestures.mjs';
test('horizontal swipes browse gallery in either direction without voting',()=>{
 assert.equal(gesture(-100,12),'next-frame');assert.equal(gesture(100,-12),'previous-frame');
});
test('only upward vertical swipes advance hotels',()=>{
 assert.equal(gesture(8,-110),'next-hotel');assert.equal(gesture(8,110),'cancel');
 assert.equal(gesture(-80,-80),'cancel');assert.equal(gesture(0,-40),'cancel');
});
test('tap slop and aborted swipes cannot skip hotels',()=>{
 assert.equal(gesture(3,-3),'tap');assert.equal(gesture(-25,2),'cancel');assert.equal(gesture(0,0),'tap');
});
