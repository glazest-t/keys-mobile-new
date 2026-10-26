import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/booking/details-view.js';
const view=globalThis.KeysBookingDetails;
const base={id:'MD-120926',hotel:'Maidens Hotel',arrival:'2026-09-12',departure:'2026-09-19',room:'Премиум Кинг',party:'1 взр.',guest:'Татьяна Глазырина',tariff:'Деловой',roomTotal:56000,paid:56000};
test('bill combines accommodation and confirmed services, excludes pending requests',()=>{
 const bill=view.account({...base,services:[{title:'Сырники',price:480,state:'progress'},{title:'Поздний выезд',price:3000,state:'pending'}]});
 assert.equal(bill.total,56480);assert.equal(bill.due,480);assert.equal(bill.services.length,1);
});
test('completed and arrival-payment bookings expose correct balances',()=>{
 assert.equal(view.account({...base,services:[{title:'Сырники',price:480}],paid:56480}).due,0);
 const bill=view.account({...base,paid:0,discount:2400,services:[{title:'Ранний заезд',price:2500}]});
 assert.equal(bill.total,56100);assert.equal(bill.due,56100);
});
test('cancelled booking shows refund and fee instead of the original amount due',()=>{
 const html=view.render({...base,cancellation:{fee:8000,refund:48000,due:0}});
 assert.match(html,/Удержание/);assert.match(html,/К возврату/);assert.doesNotMatch(html,/Осталось оплатить/);
});
test('booking facts escape user text and share the hierarchy for each status',()=>{
 for(const status of ['Бронь подтверждена','Проживание','Поездка завершена','Бронь отменена']){
  const html=view.render({...base,status,guest:'<img src=x onerror=alert(1)>'});
  assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
  for(const heading of ['Номер и гости','Тариф «Деловой»','Общий счёт'])assert.ok(html.includes(heading));
 }
});

test('new booking bill matches checkout with time supplements, extras and points for both payment methods',async()=>{
 globalThis.document={createElement:()=>({relList:{supports:()=>true}})};globalThis.PoraDemo={};
 const {createRequire}=await import('node:module'),e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
 const now=Date.parse('2026-09-13T10:00:00Z'),run=(s,a)=>e.reducer(s,{now,...a});
 for(const method of ['arrival','sbp']){
  let s=run(e.keysInitialState(),{type:'RESERVATION_START',hotelId:'more'});
  s=run(s,{type:'KEYS_STAY_TIME',kind:'early',time:'12:00'});
  s=run(s,{type:'RESERVATION_EXTRA',id:'dinner',selected:true});
  s=run(s,{type:'RESERVATION_POINTS',enabled:true});
  s=run(s,{type:'RESERVATION_CONTACT',contact:{...s.reservation.contact,lastName:'Иванова',email:'guest@example.test'}});
  s=run(s,{type:'RESERVATION_NEXT'});s=run(s,{type:'RESERVATION_METHOD',method});
  const quote=e.checkoutTotal(s.reservation);
  s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});
  if(method==='sbp')s=run(s,{type:'MOCK_PROGRESS',now:now+600000});
  assert.equal(s.reservation.status,'confirmed');
  const bill=view.account(e.keysBookingDetailsModel(s.reservation,s.booking));
  assert.equal(bill.total,quote.total);assert.equal(bill.due,method==='arrival'?quote.total:0);
 }
});
