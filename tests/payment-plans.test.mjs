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
