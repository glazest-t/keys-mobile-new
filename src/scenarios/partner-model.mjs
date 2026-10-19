// Local prototype state: no TravelLine requests or account lookups are performed.
export function createPartnerVerification(){
 const state={status:'intro',phone:'',email:'',requestId:0,requestToken:''};
 return {
  state,
  start(phone){Object.assign(state,{status:'intro',phone,email:'',requestId:state.requestId+1,requestToken:''});},
  restore(phone,saved){
   this.start(phone);this.defer();
   if(saved&&['pending','approved','rejected'].includes(saved.status)&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(saved.email)&&Number.isSafeInteger(saved.requestId)&&saved.requestId>0)Object.assign(state,{status:saved.status,email:saved.email,requestId:saved.requestId,requestToken:saved.requestToken||crypto.randomUUID()});
  },
  request(value){
   const email=value.trim().toLowerCase();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>254)return 'Проверьте рабочий email.';
   if(!/^\+7\d{10}$/.test(state.phone))return 'Сначала подтвердите номер телефона.';
   Object.assign(state,{email,status:'pending',requestId:state.requestId+1,requestToken:crypto.randomUUID()});return null;
  },
  decide(id,approved){if(state.status!=='pending'||id!==state.requestId)return false;state.status=approved?'approved':'rejected';return true;},
  defer(){if(!state.phone||['pending','approved'].includes(state.status))return false;state.status='deferred';return true;},
  edit(){state.requestId++;state.status='email';},
  reset(){Object.assign(state,{status:'intro',phone:'',email:'',requestId:state.requestId+1,requestToken:''});}
 };
}
