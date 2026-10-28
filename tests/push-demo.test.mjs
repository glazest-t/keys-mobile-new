import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({setTimeout,clearTimeout});
vm.runInContext(readFileSync(new URL('../src/scenarios/push-demo-data.js',import.meta.url),'utf8'),context);
const catalog=context.KeysPushCatalog;
test('push catalog covers each push-enabled source row and no other channels',()=>{
 const source=JSON.parse(readFileSync(new URL('../design/push-notifications-source.json',import.meta.url),'utf8'));
 assert.deepEqual(Array.from(catalog.types,t=>t.row).sort((a,b)=>a-b),source.notifications.map(t=>t.row).sort((a,b)=>a-b));
 assert.ok(source.notifications.every(t=>t.push==='Да'));
 assert.equal(new Set(catalog.types.map(t=>t.id)).size,catalog.types.length);
 assert.ok(catalog.types.every(t=>['search','booked','stay','after'].includes(t.scenario)&&t.title&&t.body));
});
test('unknown notification links safely select the check-in guide',()=>{
 assert.equal(catalog.get('not-a-real-push').id,'checkin-guide');
 assert.equal(catalog.get(null).id,'checkin-guide');
});
test('quickly changing notification type cannot deliver the previous push',()=>{
 const pending=[],delivered=[];
 const delivery=catalog.createDelivery({setTimer:fn=>(pending.push(fn),pending.length),clearTimer:()=>{}});
 delivery.schedule(()=>delivered.push('old'));
 delivery.schedule(()=>delivered.push('new'));
 pending[0]();pending[1]();
 assert.deepEqual(delivered,['new']);
});
test('leaving the phone or cancelling delivery prevents a queued push',()=>{
 const pending=[],delivered=[];
 const delivery=catalog.createDelivery({setTimer:fn=>(pending.push(fn),pending.length),clearTimer:()=>{}});
 delivery.schedule(()=>delivered.push('closed'));
 delivery.cancel();pending[0]();
 delivery.schedule(()=>delivered.push('replay'));pending[1]();
 assert.deepEqual(delivered,['replay']);
});

const inboxContext=vm.createContext({});
vm.runInContext(readFileSync(new URL('../src/scenarios/system-inbox.js',import.meta.url),'utf8'),inboxContext);
const createInbox=inboxContext.KeysSystemInbox.createInbox;
test('delivered pushes survive dismissal, reload and read-state updates',()=>{
 const saved=new Map(),storage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
 const inbox=createInbox({storage,now:()=> '2026-10-28T12:00:00Z'});
 inbox.receive('booking-cancelled');
 const reopened=createInbox({storage});
 assert.equal(reopened.list()[0].id,'booking-cancelled');
 assert.equal(reopened.list()[0].readAt,null);
 reopened.markRead('booking-cancelled');
 assert.ok(inbox.list()[0].readAt);
 inbox.receive('room-key');
 inbox.receive('room-key');
 assert.equal(inbox.list().length,2,'Replaying a demo updates its message instead of duplicating it');
 inbox.markAllRead();assert.ok(inbox.list().every(item=>item.readAt));
});
test('the inbox tolerates blocked or malformed storage',()=>{
 const blocked=createInbox({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
 blocked.receive('room-key');assert.equal(blocked.list().length,1);
 const bad=createInbox({storage:{getItem:()=> '[null,{"id":"bad","receivedAt":"broken"}]'}});
 assert.equal(bad.list().length,0);
});
