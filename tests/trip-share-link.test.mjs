import test from 'node:test';
import assert from 'node:assert/strict';
import {keysTripShareUrl} from '../src/sections/trip-share-link.mjs';
const raw='http://127.0.0.1:8765/sections/index.html?scenario=search&hotel=maidens&arrival=2026-09-12&departure=2026-09-19&adults=1';
test('local QR opens the public prototype rather than the scanning phone localhost',()=>{
 const url=new URL(keysTripShareUrl(raw,'read',{stayDay:'day-2',brand:'orbit'}));
 assert.equal(url.origin,'https://glazest-t.github.io');
 assert.equal(url.pathname,'/keys-mobile-new/sections/index.html');
 assert.equal(url.searchParams.get('hotel'),'maidens');
 assert.equal(url.searchParams.get('arrival'),'2026-09-12');
 assert.equal(url.searchParams.get('stayDay'),'day-2');
 assert.equal(url.searchParams.get('brand'),'orbit');
});
test('view and management URLs have distinct access while preserving the same trip',()=>{
 const view=new URL(keysTripShareUrl(raw,'read',{stayDay:'checkout'}));
 const manage=new URL(keysTripShareUrl(raw,'manage',{stayDay:'checkout'}));
 assert.notEqual(view.href,manage.href);
 assert.equal(view.searchParams.get('access'),'read');
 assert.equal(manage.searchParams.get('access'),'manage');
 assert.equal(manage.searchParams.get('stayDay'),'checkout');
 manage.searchParams.set('access','read');assert.equal(manage.href,view.href);
});
test('hosted previews keep their host and unsupported access defaults to read',()=>{
 const url=new URL(keysTripShareUrl('https://example.com/preview/sections/index.html?hotel=maidens','invalid'));
 assert.equal(url.origin,'https://example.com');assert.equal(url.pathname,'/preview/sections/index.html');
 assert.equal(url.searchParams.get('access'),'read');assert.equal(url.searchParams.has('stayDay'),false);
});
