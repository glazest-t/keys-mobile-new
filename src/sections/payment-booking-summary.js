function Z({draft:s,className:t}) {
 const hotel=F(s.hotelId),tariff=k(s.hotelId,s.tariffId);
 return e.jsxs('section',{'aria-label':'Ваше бронирование',className:x('keys-checkout-panel keys-payment-summary keys-payment-booking-summary',t),children:[
  e.jsxs('div',{className:'keys-payment-stay-preview',children:[
   e.jsx('img',{src:s.room.photo.src,alt:s.room.name}),
   e.jsxs('div',{className:'keys-payment-stay-copy',children:[e.jsx('h2',{children:hotel.name}),e.jsx('p',{children:hotel.city}),e.jsx('strong',{children:s.room.name}),e.jsx('p',{children:'Тариф «'+tariff.name+'»'})]})
  ]})
 ]});
}
