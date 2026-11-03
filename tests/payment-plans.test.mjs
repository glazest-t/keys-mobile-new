import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const now=Date.parse('2026-09-29T10:00:00Z');
const run=(s,a)=>e.reducer(s,{now,...a});
function prepare(plan='full',method='card'){
 let s=e.keysInitialState();
 for(const a of [{type:'HOTEL_OPEN',id:'more'},{type:'RESERVATION_START'},{type:'RESERVATION_NEXT'}])s=run(s,a);
 s=run(s,{type:'RESERVATION_CONTACT',contact:{...s.reservation.contact,lastName:'Иванова',email:'guest@example.test'}});
 s=run(s,{type:'RESERVATION_METHOD',method});s=run(s,{type:'KEYS_PAYMENT_PLAN',plan});return s;
}
function confirm(s){s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});return run(s,{type:'MOCK_PROGRESS',now:now+600000});}
for(const plan of ['full','deposit30','first-night'])test('card payment '+plan+' has consistent totals, record and bill',()=>{
 const draftState=prepare(plan),draft=draftState.reservation,total=e.checkoutTotal(draft),split=e.keysPaymentSplit(draft);
 const expected=plan==='full'?total.total:plan==='deposit30'?Math.round(total.total*.3):Math.round((total.room-total.discount)/((Date.parse(draft.departure)-Date.parse(draft.arrival))/86400000));
 assert.equal(split.now,expected);assert.equal(split.now+split.remaining,total.total);
 const s=confirm(draftState);assert.equal(s.reservation.status,'confirmed');assert.equal(s.booking.payment.amount,expected);assert.equal(s.booking.payment.status,split.remaining?'partial':'paid');assert.equal(s.booking.dueAtHotel,split.remaining);assert.equal(e.keysBookingDetailsModel(s.reservation,s.booking).paid,expected);assert.deepEqual(s.keysCreatedBookings[s.booking.id].booking,s.booking);
});
test('switching payment method does not carry partial payment to SBP or arrival',()=>{
 let s=prepare('deposit30');s=run(s,{type:'RESERVATION_METHOD',method:'sbp'});assert.equal(e.keysPaymentSplit(s.reservation).now,e.checkoutTotal(s.reservation).total);
 s=run(s,{type:'RESERVATION_METHOD',method:'arrival'});assert.equal(e.keysPaymentSplit(s.reservation).now,0);
 s=run(s,{type:'RESERVATION_METHOD',method:'card'});assert.equal(e.keysPaymentSplit(s.reservation).plan,'deposit30');
});
test('partial amount tracks times, extras and points; first-night is capped by total',()=>{
 let s=prepare('deposit30');s=run(s,{type:'RESERVATION_POINTS',enabled:true});
 const draft={...s.reservation,extras:[{serviceId:'breakfast',price:1100}],keysPaymentPlan:'deposit30'};
 const split=e.keysPaymentSplit(draft);assert.equal(split.now,Math.round(e.checkoutTotal(draft).total*.3));assert.equal(split.now+split.remaining,e.checkoutTotal(draft).total);
 const one={...draft,keysPaymentPlan:'first-night',departure:new Date(Date.parse(draft.arrival)+86400000).toISOString().slice(0,10),extras:[]};const single=e.keysPaymentSplit(one);assert.ok(single.now<=single.total);assert.equal(single.remaining,0);
});
test('balance payment failure and cancellation preserve debt; retry pays once without extra points',()=>{
 let s=confirm(prepare('deposit30'));const id=s.booking.id,paid=s.booking.payment.amount,points=s.loyalty.balance;
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id,result:'declined'});const attempt=s.keysBalancePayment.attempt;
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});assert.equal(s.keysBalancePayment.attempt,attempt);
 s=run(s,{type:'KEYS_BALANCE_RESULT',bookingId:id,attempt});assert.equal(s.keysBalancePayment.status,'failed');assert.equal(s.booking.payment.amount,paid);
 s=run(s,{type:'KEYS_BALANCE_CLOSE'});assert.equal(s.booking.payment.amount,paid);
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});const action={type:'KEYS_BALANCE_RESULT',bookingId:id,attempt:s.keysBalancePayment.attempt};s=run(s,action);
 assert.equal(s.booking.payment.status,'paid');assert.equal(s.booking.payment.amount,e.checkoutTotal(s.reservation).total);assert.equal(s.booking.dueAtHotel,0);assert.equal(s.loyalty.balance,points);assert.equal(s.keysCreatedBookings[id].booking.payment.amount,s.booking.payment.amount);
 const done=s;s=run(s,action);assert.equal(s,done);s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});assert.equal(s,done);
});
test('cancelled booking cannot be topped up and only paid amount can be refunded',()=>{
 let s=confirm(prepare('deposit30'));const id=s.booking.id,quote=e.keysBookingCancellationQuote(s.reservation,s.booking,'2020-01-01');assert.ok(quote.refund<=s.booking.payment.amount);
 s=run(s,{type:'KEYS_BOOKING_CANCELLED',bookingId:id,result:quote});const before=s;s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});assert.equal(s,before);
});
test('confirmed and processing payment plan cannot change retroactively',()=>{
 let s=prepare('deposit30');const before=s;s=run(s,{type:'KEYS_PAYMENT_PLAN',plan:'invalid'});assert.equal(s,before);
 s=run(s,{type:'RESERVATION_PAY',draftId:s.reservation.id});const processing=s;s=run(s,{type:'KEYS_PAYMENT_PLAN',plan:'full'});assert.equal(s,processing);
 s=run(s,{type:'MOCK_PROGRESS',now:now+600000});const confirmed=s;s=run(s,{type:'KEYS_PAYMENT_PLAN',plan:'full'});assert.equal(s,confirmed);
});
test('stale payment callbacks cannot settle a new attempt after cancelling',()=>{
 let s=confirm(prepare('first-night'));const id=s.booking.id;
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});const old=s.keysBalancePayment.attempt;
 s=run(s,{type:'KEYS_BALANCE_CLOSE'});s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});const current=s;
 assert.ok(s.keysBalancePayment.attempt>old);s=run(s,{type:'KEYS_BALANCE_RESULT',bookingId:id,attempt:old});assert.equal(s,current);
});
test('declined initial prepayment creates no booking; retry charges only chosen amount',()=>{
 let s=prepare('deposit30');s={...s,reservation:{...s.reservation,paymentOutcomes:['declined','success']}};const originalBooking=s.booking.id,points=s.loyalty.balance,split=e.keysPaymentSplit(s.reservation);
 s=confirm(s);assert.equal(s.reservation.status,'failed');assert.equal(s.booking.id,originalBooking);assert.equal(s.loyalty.balance,points);
 s=confirm(s);assert.equal(s.reservation.status,'confirmed');assert.equal(s.booking.payment.amount,split.now);assert.equal(s.booking.dueAtHotel,split.remaining);
});
test('paying a previous booking preserves a newer checkout draft',()=>{
 let s=confirm(prepare('deposit30'));const id=s.booking.id;
 s=run(s,{type:'HOTEL_OPEN',id:'palm'});s=run(s,{type:'RESERVATION_START'});const newDraft=s.reservation;
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});s=run(s,{type:'KEYS_BALANCE_RESULT',bookingId:id,attempt:s.keysBalancePayment.attempt});
 assert.equal(s.reservation,newDraft);assert.equal(s.keysCreatedBookings[id].booking.payment.status,'paid');assert.equal(e.keysBookingPaymentBalance(s.keysCreatedBookings[id].draft,s.keysCreatedBookings[id].booking),0);
});

