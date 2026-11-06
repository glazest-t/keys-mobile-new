import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {verifyFullSnapshot} from '../scripts/build-versions.mjs';

test('Full baseline remains unchanged', async () => {
 const snapshot = await verifyFullSnapshot();
 assert.equal(snapshot.name, 'Полная');
 assert.ok(Object.keys(snapshot.files).length > 100);
});

const source = await readFile(new URL('../src/preview-versions/version-switch.js', import.meta.url), 'utf8');
for (const prefix of ['/', '/keys-mobile-new/']) {
 test(`Switch versions in both directions under ${prefix}`, () => {
  for (const current of ['november', 'full']) {
   const url = new URL(`https://example.com${prefix}${current === 'full' ? 'versions/full/' : ''}?scenario=booked-partial&view=mobile&brand=orbit&noticeLayout=chats&v=old#profile/history`);
   let navigate, change, replaced = false;
   const select = {addEventListener(type, fn) {if (type === 'change') change = fn;}};
   const toolbar = {querySelector() {return {replaceWith() {replaced = true;}};}};
   const document = {
    currentScript: {src: `https://example.com${prefix}preview-versions/version-switch.js?v=123`},
    documentElement: {dataset: {}},
    getElementById() {return toolbar;},
    createElement() {return {querySelector() {return select;}};}
   };
   const window = {}; window.parent = window;
   const location = {pathname: url.pathname, search: url.search, hash: url.hash, assign(href) {navigate = new URL(href);}};
   vm.runInNewContext(source, {URL, window, document, location});
   assert.equal(select.value, current);
   assert.equal(replaced, true);
   select.value = current === 'full' ? 'november' : 'full';
   change();
   assert.equal(navigate.pathname, `${prefix}${select.value === 'full' ? 'versions/full/' : ''}`);
   assert.equal(navigate.searchParams.get('scenario'), 'booked-partial');
   assert.equal(navigate.searchParams.get('view'), 'mobile');
   assert.equal(navigate.searchParams.get('noticeLayout'), 'chats');
   assert.equal(navigate.searchParams.has('v'), false);
   assert.equal(navigate.hash, '#profile/history');
  }
 });
}
