function keysConnectedHotelSavings(draft){return draft.hotelLoyaltyDiscount?Ul({...draft,hotelLoyaltyDiscount:0})-Ul(draft):0;}
// Prototype connection state is scoped to the hotel. Passwords never leave the form.
function keysHotelLoyaltyScenario(state,enabled){
 if(!!state.keysHotelLoyaltyMissing===enabled)return state;
 return {...state,keysHotelLoyaltyMissing:enabled,keysConnectedHotelCards:{},keysHotelPointsBeforeMissing:enabled?state.keysHotelPoints:undefined,keysHotelPoints:enabled?{more:0}:state.keysHotelPointsBeforeMissing,
  reservation:state.reservation?{...state.reservation,hotelLoyaltyDiscount:0}:null};
}
function keysConnectHotelLoyalty(state,email,targetHotelId){
 const draft=state.reservation,hotelId=targetHotelId||draft?.hotelId;
 if(!state.keysHotelLoyaltyMissing||!hotelId||(!targetHotelId&&(!draft||draft.status==='confirmed')))return state;
 const card={hotelId,email,method:'email',discount:10};
 return {...state,keysConnectedHotelCards:{...state.keysConnectedHotelCards,[hotelId]:card},reservation:draft?.hotelId===hotelId&&draft.status!=='confirmed'?{...draft,hotelLoyaltyDiscount:.1,error:''}:draft};
}
function keysHotelRememberedEmail(hotelId){try{return JSON.parse(localStorage.getItem('keys-hotel-login-'+hotelId)||'null')?.email||'';}catch{return '';}}
function KeysHotelLoyaltyPage({title,onClose,children}){return n.jsxs('section',{className:'keys-loyalty-page',children:[n.jsx(Ae,{title,onBack:onClose}),children]});}
function KeysHotelLoyaltyBanner({draft,hotelId:targetHotelId,standalone=false}){
 const hotelId=targetHotelId||draft?.hotelId;
 const {state,dispatch}=J(),[step,setStep]=E.useState(standalone?'login':null),[email,setEmail]=E.useState(()=>standalone?keysHotelRememberedEmail(hotelId):''),[password,setPassword]=E.useState(''),[error,setError]=E.useState('');
 const card=state.keysConnectedHotelCards?.[hotelId],hotel=Ie(hotelId),Dialog=standalone?KeysHotelLoyaltyPage:ct;
 const close=()=>{setStep(standalone?'login':null);setPassword('');setError('');if(standalone)dispatch({type:'BACK'});};
 const open=()=>{setEmail(keysHotelRememberedEmail(hotelId));setStep('login');setError('');};
 const connect=()=>{try{localStorage.setItem('keys-hotel-login-'+hotelId,JSON.stringify({email,method:'email'}));}catch{}dispatch({type:'KEYS_CONNECT_HOTEL_LOYALTY',email,hotelId:standalone?hotelId:undefined});setPassword('');setStep('success');};
 const submit=event=>{event.preventDefault();setError('');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Укажите корректную почту');return;}if(step==='recovery'){setStep('sent');return;}if(password.length<6){setError('Введите пароль от 6 символов');return;}connect();};
 if(!state.keysHotelLoyaltyMissing)return null;
 const saved=draft?keysConnectedHotelSavings(draft):0;
 return n.jsxs(n.Fragment,{children:[
  !standalone&&n.jsxs('section',{className:'keys-connect-loyalty'+(card?' is-connected':''),'aria-label':'Лояльность отеля',children:[card?n.jsx(D,{name:'check',className:'size-5'}):n.jsx('span',{className:'keys-connect-discount','aria-hidden':true,children:'−10%'}),n.jsxs('div',{children:[n.jsx('h2',{children:card?'Карта лояльности · скидка 10%':'Бронируйте выгоднее'}),n.jsx('p',{children:card?n.jsxs(n.Fragment,{children:['Применена к проживанию · экономия ',n.jsx('span',{style:{whiteSpace:'nowrap'},children:Te(saved)})]}):'Возможно, у вас уже есть скидка 10% в этом отеле. Подключите карту лояльности, чтобы применить её к брони.'})]}),!card&&n.jsx('button',{type:'button',className:'keys-connect-action',onClick:open,children:'Подключить карту лояльности отеля'})]}),
  step&&n.jsx(Dialog,{title:step==='success'?'Карта лояльности добавлена':step==='recovery'?'Восстановить пароль':step==='sent'?'Проверьте почту':step==='reset'?'Новый пароль':'Карта лояльности отеля',onClose:close,children:step==='success'?n.jsxs('div',{className:'keys-loyalty-login',children:[n.jsxs('div',{className:'keys-connected-card',children:[n.jsx(D,{name:'hotel',className:'size-5'}),n.jsx('h3',{children:hotel.name}),n.jsx('strong',{children:'Скидка 10%'}),n.jsx('p',{children:standalone?'Карта лояльности подключена. Скидка применится при бронировании этого отеля.':'Карта лояльности подключена. Стоимость текущей брони пересчитана.'})]}),n.jsx(H,{onClick:close,children:standalone?'К выгодам':'К бронированию'})]}):step==='sent'?n.jsxs('div',{className:'keys-loyalty-login',children:[n.jsx('p',{children:'Ссылка для восстановления пароля будет отправлена на '+email+'.'}),n.jsx('small',{children:'Демо: письмо не отправляется. Откройте ссылку ниже, чтобы продолжить сценарий.'}),n.jsx(H,{onClick:()=>{setPassword('');setStep('reset');},children:'Открыть ссылку из письма'}),n.jsx('button',{type:'button',className:'keys-connect-text',onClick:()=>setStep('recovery'),children:'Изменить почту'})]}):n.jsxs('form',{className:'keys-loyalty-login',onSubmit:submit,noValidate:true,children:[
   n.jsx('p',{children:step==='login'?'Используйте почту и пароль от личного кабинета '+hotel.name:step==='recovery'?'Укажите почту, с которой вы регистрировались в отеле.':'Задайте новый пароль для кабинета отеля.'}),
   step!=='reset'&&n.jsxs('label',{children:['Электронная почта',n.jsx('input',{type:'email',autoComplete:'email',value:email,onChange:event=>setEmail(event.target.value),placeholder:'name@example.ru',required:true})]}),
   step!=='recovery'&&n.jsxs('label',{children:[step==='reset'?'Новый пароль':'Пароль',n.jsx('input',{type:'password',autoComplete:step==='reset'?'new-password':'current-password',value:password,onChange:event=>setPassword(event.target.value),placeholder:'Не менее 6 символов',required:true,minLength:6})]}),
   error&&n.jsx('p',{role:'alert',className:'keys-loyalty-login-error',children:error}),
   step==='login'&&n.jsx('button',{type:'button',className:'keys-connect-text',onClick:()=>{setPassword('');setError('');setStep('recovery');},children:'Не помню пароль'}),
   n.jsx(H,{type:'submit',children:step==='recovery'?'Получить ссылку':step==='reset'?'Сохранить и подключить карту':'Войти и подключить карту'}),
   n.jsx('small',{children:'Демо-сценарий: введите любую почту и пароль от 6 символов. Реальные данные не нужны.'})
  ]})})
 ]});
}
