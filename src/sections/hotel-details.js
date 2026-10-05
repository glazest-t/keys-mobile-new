// Hotel overview uses the same typography and semantic colours as result cards.
function keysReviewHighlights(reviews,today){
 const end=new Date(today+'T23:59:59Z'),start=new Date(today+'T00:00:00Z'),day=start.getUTCDate();
 start.setUTCDate(1);start.setUTCMonth(start.getUTCMonth()-3);
 const lastDay=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
 start.setUTCDate(Math.min(day,lastDay));
 const all=reviews.filter(review=>new Date(review.date+'T00:00:00Z')<=end);
 const recent=all.filter(review=>new Date(review.date+'T00:00:00Z')>=start);
 const summarize=items=>{const counts=new Map();items.forEach(review=>new Set(review.praise||[]).forEach(topic=>counts.set(topic,(counts.get(topic)||0)+1)));return {count:items.length,topics:[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ru')).slice(0,3).map(([topic])=>topic)};};
 return {all:summarize(all),recent:summarize(recent)};
}
function keysHotelReasons(hotel,search={}){
 const filterKeys={'Со спа':'spa','С завтраком':'breakfast','У моря':'beach','С бассейном':'pool','Тихий отель':'quiet','С детьми':'family','С питомцем':'pets','С парковкой':'parking','Отчётные документы':'work'};
 const wanted=new Set((search.filters||[]).map(filter=>filterKeys[filter]||filter)),party=search.party||{};
 if(party.pet)wanted.add('pets');if(party.car)wanted.add('parking');if(party.business)wanted.add('work');if(party.childrenAges?.length)wanted.add('family');
 const options=[['quiet','Тихое расположение','Тихое расположение поможет отдохнуть от суеты.'],['spa','Спа в отеле','В отеле есть спа — можно расслабиться после насыщенного дня.'],['breakfast','Завтрак на месте','Удобно начать утро в отеле. Включённость зависит от тарифа.'],['beach','Рядом с морем',hotel.seaDistance?'До моря '+hotel.seaDistance+' м — удобно для прогулок.':'Отель рядом с морем.'],['parking','Удобно на машине','У отеля есть парковка.'],['pets','Можно с питомцем','Отель принимает гостей с питомцами.'],['work','Для деловой поездки','В отеле есть условия для работы.'],['family','Для поездки с детьми','Отель подходит для семейного отдыха.'],['pool','Отдых у бассейна','В отеле есть бассейн.']];
 return options.filter(([key])=>hotel[key]).sort((a,b)=>Number(wanted.has(b[0]))-Number(wanted.has(a[0]))).slice(0,3).map(([key,title,text])=>({key,title,text,matched:wanted.has(key)}));
}
function keysRoomAmenities(rooms){return [...new Set(rooms.flatMap(room=>(room.description||'').split(' · ').map(item=>item.trim()).filter(Boolean).map(item=>item.charAt(0).toUpperCase()+item.slice(1))))].sort((a,b)=>Number(/вид|окна/i.test(a))-Number(/вид|окна/i.test(b)));}
function keysHotelAmenities(hotel,extra={}){
 return [
  ['Спа','Отдых',hotel.spa],['Бассейн','Отдых',hotel.pool],
  ['Ресторан','Питание',extra.restaurant],['Парковка','Сервисы',hotel.parking],
  ['Завтрак в отеле','Питание',hotel.breakfast],['Рядом с пляжем','Отдых',hotel.beach],
  ['Детский клуб','С детьми',extra.kidsClub],['Можно с питомцем','Сервисы',hotel.pets],
  ['Условия для работы','Сервисы',hotel.work]
 ].filter(([, ,available])=>available).map(([label,group])=>({label,group}));
}
function TY({hotel}) {
 const {state,open}=J(),reviews=Zc(hotel),periods=keysReviewHighlights(reviews.reviews,state.tripContext.today);
 const period=(title,summary,recent=false)=>n.jsxs('div',{className:'keys-hotel-review-period'+(recent?' is-recent':''),children:[
  n.jsx('h3',{children:title}),n.jsx('span',{className:'keys-hotel-review-count',children:Ym(summary.count)}),
  summary.topics.length?n.jsx('ul',{className:'keys-hotel-review-topics',children:summary.topics.map(topic=>n.jsx('li',{children:topic},topic))}):n.jsx('p',{className:'keys-hotel-review-empty',children:'Пока недостаточно отзывов'})
 ]},title);
 return n.jsxs('section',{className:'keys-hotel-reviews-card','aria-label':'Что гости хвалят в отеле',children:[
  n.jsxs('button',{type:'button',className:'keys-hotel-review-summary',onClick:()=>open({type:'hotel-reviews',hotelId:hotel.id}),'aria-label':'Все отзывы об отеле',children:[
   n.jsx('span',{className:'keys-hotel-review-score',children:n.jsx('strong',{children:String(hotel.rating).replace('.',',')})}),
   n.jsxs('span',{className:'keys-hotel-review-copy',children:[n.jsx('strong',{children:'Отзывы гостей'}),n.jsx('span',{children:'За что ценят этот отель'})]}),n.jsx(D,{name:'chevron',className:'size-4'})]}),
  n.jsxs('div',{className:'keys-hotel-review-periods',children:[period('За всё время',periods.all),period('Последние 3 месяца',periods.recent,true)]})
 ]});
}
function jY({hotel,draft}) {
 const {state,open}=J(),[discountOpen,setDiscountOpen]=E.useState(false);
 const price=tx(hotel,{...state.search,arrival:draft.arrival,departure:draft.departure,party:draft.party},state.discovery.priceTick);
 const watch=Vm(state.discovery.watches,hotel.id,state.search);
 return n.jsxs('section',{'aria-label':'Стоимость проживания',className:'keys-hotel-pricing',children:[
  n.jsxs('div',{className:'keys-hotel-pricing-row',children:[
   n.jsxs('button',{type:'button',className:'keys-hotel-pricing-amount',onClick:()=>setDiscountOpen(true),'aria-label':'Персонализированная цена — посмотреть расчёт скидки','aria-haspopup':'dialog',children:[
    n.jsx('span',{className:'keys-hotel-price-label',children:'Персонализированная цена'}),
    n.jsxs('span',{className:'keys-hotel-price-values',children:[n.jsx('strong',{children:Te(price.total)}),price.ownPrice&&n.jsxs('span',{className:'keys-hotel-pricing-base',children:[n.jsx('s',{children:Te(price.usualTotal)}),n.jsx('span',{className:'keys-hotel-pricing-discount',children:'−'+eT(price.total,price.usualTotal)+'%'})]})]}),
    n.jsxs('span',{className:'keys-hotel-price-action',children:['Как получилась цена',n.jsx(D,{name:'chevron',className:'size-4'})]})
   ]}),
   n.jsxs('button',{type:'button',className:'keys-hotel-watch','aria-label':watch?.enabled?'Цена отслеживается':'Отслеживать цену',title:watch?.enabled?'Цена отслеживается':'Отслеживать цену','aria-pressed':!!watch?.enabled,onClick:()=>open({type:'price-watch',hotelId:hotel.id,watchId:watch?.id}),children:[n.jsx(D,{name:'price',className:'size-5'}),watch?.enabled&&n.jsx('span',{className:'keys-hotel-watch-check','aria-hidden':true,children:n.jsx(D,{name:'check',className:'size-3'})})]})
  ]}),
  discountOpen&&n.jsx(KeysHotelDiscount,{price,onClose:()=>setDiscountOpen(false)})
 ]});
}
function KeysHotelGallery({hotel}) {
 const track=E.useRef(null),[active,setActive]=E.useState(0),[opened,setOpened]=E.useState(null);
 const captions={
  '92b13884e717.webp':'Открытый бассейн',
  'e64794f9d629.webp':'Номер с видом на море',
  '9dc80f32892b.webp':'Массаж в спа',
  '712730632ddb.webp':'Ресторан отеля',
  'ba0adadb3415.webp':'Главный корпус у моря',
  '81e6ff1ad368.webp':'Летняя терраса',
  '291753c8079c.webp':'Парк и фонтаны',
  '0826642075c1.webp':'Гостиная номера',
  '3aa57919bbb9.webp':'Напитки у бассейна',
  'fc0105b35d89.webp':'Вечерняя подсветка фонтанов'
 };
 const photos=(hotel.photos||[]).map(photo=>({...photo,alt:captions[photo.src.split('/').pop()]||photo.alt||'Фото отеля'}));
 const move=step=>{const next=Math.min(photos.length-1,Math.max(0,active+step));track.current?.scrollTo({left:next*track.current.clientWidth,behavior:xY()});};
 return n.jsxs('section',{className:'keys-hotel-gallery','aria-label':'Фотографии отеля',children:[
  n.jsx('div',{ref:track,className:'keys-hotel-gallery-track',onScroll:event=>{const el=event.currentTarget;setActive(Math.round(el.scrollLeft/Math.max(1,el.clientWidth)));},onKeyDown:event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}},children:photos.length?photos.map((photo,index)=>n.jsx('button',{type:'button',className:'keys-hotel-gallery-slide','aria-label':'Открыть фото '+(index+1)+' из '+photos.length,tabIndex:active===index?0:-1,onClick:()=>setOpened(index),children:n.jsx(Ol,{src:photo.src,alt:photo.alt||hotel.name,loading:index===0?'eager':'lazy',fetchPriority:index===0?'high':'auto',draggable:false,className:'keys-hotel-gallery-image'})},photo.src+'-'+index)):n.jsx('div',{className:'keys-hotel-gallery-empty',children:n.jsx(D,{name:'photos',className:'size-8'})})}),
  photos.length>0&&n.jsxs('div',{className:'keys-hotel-gallery-bottom',children:[
   n.jsx('span',{className:'keys-hotel-gallery-caption',children:photos[active]?.alt||hotel.name}),
   n.jsxs('button',{type:'button',className:'keys-hotel-gallery-counter','aria-label':'Все фотографии отеля',onClick:()=>setOpened(active),children:[n.jsx(D,{name:'photos',className:'size-4'}),(active+1)+' / '+photos.length]})
  ]}),
  photos.length>1&&n.jsx('div',{className:'keys-hotel-gallery-peeks',children:photos.slice(1,3).map((photo,index)=>n.jsxs('button',{type:'button','aria-label':'Посмотреть фото: '+photo.alt,onClick:()=>setOpened(index+1),children:[n.jsx(Ol,{src:photo.src,alt:photo.alt,loading:'lazy',className:'keys-hotel-gallery-image'}),n.jsx('span',{children:photo.alt})]},photo.src))}),
  n.jsx(JU,{hotelId:hotel.id,className:'keys-hotel-gallery-story'}),
  opened!==null&&n.jsx(Si,{photos,title:hotel.name,startIndex:opened,keysHotelLayout:true,onClose:()=>setOpened(null)})
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
  rooms?n.jsx(KeysHotelRooms,{hotel}):n.jsx(KeysHotelOverview,{hotel,draft,minimum}),
  !rooms&&n.jsx(uk,{className:'keys-hotel-booking-cta',children:n.jsx(H,{onClick:()=>open({type:'hotel',hotelId:hotel.id,rooms:true}),children:'Выбрать номер от '+Te(minimum)})}),
  sharing&&n.jsx(ki,{hotel,onClose:()=>setSharing(false)})
 ]});
}
function KeysHotelLocation({hotel,draft}){
 const {state,open}=J();
 return n.jsxs('section',{className:'keys-hotel-location-section',children:[
  n.jsxs('div',{className:'keys-hotel-section-heading',children:[n.jsx('h2',{children:'Расположение'}),n.jsxs('button',{type:'button',className:'keys-hotel-text-action','data-keys-button':'text',onClick:()=>open({type:'hotel-map',hotelId:hotel.id}),children:['На карте',n.jsx(D,{name:'chevron',className:'size-3.5'})]})]}),
  n.jsx('p',{children:hotel.address||[hotel.city,hotel.area].filter(Boolean).join(', ')}),
  n.jsx('div',{className:'keys-hotel-inline-map','aria-label':'Карта расположения '+hotel.name,children:n.jsx(E.Suspense,{fallback:n.jsx('p',{role:'status',children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels:[hotel],focusId:hotel.id,selectedId:hotel.id,previewHeight:0,onSelect:()=>open({type:'hotel-map',hotelId:hotel.id}),onDismiss:()=>{},dates:draft,priceTick:state.discovery.priceTick,booked:false})})})
 ]});
}
function KeysHotelAmenities({hotel}){
 const [opened,setOpened]=E.useState(false),amenities=keysHotelAmenities(hotel,Vc(hotel.id));
 const groups=[...new Set(amenities.map(item=>item.group))];
 if(!amenities.length)return null;
 return n.jsxs('section',{className:'keys-hotel-amenities',children:[
  n.jsx('h2',{children:'Удобства в отеле'}),
  n.jsx('ul',{className:'keys-hotel-amenity-preview',children:amenities.slice(0,4).map(item=>n.jsx('li',{children:item.label},item.label))}),
  amenities.length>4&&n.jsxs('button',{type:'button',className:'keys-hotel-text-action','data-keys-button':'text','aria-haspopup':'dialog',onClick:()=>setOpened(true),children:['Все удобства',n.jsx(D,{name:'chevron',className:'size-4'})]}),
  opened&&n.jsx(ct,{title:'Удобства в отеле',onClose:()=>setOpened(false),children:n.jsx('div',{className:'keys-hotel-amenities-sheet',children:groups.map(group=>n.jsxs('section',{children:[n.jsx('h3',{children:group}),n.jsx('ul',{className:'keys-hotel-amenity-list',children:amenities.filter(item=>item.group===group).map(item=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-4'}),item.label]},item.label))})]},group))})})
 ]});
}
function KeysHotelOverview({hotel,draft,minimum}) {
 const {state,open}=J(),reasons=keysHotelReasons(hotel,state.search);
 const stars=Number.isInteger(hotel.stars)&&hotel.stars>0&&hotel.stars<=5?hotel.stars:null;
 const propertyType=hotel.accommodationType||'Отель';
 return n.jsxs('div',{className:'keys-hotel-overview',children:[
  n.jsx(KeysHotelGallery,{hotel}),
  n.jsxs('section',{className:'keys-hotel-identity',children:[
   n.jsx('h1',{children:hotel.name}),
   n.jsxs('div',{className:'keys-hotel-meta',children:[
    n.jsxs('div',{className:'keys-hotel-category',children:[n.jsx('span',{children:propertyType}),stars&&n.jsx('span',{className:'keys-hotel-category-label',children:stars+' '+(stars===1?'звезда':stars<5?'звезды':'звёзд')})]}),
    n.jsx('p',{className:'keys-hotel-city',children:[hotel.city,hotel.area||hotel.district].filter(Boolean).join(' · ')})
   ]})
  ]}),
  n.jsxs('div',{className:'keys-hotel-booking-panel',children:[
   n.jsx(jY,{hotel,draft}),
   n.jsx('div',{className:'keys-hotel-desktop-booking-action',children:n.jsx(H,{onClick:()=>open({type:'hotel',hotelId:hotel.id,rooms:true}),children:'Выбрать номер от '+Te(minimum)})})
  ]}),
  n.jsxs('div',{className:'keys-hotel-content',children:[
  n.jsx(KeysHotelFeatures,{hotel}),
  n.jsx('div',{className:'keys-hotel-reviews-section',children:n.jsx(TY,{hotel})}),
  reasons.length>0&&n.jsxs('section',{className:'keys-hotel-recommendations',children:[n.jsx('h2',{children:'Почему рекомендуем вам'}),n.jsx('div',{className:'keys-hotel-recommendation-tags',children:n.jsx(KeysHotelFeatures,{hotel})}),n.jsx('ul',{children:reasons.map(reason=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-5'}),n.jsx('span',{children:reason.title})]},reason.key))})]}),
  n.jsx(KeysHotelLocation,{hotel,draft}),n.jsx(KeysHotelAmenities,{hotel})
  ]})
 ]});
}
