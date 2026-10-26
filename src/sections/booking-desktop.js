// A single reservation summary follows the guest through the desktop checkout.
function useKeysDesktopBooking(){
 const [desktop,setDesktop]=E.useState(false);
 E.useEffect(()=>{const media=matchMedia('(min-width:900px)'),sync=()=>setDesktop(document.documentElement.dataset.desktopAccount==='true'&&media.matches),observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});media.addEventListener('change',sync);sync();return()=>{observer.disconnect();media.removeEventListener('change',sync);};},[]);
 return desktop;
}
function KeysBookingCart({draft,stage='rooms',onNext,booking,hiddenByFilters=false,moneyOnly=false}){
 const {state,dispatch}=J(),hotel=Ie(draft.hotelId),tariff=Sr(draft.hotelId,draft.tariffId),total=YA(draft),confirmed=stage==='confirmed',arrival=(confirmed?booking.payment?.method:draft.paymentMethod)==='arrival',payment=stage==='payment';
 const quote=keysReservationDiscountQuote(draft,state.search,state.discovery.priceTick),hotelSaving=Math.max(0,quote.usualTotal-total.room-keysConnectedHotelSavings(draft));
 const row=(label,value)=>n.jsxs('div',{className:'keys-cart-row',children:[n.jsx('dt',{children:label}),n.jsx('dd',{children:value})]},label);
 const totalLine=n.jsxs('div',{className:'keys-cart-total',children:[n.jsx('dt',{children:(payment||confirmed)&&arrival?'При заселении':confirmed?'Оплачено':'Итого'}),n.jsx('dd',{children:Te(confirmed?(arrival?booking.dueAtHotel:booking.payment?.amount??booking.paid):total.total)})]});
 const date=value=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
 return n.jsxs('aside',{className:'keys-booking-cart','aria-label':confirmed?'Итог бронирования':moneyOnly?'Стоимость бронирования':'Ваше бронирование',children:[n.jsxs('div',{className:'keys-cart-body',children:[
  n.jsx('h2',{children:confirmed?'Оплата':moneyOnly?'Стоимость бронирования':'Ваше бронирование'}),
  !confirmed&&keysReservationDiscountQuote(draft,state.search,state.discovery.priceTick).registrationDiscount>0&&n.jsx('p',{className:'keys-cart-helper keys-registration-cart',children:'Цена со скидкой за регистрацию. Войдите по телефону на следующем шаге.'}),
  confirmed&&n.jsxs('p',{className:'keys-confirmation-payment-status'+(arrival?' is-arrival':''),children:[n.jsx(D,{name:arrival?'clock':'check',className:'size-4'}),arrival?'Оплата при заселении':'Оплачено']}),
  !confirmed&&!moneyOnly&&n.jsxs('div',{className:'keys-cart-room',children:[n.jsx('img',{src:draft.room.photo.src,alt:draft.room.name}),n.jsxs('div',{children:[n.jsx('p',{children:hotel.name}),n.jsx('h3',{children:draft.room.name})]})]}),
  hiddenByFilters&&n.jsx('p',{className:'keys-cart-filter-note',role:'status',children:'Выбранный тариф сохранён в корзине, но скрыт текущими фильтрами.'}),
  !confirmed&&!moneyOnly&&n.jsxs('dl',{className:'keys-cart-dates',children:[n.jsxs('div',{children:[n.jsx('dt',{children:'Заезд'}),n.jsx('dd',{children:date(draft.arrival)})]}),n.jsxs('div',{children:[n.jsx('dt',{children:'Выезд'}),n.jsx('dd',{children:date(draft.departure)})]})]}),
  !confirmed&&!moneyOnly&&n.jsxs('p',{className:'keys-cart-guests',children:[n.jsx(D,{name:'users',className:'size-4'}),Rt(draft.party)]}),
  !confirmed&&!moneyOnly&&n.jsxs('div',{className:'keys-cart-tariff',children:[n.jsxs('p',{children:['Тариф «',tariff.name,'»']}),n.jsxs('span',{children:[n.jsx(D,{name:'coffee',className:'size-4'}),tariff.includesBreakfast?'Завтрак включён':'Без питания']}),n.jsxs('span',{children:[n.jsx(D,{name:'shield',className:'size-4'}),vY(tariff,draft.arrival)]})]}),
  n.jsxs('dl',{className:'keys-cart-costs','aria-live':'polite',children:[row('Проживание',Te(moneyOnly?quote.usualTotal:total.room+keysConnectedHotelSavings(draft))),moneyOnly&&hotelSaving>0&&row('Скидка отеля','−'+Te(hotelSaving)),keysConnectedHotelSavings(draft)>0&&row('Карта отеля · 10%','−'+Te(keysConnectedHotelSavings(draft))),!moneyOnly&&keysPointsUsed(draft)>0&&row('Баллы Ключей','−'+Te(keysPointsUsed(draft))),!moneyOnly&&keysHotelPointsUsed(draft)>0&&row('Баллы отеля','−'+Te(keysHotelPointsUsed(draft))),(payment||confirmed)&&arrival&&row(confirmed?'Оплачено сейчас':'К оплате сейчас',Te(0)),!moneyOnly&&totalLine]}),
  !moneyOnly&&n.jsx('p',{className:'keys-cart-tax',children:'Налоги и сборы включены'}),
  moneyOnly&&payment&&n.jsx(KeysPaymentPoints,{draft,toggle:true}),
  moneyOnly&&n.jsxs('div',{className:'keys-checkout-price-bar',children:[n.jsx('dl',{className:'keys-cart-final-amount','aria-live':'polite',children:totalLine}),n.jsx(KeysCheckoutAdditions,{draft})]}),
  !moneyOnly&&n.jsx(KeysCheckoutAdditions,{draft}),
  moneyOnly&&n.jsx('p',{className:'keys-cart-tax',children:'Налоги и сборы включены'}),
  ]}),n.jsxs('div',{className:'keys-cart-footer',children:[
  !confirmed&&stage!=='processing'&&n.jsx(H,{className:'keys-cart-submit',disabled:payment&&(!um(draft.contact)||!draft.paymentMethod||!keysAdditionalGuestComplete(draft)),onClick:payment?()=>dispatch({type:'RESERVATION_PAY',draftId:draft.id}):onNext,children:payment?(arrival?'Подтвердить бронь':draft.status==='failed'?'Повторить оплату':'Оплатить · '+Te(total.total)):'Забронировать · '+Te(total.total)}),
  payment&&!um(draft.contact)&&n.jsx('p',{className:'keys-cart-helper',children:'Заполните данные гостя, чтобы продолжить'}),
  payment&&!keysAdditionalGuestComplete(draft)&&n.jsx('p',{className:'keys-cart-helper',children:'Заполните имя и фамилию второго гостя или очистите оба поля'}),
  payment&&!draft.paymentMethod&&n.jsx('p',{className:'keys-cart-helper',children:'Выберите способ оплаты'})
 ]})]});
}
let keysCheckoutValidation;
function keysCheckoutValidationContext(){return keysCheckoutValidation||(keysCheckoutValidation=E.createContext(false));}
function keysCheckoutStep(state,step){
 const draft=state.reservation;
 if(!draft||!['details','services','payment'].includes(step)||draft.status==='confirmed')return state;
 if(step==='payment'&&(!um(draft.contact)||!keysAdditionalGuestComplete(draft)))return state;
 return {...state,reservation:{...draft,keysCheckoutStep:step,error:''}};
}
function KeysCheckoutAmounts({draft}){
 const {state}=J(),total=YA(draft),quote=keysReservationDiscountQuote(draft,state.search,state.discovery.priceTick),connected=keysConnectedHotelSavings(draft),hotelDiscount=Math.max(0,quote.usualTotal-total.room-connected);
 const row=(label,value)=>n.jsxs('div',{children:[n.jsx('dt',{children:label}),n.jsx('dd',{children:value})]},label);
 return n.jsxs('section',{className:'keys-checkout-amounts','aria-label':'Стоимость бронирования',children:[n.jsx('h2',{children:'Стоимость бронирования'}),n.jsxs('dl',{children:[row('Проживание',Te(quote.usualTotal)),hotelDiscount>0&&row('Скидка отеля','−'+Te(hotelDiscount)),connected>0&&row('Карта отеля · 10%','−'+Te(connected)),...keysStayTimeRows(draft,row),...draft.extras.map(extra=>row(Dg(draft.hotelId,extra.serviceId),Te(extra.price))),keysPointsUsed(draft)>0&&row('Баллы Ключей','−'+Te(keysPointsUsed(draft))),keysHotelPointsUsed(draft)>0&&row('Баллы отеля','−'+Te(keysHotelPointsUsed(draft))),row('Итого',Te(total.total))]}),n.jsx('p',{children:'Налоги и сборы включены'})]});
}
function KeysCheckoutRoomSummary({draft}){
 const hotel=Ie(draft.hotelId),tariff=Sr(draft.hotelId,draft.tariffId);
 return n.jsxs('section',{className:'keys-checkout-room-summary','aria-label':'Номер и условия проживания',children:[
  n.jsxs('div',{className:'keys-checkout-room-intro',children:[n.jsx('img',{src:draft.room.photo.src,alt:draft.room.name}),n.jsxs('div',{className:'keys-checkout-room-copy',children:[n.jsx('p',{children:hotel.name}),n.jsx('h2',{children:draft.room.name}),n.jsx('p',{children:zt(draft.arrival,draft.departure)+' · '+Rt(draft.party)}),n.jsx('p',{children:[draft.room.area?draft.room.area+' м²':null,draft.room.bedType==='twin'?'Две отдельные кровати':'Двуспальная кровать'].filter(Boolean).join(' · ')}),n.jsxs('div',{className:'keys-checkout-room-rate',children:[n.jsx('h3',{children:'Тариф «'+tariff.name+'»'}),n.jsxs('p',{children:[n.jsx(D,{name:'coffee',className:'size-4'}),tariff.includesBreakfast?'Завтрак включён':'Без питания']})]})]})]})
 ]});
}
function KeysCheckoutLayout({draft,children,processing=false}){
 const desktop=useKeysDesktopBooking(),{dispatch,back}=J(),[attempted,setAttempted]=E.useState(0),content=E.useRef(null);
 const step=draft.keysCheckoutStep||'details',total=YA(draft),arrival=draft.paymentMethod==='arrival';
 const go=value=>{setAttempted(0);dispatch({type:'KEYS_CHECKOUT_STEP',step:value});};
 E.useEffect(()=>{const el=content.current;if(!el)return;let parent=el.parentElement;while(parent&&parent.scrollHeight<=parent.clientHeight)parent=parent.parentElement;if(parent)parent.scrollTop=0;el.querySelector('h1')?.focus({preventScroll:true});},[step,desktop]);
 const next=()=>{setAttempted(value=>value+1);if(!um(draft.contact)||!keysAdditionalGuestComplete(draft)){requestAnimationFrame(()=>{const first=content.current?.querySelector('[aria-invalid=true],input:invalid');first?.focus();first?.scrollIntoView({block:'center',behavior:'smooth'});});return;}go('payment');};
 if(processing)return desktop?n.jsx('div',{className:'keys-booking-desktop keys-checkout-desktop',children:n.jsxs('div',{className:'keys-booking-columns',children:[n.jsx('div',{className:'keys-booking-primary',children}),n.jsx(KeysBookingCart,{draft,stage:'processing'})]})}):children;
 const header=n.jsx(desktop?Ae:KeysPaymentStayHeader,{title:desktop?'Оформление брони':step==='services'?'Добавить к поездке':'Оформление брони',onBack:desktop?back:step==='details'?back:()=>go('details')});
 if(desktop)return n.jsxs('div',{className:'keys-booking-desktop keys-checkout-desktop keys-checkout-grouped',children:[header,n.jsxs('div',{className:'keys-booking-columns',children:[n.jsxs('div',{className:'keys-booking-primary',children:[n.jsx(KeysCheckoutRoomSummary,{draft}),n.jsx(KeysCheckoutTimes,{draft}),children[4],children[3],children[2],children[7],children[8]]}),n.jsxs('aside',{className:'keys-checkout-sidebar','aria-label':'Стоимость и баллы',children:[n.jsx(KeysBookingCart,{draft,stage:'payment',moneyOnly:true}),n.jsx(KeysHotelLoyaltyBanner,{draft})]})]})]});
 const title=step==='details'?'Данные бронирования':'Подтверждение и оплата';
 const contactInvalid=!um(draft.contact)||!keysAdditionalGuestComplete(draft);
 const helper=contactInvalid?'Заполните данные гостей':!draft.paymentMethod?'Выберите способ оплаты':null;
 const footer=n.jsx(children[9].type,{children:n.jsxs('div',{className:'keys-checkout-fixed',children:[
  step!=='services'&&n.jsxs('div',{className:'keys-checkout-price-bar',children:[n.jsxs('div',{className:'keys-checkout-due','aria-live':'polite',children:[n.jsxs('span',{children:[step==='details'||!draft.paymentMethod?'Итого':'Сейчас',n.jsx('strong',{children:Te(step==='payment'&&arrival?0:total.total)})]}),step==='payment'&&draft.paymentMethod&&n.jsxs('span',{children:['В отеле',n.jsx('strong',{children:Te(arrival?total.total:0)})]})]}),n.jsx(KeysCheckoutAdditions,{draft})]}),
  step==='payment'&&helper&&n.jsx('p',{className:'keys-checkout-help',children:helper}),
  n.jsx(H,{className:'keys-checkout-next',disabled:step==='payment'&&!draft.paymentMethod&&!contactInvalid,onClick:step==='details'?next:step==='services'?()=>go('details'):contactInvalid?()=>go('details'):()=>dispatch({type:'RESERVATION_PAY',draftId:draft.id}),children:step==='details'?'Продолжить':step==='services'?'Готово':contactInvalid?'Заполнить данные гостей':arrival?'Подтвердить бронь':draft.status==='failed'?'Повторить оплату':'Перейти к оплате'})
 ]})});
 return n.jsxs('div',{ref:content,className:'keys-checkout-flow','data-checkout-step':step,children:[header,
  step!=='services'&&n.jsxs('div',{className:'keys-checkout-step-heading','aria-label':(step==='details'?'Шаг 1 из 2: ':'Шаг 2 из 2: ')+title,children:[n.jsx('p',{className:'keys-checkout-step-title',children:title}),n.jsx('span',{children:step==='details'?'1 из 2':'2 из 2'}),n.jsxs('div',{className:'keys-checkout-progress','aria-hidden':true,children:[n.jsx('i',{className:'is-active'}),n.jsx('i',{className:step==='payment'?'is-active':''})]})]}),
  step==='details'?n.jsxs(keysCheckoutValidationContext().Provider,{value:attempted,children:[children[1],n.jsx(KeysCheckoutTimes,{draft}),children[3],attempted>0&&contactInvalid&&n.jsx('p',{role:'alert',className:'keys-checkout-error',children:'Проверьте обязательные поля: имя, фамилия, телефон и email. Для второго гостя заполните оба поля или оставьте их пустыми.'}),n.jsxs('button',{className:'keys-checkout-services-entry',type:'button',onClick:()=>go('services'),children:[n.jsx(D,{name:'coffee',className:'size-5'}),n.jsxs('span',{children:[n.jsx('strong',{children:'Добавить к поездке'}),n.jsx('small',{children:draft.extras.length?'Выбрано услуг: '+draft.extras.length+' · '+Te(total.extras):'Завтрак, ужин, спа и другие услуги'})]}),n.jsx(D,{name:'chevron',className:'size-4'})]}),children[7]]}):step==='services'?n.jsx('div',{className:'keys-checkout-service-catalog',children:children[2]}):n.jsxs(n.Fragment,{children:[n.jsx(KeysHotelLoyaltyBanner,{draft}),children[5],children[4],n.jsx(KeysCheckoutAmounts,{draft}),children[8]]}),footer
 ]});
}
function KeysBookingConfirmation({draft,booking,details,children,className}){
 const desktop=useKeysDesktopBooking();
 if(!desktop)return n.jsx('div',{className,children});
 const tariff=booking.tariff??Sr(draft.hotelId,draft.tariffId);
 return n.jsxs('div',{className:'keys-booking-desktop keys-confirmation-desktop '+className,children:[children[0],children[1],n.jsxs('div',{className:'keys-booking-columns',children:[
  n.jsxs('div',{className:'keys-booking-primary',children:[children[2],n.jsxs('section',{className:'keys-checkout-panel keys-confirmation-terms',children:[n.jsx('h2',{children:'Условия бронирования'}),n.jsxs('p',{children:[n.jsx(D,{name:'coffee',className:'size-5'}),tariff.includesBreakfast?'Завтрак включён':'Без питания']}),n.jsxs('p',{children:[n.jsx(D,{name:'shield',className:'size-5'}),vY(tariff,draft.arrival)]})]})]}),
  n.jsxs('div',{className:'keys-confirmation-side',children:[n.jsx(KeysBookingCart,{draft,booking,stage:'confirmed'}),children[4]]})
 ]})]});
}

