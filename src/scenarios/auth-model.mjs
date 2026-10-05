// Local interaction model only. Production authentication requires a server/SMS provider.
export const PROTOTYPE_CODE='123456';
export function normalizePhone(value){
 let digits=value.replace(/\D/g,'');
 if(digits.length===10)digits='7'+digits;
 if(digits.length===11&&digits[0]==='8')digits='7'+digits.slice(1);
 return /^7\d{10}$/.test(digits)?'+'+digits:null;
}
export function formatPhone(value){
 const d=value.replace(/\D/g,'');
 return `+7 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
}
export function createAuthFlow(now=()=>Date.now()){
 const state={step:'phone',phone:'',name:'',resendAt:0,expiresAt:0,verified:false};
 return {
  state,
  send(value){
   const phone=normalizePhone(value);
   if(!phone)return 'Проверьте номер: после +7 должно быть 10 цифр.';
   if(state.phone===phone&&now()<state.resendAt){state.step='code';return null;}
   Object.assign(state,{phone,step:'code',verified:false,resendAt:now()+30000,expiresAt:now()+300000});return null;
  },
  resend(){
   if(!state.phone||now()<state.resendAt)return false;
   Object.assign(state,{resendAt:now()+30000,expiresAt:now()+300000,verified:false});return true;
  },
  verify(code){
   if(!state.phone||state.step!=='code')return 'Сначала укажите номер телефона.';
   if(now()>=state.expiresAt)return 'Срок действия кода истёк. Запросите новый.';
   if(code!==PROTOTYPE_CODE)return 'Код не подошёл. Проверьте цифры и попробуйте ещё раз.';
   state.verified=true;state.step='name';return null;
  },
  complete(value){
   if(!state.verified||state.step!=='name')return 'Сначала подтвердите номер телефона.';
   const name=value.trim().replace(/\s+/g,' ');
   if(name.length<2||name.length>40||!/^\p{L}[\p{L}\p{M} ’'\-]*$/u.test(name))return 'Введите имя буквами — от 2 до 40 символов.';
   state.name=name;state.step='done';return null;
  },
  back(){if(state.step==='name')state.step='code';else if(state.step==='code'){state.step='phone';state.verified=false;}},
  remaining(){return Math.max(0,Math.ceil((state.resendAt-now())/1000));}
 };
}
