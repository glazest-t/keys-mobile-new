// Checkout selects a payment method; card details belong to the later payment step.
const keysCheckoutMethods=[{id:'arrival',name:'При заселении',detail:'Сейчас ничего платить не нужно',icon:'hotel'},{id:'card',name:'Картой',detail:'Данные карты — на следующем шаге',icon:'card'},{id:'sbp',name:'СБП',detail:'Через приложение банка',icon:'qr'},{id:'digital-ruble',name:'Цифровой рубль',detail:'Через цифровой кошелёк',icon:'coins'},{id:'sberpay',name:'SberPay',detail:'Через СберБанк Онлайн',icon:'card'},{id:'yandexpay',name:'Яндекс Пэй',detail:'Через приложение Яндекс',icon:'card'}];
// Separate wallets: hotel points are usable only at their issuing hotel.
// Demo balance until a hotel loyalty account is connected.
function keysHotelPointsBalance(state,hotelId){return Math.max(0,Math.floor(state.keysHotelPoints?.[hotelId]??(hotelId==='more'?1500:0)));}
function keysPointsLimit(draft,balance){return balance<=Ul(draft)?Math.max(0,Math.floor(balance)):0;}
function keysPointsUsed(draft){return draft.usePoints?Math.max(0,Math.floor(draft.pointsAmount||0)):0;}
function keysHotelPointsUsed(draft){return draft.usePoints?Math.max(0,Math.floor(draft.hotelPointsAmount||0)):0;}
function keysPointsDiscount(draft){return Math.min(Ul(draft),keysPointsUsed(draft)+keysHotelPointsUsed(draft));}
function keysPointsSelection(state,draft,enabled){
 const keys=Math.max(0,Math.floor(state.loyalty.balance)),hotel=keysHotelPointsBalance(state,draft.hotelId),total=keys+hotel;
 return {usePoints:!!enabled&&total>0&&total<=Ul(draft),pointsAmount:keys,hotelPointsAmount:hotel};
}
function keysPointsValid(state,draft){return !draft.usePoints||(keysPointsUsed(draft)===state.loyalty.balance&&keysHotelPointsUsed(draft)===keysHotelPointsBalance(state,draft.hotelId)&&keysPointsUsed(draft)+keysHotelPointsUsed(draft)<=Ul(draft));}
function keysPaymentMethodMatches(id,filter){return filter==='all'||(filter==='later'?id==='arrival':id!=='arrival');}
function KeysCancellationPolicy({draft}){
 const {state}=J(),tariff=Sr(draft.hotelId,draft.tariffId),deadline=tariff.refundable?Hx(tariff,draft.arrival):null,free=tariff.refundable&&state.tripContext.today<=deadline;
 return n.jsxs('section',{className:'keys-checkout-panel keys-cancellation-policy','aria-label':'Условия отмены',children:[n.jsx('h2',{children:'Условия отмены'}),n.jsxs('div',{className:'keys-cancellation-copy',children:[n.jsx(D,{name:'shield',className:'size-5'}),n.jsxs('div',{children:[n.jsx('h3',{children:free?'Бесплатная отмена до '+qm(deadline):tariff.refundable?'Отмена со штрафом':'Невозвратный тариф'}),n.jsx('p',{children:tariff.refundable?(free?'После этой даты штраф — стоимость ':'Срок бесплатной отмены истёк. Штраф — стоимость ')+(tariff.penaltyNights===1?'одной ночи':tariff.penaltyNights+' ночей')+'.':'При отмене взимается полная стоимость проживания.'})]})]})]});
}
function KeysPaymentOptions(){
 const {state,dispatch}=J(),draft=state.reservation,[other,setOther]=E.useState(false),desktop=useKeysDesktopBooking(),extraId=E.useId();
 const method=draft.paymentMethod,main=keysCheckoutMethods.slice(0,2),extra=keysCheckoutMethods.slice(2),selectedExtra=extra.find(item=>item.id===method);
 const select=id=>{dispatch({type:'RESERVATION_METHOD',method:id});if(!desktop)setOther(false);};
 const option=(item,modal=false)=>n.jsxs('div',{className:'keys-pay-method-item'+(method===item.id?' is-selected':''),children:[
  n.jsxs('label',{className:'keys-pay-method',children:[n.jsx(D,{name:item.icon,className:'size-5'}),n.jsxs('span',{children:[n.jsx('strong',{children:item.name}),n.jsx('small',{children:item.id==='arrival'?'Сейчас 0 ₽ · в отеле '+Te(YA(draft).total):'Сейчас '+Te(YA(draft).total)})]}),n.jsx('input',{type:'radio',name:modal?'keys-pay-method-dialog':'keys-pay-method',value:item.id,checked:method===item.id,onChange:()=>select(item.id),'aria-label':item.name})]})
 ]},item.id);
 return n.jsxs('section',{className:'keys-checkout-panel keys-pay-section','aria-label':'Способ оплаты',children:[n.jsx('h2',{children:'Способ оплаты'}),n.jsxs('div',{className:'keys-pay-methods',children:[main.map(item=>option(item)),selectedExtra&&(!desktop||!other)&&option(selectedExtra),n.jsxs('button',{type:'button',className:'keys-pay-other',...(desktop?{'aria-expanded':other,'aria-controls':extraId}:{'aria-haspopup':'dialog'}),onClick:()=>setOther(!other),children:[n.jsx('span',{children:desktop&&other?'Скрыть другие способы':'Другие способы'}),n.jsx(D,{name:'chevron',className:'size-4'+(desktop?' keys-pay-disclosure'+(other?' is-open':''):'')})]}),desktop&&other&&n.jsx('div',{id:extraId,className:'keys-pay-extra-inline',children:extra.map(item=>option(item))})]}),!desktop&&other&&n.jsx(ct,{title:'Другие способы оплаты',onClose:()=>setOther(false),children:n.jsx('div',{className:'keys-pay-methods',children:extra.map(item=>option(item,true))})})]});
}
function KeysPaymentPoints({draft,toggle=false}){
 const {state,dispatch}=J(),keys=state.loyalty.balance,hotel=keysHotelPointsBalance(state,draft.hotelId),total=keys+hotel,available=total>0&&total<=Ul(draft);
 E.useEffect(()=>{if(draft.usePoints&&!keysPointsValid(state,draft))dispatch({type:'RESERVATION_POINTS',enabled:true});},[draft.usePoints,draft.pointsAmount,draft.hotelPointsAmount,keys,hotel,draft.hotelId,Ul(draft)]);
 const wallet=(label,value,icon)=>n.jsxs('div',{className:'keys-pay-wallet',children:[n.jsx(D,{name:icon,className:'size-5'}),n.jsx('dt',{children:label}),n.jsx('dd',{children:ln(value)+' баллов'})]});
 return n.jsxs('section',{className:'keys-checkout-panel keys-pay-section keys-pay-points'+(toggle?' keys-pay-points-toggle':''),'aria-label':'Списание баллов',children:[
  n.jsxs('div',{className:'keys-pay-points-head',children:[n.jsxs('div',{children:[n.jsx('h2',{children:toggle?'Списать баллы':'Баллы'}),n.jsx('p',{children:'Доступно '+ln(total)+' баллов'})]}),n.jsxs('label',{className:'keys-pay-use-points',children:[n.jsx('span',{children:'Списать все'}),n.jsx('input',{type:'checkbox',...(toggle?{role:'switch',className:'keys-points-switch','aria-label':'Списать все баллы'}:{}),checked:draft.usePoints,disabled:!available,onChange:event=>dispatch({type:'RESERVATION_POINTS',enabled:event.target.checked})})]})]}),
  (draft.usePoints||toggle)?n.jsxs('div',{className:'keys-pay-points-details',children:[
   n.jsxs('div',{className:'keys-pay-wallets',children:[n.jsxs('dl',{children:[wallet('Баллы Ключей',keys,'coins'),hotel>0&&wallet('Баллы отеля',hotel,'hotel')]}),n.jsxs('p',{className:'keys-pay-wallet-total','aria-live':'polite',children:[n.jsx('span',{children:draft.usePoints?'Спишем все '+ln(total)+' баллов':'Баллы не списываются'}),n.jsx('strong',{children:draft.usePoints?'−'+Te(total):Te(0)})]})]}),
  ]}):null,
  total>0&&!available&&n.jsx('p',{className:'keys-pay-wallet-hint',children:'Баллов больше стоимости проживания. Полное списание недоступно.'}),
 ]});
}
