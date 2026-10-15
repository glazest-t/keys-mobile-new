function keysConnectedHotelSavings(draft){return draft.hotelLoyaltyDiscount?Ul({...draft,hotelLoyaltyDiscount:0})-Ul(draft):0;}
// Prototype connection state is scoped to the hotel. Passwords never leave the form.
function keysHotelLoyaltyScenario(state,enabled){
 if(!!state.keysHotelLoyaltyMissing===enabled)return state;
 return {...state,keysHotelLoyaltyMissing:enabled,keysConnectedHotelCards:{},keysHotelPointsBeforeMissing:enabled?state.keysHotelPoints:undefined,keysHotelPoints:enabled?{more:0}:state.keysHotelPointsBeforeMissing,
  reservation:state.reservation?{...state.reservation,hotelLoyaltyDiscount:0}:null};
}
function keysConnectHotelLoyalty(state,email){
 const draft=state.reservation;
 if(!state.keysHotelLoyaltyMissing||!draft||draft.status==='confirmed')return state;
 const card={hotelId:draft.hotelId,email,method:'email',discount:10};
 return {...state,keysConnectedHotelCards:{...state.keysConnectedHotelCards,[draft.hotelId]:card},reservation:{...draft,hotelLoyaltyDiscount:.1,error:''}};
}
function KeysHotelLoyaltyBanner({draft}){
 const {state,dispatch}=J(),[step,setStep]=E.useState(null),[email,setEmail]=E.useState(''),[password,setPassword]=E.useState(''),[error,setError]=E.useState('');
 const card=state.keysConnectedHotelCards?.[draft.hotelId],hotel=Ie(draft.hotelId);
 const close=()=>{setStep(null);setPassword('');setError('');};
 const open=()=>{let remembered='';try{remembered=JSON.parse(localStorage.getItem('keys-hotel-login-'+draft.hotelId)||'null')?.email||'';}catch{}setEmail(remembered);setStep('login');setError('');};
 const connect=()=>{try{localStorage.setItem('keys-hotel-login-'+draft.hotelId,JSON.stringify({email,method:'email'}));}catch{}dispatch({type:'KEYS_CONNECT_HOTEL_LOYALTY',email});setPassword('');setStep('success');};
 const submit=event=>{event.preventDefault();setError('');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Укажите корректную почту');return;}if(step==='recovery'){setStep('sent');return;}if(password.length<6){setError('Введите пароль от 6 символов');return;}connect();};
 if(!state.keysHotelLoyaltyMissing)return null;
 const saved=keysConnectedHotelSavings(draft);
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('section',{className:'keys-connect-loyalty'+(card?' is-connected':''),'aria-label':'Лояльность отеля',children:[n.jsx(D,{name:card?'check':'gift',className:'size-5'}),n.jsxs('div',{children:[n.jsx('h2',{children:card?'Карта лояльности · скидка 10%':'Бронируйте выгоднее'}),n.jsx('p',{children:card?n.jsxs(n.Fragment,{children:['Применена к проживанию · экономия ',n.jsx('span',{style:{whiteSpace:'nowrap'},children:Te(saved)})]}):'Подключите карту лояльности отеля — возможно, вам уже доступна скидка на эту бронь.'})]}),!card&&n.jsx('button',{type:'button',className:'keys-connect-action',onClick:open,children:'Подключить карту лояльности отеля'})]}),
  step&&n.jsx(ct,{title:step==='success'?'Карта лояльности добавлена':step==='recovery'?'Восстановить пароль':step==='sent'?'Проверьте почту':step==='reset'?'Новый пароль':'Карта лояльности отеля',onClose:close,children:step==='success'?n.jsxs('div',{className:'keys-loyalty-login',children:[n.jsxs('div',{className:'keys-connected-card',children:[n.jsx(D,{name:'hotel',className:'size-5'}),n.jsx('h3',{children:hotel.name}),n.jsx('strong',{children:'Скидка 10%'}),n.jsx('p',{children:'Карта лояльности подключена. Стоимость текущей брони пересчитана.'})]}),n.jsx(H,{onClick:close,children:'К бронированию'})]}):step==='sent'?n.jsxs('div',{className:'keys-loyalty-login',children:[n.jsx('p',{children:'Ссылка для восстановления пароля будет отправлена на '+email+'.'}),n.jsx('small',{children:'Демо: письмо не отправляется. Откройте ссылку ниже, чтобы продолжить сценарий.'}),n.jsx(H,{onClick:()=>{setPassword('');setStep('reset');},children:'Открыть ссылку из письма'}),n.jsx('button',{type:'button',className:'keys-connect-text',onClick:()=>setStep('recovery'),children:'Изменить почту'})]}):n.jsxs('form',{className:'keys-loyalty-login',onSubmit:submit,noValidate:true,children:[
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
