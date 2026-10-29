// The checkout and existing-booking service picker use the same hotel pricing.
function keysStayTimePolicy(hotelId){
 const hotel=Ie(hotelId);
 return globalThis.KeysStayTimePricing.policy(hotelId,hotel.checkInTime??(hotelId==='more'?Lg.checkInTime:hotelId==='maidens'?'14:00':'15:00'),hotel.checkOutTime??(hotelId==='more'?Lg.checkOutTime:'12:00'));
}
function keysStayTimeOptions(draft,kind){
 return globalThis.KeysStayTimePricing.options(keysStayTimePolicy(draft.hotelId),kind,Ul(draft)/Math.max(1,Ge(draft.arrival,draft.departure)),Te);
}
function keysStayTimeQuote(draft){
 const policy=keysStayTimePolicy(draft.hotelId);
 const selected=kind=>{const options=keysStayTimeOptions(draft,kind);return options.find(item=>item.available&&item.time===draft.keysStayTimes?.[kind])??options.find(item=>item.included);};
 const early=selected('early'),late=selected('late');
 return {early,late,checkIn:early.time,checkOut:late.time,total:early.price+late.price,policy};
}
function keysSetStayTime(state,action){
 const draft=state.reservation;
 if(!draft||!['editing','failed'].includes(draft.status)||!['early','late'].includes(action.kind))return state;
 const option=keysStayTimeOptions(draft,action.kind).find(item=>item.available&&item.time===action.time);
 if(!option)return state;
 return {...state,reservation:{...draft,status:'editing',error:'',keysStayTimes:{...draft.keysStayTimes,[action.kind]:option.time}}};
}
function YA(draft){
 const base=keysBaseCheckoutTotal(draft),stayTimes=keysStayTimeQuote(draft).total;
 return {...base,stayTimes,accommodation:base.accommodation+stayTimes,total:base.total+stayTimes};
}
function keysStayTimeRows(draft,row){
 const quote=keysStayTimeQuote(draft);
 return [!quote.early.included&&row('Ранний заезд · '+quote.checkIn,Te(quote.early.price)),!quote.late.included&&row('Поздний выезд · '+quote.checkOut,Te(quote.late.price))];
}
function KeysCheckoutTimes({draft}){
 const {dispatch}=J(),[editing,setEditing]=E.useState(null),[rulesOpen,setRulesOpen]=E.useState(false),quote=keysStayTimeQuote(draft),policy=quote.policy;
 const label=kind=>kind==='early'?'Заезд':'Выезд';
 const timeLabel=(kind,time)=>(kind==='early'?'С ':'До ')+time;
 const date=kind=>new Date((kind==='early'?draft.arrival:draft.departure)+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
 const ruleText=kind=>{const rule=policy[kind];return rule.type==='hourly'?Te(rule.amount)+' за каждый час':rule.type==='fixed'?Te(rule.amount)+' независимо от выбранного времени':rule.fullAfter?'До '+rule.fullAfter+' — 50% суток, позже — 100% суток':'50% стоимости суток';};
 return n.jsxs('section',{className:'keys-checkout-panel keys-checkout-times','aria-label':'Правила заезда и выезда',children:[
  n.jsxs('div',{className:'keys-stay-time-heading',children:[n.jsx('h2',{children:'Заезд и выезд'}),n.jsx('button',{type:'button',className:'keys-stay-time-info','aria-label':'Условия заезда и выезда','aria-haspopup':'dialog',onClick:()=>setRulesOpen(true),children:n.jsxs('svg',{className:'keys-info-icon',width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round','aria-hidden':true,children:[n.jsx('circle',{cx:12,cy:12,r:9}),n.jsx('path',{d:'M12 11v6m0-10v1'})]})})]}),
  n.jsxs('div',{className:'keys-stay-time-card',children:[n.jsx('dl',{className:'keys-stay-time-summary',children:['early','late'].map(kind=>n.jsxs('div',{children:[n.jsx('dt',{children:label(kind)+' · '+date(kind)}),n.jsxs('dd',{children:[n.jsx('span',{children:timeLabel(kind,quote[kind].time)}),n.jsx('span',{className:'keys-stay-time-charge'+(quote[kind].price>0?' is-paid':''),children:quote[kind].price>0?'+'+Te(quote[kind].price):'Без доплаты'})]})]},kind))}),n.jsxs('button',{type:'button',className:'keys-stay-time-change keys-guest-row-action','aria-haspopup':'dialog','aria-label':'Изменить время заезда и выезда',onClick:()=>setEditing('early'),children:['Изменить',n.jsx(D,{name:'chevron',className:'size-3.5','aria-hidden':true})]})]}),
  rulesOpen&&n.jsx(ct,{title:'Условия заезда и выезда',onClose:()=>setRulesOpen(false),children:n.jsxs('div',{className:'keys-stay-time-rules',children:[n.jsx('p',{children:'Заезд с '+policy.checkIn+', выезд до '+policy.checkOut+' включены в стоимость. Время местное.'}),n.jsxs('section',{children:[n.jsx('h3',{children:'Ранний заезд'}),n.jsx('p',{children:ruleText('early')+'.'})]}),n.jsxs('section',{children:[n.jsx('h3',{children:'Поздний выезд'}),n.jsx('p',{children:ruleText('late')+'.'})]}),(policy.early.type==='percent'||policy.late.type==='percent')&&n.jsx('p',{children:'Процент рассчитывается от средней стоимости суток выбранного номера и тарифа, с учётом скидки отеля, до списания баллов.'}),n.jsx('p',{children:'Доступное выбранное время включим в бронь. Доплата уже учитывается в итоговой стоимости.'})]})}),
  editing&&n.jsxs(ct,{title:'Изменить время',subtitle:'Время местное',onClose:()=>setEditing(null),children:[
   n.jsx('div',{className:'keys-stay-time-tabs',role:'group','aria-label':'Заезд или выезд',children:['early','late'].map(kind=>n.jsxs('button',{type:'button','aria-pressed':editing===kind,onClick:()=>setEditing(kind),children:[n.jsx('span',{children:label(kind)+' · '+date(kind)}),n.jsx('strong',{children:timeLabel(kind,quote[kind].time)})]},kind))}),
   n.jsx('p',{className:'keys-stay-time-sheet-rule',children:ruleText(editing)+'.'}),
   n.jsx('div',{className:'keys-stay-time-options',role:'group','aria-label':editing==='early'?'Время заезда':'Время выезда',children:keysStayTimeOptions(draft,editing).map(option=>n.jsxs('button',{type:'button',disabled:!option.available,'aria-pressed':quote[editing].time===option.time,onClick:()=>{dispatch({type:'KEYS_STAY_TIME',kind:editing,time:option.time});},children:[n.jsxs('span',{children:[n.jsx('strong',{children:timeLabel(editing,option.time)}),n.jsx('small',{children:option.detail})]}),n.jsx('b',{children:!option.available?'Недоступно':option.included?'Без доплаты':'+'+Te(option.price)}),quote[editing].time===option.time&&n.jsx(D,{name:'check',className:'size-4'})]},option.time))}),
   n.jsx('p',{className:'keys-stay-time-sheet-note','aria-live':'polite',children:quote.total?'Доплата за выбранное время: '+Te(quote.total)+'. Уже включена в итоговую стоимость.':'Стандартное время — без доплаты.'}),
   n.jsx(H,{onClick:()=>setEditing(null),children:'Готово'})
  ]})
 ]});
}
function keysCheckoutAdditions(draft){
 const quote=keysStayTimeQuote(draft),items=[];
 if(!quote.early.included)items.push({id:'early',name:'Ранний заезд',detail:'С '+quote.checkIn,price:quote.early.price});
 if(!quote.late.included)items.push({id:'late',name:'Поздний выезд',detail:'До '+quote.checkOut,price:quote.late.price});
 draft.extras.forEach(extra=>items.push({id:'extra-'+extra.serviceId,name:Dg(draft.hotelId,extra.serviceId),detail:[extra.date?new Date(extra.date+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}):null,extra.time].filter(Boolean).join(' · '),price:extra.price}));
 return {items,total:items.reduce((sum,item)=>sum+item.price,0)};
}
function KeysCheckoutPriceDetails({draft,label='Итого за поездку',amount}){
 const {state}=J(),[open,setOpen]=E.useState(false),{items}=keysCheckoutAdditions(draft),total=YA(draft);
 const quote=keysReservationDiscountQuote(draft,state.search,state.discovery.priceTick),connected=keysConnectedHotelSavings(draft),hotelSaving=Math.max(0,quote.usualTotal-total.room-connected);
 const points=keysPointsUsed(draft),hotelPoints=keysHotelPointsUsed(draft),payAtHotel=draft.keysCheckoutStep==='payment'&&draft.paymentMethod==='arrival';
 const row=(label,value)=>n.jsxs('div',{children:[n.jsx('dt',{children:label}),n.jsx('dd',{children:value})]},label);
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('button',{type:'button',className:'keys-checkout-price-details','aria-haspopup':'dialog','aria-label':label+': '+Te(amount??total.total)+'. Детали цены',onClick:()=>setOpen(true),children:[n.jsx('span',{className:'keys-checkout-price-label',children:label}),n.jsxs('span',{className:'keys-checkout-price-value',children:[n.jsx('strong',{'aria-live':'polite',children:Te(amount??total.total)}),n.jsx(D,{name:'chevron',className:'size-5','aria-hidden':true})]})]}),
  open&&n.jsx(ct,{title:'Стоимость бронирования',onClose:()=>setOpen(false),children:n.jsxs('div',{className:'keys-price-breakdown',children:[
   n.jsxs('dl',{children:[row('Проживание',Te(quote.usualTotal)),hotelSaving>0&&row('Скидка отеля','−'+Te(hotelSaving)),connected>0&&row('Карта отеля · 10%','−'+Te(connected))]}),
   items.length>0&&n.jsxs('section',{'aria-label':'Услуги',children:[n.jsx('h3',{children:'Услуги'}),n.jsx('dl',{children:items.map(item=>row(item.name+(['early','late'].includes(item.id)?' · '+item.detail.toLocaleLowerCase('ru-RU'):''),item.price?Te(item.price):'Бесплатно'))})]}),
   (points>0||hotelPoints>0)&&n.jsxs('section',{'aria-label':'Списанные баллы',children:[n.jsx('h3',{children:'Списанные баллы'}),n.jsxs('dl',{children:[points>0&&row('Баллы Ключей','−'+Te(points)),hotelPoints>0&&row('Баллы отеля','−'+Te(hotelPoints))]})]}),
   n.jsx('dl',{className:'keys-price-breakdown-total',children:row('Итого',Te(total.total))}),
   payAtHotel&&n.jsxs('dl',{children:[row('К оплате сейчас',Te(0)),row('При заселении',Te(total.total))]}),
   n.jsx('p',{children:'Налоги и сборы включены'}),
   n.jsx(H,{onClick:()=>setOpen(false),children:'Понятно'})
  ]})})
 ]});
}
