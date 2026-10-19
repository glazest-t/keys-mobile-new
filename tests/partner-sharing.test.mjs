import test from 'node:test';
import assert from 'node:assert/strict';
import {partnerInvitationURL,readPartnerInviter,escapePartnerText} from '../src/scenarios/partner-sharing.mjs';
test('invitation uses a reachable public URL locally and strips authentication state',()=>{
 const url=new URL(partnerInvitationURL({href:'http://127.0.0.1:8765/?approved=true&token=secret',name:'Татьяна',hotel:'Maidens Hotel',brand:'orbit'}));
 assert.equal(url.origin,'https://glazest-t.github.io');assert.equal(url.pathname,'/keys-mobile-new/');
 assert.equal(url.searchParams.get('scenario'),'guest-invite');assert.equal(url.searchParams.get('brand'),'orbit');assert.equal(url.searchParams.has('token'),false);assert.equal(url.searchParams.has('approved'),false);
 assert.deepEqual(readPartnerInviter(url.search),{name:'Татьяна',hotel:'Maidens Hotel'});
});
test('deployed invitation preserves project path and safely renders external display data',()=>{
 const url=new URL(partnerInvitationURL({href:'https://example.test/prototype/?scenario=search',name:' <b>Гость</b> ',hotel:'Отель',brand:'unknown'}));
 assert.equal(url.pathname,'/prototype/');assert.equal(url.searchParams.get('brand'),'base');assert.equal(escapePartnerText(readPartnerInviter(url.search).name),'&lt;b&gt;Гость&lt;/b&gt;');
 assert.deepEqual(readPartnerInviter(),{name:'Юра Костин',hotel:'Maidens Hotel'});assert.equal(readPartnerInviter('?inviter='+ 'a'.repeat(200)).name.length,80);
});
