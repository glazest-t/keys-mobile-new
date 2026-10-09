// A single reservation summary follows the guest through the desktop checkout.
function useKeysDesktopBooking(){
 const [desktop,setDesktop]=E.useState(false);
 E.useEffect(()=>{const media=matchMedia('(min-width:900px)'),sync=()=>setDesktop(document.documentElement.dataset.desktopAccount==='true'&&media.matches),observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});media.addEventListener('change',sync);sync();return()=>{observer.disconnect();media.removeEventListener('change',sync);};},[]);
 return desktop;
}
function KeysBookingCart({draft,stage='rooms',onNext,booking,hiddenByFilters=false}){
 const {dispatch}=J(),hotel=Ie(draft.hotelId),tariff=Sr(draft.hotelId,draft.tariffId),total=YA(draft),confirmed=stage==='confirmed',arrival=(confirmed?booking.payment?.method:draft.paymentMethod)==='arrival',payment=stage==='payment';
 const row=(label,value)=>n.jsxs('div',{className:'keys-cart-row',children:[n.jsx('dt',{children:label}),n.jsx('dd',{children:value})]},label);
 const date=value=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
 return n.jsxs('aside',{className:'keys-booking-cart','aria-label':confirmed?'Итог бронирования':'Ваше бронирование',children:[
  n.jsx('h2',{children:confirmed?'Оплата':'Ваше бронирование'}),
  confirmed&&n.jsxs('p',{className:'keys-confirmation-payment-status'+(arrival?' is-arrival':''),children:[n.jsx(D,{name:arrival?'clock':'check',className:'size-4'}),arrival?'Оплата при заселении':'Оплачено']}),
  !confirmed&&n.jsxs('div',{className:'keys-cart-room',children:[n.jsx('img',{src:draft.room.photo.src,alt:draft.room.name}),n.jsxs('div',{children:[n.jsx('p',{children:hotel.name}),n.jsx('h3',{children:draft.room.name})]})]}),
  hiddenByFilters&&n.jsx('p',{className:'keys-cart-filter-note',role:'status',children:'Выбранный тариф сохранён в корзине, но скрыт текущими фильтрами.'}),
  !confirmed&&n.jsxs('dl',{className:'keys-cart-dates',children:[n.jsxs('div',{children:[n.jsx('dt',{children:'Заезд'}),n.jsx('dd',{children:date(draft.arrival)})]}),n.jsxs('div',{children:[n.jsx('dt',{children:'Выезд'}),n.jsx('dd',{children:date(draft.departure)})]})]}),
  !confirmed&&n.jsxs('p',{className:'keys-cart-guests',children:[n.jsx(D,{name:'users',className:'size-4'}),Rt(draft.party)]}),
  !confirmed&&n.jsxs('div',{className:'keys-cart-tariff',children:[n.jsxs('p',{children:['Тариф «',tariff.name,'»']}),n.jsxs('span',{children:[n.jsx(D,{name:'coffee',className:'size-4'}),tariff.includesBreakfast?'Завтрак включён':'Без питания']}),n.jsxs('span',{children:[n.jsx(D,{name:'shield',className:'size-4'}),vY(tariff,draft.arrival)]})]}),
  n.jsxs('dl',{className:'keys-cart-costs','aria-live':'polite',children:[row('Проживание',Te(total.room)),...draft.extras.map(extra=>row(Dg(draft.hotelId,extra.serviceId),extra.price?Te(extra.price):'Бесплатно')),keysPointsUsed(draft)>0&&row('Баллы Ключей','−'+Te(keysPointsUsed(draft))),keysHotelPointsUsed(draft)>0&&row('Баллы отеля','−'+Te(keysHotelPointsUsed(draft))),(payment||confirmed)&&arrival&&row(confirmed?'Оплачено сейчас':'К оплате сейчас',Te(0)),n.jsxs('div',{className:'keys-cart-total',children:[n.jsx('dt',{children:(payment||confirmed)&&arrival?'При заселении':confirmed?'Оплачено':'Итого'}),n.jsx('dd',{children:Te(confirmed?(arrival?booking.dueAtHotel:booking.payment?.amount??booking.paid):total.total)})]})]}),
  n.jsx('p',{className:'keys-cart-tax',children:'Налоги и сборы включены'}),
  !confirmed&&stage!=='processing'&&n.jsx(H,{className:'keys-cart-submit',disabled:payment&&(!um(draft.contact)||!draft.paymentMethod||!keysAdditionalGuestComplete(draft)),onClick:payment?()=>dispatch({type:'RESERVATION_PAY',draftId:draft.id}):onNext,children:payment?(arrival?'Подтвердить бронь':draft.status==='failed'?'Повторить оплату':'Оплатить · '+Te(total.total)):'Забронировать · '+Te(total.total)}),
  payment&&!um(draft.contact)&&n.jsx('p',{className:'keys-cart-helper',children:'Заполните данные гостя, чтобы продолжить'}),
  payment&&!keysAdditionalGuestComplete(draft)&&n.jsx('p',{className:'keys-cart-helper',children:'Заполните имя и фамилию второго гостя или очистите оба поля'}),
  payment&&!draft.paymentMethod&&n.jsx('p',{className:'keys-cart-helper',children:'Выберите способ оплаты'})
 ]});
}
function KeysCheckoutLayout({draft,children,processing=false}){
 const desktop=useKeysDesktopBooking();
 if(!desktop)return n.jsx(n.Fragment,{children:processing?children:[children[0],children[1],children[3],children[2],children[4],children[5],children[7],children[6],children[8],children[9]]});
 if(processing)return n.jsx('div',{className:'keys-booking-desktop keys-checkout-desktop',children:n.jsxs('div',{className:'keys-booking-columns',children:[n.jsx('div',{className:'keys-booking-primary',children}),n.jsx(KeysBookingCart,{draft,stage:'processing'})]})});
 return n.jsxs('div',{className:'keys-booking-desktop keys-checkout-desktop',children:[children[0],n.jsxs('div',{className:'keys-booking-columns',children:[n.jsxs('div',{className:'keys-booking-primary',children:[children[3],children[2],children[4],children[5],children[7],children[8]]}),n.jsx(KeysBookingCart,{draft,stage:'payment'})]})]});
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
