// Local prototype transport only. A production payment must be verified by a server.
const keysExternalPaymentPrefix='keys-demo-payment-v1:';
function keysExternalPaymentReduce(state,action){
 if(action.type==='KEYS_EXTERNAL_NOTICE_CLEAR')return {...state,keysExternalPaymentNotice:null};
 const sessions=state.keysExternalPayments||{},existing=sessions[action.token];
 if(action.type==='KEYS_EXTERNAL_OPEN'){
  const record=state.keysCreatedBookings?.[action.bookingId];
  if(!record||!keysPartialPayment(record.booking)||existing||typeof action.token!=='string'||!action.token)return state;
  const amount=keysBookingPaymentBalance(record.draft,record.booking);
  if(amount<=0||amount!==action.amount)return state;
  return {...state,keysExternalPayments:{...sessions,[action.token]:{token:action.token,bookingId:record.booking.id,amount,createdAt:action.now,status:'ready'}}};
 }
 if(action.type!=='KEYS_EXTERNAL_RESULT'||!existing||existing.status!=='ready')return state;
 const record=state.keysCreatedBookings?.[existing.bookingId],valid=record&&keysPartialPayment(record.booking)&&existing.bookingId===action.bookingId&&existing.amount===action.amount&&keysBookingPaymentBalance(record.draft,record.booking)===existing.amount&&action.now-existing.createdAt<=30*60*1000;
 if(!valid)return {...state,keysExternalPayments:{...sessions,[action.token]:{...existing,status:'expired'}}};
 const started=keysPaymentPlanReduce(state,{type:'KEYS_BALANCE_START',bookingId:existing.bookingId});
 if(started===state)return {...state,keysExternalPayments:{...sessions,[action.token]:{...existing,status:'expired'}}};
 const paid=keysPaymentPlanReduce(started,{type:'KEYS_BALANCE_RESULT',bookingId:existing.bookingId,attempt:started.keysBalancePayment.attempt});
 return {...paid,keysExternalPayments:{...sessions,[action.token]:{...existing,status:'paid'}},keysExternalPaymentNotice:{token:action.token,bookingId:existing.bookingId,amount:existing.amount,hotel:Ie(record.draft.hotelId).name}};
}
function keysOpenExternalPayment(state,dispatch,bookingId){
 const record=state.keysCreatedBookings?.[bookingId];if(!record||!keysPartialPayment(record.booking))return false;
 const amount=keysBookingPaymentBalance(record.draft,record.booking);if(!amount)return false;
 const token=crypto.randomUUID(),now=Date.now(),payload={token,bookingId,amount,hotel:Ie(record.draft.hotelId).name,arrival:record.draft.arrival,departure:record.draft.departure,email:'guest@example.test',createdAt:now,status:'ready'};
 try{localStorage.setItem(keysExternalPaymentPrefix+token,JSON.stringify(payload));}catch{keysPost('payment-open-error',{reason:'storage'});return false;}
 const url=new URL('../payment/index.html',location.href);url.searchParams.set('session',token);
 const tab=window.open(url.href,'_blank');
 if(!tab){localStorage.removeItem(keysExternalPaymentPrefix+token);keysPost('payment-open-error',{reason:'popup'});return false;}
 dispatch({type:'KEYS_EXTERNAL_OPEN',token,bookingId,amount,now});return true;
}
function KeysExternalPaymentBridge(){
 const {state,dispatch}=J(),current=E.useRef(state),notified=E.useRef(null);current.current=state;
 E.useEffect(()=>{
  // Called synchronously by the same-origin host to retain the user's popup activation.
  globalThis.KeysOpenBalancePayment=id=>keysOpenExternalPayment(current.current,dispatch,id);
  const receive=event=>{
   if(event.storageArea!==localStorage||!event.key?.startsWith(keysExternalPaymentPrefix)||!event.newValue)return;
   try{const data=JSON.parse(event.newValue);if(data.status==='submitted')dispatch({type:'KEYS_EXTERNAL_RESULT',token:event.key.slice(keysExternalPaymentPrefix.length),bookingId:data.bookingId,amount:data.amount,now:Date.now()});}catch{}
  };
  window.addEventListener('storage',receive);return()=>{delete globalThis.KeysOpenBalancePayment;window.removeEventListener('storage',receive);};
 },[dispatch]);
 E.useEffect(()=>{
  for(const session of Object.values(state.keysExternalPayments||{})){
   if(!['paid','expired'].includes(session.status))continue;
   try{const key=keysExternalPaymentPrefix+session.token,payload=JSON.parse(localStorage.getItem(key)||'null');if(payload&&payload.status!==session.status)localStorage.setItem(key,JSON.stringify({...payload,status:session.status}));}catch{}
  }
  const notice=state.keysExternalPaymentNotice;
  if(notice&&notice.token!==notified.current){notified.current=notice.token;keysPost('payment-success',notice);dispatch({type:'KEYS_EXTERNAL_NOTICE_CLEAR'});}
 },[state.keysExternalPayments,state.keysExternalPaymentNotice]);
 return null;
}