test('partial-payment preset opens a confirmed Maidens booking and supports balance payment',()=>{
 const original=e.keysInitialState();let s=run(original,{type:'KEYS_PARTIAL_DEMO',enabled:true});
 assert.equal(s.booking.hotelId,'maidens');assert.equal(s.reservation.status,'confirmed');
 assert.equal(s.booking.payment.status,'partial');assert.equal(s.booking.payment.amount,Math.round(e.checkoutTotal(s.reservation).total*.3));
 const id=s.keysPartialDemoId;assert.equal(s.keysCreatedBookings[id].booking.id,id);
 assert.equal(e.keysBookingDetailsModel(s.reservation,s.booking).paid,s.booking.payment.amount);
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:id});s=run(s,{type:'KEYS_BALANCE_RESULT',bookingId:id,attempt:s.keysBalancePayment.attempt});
 assert.equal(s.booking.payment.status,'paid');assert.equal(s.booking.dueAtHotel,0);
 assert.equal(run(s,{type:'KEYS_PARTIAL_DEMO',enabled:true}),s,'return from payment keeps paid status');
 s=run(s,{type:'KEYS_PARTIAL_DEMO',enabled:true,reset:true});assert.equal(s.booking.payment.status,'partial');
 assert.equal(run(s,{type:'KEYS_PARTIAL_DEMO',enabled:false}),original,'leaving restores the previous runtime');
});
test('partial-payment preset isolates existing reservations and ignores old payment callbacks after reset',()=>{
 const original=confirm(prepare('first-night'));let s=run(original,{type:'KEYS_PARTIAL_DEMO',enabled:true});
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:s.keysPartialDemoId});const stale={type:'KEYS_BALANCE_RESULT',bookingId:s.keysPartialDemoId,attempt:s.keysBalancePayment.attempt};
 s=run(s,{type:'KEYS_PARTIAL_DEMO',enabled:true,reset:true});const reset=s;
 assert.equal(run(s,stale),reset);
 s=run(s,{type:'KEYS_BALANCE_START',bookingId:s.keysPartialDemoId});const fresh=s;
 assert.notEqual(s.keysBalancePayment.attempt,stale.attempt);assert.equal(run(s,stale),fresh);
 assert.equal(run(s,{type:'KEYS_PARTIAL_DEMO',enabled:false}),original);
});