function keysCancelCreatedBooking(state,action){
 const record=state.keysCreatedBookings?.[action.bookingId];
 if(!record||record.booking.keysCancellation)return state;
 const keyPoints=Math.max(0,Math.min(action.result.keysPoints??action.result.points??0,record.booking.pointsSpent||0)),hotelPoints=Math.max(0,Math.min(action.result.hotelPoints||0,record.booking.hotelPointsSpent||0));
 const result={...action.result,keysPoints:keyPoints,hotelPoints,points:keyPoints+hotelPoints};
 const booking={...record.booking,keysCancellation:result};
 return {...state,booking:state.booking.id===booking.id?booking:state.booking,keysCreatedBookings:{...state.keysCreatedBookings,[booking.id]:{...record,booking}},loyalty:{...state.loyalty,balance:state.loyalty.balance+keyPoints},keysHotelPoints:{...state.keysHotelPoints,[booking.hotelId]:keysHotelPointsBalance(state,booking.hotelId)+hotelPoints}};
}
function keysBookingCancellationQuote(draft,booking,today){
 const total=YA(draft),tariff=booking.tariff,paid=booking.payment?.amount??booking.paid??0;
 const deadline=Hx(tariff,draft.arrival),free=tariff.refundable&&today<=deadline;
 const fee=free?0:Math.min(total.total,tariff.refundable?Math.round(total.room/Math.max(1,Ge(draft.arrival,draft.departure))*(tariff.penaltyNights||1)):total.total);
 return {bookingId:booking.id,hotel:Ie(draft.hotelId).name,dates:zt(draft.arrival,draft.departure),fee,refund:Math.max(0,paid-fee),due:Math.max(0,fee-paid),points:free?(booking.pointsSpent||0)+(booking.hotelPointsSpent||0):0,keysPoints:free?booking.pointsSpent||0:0,hotelPoints:free?booking.hotelPointsSpent||0:0,policy:free?'Бесплатная отмена по условиям тарифа.':vY(tariff,draft.arrival)+(tariff.refundable?'. Удерживается стоимость '+(tariff.penaltyNights||1)+' ночи.':'.')};
}
function keysRequestBookingCancellation(draft,booking,state){
 keysPost('cancel-booking',keysBookingCancellationQuote(draft,booking,state.tripContext?.today??new Date().toISOString().slice(0,10)));
}
function KeysCancelledBooking({draft,booking,details,onBack}){
 const {dispatch}=J(),c=booking.keysCancellation;
 return n.jsxs('div',{className:'keys-booking-success keys-cancelled-booking',children:[
  details&&n.jsx(Ae,{title:'Детали брони',onBack}),
  n.jsxs('header',{className:'keys-success-heading',children:[n.jsx(details?'h2':'h1',{children:'Бронь отменена'}),n.jsx('p',{children:'Бронирование '+booking.id})]}),
  n.jsxs('section',{className:'keys-checkout-panel',children:[n.jsxs('div',{className:'keys-success-hotel',children:[n.jsx('img',{src:draft.room.photo.src,alt:draft.room.name}),n.jsxs('div',{children:[n.jsx('h2',{children:Ie(draft.hotelId).name}),n.jsx('p',{children:zt(draft.arrival,draft.departure)}),n.jsx('p',{children:draft.room.name})]})]}),n.jsxs('dl',{className:'keys-success-facts',children:[n.jsxs('div',{className:'keys-success-row',children:[n.jsx('dt',{children:'Удержание'}),n.jsx('dd',{children:Te(c.fee)})]}),n.jsxs('div',{className:'keys-success-row',children:[n.jsx('dt',{children:'К возврату'}),n.jsx('dd',{children:Te(c.refund)})]}),c.due>0&&n.jsxs('div',{className:'keys-success-row',children:[n.jsx('dt',{children:'К оплате по условиям отмены'}),n.jsx('dd',{children:Te(c.due)})]})]}),n.jsx('p',{className:'keys-cart-tax',role:'status',children:c.refund>0?'Возврат в обработке. Деньги поступят тем же способом оплаты. Срок зависит от банка.':c.due>0?'Отель свяжется с вами по оплате удержания.':'Ничего оплачивать не нужно.'}),c.points>0&&n.jsx('p',{className:'keys-cart-tax',children:c.points+' баллов возвращено на соответствующие бонусные счета.'})]}),
  n.jsx(H,{onClick:()=>dispatch({type:'HOME'}),children:'К поездкам'})
 ]});
}
