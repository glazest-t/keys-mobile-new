function Z({draft:s,className:t}) {
 const {state:a,open:l,back:o}=h(),hotel=F(s.hotelId),tariff=k(s.hotelId,s.tariffId),previous=a.navigation.history.at(-1);
 const change=()=>previous?.type==='hotel'&&(previous.hotelId??hotel.id)===s.hotelId?o():l({type:'hotel',hotelId:s.hotelId,rooms:true});
 return e.jsxs('section',{'aria-label':'Ваше бронирование',className:x('keys-payment-summary keys-payment-booking-summary',t),children:[
  e.jsxs('div',{className:'keys-payment-summary-heading',children:[e.jsx(m,{name:'hotel',className:'keys-payment-summary-icon'}),e.jsxs('div',{children:[e.jsx('h2',{children:hotel.name}),e.jsx('p',{children:hotel.city})]})]}),
  e.jsxs('div',{className:'keys-payment-summary-body',children:[
   e.jsx('strong',{children:s.room.name}),
   e.jsx('p',{children:V(s.arrival,s.departure)+' · '+C(S(s.arrival,s.departure))+' · '+B(s.party)}),
   e.jsx('p',{children:'Тариф «'+tariff.name+'»'})
  ]}),
  e.jsxs('button',{type:'button',className:'keys-payment-summary-action',onClick:change,children:['Изменить номер и даты',e.jsx(m,{name:'chevron',className:'size-3.5'})]})
 ]});
}
