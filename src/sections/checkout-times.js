// Demonstration hotel settings, not live availability or commercial hotel policies.
function keysStayTimePolicy(hotelId){
 const hotel=Ie(hotelId);
 const checkIn=hotel.checkInTime??(hotelId==='more'?Lg.checkInTime:hotelId==='maidens'?'14:00':'15:00');
 const checkOut=hotel.checkOutTime??(hotelId==='more'?Lg.checkOutTime:'12:00');
 return {checkIn,checkOut,early:hotelId==='maidens'?{type:'fixed',amount:2500}:hotelId==='more'?{type:'hourly',amount:800}:{type:'percent',amount:50},late:hotelId==='maidens'?{type:'fixed',amount:3000}:{type:'percent',amount:50,fullAfter:'18:00'}};
}
function keysStayTimeOptions(draft,kind){
 const policy=keysStayTimePolicy(draft.hotelId),early=kind==='early',standard=early?policy.checkIn:policy.checkOut,rule=policy[kind];
 const nightly=Ul(draft)/Math.max(1,Ge(draft.arrival,draft.departure));
 const hours=value=>Number(value.slice(0,2))+Number(value.slice(3))/60;
 const values=early?['06:00','09:00','12:00',standard]:[standard,'16:00','18:00','22:00'];
 return [...new Set(values)].filter(time=>early?time<=standard:time>=standard).sort().map(time=>{
  const included=time===standard,available=!(early&&time==='06:00');
  const units=Math.ceil(Math.abs(hours(standard)-hours(time))),percent=rule.fullAfter&&time>rule.fullAfter?100:rule.amount;
  const price=included||!available?0:Math.round(rule.type==='hourly'?units*rule.amount:rule.type==='fixed'?rule.amount:nightly*percent/100);
  const detail=!available?'Нет доступных номеров':included?'Стандартное время · включено':rule.type==='hourly'?units+' ч × '+Te(rule.amount):rule.type==='fixed'?'Фиксированная доплата':percent+'% стоимости суток';
  return {time,price,available,included,detail};
 });
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
 const date=kind=>new Date((kind==='early'?draft.arrival:draft.departure)+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
 const ruleText=kind=>{const rule=policy[kind];return rule.type==='hourly'?Te(rule.amount)+' за каждый час':rule.type==='fixed'?Te(rule.amount)+' независимо от выбранного времени':rule.fullAfter?'До '+rule.fullAfter+' — 50% суток, позже — 100% суток':'50% стоимости суток';};
 return n.jsxs('section',{className:'keys-checkout-panel keys-checkout-times','aria-label':'Время заезда и выезда',children:[
  n.jsxs('div',{className:'keys-stay-time-heading',children:[n.jsx('h2',{children:'Время заезда и выезда'}),n.jsx('button',{type:'button',className:'keys-stay-time-info','aria-label':'Условия заезда и выезда','aria-haspopup':'dialog',onClick:()=>setRulesOpen(true),children:n.jsxs('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round','aria-hidden':true,children:[n.jsx('circle',{cx:12,cy:12,r:9}),n.jsx('path',{d:'M12 11v6m0-10v1'})]})})]}),
  n.jsx('div',{className:'keys-stay-time-fields',children:['early','late'].map(kind=>n.jsxs('button',{type:'button',className:'keys-stay-time-field','aria-haspopup':'dialog','aria-label':'Изменить время '+(kind==='early'?'заезда':'выезда')+', '+quote[kind].time,onClick:()=>setEditing(kind),children:[n.jsx('span',{children:label(kind)+' · '+date(kind)}),n.jsxs('strong',{children:[(kind==='early'?'С ':'До ')+quote[kind].time,n.jsx(D,{name:'chevron',className:'size-4'})]}),n.jsx('small',{children:quote[kind].included?'Включено':'+'+Te(quote[kind].price)})]},kind))}),
  rulesOpen&&n.jsx(ct,{title:'Условия заезда и выезда',onClose:()=>setRulesOpen(false),children:n.jsxs('div',{className:'keys-stay-time-rules',children:[n.jsx('p',{children:'Заезд с '+policy.checkIn+', выезд до '+policy.checkOut+' включены в стоимость. Время местное.'}),n.jsxs('section',{children:[n.jsx('h3',{children:'Ранний заезд'}),n.jsx('p',{children:ruleText('early')+'.'})]}),n.jsxs('section',{children:[n.jsx('h3',{children:'Поздний выезд'}),n.jsx('p',{children:ruleText('late')+'.'})]}),(policy.early.type==='percent'||policy.late.type==='percent')&&n.jsx('p',{children:'Процент рассчитывается от средней стоимости суток выбранного номера и тарифа, с учётом скидки отеля, до списания баллов.'}),n.jsx('p',{children:'Доступное выбранное время включим в бронь. Доплата уже учитывается в итоговой стоимости.'})]})}),
  editing&&n.jsxs(ct,{title:editing==='early'?'Время заезда':'Время выезда',subtitle:date(editing)+' · местное время',onClose:()=>setEditing(null),children:[
   n.jsx('p',{className:'keys-stay-time-sheet-rule',children:ruleText(editing)+'.'}),
   n.jsx('div',{className:'keys-stay-time-options',role:'group','aria-label':editing==='early'?'Время заезда':'Время выезда',children:keysStayTimeOptions(draft,editing).map(option=>n.jsxs('button',{type:'button',disabled:!option.available,'aria-pressed':quote[editing].time===option.time,onClick:()=>{dispatch({type:'KEYS_STAY_TIME',kind:editing,time:option.time});setEditing(null);},children:[n.jsxs('span',{children:[n.jsx('strong',{children:option.time}),n.jsx('small',{children:option.detail})]}),n.jsx('b',{children:!option.available?'Недоступно':option.included?'Без доплаты':'+'+Te(option.price)}),quote[editing].time===option.time&&n.jsx(D,{name:'check',className:'size-4'})]},option.time))}),
   n.jsx('p',{className:'keys-stay-time-sheet-note',children:'Доплата добавится к общей стоимости бронирования.'})
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
function KeysCheckoutAdditions({draft}){
 const [open,setOpen]=E.useState(false),{items,total}=keysCheckoutAdditions(draft);
 if(!items.length)return null;
 const price=total?Te(total):'Бесплатно';
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('button',{type:'button',className:'keys-checkout-additions','aria-haspopup':'dialog','aria-label':'Дополнительные услуги: '+items.length+', '+price+'. Посмотреть состав',onClick:()=>setOpen(true),children:[n.jsx('span',{className:'keys-checkout-additions-label',children:'Включая допуслуги'}),n.jsxs('span',{className:'keys-checkout-additions-value',children:[items.length+' '+(items.length%100>=11&&items.length%100<=14?'услуг':items.length%10===1?'услуга':items.length%10>=2&&items.length%10<=4?'услуги':'услуг')+' · '+price,n.jsx(D,{name:'chevron',className:'size-4'})]})]}),
  open&&n.jsxs(ct,{title:'Дополнительные услуги',subtitle:'Уже включены в итоговую стоимость',onClose:()=>setOpen(false),children:[
   n.jsx('dl',{className:'keys-checkout-additions-list',children:items.map(item=>n.jsxs('div',{children:[n.jsxs('dt',{children:[n.jsx('strong',{children:item.name}),n.jsx('small',{children:item.detail})]}),n.jsx('dd',{children:item.price?Te(item.price):'Бесплатно'})]},item.id))}),
   n.jsxs('div',{className:'keys-checkout-additions-total',children:[n.jsx('span',{children:'Всего за допуслуги'}),n.jsx('strong',{children:price})]})
  ]})
 ]});
}
