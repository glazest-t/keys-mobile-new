import {cu as KeysSuccessHeader, ar as keysStayDefaults, KeysBookingConfirmation,KeysCancelledBooking,keysRequestBookingCancellation} from "./index-C4VobzN0.js";
function S({draft:t,booking:s,details=false,onBack}){
 const {dispatch:c,open:a,state}=h(),{share:o}=w(t,s),hotel=x(t.hotelId);
 if(s.keysCancellation)return e.jsx(KeysCancelledBooking,{draft:t,booking:s,details,onBack});
 const payAtHotel=s.payment?.method==='arrival';
 const checkIn=s.checkInTime??hotel.checkInTime??(hotel.id==='more'?keysStayDefaults.checkInTime:hotel.id==='maidens'?'14:00':s.arrivalTime||'15:00'),checkOut=s.checkOutTime??hotel.checkOutTime??(hotel.id==='more'?keysStayDefaults.checkOutTime:'12:00');
 const date=value=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','');
 const row=(label,value)=>e.jsxs('div',{className:'keys-success-row',children:[e.jsx('dt',{children:label}),e.jsx('dd',{children:value})]},label);
 return e.jsxs(KeysBookingConfirmation,{draft:t,booking:s,details,className:'keys-booking-success'+(details?' is-details':''),children:[
  details&&e.jsx(KeysSuccessHeader,{title:'Детали брони',onBack}),
  e.jsxs('header',{className:'keys-success-heading',children:[e.jsxs('div',{children:[e.jsx(y,{name:'check',className:'keys-success-check'}),e.jsx(details?'p':'h1',{className:details?'keys-success-detail-status':undefined,children:'Бронь подтверждена'})]}),e.jsx('p',{children:'Бронирование '+s.id})]}),
  e.jsxs('section',{className:'keys-checkout-panel keys-success-stay','aria-label':'Подтверждённое проживание',children:[
   e.jsxs('div',{className:'keys-success-hotel',children:[e.jsx('img',{src:t.room.photo.src,alt:t.room.name}),e.jsxs('div',{children:[e.jsx('h2',{children:hotel.name}),e.jsx('p',{children:hotel.city}),e.jsx('p',{children:t.room.name})]})]}),
   e.jsxs('dl',{className:'keys-success-dates',children:[e.jsxs('div',{children:[e.jsx('dt',{children:'Заезд'}),e.jsxs('dd',{children:[date(t.arrival),e.jsx('small',{children:'с '+checkIn})]})]}),e.jsxs('div',{children:[e.jsx('dt',{children:'Выезд'}),e.jsxs('dd',{children:[date(t.departure),e.jsx('small',{children:'до '+checkOut})]})]})]}),
   e.jsxs('dl',{className:'keys-success-facts',children:[row('Гости',j(t.party)),row('Тариф',s.tariff.name),row('На имя',g(s.contact))]}),
   !!t.extras.length&&e.jsxs('button',{type:'button',className:'keys-success-services',onClick:()=>a({type:'orders'}),children:[e.jsx('span',{children:'Добавленные услуги · '+t.extras.length}),e.jsx(y,{name:'chevron',className:'size-4'})]})
  ]}),
  e.jsxs('section',{className:'keys-checkout-panel keys-success-payment','aria-label':'Оплата бронирования',children:[
   e.jsxs('div',{className:'keys-success-section-heading',children:[e.jsx('h2',{children:'Оплата'}),e.jsxs('span',{children:[e.jsx(y,{name:payAtHotel?'clock':'check',className:'size-4'}),payAtHotel?'При заселении':'Оплачено']})]}),
   e.jsxs('dl',{className:'keys-success-facts',children:[s.pointsSpent>0&&row('Списано баллов',s.pointsSpent.toLocaleString('ru-RU')),row('Налоги и сборы','Включены'),payAtHotel&&row('Оплачено сейчас',N(0)),e.jsxs('div',{className:'keys-success-total',children:[e.jsx('dt',{children:payAtHotel?'К оплате в отеле':'Итого оплачено'}),e.jsx('dd',{children:N(payAtHotel?s.dueAtHotel:s.payment?.amount??s.paid)})]})]})
  ]}),
  e.jsxs('div',{className:'keys-success-actions',children:[e.jsx('p',{children:payAtHotel?'Подтверждение сохранено в документах поездки. Чек выдадут после оплаты в отеле.':'Подтверждение и чек сохранены в документах поездки.'}),!details&&e.jsx(n,{onClick:()=>c({type:'HOME'}),children:'К поездке'}),e.jsx(n,{variant:'secondary',icon:'share',onClick:o,children:'Поделиться бронированием'}),e.jsx('button',{type:'button',className:'keys-cancel-entry',onClick:()=>keysRequestBookingCancellation(t,s,state),children:'Отменить бронирование'})]})
 ]});
}
