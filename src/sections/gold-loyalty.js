function keysSetLoyalty(state,value){
 const tier=value==='Gold'?'Gold':'Silver';
 if(state.keysLoyaltyTier===tier&&state.search.keysLoyaltyTier===tier)return state;
 const reservation=state.reservation;
 return {...state,keysLoyaltyTier:tier,search:{...state.search,keysLoyaltyTier:tier},
  reservation:reservation&&reservation.status!=='confirmed'?{...reservation,keysLoyaltyTier:tier,tariffId:reservation.tariffId==='loyalty-gold'&&tier!=='Gold'?'flexible':reservation.tariffId}:reservation};
}
// Anonymous visitors preview the existing member price; signing in never adds a second discount.
function keysRegistrationPrice(price){
 return globalThis.keysGuestMode&&!globalThis.keysGuestAuthorized&&price.usualTotal>price.total
  ? {...price,registrationDiscount:price.usualTotal-price.total}:price;
}
function tx(hotel,search,tick=0){
 const price={...keysStandardHotelPrice(hotel,search,tick),hotelId:hotel.id};
 if(search.keysLoyaltyTier!=='Gold')return keysRegistrationPrice(price);
 const total=Math.round(price.total*Sr(hotel.id,'loyalty-gold').multiplier);
 return {...price,total,nightly:Math.round(total/Math.max(1,price.count)),ownPrice:true,hotelTier:'Gold',goldDiscount:price.total-total,beforeGold:price.total};
}
function KeysGoldPrivileges(){
 return n.jsxs('details',{className:'keys-gold-privileges',onClick:event=>event.stopPropagation(),children:[
  n.jsxs('summary',{children:[n.jsx(D,{name:'gift',className:'size-4'}),n.jsx('span',{children:'Привилегии Gold'}),n.jsx(D,{name:'chevron',className:'keys-gold-chevron size-4'})]}),
  n.jsx('ul',{children:['Фитнес-зал бесплатно','Парковка бесплатно','−10% в ресторане'].map(label=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-4'}),label]},label))})
 ]});
}
function KeysPhotoPrice({hotel,price,nights}){
 const {state}=J(),[opened,setOpened]=E.useState(false);
 const quote=tx(hotel,state.search,state.discovery.priceTick),registration=!!quote.registrationDiscount,gold=state.keysLoyaltyTier==='Gold'||registration;
 return n.jsxs(n.Fragment,{children:[n.jsxs(gold?'button':'div',{
  type:gold?'button':undefined,className:'keys-discovery-price'+(gold?' has-gold-price':''),
  'aria-label':gold?(registration?'Цена после регистрации ':'Цена Gold ')+Te(quote.total)+' — детали скидки':undefined,'aria-haspopup':gold?'dialog':undefined,
  onPointerDown:gold?event=>event.stopPropagation():undefined,
  onClick:gold?event=>{event.stopPropagation();setOpened(true);}:undefined,
  children:[gold&&n.jsx('span',{className:'keys-photo-gold',children:'−'+eT(quote.total,quote.usualTotal)+'%'}),n.jsx('strong',{children:Te(gold?quote.total:price)}),n.jsx('span',{children:registration?'После регистрации':'за '+Xe(nights)})]
 }),opened&&n.jsx(KeysHotelDiscount,{price:quote,onClose:()=>setOpened(false)})]});
}
