// Prototype payments: no card details or banking requests are collected.
const keysCardPaymentPlans=[{id:'full',label:'Оплата полностью'},{id:'deposit30',label:'Предоплата 30%'},{id:'first-night',label:'Оплата первой ночи'}];
function keysPaymentSplit(draft){
 const total=YA(draft),plan=draft.paymentMethod==='card'?(draft.keysPaymentPlan||'full'):'full';
 // The catalogue has a uniform nightly rate. Points reduce accommodation first.
 const firstNight=Math.round(Math.max(0,total.room-total.discount)/Math.max(1,Ge(draft.arrival,draft.departure)));
 const now=draft.paymentMethod==='arrival'?0:Math.min(total.total,plan==='deposit30'?Math.round(total.total*.3):plan==='first-night'?firstNight:total.total);
 return {plan,total:total.total,now,remaining:Math.max(0,total.total-now)};
}
function keysBookingPaymentBalance(draft,booking){return Math.max(0,YA(draft).total-(booking.payment?.amount??booking.paid??0));}
function keysPartialPayment(booking){return booking.payment?.status==='partial'&&!booking.keysCancellation;}
function keysPaymentPlanReduce(state,action){
 const draft=state.reservation;
 if(action.type==='KEYS_PAYMENT_PLAN'){
  if(!draft||draft.paymentMethod!=='card'||!['editing','failed'].includes(draft.status)||!keysCardPaymentPlans.some(p=>p.id===action.plan))return state;
  return {...state,reservation:{...draft,keysPaymentPlan:action.plan,error:''}};
 }
 const session=state.keysBalancePayment;
 if(action.type==='KEYS_BALANCE_CLOSE')return {...state,keysBalancePayment:null};
 const id=action.bookingId||session?.bookingId,record=state.keysCreatedBookings?.[id];
 if(!record||record.booking.keysCancellation)return state;
 const due=keysBookingPaymentBalance(record.draft,record.booking);
 if(action.type==='KEYS_BALANCE_START'){
  if(!keysPartialPayment(record.booking)||due<=0||session?.status==='processing')return state;
  return {...state,keysBalanceAttempt:(state.keysBalanceAttempt||0)+1,keysBalancePayment:{bookingId:id,amount:due,status:'processing',attempt:(state.keysBalanceAttempt||0)+1,result:action.result==='declined'?'declined':'success'}};
 }
 if(action.type!=='KEYS_BALANCE_RESULT'||session?.status!=='processing'||session.bookingId!==id||action.attempt!==session.attempt)return state;
 if(session.result==='declined')return {...state,keysBalancePayment:{...session,status:'failed'}};
 if(!keysPartialPayment(record.booking)||due!==session.amount)return {...state,keysBalancePayment:null};
 const total=YA(record.draft),booking={...record.booking,paid:total.accommodation,dueAtHotel:0,payment:{...record.booking.payment,amount:total.total,status:'paid',balancePayments:[...(record.booking.payment.balancePayments||[]),{id:id+'-balance-'+session.attempt,amount:due}]}};
 return {...state,booking:state.booking.id===id?booking:state.booking,keysCreatedBookings:{...state.keysCreatedBookings,[id]:{...record,booking}},orders:state.orders.map(order=>order.id.startsWith(id+'-reservation-')?{...order,paid:true}:order),keysBalancePayment:{...session,status:'success'}};
}
function KeysCardPaymentPlans({draft}){
 const split=keysPaymentSplit(draft),{dispatch}=J();
 return n.jsxs('fieldset',{className:'keys-card-plans',children:[n.jsx('legend',{children:'Сколько оплатить сейчас'}),keysCardPaymentPlans.map(plan=>{const amount=keysPaymentSplit({...draft,keysPaymentPlan:plan.id}).now;return n.jsxs('label',{className:'keys-card-plan'+(split.plan===plan.id?' is-selected':''),children:[n.jsx('input',{type:'radio',name:'keys-card-plan',checked:split.plan===plan.id,onChange:()=>dispatch({type:'KEYS_PAYMENT_PLAN',plan:plan.id})}),n.jsx('span',{children:plan.label}),n.jsx('strong',{children:Te(amount)})]},plan.id);}),split.remaining>0&&n.jsx('p',{children:'Остаток '+Te(split.remaining)+' можно оплатить в разделе «Поездки».'})]});
}
function KeysBalancePayment({bookingId}){
 const {state,dispatch,back}=J(),record=state.keysCreatedBookings?.[bookingId],session=state.keysBalancePayment?.bookingId===bookingId?state.keysBalancePayment:null,[result,setResult]=E.useState('success');
 const processing=session?.status==='processing',success=session?.status==='success',failed=session?.status==='failed';
 E.useEffect(()=>{if(!processing)return;const timer=setTimeout(()=>dispatch({type:'KEYS_BALANCE_RESULT',bookingId,attempt:session.attempt}),1200);return()=>clearTimeout(timer);},[processing,bookingId,session?.attempt]);
 const close=()=>{dispatch({type:'KEYS_BALANCE_CLOSE'});back();};
 if(!record)return n.jsx(Ae,{title:'Оплата брони',onBack:close});
 const {draft,booking}=record,due=keysBookingPaymentBalance(draft,booking),unavailable=!!booking.keysCancellation||!due;
 return n.jsxs('div',{className:'keys-acquiring',children:[n.jsx(Ae,{title:'Оплата брони',onBack:processing?undefined:close}),n.jsxs('section',{className:'keys-acquiring-card','aria-label':'Эквайринг',children:[n.jsx(D,{name:success?'check':'card',className:'keys-acquiring-icon'}),n.jsx('h2',{children:success?'Бронирование оплачено':booking.keysCancellation?'Бронь отменена':unavailable?'Всё оплачено':'Оплата остатка'}),n.jsx('p',{children:Ie(draft.hotelId).name+' · '+booking.id}),n.jsxs('dl',{children:[n.jsxs('div',{children:[n.jsx('dt',{children:'Стоимость брони'}),n.jsx('dd',{children:Te(YA(draft).total)})]}),n.jsxs('div',{children:[n.jsx('dt',{children:'Уже оплачено'}),n.jsx('dd',{children:Te(booking.payment?.amount||0)})]}),!unavailable&&n.jsxs('div',{children:[n.jsx('dt',{children:'К оплате'}),n.jsx('dd',{children:Te(due)})]})]}),
 !unavailable&&n.jsxs('div',{className:'keys-acquiring-demo',children:[n.jsx('strong',{children:'Тестовая карта ···· 4242'}),n.jsx('p',{children:'Демонстрация эквайринга. Деньги не списываются.'})]}),
 failed&&n.jsx('p',{role:'alert',className:'keys-checkout-error',children:'Не удалось оплатить. Деньги не списаны. Попробуйте ещё раз.'}),
 !unavailable&&n.jsx(H,{disabled:processing,onClick:()=>dispatch({type:'KEYS_BALANCE_START',bookingId,result}),children:processing?'Обрабатываем оплату…':(failed?'Повторить оплату · ':'Оплатить · ')+Te(due)}),
 (success||unavailable)&&n.jsx(H,{onClick:()=>{dispatch({type:'KEYS_BALANCE_CLOSE'});dispatch({type:'HOME',confirmedBookingId:bookingId});},children:'К поездке'}),
 !processing&&!unavailable&&n.jsx(H,{variant:'secondary',onClick:close,children:'Вернуться без оплаты'}),
 !unavailable&&n.jsxs('label',{className:'keys-acquiring-outcome',children:['Результат тестовой оплаты',n.jsxs('select',{value:result,disabled:processing,onChange:event=>setResult(event.target.value),children:[n.jsx('option',{value:'success',children:'Успешно'}),n.jsx('option',{value:'declined',children:'Отказ банка'})]})]})
 ]})]});
}