test('external payment validates its registered session and settles the exact booking once',()=>{
 let s=confirm(prepare('deposit30'));const id=s.booking.id,amount=e.keysBookingPaymentBalance(s.reservation,s.booking),token='test-external-1';
 const unregistered=run(s,{type:'KEYS_EXTERNAL_RESULT',token,bookingId:id,amount});assert.equal(unregistered,s);
 s=run(s,{type:'KEYS_EXTERNAL_OPEN',token,bookingId:id,amount});assert.equal(s.keysExternalPayments[token].status,'ready');
 s=run(s,{type:'KEYS_EXTERNAL_RESULT',token,bookingId:id,amount});assert.equal(s.keysExternalPayments[token].status,'paid');assert.equal(s.booking.payment.status,'paid');assert.equal(s.booking.dueAtHotel,0);assert.equal(s.keysExternalPaymentNotice.bookingId,id);
 assert.equal(run(s,{type:'KEYS_EXTERNAL_RESULT',token,bookingId:id,amount}),s);
});
test('external payment rejects changed amount, expired sessions and cancelled bookings',()=>{
 for(const reason of ['amount','expired','cancelled']){
  let s=confirm(prepare('deposit30'));const id=s.booking.id,amount=e.keysBookingPaymentBalance(s.reservation,s.booking),paid=s.booking.payment.amount,token='test-'+reason;
  s=run(s,{type:'KEYS_EXTERNAL_OPEN',token,bookingId:id,amount});
  if(reason==='cancelled')s=run(s,{type:'KEYS_BOOKING_CANCELLED',bookingId:id,result:e.keysBookingCancellationQuote(s.reservation,s.booking,'2020-01-01')});
  s=run(s,{type:'KEYS_EXTERNAL_RESULT',token,bookingId:id,amount:reason==='amount'?amount+1:amount,now:reason==='expired'?now+31*60*1000:now});
  assert.equal(s.keysExternalPayments[token].status,'expired');assert.equal(s.booking.payment.amount,paid);assert.equal(s.keysExternalPaymentNotice,undefined);
 }
});
test('multiple external tabs cannot settle a booking twice or settle a reset demo',()=>{
 let s=run(e.keysInitialState(),{type:'KEYS_PARTIAL_DEMO',enabled:true});const id=s.keysPartialDemoId,amount=e.keysBookingPaymentBalance(s.reservation,s.booking);
 for(const token of ['first','second'])s=run(s,{type:'KEYS_EXTERNAL_OPEN',token,bookingId:id,amount});
 s=run(s,{type:'KEYS_EXTERNAL_RESULT',token:'first',bookingId:id,amount});
 s=run(s,{type:'KEYS_EXTERNAL_RESULT',token:'second',bookingId:id,amount});assert.equal(s.keysExternalPayments.second.status,'expired');assert.equal(s.booking.payment.balancePayments.length,1);
 s=run(s,{type:'KEYS_PARTIAL_DEMO',enabled:true,reset:true});const reset=s;
 assert.equal(run(s,{type:'KEYS_EXTERNAL_RESULT',token:'first',bookingId:id,amount}),reset);assert.equal(s.booking.payment.status,'partial');
});
