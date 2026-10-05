import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../src/sections/host.js',import.meta.url),'utf8');
function host(origin,scenario='stay'){
 const listeners={root:{},window:{},document:{}},messages=[];
 const sections=['trips','feedback','account','search','stay-details'].map(name=>({dataset:{unifiedSection:name},hidden:name!=='trips'}));
 const panels=['benefits','profile','assistant'].map(name=>({hidden:true,querySelector:()=>({dataset:{screen:name}})}));
 const done={textContent:''};
 const feedback={dispatchEvent(){}};
 const account=sections.find(s=>s.dataset.unifiedSection==='account');
 account.querySelectorAll=()=>panels;
 const profileScroll={scrollTop:0};
 account.querySelector=selector=>selector==='[data-screen="profile"]>.kf-scroll'?profileScroll:
  selector==='.kf-phone[data-screen="profile"]'?{closest:()=>panels.find(p=>p.querySelector().dataset.screen==='profile')}:null;
 const root={append:s=>sections.push(s),addEventListener:(type,fn)=>listeners.root[type]=fn,
  querySelectorAll:selector=>selector===':scope>.ku-section'?sections:[],
  querySelector:selector=>selector==='.k3-stay-head'?{click(){sections.forEach(s=>s.hidden=s.dataset.unifiedSection!=='stay-details')}}:selector.includes('[data-kfb="success"]')?done:selector==='#keysFeedbackFlow'?feedback:sections.find(s=>selector===`[data-unified-section="${s.dataset.unifiedSection}"]`)
 };
 const frame={focus(){},contentWindow:{postMessage:message=>messages.push(message)},hasAttribute:()=>true};
 const document={body:{dataset:{keysStayDay:'day-2',keysScenario:scenario}},getElementById:()=>root,createElement:tag=>tag==='iframe'?frame:{dataset:{},append(){}},addEventListener:(type,fn)=>listeners.document[type]=fn};
 const window={addEventListener:(type,fn)=>listeners.window[type]=fn,KeysAppHeader:{create(){}},KeysAppNav:{}};
 vm.runInNewContext(code,{document,window,matchMedia:()=>({matches:true}),location:{origin:'http://localhost',protocol:'http:'},MutationObserver:class{observe(){}},CustomEvent:class{}});
 const message=data=>listeners.window.message({source:frame.contentWindow,origin:'http://localhost',data:{source:'keys-arbana',...data}});
 message({type:'ready'});
 if(origin){
  const button={dataset:{headerAction:'notifications'},closest:()=>origin==='trips'?null:{dataset:{screen:origin}}};
  listeners.root.click({target:{closest:selector=>selector==='[data-header-action]'?button:null},preventDefault(){},stopImmediatePropagation(){}});
 }
 message({type:'state',screen:'notifications'});
 return {sections,panels,messages,message,exitHostDetails:()=>listeners.window.click({target:{closest:selector=>selector==='#keysStayDetails .ksd-back[data-exit]'?{}:null},preventDefault(){},stopImmediatePropagation(){}}),openHotelChat:()=>listeners.root['keys-open-hotel-chat'](),openTripReview:trigger=>listeners.root['keys-open-trip-review']({detail:{trigger}}),exitFeedback:()=>listeners.window.click({target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){}})};
}
for(const origin of ['trips','benefits','profile'])test(`notifications → feedback → notifications → back preserves ${origin}`,()=>{
 const h=host(origin),sent=h.messages.length;
 h.message({type:'navigate',target:'feedback'});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='feedback').hidden,false);
 h.exitFeedback();
 assert.equal(h.messages.length,sent,'Returning must not dispatch NAV_TAB and reset runtime history');
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='arbana-sections').hidden,false);
 h.message({type:'state',screen:null});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection===(origin==='trips'?'trips':'account')).hidden,false);
 if(origin!=='trips')assert.equal(h.panels.find(s=>s.querySelector().dataset.screen===origin).hidden,false);
});
test('runtime entry from Find or Chats keeps its own history after feedback',()=>{
 const h=host(null),sent=h.messages.length;
 h.message({type:'navigate',target:'feedback'});h.exitFeedback();
 assert.equal(h.messages.length,sent,'Host must not redirect a native runtime entry to Find');
 h.message({type:'state',screen:null});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='arbana-sections').hidden,false);
});

test('completed trip requests its notification history',()=>{
 const h=host('trips','after');
 assert.ok(h.messages.length>=2);
 assert.ok(h.messages.every(message=>message.stayDay==='after'));
});

test('trip review returns to its home action, not notifications',()=>{
 const h=host(null,'after');let focused=false;const sent=h.messages.length;
 h.openTripReview({focus(){focused=true;}});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='feedback').hidden,false);
 h.exitFeedback();
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='trips').hidden,false);
 assert.equal(focused,true);
 assert.equal(h.messages.length,sent);
});

test('before arrival excludes first-night and checkout feedback pushes',()=>{
 const h=host('trips','booked');
 assert.ok(h.messages.every(message=>message.stayDay==='day-1'));
});

test('hotel chat opened from Trips returns to Trips after its Back action',()=>{
 const h=host(null);
 h.sections.forEach(s=>s.hidden=s.dataset.unifiedSection!=='trips');
 // Use the existing hotel-chat entry event, then the runtime's screen transition.
 h.openHotelChat();
 h.message({type:'state',tab:'chats',screen:'chat'});
 h.message({type:'state',tab:'chats',screen:null});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='trips').hidden,false);
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='arbana-sections').hidden,true);
});


test('booking details entered from a hotel conversation return without resetting that conversation',()=>{
 const h=host(null);h.openHotelChat();h.message({type:'state',tab:'chats',screen:'chat'});
 h.message({type:'navigate',target:'stay-details'});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='stay-details').hidden,false);
 const sent=h.messages.length;h.exitHostDetails();
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='arbana-sections').hidden,false);
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='stay-details').hidden,true);
 assert.equal(h.messages.length,sent,'Back must reveal the existing chat without NAV_TAB');
 h.message({type:'state',tab:'chats',screen:null});
 assert.equal(h.sections.find(s=>s.dataset.unifiedSection==='trips').hidden,false);
});
