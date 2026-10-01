// Hotel overview uses the same typography and semantic colours as result cards.
function TY({hotel}) {
 const {open}=J(), reviews=Zc(hotel), praise=wY(reviews.praise.slice(0,3).map(item=>item.topic));
 return n.jsxs('button',{type:'button',className:'keys-hotel-review-summary',onClick:()=>open({type:'hotel-reviews',hotelId:hotel.id}),'aria-label':'Отзывы об отеле: '+Ym(reviews.reviews.length),children:[
  n.jsxs('span',{className:'keys-hotel-review-score',children:[n.jsx('strong',{children:String(hotel.rating).replace('.',',')})]}),
  n.jsxs('span',{className:'keys-hotel-review-copy',children:[n.jsx('strong',{children:'Отзывы гостей'}),n.jsx('span',{children:Ym(reviews.reviews.length)+' · '+Lc(hotel.rating)}),praise&&n.jsx('span',{className:'keys-hotel-review-praise',children:'Хвалят '+praise})]}),
  n.jsx(D,{name:'chevron',className:'size-4'})
 ]});
}
function jY({hotel,draft}) {
 const {state,open}=J(),[discountOpen,setDiscountOpen]=E.useState(false);
 const price=tx(hotel,{...state.search,arrival:draft.arrival,departure:draft.departure,party:draft.party},state.discovery.priceTick);
 const watch=Vm(state.discovery.watches,hotel.id,state.search);
 return n.jsxs('section',{'aria-label':'Стоимость проживания',className:'keys-hotel-pricing',children:[
  n.jsxs('div',{className:'keys-hotel-pricing-row',children:[
   n.jsxs('button',{type:'button',className:'keys-hotel-pricing-amount',onClick:()=>setDiscountOpen(true),'aria-label':'Стоимость проживания и расчёт скидки','aria-haspopup':'dialog',children:[
    n.jsx('strong',{children:Te(price.total)}),
    price.ownPrice&&n.jsxs('span',{className:'keys-hotel-pricing-base',children:[n.jsx('s',{children:Te(price.usualTotal)}),n.jsx('span',{className:'keys-hotel-pricing-discount',children:'−'+eT(price.total,price.usualTotal)+'%'})]})
   ]}),
   n.jsxs('button',{type:'button',className:'keys-hotel-watch','aria-label':watch?.enabled?'Цена отслеживается':'Отслеживать цену',title:watch?.enabled?'Цена отслеживается':'Отслеживать цену','aria-pressed':!!watch?.enabled,onClick:()=>open({type:'price-watch',hotelId:hotel.id,watchId:watch?.id}),children:[n.jsx(D,{name:'price',className:'size-5'}),watch?.enabled&&n.jsx('span',{className:'keys-hotel-watch-check','aria-hidden':true,children:n.jsx(D,{name:'check',className:'size-3'})})]})
  ]}),
  discountOpen&&n.jsx(KeysHotelDiscount,{price,onClose:()=>setDiscountOpen(false)})
 ]});
}
function KeysHotelGallery({hotel}) {
 const track=E.useRef(null),[active,setActive]=E.useState(0),[opened,setOpened]=E.useState(null);
 const photos=hotel.photos||[];
 const move=step=>{const next=Math.min(photos.length-1,Math.max(0,active+step));track.current?.scrollTo({left:next*track.current.clientWidth,behavior:xY()});};
 return n.jsxs('section',{className:'keys-hotel-gallery','aria-label':'Фотографии отеля',children:[
  n.jsx('div',{ref:track,className:'keys-hotel-gallery-track',onScroll:event=>{const el=event.currentTarget;setActive(Math.round(el.scrollLeft/Math.max(1,el.clientWidth)));},onKeyDown:event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}},children:photos.length?photos.map((photo,index)=>n.jsx('button',{type:'button',className:'keys-hotel-gallery-slide','aria-label':'Открыть фото '+(index+1)+' из '+photos.length,tabIndex:active===index?0:-1,onClick:()=>setOpened(index),children:n.jsx(Ol,{src:photo.src,alt:photo.alt||hotel.name,loading:index===0?'eager':'lazy',fetchPriority:index===0?'high':'auto',draggable:false,className:'keys-hotel-gallery-image'})},photo.src+'-'+index)):n.jsx('div',{className:'keys-hotel-gallery-empty',children:n.jsx(D,{name:'photos',className:'size-8'})})}),
  photos.length>0&&n.jsxs('div',{className:'keys-hotel-gallery-bottom',children:[
   n.jsx('span',{className:'keys-hotel-gallery-caption',children:photos[active]?.alt||hotel.name}),
   n.jsxs('button',{type:'button',className:'keys-hotel-gallery-counter','aria-label':'Все фотографии отеля',onClick:()=>setOpened(active),children:[n.jsx(D,{name:'photos',className:'size-4'}),(active+1)+' / '+photos.length]})
  ]}),
  n.jsx(JU,{hotelId:hotel.id,className:'keys-hotel-gallery-story'}),
  opened!==null&&n.jsx(Si,{photos,title:hotel.name,startIndex:opened,onClose:()=>setOpened(null)})
 ]});
}
function KeysHotelFeatures({hotel}) {
 const tags=[hotel.spa&&'Спа',hotel.breakfast&&'Вкусные завтраки',hotel.beach&&'У моря'].filter(Boolean);
 if(!tags.length)return null;
 return n.jsx('div',{className:'keys-hotel-features','aria-label':'По вашим предпочтениям',children:tags.map(tag=>n.jsx('span',{className:'keys-hotel-feature',children:tag},tag))});
}
function keysHotelDiscount(price) {
 const total=Math.max(0,price.usualTotal-price.total);
 const hotel=Math.min(total,Math.round(price.usualTotal*.05));
 return {total,hotel,keys:total-hotel,hotelPercent:price.usualTotal?Math.round(hotel/price.usualTotal*100):0};
}
function KeysHotelDiscount({price,onClose}) {
 const discount=keysHotelDiscount(price);
 const row=(label,value,className='')=>n.jsxs('div',{className:'keys-hotel-discount-row '+className,children:[n.jsx('span',{children:label}),n.jsx('strong',{children:value})]},label);
 return n.jsx(ct,{title:'Ваша выгода',onClose,children:n.jsxs('div',{className:'keys-hotel-discount-details',children:[
  row('Стоимость без скидок',Te(price.usualTotal)),
  n.jsxs('div',{className:'keys-hotel-discount-sources',children:[
   row('Программа лояльности Ключей','−'+Te(discount.keys)),
   row('Лояльность отеля · −'+discount.hotelPercent+'%','−'+Te(discount.hotel))
  ]}),
  row('Общая скидка','−'+Te(discount.total),'keys-hotel-discount-total'),
  row('Стоимость проживания',Te(price.total),'keys-hotel-discount-final')
 ]})});
}
const keysRoomFilters=[
 {id:'cancellation',label:'Бесплатная отмена'},
 {id:'breakfast',label:'Завтрак включён'},
 {id:'no-prepayment',label:'Без предоплаты'}
];
function keysRoomOfferMatches(offer,filters) {
 return filters.every(filter=>filter==='cancellation'?offer.freeCancellation===true:filter==='breakfast'?offer.includesBreakfast===true:filter==='no-prepayment'?offer.requiresPrepayment===false:true);
}
function KeysHotelRooms({hotel}) {
 const {state,dispatch}=J(),{draft,ensure}=hk(hotel.id);
 const [filters,setFilters]=E.useState([]),[editStay,setEditStay]=E.useState(false),[photos,setPhotos]=E.useState(null);
 const rooms=wr(hotel.id).map(room=>({room,offers:DY(draft,room).map(offer=>{
  const tariff=Sr(hotel.id,offer.id);
  return {...offer,freeCancellation:tariff.refundable&&state.tripContext.today<=Hx(tariff,draft.arrival),requiresPrepayment:tariff.requiresPrepayment!==false};
 }).filter(offer=>keysRoomOfferMatches(offer,filters))})).filter(item=>item.offers.length);
 const selectedVisible=rooms.some(item=>item.offers.some(offer=>offer.selected));
 const toggle=id=>setFilters(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
 return n.jsxs('div',{className:'keys-room-selection',children:[
  n.jsxs('div',{className:'keys-room-stay',children:[
   n.jsxs('div',{children:[n.jsx('strong',{children:zt(draft.arrival,draft.departure)}),n.jsx('span',{children:Xe(Ge(draft.arrival,draft.departure))+' · '+Rt(draft.party)})]}),
   n.jsx('button',{type:'button','aria-haspopup':'dialog',onClick:()=>setEditStay(true),children:'Изменить'})
  ]}),
  n.jsx('div',{className:'keys-results-filters keys-room-filters','aria-label':'Условия тарифа',role:'group',children:keysRoomFilters.map(filter=>n.jsxs('button',{type:'button','aria-pressed':filters.includes(filter.id),onClick:()=>toggle(filter.id),children:[filters.includes(filter.id)&&n.jsx(D,{name:'check',className:'size-3.5'}),filter.label]},filter.id))}),
  n.jsxs('div',{className:'keys-room-list-heading',children:[n.jsx('h2',{children:'Номера и тарифы'}),n.jsx('span',{children:'За '+Xe(Ge(draft.arrival,draft.departure))})]}),
  rooms.length?n.jsx('div',{className:'keys-room-list',children:rooms.map(({room,offers})=>n.jsx(mk,{id:pk(room.id),room,includesBreakfast:offers.every(offer=>offer.includesBreakfast),selected:offers.some(offer=>offer.selected),onOpenPhotos:index=>setPhotos({photos:room.photos,title:room.name,index}),children:offers.map(offer=>n.jsx(Nx,{name:offer.name,price:offer.price,refundable:offer.refundable,cancellationLabel:offer.cancellation,discountLabel:offer.discountLabel||undefined,terms:offer.terms,selected:offer.selected,group:'tariff',onSelect:()=>{ensure();dispatch({type:'RESERVATION_ROOM',id:room.id});dispatch({type:'RESERVATION_TARIFF',id:offer.id});}},offer.id))},room.id))}):n.jsxs('div',{className:'keys-room-empty',role:'status',children:[n.jsx('h3',{children:'Нет подходящих тарифов'}),n.jsx('p',{children:'На эти даты нет номеров с выбранными условиями. Попробуйте убрать один из фильтров.'}),n.jsx(H,{variant:'secondary',onClick:()=>setFilters([]),children:'Сбросить фильтры'})]}),
  draft.error&&n.jsx('p',{role:'alert',className:'keys-room-error',children:draft.error}),
  rooms.length>0&&n.jsx(uk,{children:n.jsx(H,{disabled:!selectedVisible,onClick:()=>{ensure();dispatch({type:'RESERVATION_NEXT'});},children:selectedVisible?'Забронировать · '+Te(Ul(draft)):'Выберите тариф'})}),
  editStay&&n.jsx(xh,{onClose:()=>setEditStay(false)}),
  photos&&n.jsx(Si,{photos:photos.photos,title:photos.title,startIndex:photos.index,onClose:()=>setPhotos(null)})
 ]});
}
function KeysHotelPage() {
 const [sharing,setSharing]=E.useState(false),{state,dispatch,open}=J();
 const screen=state.navigation.screen,hotel=Ie(screen?.hotelId||state.search.hotelId);
 const {draft,ensure}=hk(hotel.id),rooms=!!screen?.rooms,saved=state.discovery.savedIds.includes(hotel.id);
 U4({id:hotel.id,name:hotel.name,city:hotel.city,photo:null});
 const minimum=Math.min(...wr(hotel.id).flatMap(room=>DY(draft,room).map(offer=>offer.price)));
 return n.jsxs(n.Fragment,{children:[
  n.jsx(Ae,{title:rooms?'Выбор номера':hotel.name,overPhoto:!rooms,action:!rooms&&n.jsxs(n.Fragment,{children:[
   n.jsx('button',{type:'button','aria-pressed':saved,'aria-label':saved?'Убрать отель из сохранённых':'Сохранить отель',onClick:()=>dispatch({type:'FAVORITE_TOGGLE',id:hotel.id}),className:'grid size-10 place-items-center rounded-full bg-surface text-brand',children:n.jsx(D,{name:'heart',className:F('size-[18px]',saved&&'fill-current')})}),
   n.jsx('button',{type:'button','aria-label':'Поделиться отелем',onClick:()=>setSharing(true),className:'grid size-10 place-items-center rounded-full bg-surface text-brand',children:n.jsx(D,{name:'share',className:'size-[18px]'})})
  ]})}),
  rooms?n.jsx(KeysHotelRooms,{hotel}):n.jsx(KeysHotelOverview,{hotel,draft}),
  !rooms&&n.jsx(uk,{children:n.jsx(H,{onClick:()=>open({type:'hotel',hotelId:hotel.id,rooms:true}),children:'Выбрать номер от '+Te(minimum)})}),
  sharing&&n.jsx(ki,{hotel,onClose:()=>setSharing(false)})
 ]});
}
function KeysHotelOverview({hotel,draft}) {
 const {open}=J(),content=Vl(hotel);
 const stars=Number.isInteger(hotel.stars)&&hotel.stars>0&&hotel.stars<=5?hotel.stars:null;
 const propertyType=hotel.accommodationType||'Отель';
 return n.jsxs(n.Fragment,{children:[
  n.jsx(KeysHotelGallery,{hotel}),
  n.jsxs('section',{className:'keys-hotel-identity',children:[
   n.jsx('h1',{children:hotel.name}),
   n.jsxs('div',{className:'keys-hotel-category',children:[
    n.jsx('span',{children:propertyType}),
    stars&&n.jsxs(n.Fragment,{children:[n.jsx('span',{'aria-hidden':true,className:'keys-hotel-category-separator',children:'·'}),n.jsx('span',{className:'keys-hotel-category-stars',role:'img','aria-label':'Категория: '+S6(stars),children:n.jsx('span',{'aria-hidden':true,children:'★'.repeat(stars)})})]})
   ]}),
   n.jsx('p',{className:'keys-hotel-city',children:keysHotelLocation(hotel.city,hotel)})
  ]}),
  n.jsx(jY,{hotel,draft}),
  n.jsx(KeysHotelFeatures,{hotel}),
  n.jsx('div',{className:'keys-hotel-reviews-section',children:n.jsx(TY,{hotel})}),
  n.jsxs('section',{className:'keys-hotel-about',children:[n.jsx('h2',{children:'Об отеле'}),n.jsx('p',{className:'keys-hotel-description','data-testid':'hotel-description',children:content.description,'data-content-source':content.source,'data-content-version':content.version,'data-content-mode':content.mode})]}),
  n.jsxs('button',{type:'button',className:'keys-hotel-location-card',onClick:()=>open({type:'hotel-map',hotelId:hotel.id}),'aria-label':'Расположение отеля — открыть карту',children:[
   n.jsx('span',{className:'keys-hotel-location-icon',children:n.jsx(D,{name:'map',className:'size-5'})}),
   n.jsxs('span',{className:'keys-hotel-location-copy',children:[n.jsx('strong',{children:'Расположение'}),n.jsx('span',{children:hotel.address||hotel.city}),n.jsx('span',{className:'keys-hotel-map-link',children:'На карте'})]}),
   n.jsx(D,{name:'chevron',className:'size-4'})
  ]})
 ]});
}
