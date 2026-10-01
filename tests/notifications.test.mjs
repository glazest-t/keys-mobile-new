import test from 'node:test';
import assert from 'node:assert/strict';
import {keysEnsureStayFeedbackNotification} from '../src/sections/notification-seed.js';
test('first-night push is added to existing history once without losing other notifications',()=>{
 const welcome={id:'welcome',createdAt:'2026-09-30T10:00:00Z',readAt:null};
 const account={notifications:[welcome]};let saves=0;
 keysEnsureStayFeedbackNotification(account,()=>saves++);
 keysEnsureStayFeedbackNotification(account,()=>saves++);
 assert.equal(saves,1);assert.equal(account.notifications.length,2);
 assert.equal(account.notifications[1],welcome);
 assert.equal(welcome.createdAt,'2026-09-12T13:30:00+03:00');
 assert.equal(account.notifications[0].target,'stay-feedback');
 assert.equal(account.notifications[0].readAt,null);
 assert.match(account.notifications[0].body,/Татьяна/);
});
test('read first-night push stays read after history is loaded again',()=>{
 const account={notifications:[]};keysEnsureStayFeedbackNotification(account,()=>{});
 account.notifications[0].readAt='2026-09-30T11:00:00Z';
 keysEnsureStayFeedbackNotification(account,()=>assert.fail('Existing push must not be recreated'));
 assert.equal(account.notifications[0].readAt,'2026-09-30T11:00:00Z');
});

test('existing history migrates login date and order without resetting read flags',()=>{
 const review={id:'keys-maidens-first-night-2026-09-13',createdAt:'2026-09-13T10:00:00+03:00',readAt:'2026-09-30T11:00:00Z'};
 const welcome={id:'welcome',createdAt:'2026-09-29T12:00:00Z',readAt:'2026-09-29T12:10:00Z'};
 const account={notifications:[welcome,review]};let saves=0;
 keysEnsureStayFeedbackNotification(account,()=>saves++);
 keysEnsureStayFeedbackNotification(account,()=>saves++);
 assert.equal(saves,1);assert.deepEqual(account.notifications,[review,welcome]);
 assert.equal(welcome.readAt,'2026-09-29T12:10:00Z');assert.equal(review.readAt,'2026-09-30T11:00:00Z');
});
test('stay-day history excludes future pushes and restores their read state',()=>{
 const account={notifications:[{id:'welcome',createdAt:'2026-09-12T13:30:00+03:00',readAt:null}]};
 const visible=day=>keysEnsureStayFeedbackNotification(account,()=>{},day);
 assert.deepEqual(visible('day-1').map(n=>n.id),['welcome']);
 assert.equal(account.notifications.length,1,'First day must not create a future review push');
 const second=visible('day-2');assert.equal(second[0].target,'stay-feedback');
 second[0].readAt='2026-09-13T10:01:00+03:00';
 const checkout=visible('checkout');assert.equal(checkout.length,3);assert.equal(checkout[0].target,'checkout-feedback');
 assert.equal(checkout[1].readAt,'2026-09-13T10:01:00+03:00');
 checkout[0].readAt='2026-09-19T09:01:00+03:00';
 assert.equal(visible('day-1').length,1);
 assert.equal(visible('day-2').length,2);
 assert.equal(visible('checkout')[0].readAt,'2026-09-19T09:01:00+03:00');
 assert.equal(account.notifications.length,3,'Switching days must not duplicate or delete pushes');
});

test('completed trip starts with an unread review invitation and keeps subsequent read state',()=>{
 const account={notifications:[]};
 keysEnsureStayFeedbackNotification(account,()=>{},'checkout');
 account.notifications.forEach(item=>item.readAt='2026-09-19T10:00:00Z');
 let saves=0;
 const items=keysEnsureStayFeedbackNotification(account,()=>saves++,'after');
 assert.equal(items.length,2);
 assert.equal(items[0].target,'checkout-feedback');
 assert.equal(items[0].readAt,null);
 assert.equal(items[1].readAt,'2026-09-19T10:00:00Z');
 items[0].readAt='2026-09-19T11:00:00Z';
 const restored=JSON.parse(JSON.stringify(account));
 keysEnsureStayFeedbackNotification(restored,()=>saves++,'after');
 assert.equal(restored.notifications[0].readAt,'2026-09-19T11:00:00Z');
 assert.equal(saves,1);
});
