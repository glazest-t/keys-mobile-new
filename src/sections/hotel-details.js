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
function KeysHotelReviewHighlights({hotel,heading=false,preview=false}) {
 const {state}=J(),periods=keysReviewHighlights(Zc(hotel).reviews,state.tripContext.today);
 const period=(title,summary,recent=false)=>n.jsxs('div',{className:'keys-hotel-review-period'+(recent?' is-recent':''),children:[
  n.jsx('h3',{children:title}),n.jsx('span',{className:'keys-hotel-review-count',children:Ym(summary.count)}),
  summary.topics.length?n.jsx('ul',{className:'keys-hotel-review-topics',children:summary.topics.map(topic=>n.jsx('li',{children:topic},topic))}):n.jsx('p',{className:'keys-hotel-review-empty',children:'Пока недостаточно отзывов'})
 ]},title);
 return n.jsxs('div',{className:'keys-review-highlights',children:[heading&&n.jsx('h2',{children:'Что гости хвалят'}),n.jsxs('div',{className:'keys-hotel-review-periods',children:[period(preview?'Гости ценят за всё время':'За всё время',periods.all),period(preview?'Хвалят в последние 3 месяца':'Последние 3 месяца',periods.recent,true)]})]});
}
function keysHotelRatingLabel(value){
 const rating=Number(String(value).replace(',','.'));
 return !Number.isFinite(rating)?'Отзывы гостей':rating>=9?'Очень хорошо':rating>=8?'Хорошо':rating>=7?'Неплохо':'Есть замечания';
}
function TY({hotel,showAll=true}) {
 const {state,open}=J();
 const count=keysReviewHighlights(Zc(hotel).reviews,state.tripContext.today).all.count;
 return n.jsxs('section',{className:'keys-hotel-reviews-card'+(showAll?'':' keys-hotel-reviews-card-full'),'aria-label':'Отзывы гостей',children:[
  n.jsxs('div',{className:'keys-hotel-card-heading',children:[
   n.jsxs('div',{children:[n.jsx('h2',{children:'Отзывы гостей'}),n.jsx('span',{children:Ym(count)})]}),
   n.jsx('strong',{className:'keys-hotel-reviews-rating','aria-label':'Рейтинг '+String(hotel.rating).replace('.',','),children:String(hotel.rating).replace('.',',')})
  ]}),
  n.jsx(KeysHotelReviewHighlights,{hotel,preview:true}),
  showAll&&n.jsxs('button',{type:'button',className:'keys-hotel-card-action',onClick:()=>open({type:'hotel-reviews',hotelId:hotel.id}),children:['Все отзывы',n.jsx(D,{name:'chevron',className:'size-4'})]})
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
    n.jsxs('span',{className:'keys-hotel-price-action',children:n.jsx(D,{name:'chevron',className:'size-4'})})
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
 const [filters,setFilters]=E.useState([]),[photos,setPhotos]=E.useState(null);
 const rooms=wr(hotel.id).map(room=>({room,offers:DY(draft,room).map(offer=>{
  const tariff=Sr(hotel.id,offer.id);
  return {...offer,freeCancellation:tariff.refundable&&state.tripContext.today<=Hx(tariff,draft.arrival),requiresPrepayment:tariff.requiresPrepayment!==false,changesAllowed:tariff.changesAllowed,cancellationDeadline:tariff.refundable?qm(Hx(tariff,draft.arrival)):null};
 }).filter(offer=>keysRoomOfferMatches(offer,filters))})).filter(item=>item.offers.length);
 const toggle=id=>setFilters(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
 return n.jsxs('div',{className:'keys-room-selection',children:[
  n.jsx('div',{className:'keys-results-filters keys-room-filters','aria-label':'Условия тарифа',role:'group',children:keysRoomFilters.map(filter=>n.jsxs('button',{type:'button','aria-pressed':filters.includes(filter.id),onClick:()=>toggle(filter.id),children:[filters.includes(filter.id)&&n.jsx(D,{name:'check',className:'size-3.5'}),filter.label]},filter.id))}),
  rooms.length?n.jsx('div',{className:'keys-room-list',children:rooms.map(({room,offers})=>n.jsx(KeysRoomOfferCard,{room,offers,draft,onChoose:offer=>{ensure();dispatch({type:'RESERVATION_ROOM',id:room.id});dispatch({type:'RESERVATION_TARIFF',id:offer.id});},onOpenPhotos:index=>setPhotos({photos:room.photos,title:room.name,index}),onSelect:offer=>{ensure();dispatch({type:'RESERVATION_ROOM',id:room.id});dispatch({type:'RESERVATION_TARIFF',id:offer.id});dispatch({type:'RESERVATION_NEXT'});}},room.id))}):n.jsxs('div',{className:'keys-room-empty',role:'status',children:[n.jsx('h3',{children:'Нет подходящих тарифов'}),n.jsx('p',{children:'На эти даты нет номеров с выбранными условиями. Попробуйте убрать один из фильтров.'}),n.jsx(H,{variant:'secondary',onClick:()=>setFilters([]),children:'Сбросить фильтры'})]}),
  draft.error&&n.jsx('p',{role:'alert',className:'keys-room-error',children:draft.error}),
  photos&&n.jsx(Si,{photos:photos.photos,title:photos.title,startIndex:photos.index,onClose:()=>setPhotos(null)})
 ]});
}
function KeysHotelPage() {
 const [sharing,setSharing]=E.useState(false),[editStay,setEditStay]=E.useState(false),{state,dispatch,open}=J();
 const screen=state.navigation.screen,hotel=Ie(screen?.hotelId||state.search.hotelId);
 const {draft,ensure}=hk(hotel.id),rooms=!!screen?.rooms,saved=state.discovery.savedIds.includes(hotel.id);
 U4({id:hotel.id,name:hotel.name,city:hotel.city,photo:null});
 const minimum=Math.min(...wr(hotel.id).flatMap(room=>DY(draft,room).map(offer=>offer.price)));
 return n.jsxs(n.Fragment,{children:[
  n.jsx(Ae,{title:rooms?'Выбор номера':hotel.name,subtitle:rooms?zt(draft.arrival,draft.departure)+' · '+Rt(draft.party):undefined,overPhoto:!rooms,action:rooms?n.jsx('button',{type:'button',className:'keys-room-edit','aria-label':'Изменить даты и количество гостей','aria-haspopup':'dialog',onClick:()=>setEditStay(true),children:'Изменить'}):n.jsxs(n.Fragment,{children:[
   n.jsx('button',{type:'button','aria-pressed':saved,'aria-label':saved?'Убрать отель из сохранённых':'Сохранить отель',onClick:()=>dispatch({type:'FAVORITE_TOGGLE',id:hotel.id}),className:'grid size-10 place-items-center rounded-full bg-surface text-brand',children:n.jsx(D,{name:'heart',className:F('size-[18px]',saved&&'fill-current')})}),
   n.jsx('button',{type:'button','aria-label':'Поделиться отелем',onClick:()=>setSharing(true),className:'grid size-10 place-items-center rounded-full bg-surface text-brand',children:n.jsx(D,{name:'share',className:'size-[18px]'})})
  ]})}),
  rooms?n.jsx(KeysHotelRooms,{hotel}):n.jsx(KeysHotelOverview,{hotel,draft,minimum}),
  !rooms&&n.jsx(uk,{className:'keys-hotel-booking-cta',children:n.jsx(H,{onClick:()=>open({type:'hotel',hotelId:hotel.id,rooms:true}),children:'Выбрать номер от '+Te(minimum)})}),
  editStay&&n.jsx(xh,{roomStay:true,onClose:()=>setEditStay(false)}),
  sharing&&n.jsx(ki,{hotel,onClose:()=>setSharing(false)})
 ]});
}
function KeysHotelLocation({hotel,draft}){
 const {state,open}=J(),places=vk(hotel).filter(place=>place.category==='walk'||place.category==='leisure').slice(0,3);
 const go=()=>open({type:'hotel-map',hotelId:hotel.id,selectedOnly:true});
 const distance=meters=>meters<1000?Math.round(meters/50)*50+' м':(Math.round(meters/100)/10).toLocaleString('ru-RU')+' км';
 return n.jsxs('section',{className:'keys-hotel-location-section keys-hotel-location-interactive',children:[
  n.jsxs('div',{className:'keys-hotel-section-heading',children:[n.jsx('h2',{children:'Расположение'}),n.jsxs('span',{className:'keys-location-link',children:['На карте',n.jsx(D,{name:'chevron',className:'size-4'})]})]}),
  n.jsx('p',{children:hotel.address||[hotel.city,hotel.area].filter(Boolean).join(', ')}),
  n.jsx('div',{className:'keys-hotel-inline-map','aria-label':'Карта расположения '+hotel.name,children:n.jsx('div',{className:'keys-hotel-map-preview','aria-hidden':true,inert:true,children:n.jsx(E.Suspense,{fallback:n.jsx('p',{children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels:[hotel],focusId:hotel.id,selectedId:hotel.id,previewHeight:0,onSelect:()=>{},onDismiss:()=>{},dates:draft,priceTick:state.discovery.priceTick,booked:false})})})}),
  places.length>0&&n.jsxs('div',{className:'keys-location-landmarks',children:[n.jsx('dl',{children:places.map(place=>n.jsxs('div',{children:[n.jsx('dt',{children:place.name}),n.jsx('dd',{children:'≈ '+distance(place.meters)})]},place.id))})]}),
  n.jsx('button',{type:'button',className:'keys-location-hitarea','aria-label':'Открыть расположение и места рядом: '+hotel.name,onClick:go})
 ]});
}
function KeysHotelLocationMap({hotelId}) {
 const {state,back}=J(),hotel=Ie(hotelId);
 const hotels=E.useMemo(()=>[hotel],[hotel]);
 const places=E.useMemo(()=>vk(hotel),[hotel]);
 const [filter,setFilter]=E.useState('all'),[focus,setFocus]=E.useState(),[sheetHeight,setSheetHeight]=E.useState(0);
 const visiblePlaces=E.useMemo(()=>filter==='all'?places:places.filter(place=>place.category===filter),[places,filter]);
 const selectPlace=id=>setFocus({id});
 return n.jsxs('section',{className:'keys-single-hotel-map','aria-label':'Расположение отеля '+hotel.name,children:[
  n.jsx('div',{className:'keys-single-hotel-map-canvas',style:{bottom:sheetHeight},children:n.jsx(E.Suspense,{fallback:n.jsx('p',{role:'status',children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels,focusId:hotel.id,selectedId:hotel.id,pinLabel:hotel.name,previewHeight:0,onSelect:()=>{},onDismiss:()=>setFocus(undefined),dates:state.search,priceTick:state.discovery.priceTick,booked:false,nearby:places.length?{places:visiblePlaces,focus,onSelect:selectPlace,hotelPinWidth:220}:undefined})})}),
  places.length>0&&n.jsx(QV,{places,filter,onFilter:value=>{setFilter(value);setFocus(undefined)},selectedId:focus?.id,onSelect:selectPlace,onHeight:setSheetHeight}),
  n.jsxs('header',{className:'keys-single-hotel-map-header',children:[n.jsx('button',{type:'button','aria-label':'Закрыть карту',onClick:back,children:n.jsx(D,{name:'back',className:'size-5'})}),n.jsxs('div',{children:[n.jsx('h1',{children:hotel.name}),n.jsx('p',{children:hotel.address||[hotel.city,hotel.area].filter(Boolean).join(', ')})]})]})
 ]});
}
function KeysHotelAmenities({hotel}){
 const [opened,setOpened]=E.useState(false),amenities=keysHotelAmenities(hotel,Vc(hotel.id));
 const groups=[...new Set(amenities.map(item=>item.group))];
 if(!amenities.length)return null;
 return n.jsxs('section',{className:'keys-hotel-amenities',children:[
  n.jsxs('div',{className:'keys-hotel-card-heading',children:[n.jsx('h2',{children:'Удобства'}),amenities.length>4&&n.jsxs('button',{type:'button',className:'keys-hotel-inline-action','aria-label':'Все удобства','aria-haspopup':'dialog',onClick:()=>setOpened(true),children:['Все',n.jsx(D,{name:'chevron',className:'size-4'})]})]}),
  n.jsx('ul',{className:'keys-hotel-amenity-preview',children:amenities.slice(0,4).map(item=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-4'}),n.jsx('span',{children:item.label})]},item.label))}),
  opened&&n.jsx(ct,{title:'Удобства в отеле',onClose:()=>setOpened(false),children:n.jsx('div',{className:'keys-hotel-amenities-sheet',children:groups.map(group=>n.jsxs('section',{children:[n.jsx('h3',{children:group}),n.jsx('ul',{className:'keys-hotel-amenity-list',children:amenities.filter(item=>item.group===group).map(item=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-4'}),item.label]},item.label))})]},group))})})
 ]});
}
function KeysHotelCompactReviews({hotel,interactive=true}){
 const {state,open}=J(),summary=keysReviewHighlights(Zc(hotel).reviews,state.tripContext.today).all,ratingLabel=keysHotelRatingLabel(hotel.rating);
 return n.jsxs(interactive?'button':'section',{...(interactive?{type:'button',onClick:()=>open({type:'hotel-reviews',hotelId:hotel.id})}:{}),className:'keys-hotel-rating-link','aria-label':'Отзывы гостей: '+String(hotel.rating).replace('.',',')+', '+Ym(summary.count),children:[n.jsx('strong',{className:'keys-hotel-rating-number',children:String(hotel.rating).replace('.',',')}),n.jsxs('span',{className:'keys-hotel-rating-copy',children:[n.jsxs('span',{className:'keys-hotel-rating-title',children:[n.jsx('strong',{children:ratingLabel}),n.jsx('span',{children:Ym(summary.count)})]}),n.jsx('span',{children:summary.topics.length?'Гости хвалят: '+summary.topics.map(t=>t.toLowerCase()).join(', '):'Впечатления гостей об отеле'})]}),interactive&&n.jsx(D,{name:'chevron',className:'size-4'})]});
}
function KeysHotelRecommendations({hotel}){
 const {state}=J(),reasons=keysHotelReasons(hotel,state.search);
 const art={quiet:'sleep',spa:'spa',breakfast:'breakfast',beach:'sea',parking:'parking',pets:'dog',work:'work',family:'kids',pool:'pool'};
 if(!reasons.length)return null;
 return n.jsxs('section',{className:'keys-hotel-personal',children:[n.jsx('h2',{children:'Под ваши предпочтения'}),n.jsx('ul',{className:'keys-hotel-personal-tags',tabIndex:0,'aria-label':'Под ваши предпочтения — особенности отеля',children:reasons.map(reason=>n.jsxs('li',{children:[n.jsx(KeysIdeaArt,{name:art[reason.key],className:'ki-filter-art'}),n.jsx('span',{children:reason.title})]},reason.key))})]});
}
function KeysHotelDescription({hotel}){
 const details=Vl(hotel),description=details.description||hotel.description||'';
 const sentences=description.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 return description?n.jsx('p',{className:'keys-hotel-short-description',children:sentences.slice(0,2).join('').trim()}):null;
}
function keysHotelReviewTopics(reviews){
return [{id:'all',label:'Все',match:()=>true},{id:'food',label:'Еда',match:r=>/завтрак|ресторан|ужин|(?:^|\s)еда(?:\s|[.,!?]|$)|питани/i.test(r.text+' '+r.praise.join(' '))},{id:'quiet',label:'Тишина',match:r=>/тишин|тихо|шум/i.test(r.text+' '+r.praise.join(' '))},{id:'transport',label:'Транспорт',match:r=>/транспорт|автобус|такси|парков|поездом|вокзал|машин/i.test(r.text+' '+r.praise.join(' '))},{id:'rooms',label:'Номера',match:r=>/номер|кроват|чистот/i.test(r.text+' '+r.praise.join(' '))}].filter(t=>t.id==='all'||reviews.some(t.match));
}
function KeysReviewTopicFilters({reviews,value,onChange}){
 return n.jsx('div',{className:'keys-results-filters keys-review-topic-filters','aria-label':'Темы отзывов',role:'group',children:keysHotelReviewTopics(reviews).map(item=>n.jsx('button',{type:'button','aria-pressed':value===item.id,onClick:()=>onChange(item.id),children:item.label},item.id))});
}
function KeysHotelReviewCarousel({hotel}){
 const {state,open}=J(),[topic,setTopic]=E.useState('all'),track=E.useRef(null);
 const reviews=Zc(hotel).reviews.filter(review=>review.date<=state.tripContext.today).sort((a,b)=>b.date.localeCompare(a.date));
 const topics=keysHotelReviewTopics(reviews);
 const visible=reviews.filter((topics.find(t=>t.id===topic)||topics[0]).match).slice(0,6);
 const go=()=>open({type:'hotel-reviews',hotelId:hotel.id});
 const shift=step=>{const el=track.current;el?.scrollBy({left:step*(el.firstElementChild?.getBoundingClientRect().width+12||280),behavior:xY()});};
 return n.jsxs('section',{className:'keys-hotel-review-carousel','aria-label':'Отзывы гостей по темам',children:[n.jsxs('div',{className:'keys-hotel-carousel-heading',children:[n.jsx('h2',{children:'Отзывы гостей'}),n.jsxs('div',{className:'keys-hotel-carousel-actions',children:[n.jsxs('button',{type:'button',className:'keys-hotel-inline-action','aria-label':'Все отзывы',onClick:go,children:['Все',n.jsx(D,{name:'chevron',className:'size-4'})]})]})]}),
 n.jsx(KeysReviewTopicFilters,{reviews,value:topic,onChange:value=>{setTopic(value);track.current?.scrollTo({left:0});}}),
 n.jsx('div',{ref:track,className:'keys-review-carousel-track','aria-label':'Отзывы',children:visible.map(review=>n.jsxs('button',{type:'button',className:'keys-review-preview','aria-label':'Читать отзыв: '+review.author,onClick:go,children:[n.jsxs('span',{className:'keys-review-preview-heading',children:[n.jsxs('span',{children:[n.jsx('strong',{children:review.author}),n.jsx('time',{dateTime:review.date,children:new Date(review.date+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})})]}),n.jsx('span',{className:'keys-review-preview-score',children:String(review.score).replace('.',',')})]}),n.jsx('span',{className:'keys-review-preview-text',children:review.text}),n.jsx('span',{className:'keys-review-preview-tags',children:review.praise.slice(0,2).map(label=>n.jsx('span',{children:label},label))})]},review.id))}),n.jsxs('div',{className:'keys-hotel-carousel-arrows',children:[n.jsx('button',{type:'button','aria-label':'Предыдущие отзывы',onClick:()=>shift(-1),children:n.jsx(D,{name:'back',className:'size-4'})}),n.jsx('button',{type:'button','aria-label':'Следующие отзывы',onClick:()=>shift(1),children:n.jsx(D,{name:'arrow',className:'size-4'})})]})]});
}
function KeysHotelOverview({hotel,draft,minimum}) {
 const {open}=J(),stars=Number.isInteger(hotel.stars)&&hotel.stars>0&&hotel.stars<=5?hotel.stars:null;
 return n.jsxs('div',{className:'keys-hotel-overview',children:[n.jsx(KeysHotelGallery,{hotel}),n.jsxs('div',{className:'keys-hotel-sheet',children:[
  n.jsxs('section',{className:'keys-hotel-identity',children:[n.jsx('h1',{children:hotel.name}),n.jsxs('div',{className:'keys-hotel-meta',children:[n.jsxs('div',{className:'keys-hotel-category',children:[n.jsx('span',{children:hotel.accommodationType||'Отель'}),stars&&n.jsx('span',{className:'keys-hotel-category-label',children:stars+' '+(stars===1?'звезда':stars<5?'звезды':'звёзд')})]}),n.jsx('p',{className:'keys-hotel-city',children:[hotel.city,hotel.area||hotel.district].filter(Boolean).join(' · ')})]}),n.jsx(KeysHotelRecommendations,{hotel})]}),
  n.jsxs('div',{className:'keys-hotel-booking-panel',children:[n.jsx(KeysHotelCompactReviews,{hotel}),n.jsx(jY,{hotel,draft}),n.jsx('div',{className:'keys-hotel-desktop-booking-action',children:n.jsx(H,{onClick:()=>open({type:'hotel',hotelId:hotel.id,rooms:true}),children:'Выбрать номер от '+Te(minimum)})})]}),
  n.jsx(KeysHotelDescription,{hotel}),
  n.jsxs('div',{className:'keys-hotel-content',children:[n.jsx(KeysHotelLocation,{hotel,draft}),n.jsx(KeysHotelAmenities,{hotel}),n.jsx(KeysHotelReviewCarousel,{hotel})]})
 ]})]});
}

// One hotel album: large lead image, compact mosaic, persistent category filters.
function keysHotelPhotoCategory(photo){
 if(photo.type==='video')return 'Атмосфера';
 const text=(photo.category||photo.alt||'').toLowerCase();
 if(/номер|спальн|кровать|гостиная|ванн|душ|suite|room/.test(text))return 'Номера';
 if(/ресторан|завтрак|бар\b|напит|блюд|кафе|restaurant|breakfast/.test(text))return 'Ресторан';
 if(/спа|массаж|сауна|фитнес|spa/.test(text))return 'Спа';
 if(/бассейн|пляж|море|pool|beach/.test(text))return 'Бассейн и пляж';
 return 'Территория';
}
function KeysHotelPhotoAlbum({photos=[],title,startIndex=0,onClose,onPhotoView}){
 const dialog=E.useRef(null),scroll=E.useRef(null),[category,setCategory]=E.useState('Все фото'),[opened,setOpened]=E.useState(null);
 Yl(dialog,{onClose,backdrop:'rgb(28 40 65 / 45%)'});
 const categories=['Все фото',...['Номера','Ресторан','Спа','Бассейн и пляж','Территория','Атмосфера'].filter(value=>photos.some(photo=>keysHotelPhotoCategory(photo)===value))];
 const first=Math.max(0,Math.min(startIndex,photos.length-1));
 const ordered=photos.length?[photos[first],...photos.filter((_,index)=>index!==first)]:[];
 const filtered=category==='Все фото'?ordered:photos.filter(photo=>keysHotelPhotoCategory(photo)===category);
 const choose=(value,event)=>{setCategory(value);scroll.current?.scrollTo({top:0});event.currentTarget.scrollIntoView({block:'nearest',inline:'nearest',behavior:xY()});};
 const tile=(photo,index,lead=false)=>n.jsxs('button',{type:'button',className:'keys-album-tile'+(lead?' keys-album-lead':''),'aria-label':(photo.type==='video'?'Открыть видео: ':'Открыть фото: ')+(photo.alt||'Отель'),onClick:()=>setOpened(index),children:[n.jsxs('span',{className:'keys-album-image',children:[n.jsx(Ol,{src:photo.poster||photo.src,alt:photo.alt||title,loading:lead?'eager':'lazy',className:'keys-album-photo'}),photo.type==='video'&&n.jsx('span',{className:'keys-album-video',children:'Видео'})]})]},photo.src+'-'+index);
 return Fl.createPortal(n.jsxs(E.Fragment,{children:[n.jsxs('dialog',{ref:dialog,className:'keys-hotel-album motion-gallery','aria-label':'Галерея отеля · '+title,onCancel:event=>{event.preventDefault();onClose();},onKeyDown:event=>event.stopPropagation(),children:[
  n.jsxs('header',{className:'keys-album-header',children:[n.jsx('button',{type:'button',className:'keys-album-back',autoFocus:true,'aria-label':'Назад к отелю',onClick:onClose,children:n.jsx(D,{name:'back',className:'size-5'})}),n.jsx('h1',{children:title}),n.jsx('span',{className:'keys-album-total',children:photos.length+' фото'})]}),
  n.jsxs('div',{ref:scroll,className:'keys-album-scroll',children:[n.jsxs('div',{className:'keys-album-heading',children:[n.jsx('h2',{children:category==='Все фото'?'Главное':category}),n.jsx('span',{'aria-live':'polite',children:category==='Все фото'?'':filtered.length+' фото'})]}),filtered.length?n.jsxs('div',{className:'keys-album-content',children:[tile(filtered[0],0,true),n.jsx('div',{className:'keys-album-mosaic',children:filtered.slice(1).map((photo,index)=>tile(photo,index+1))})]}):n.jsx('p',{className:'keys-album-empty',children:'Фотографии скоро появятся'})]}),
  n.jsx('nav',{className:'keys-album-filters','aria-label':'Категории фотографий',children:categories.map(value=>n.jsx('button',{type:'button','aria-pressed':category===value,onClick:event=>choose(value,event),children:value},value))})]}),
  opened!==null&&n.jsx(KeysHotelPhotoViewer,{photos:filtered,title,startIndex:opened,onClose:()=>setOpened(null),onPhotoView:index=>onPhotoView?.(photos.indexOf(filtered[index]))})]}),document.body);
}

// Full reviews reuse the hotel's summary and topic filters, keeping one source of truth.
function KeysHotelReviews({hotel}){
 const {state}=J(),[topic,setTopic]=E.useState('all'),[sort,setSort]=E.useState('new'),[expanded,setExpanded]=E.useState(false);
 const reviews=Zc(hotel).reviews.filter(review=>review.date<=state.tripContext.today);
 const topics=keysHotelReviewTopics(reviews),match=(topics.find(item=>item.id===topic)||topics[0]).match;
 const filtered=qI(reviews.filter(match),'all',sort),visible=expanded?filtered:filtered.slice(0,4);
 return n.jsxs('div',{className:'keys-reviews-content',children:[
  n.jsx(KeysHotelCompactReviews,{hotel,interactive:false}),
  n.jsxs('section',{className:'keys-reviews-feed','aria-label':'Что пишут гости',children:[
   n.jsxs('div',{className:'keys-reviews-heading',children:[n.jsx('h2',{children:'Что пишут гости'}),n.jsx(St,{'aria-label':'Порядок отзывов',value:sort,onChange:value=>{setSort(value);setExpanded(false)},options:Gw,variant:'link'})]}),
   n.jsx(KeysReviewTopicFilters,{reviews,value:topic,onChange:value=>{setTopic(value);setExpanded(false)}}),
   n.jsx('ul',{className:'keys-reviews-list',children:visible.map(review=>n.jsx(KeysGuestReview,{review},review.id))}),
   !visible.length&&n.jsx('p',{className:'keys-reviews-empty',children:'По этой теме пока нет отзывов.'}),
   visible.length<filtered.length&&n.jsx(H,{variant:'secondary',className:'keys-reviews-more',onClick:()=>setExpanded(true),children:'Показать ещё '+(filtered.length-visible.length)})
  ]})
 ]});
}
function KeysGuestReview({review}){
 return n.jsxs('li',{className:'keys-guest-review',children:[
  n.jsxs('div',{className:'keys-review-preview-heading',children:[n.jsxs('span',{children:[n.jsx('strong',{children:review.author}),n.jsx('time',{dateTime:review.date,children:Al(review.date)+' · '+BI[review.party]+' · '+Xe(review.nights)})]}),n.jsx('span',{className:'keys-review-preview-score','aria-label':'Оценка '+W0(review.score),children:W0(review.score)})]}),
  n.jsx('p',{className:'keys-guest-review-text',children:review.text}),
  review.photos?.length>0&&n.jsx('div',{className:'keys-guest-review-photos',children:review.photos.map(photo=>n.jsx('img',{src:photo.src,alt:photo.alt,loading:'lazy',draggable:false},photo.src))}),
  review.reply&&n.jsxs('div',{className:'keys-guest-review-reply',children:[n.jsx('strong',{children:'Ответ отеля'}),n.jsx('p',{children:review.reply})]})
 ]});
}

function keysRoomTariffFacts(offer){
 return [
  {icon:'coffee',positive:offer.includesBreakfast===true,title:offer.includesBreakfast?'Завтрак включён':'Без питания',detail:offer.includesBreakfast?'Входит в стоимость тарифа':'Питание не входит в стоимость'},
  {icon:'shield',title:offer.freeCancellation?'Бесплатная отмена':offer.refundable?'Отмена со штрафом':'Без возврата',detail:offer.freeCancellation?'До '+offer.cancellationDeadline:offer.refundable?'Срок бесплатной отмены истёк':'При отмене деньги не вернутся',positive:offer.freeCancellation},
  {icon:'card',title:offer.requiresPrepayment?'Оплата при бронировании':'Без предоплаты',detail:offer.requiresPrepayment?'Картой или СБП':'Оплата в отеле'},
  {icon:'calendar',title:offer.changesAllowed?'Можно изменить бронь':'Без изменений',detail:offer.changesAllowed?'Даты и состав гостей':'Даты и состав гостей фиксированы'}
 ];
}
function KeysRoomOfferCard({room,offers,draft,onOpenPhotos,onChoose,onSelect}){
 const [terms,setTerms]=E.useState(null),[amenitiesOpen,setAmenitiesOpen]=E.useState(false);
 return n.jsxs('article',{id:pk(room.id),className:'keys-room-offer-card','aria-label':'Номер '+room.name,children:[
  n.jsx(RY,{photos:room.photos,area:room.area,name:room.name,onOpen:onOpenPhotos}),
  n.jsxs('div',{className:'keys-room-identity',children:[n.jsxs('div',{className:'keys-room-title-row',children:[n.jsx('h2',{children:room.name}),n.jsx('button',{type:'button',className:'keys-room-info','aria-label':'Оснащение номера '+room.name,'aria-haspopup':'dialog',onClick:()=>setAmenitiesOpen(true),children:n.jsx(D,{name:'help',className:'size-5'})})]}),n.jsxs('p',{children:[room.area!=null&&n.jsxs('span',{children:[n.jsx(D,{name:'area',className:'size-4'}),room.area+' м²']}),n.jsx('span',{children:room.description})]})]}),
  n.jsx('div',{className:'keys-room-tariff-track'+(offers.length===1?' is-single':''),role:'radiogroup','aria-label':'Тарифы номера '+room.name,children:offers.map(offer=>n.jsx(KeysRoomTariff,{offer,room,draft,onChoose:()=>onChoose(offer),onSelect:()=>onSelect(offer),onTerms:()=>setTerms(offer)},offer.id))}),
  amenitiesOpen&&n.jsx(ct,{title:'Оснащение номера',onClose:()=>setAmenitiesOpen(false),children:n.jsxs('div',{className:'keys-room-equipment',children:[n.jsx('h3',{children:room.name}),room.area!=null&&n.jsx('p',{children:'Площадь — '+room.area+' м²'}),n.jsx('ul',{children:keysRoomAmenities([room]).map(item=>n.jsxs('li',{children:[n.jsx(D,{name:'check',className:'size-4'}),item]},item))})]})}),
  terms&&n.jsx(ct,{title:'Условия тарифа',onClose:()=>setTerms(null),children:n.jsxs('div',{className:'keys-tariff-details',children:[n.jsx('h3',{children:terms.name}),n.jsx('p',{children:room.name}),n.jsx('ul',{children:[terms.includesBreakfast?'Завтрак включён в стоимость':'Питание не включено',...terms.terms].map((term,index)=>n.jsx('li',{children:term},index))})]})})
 ]});
}
function KeysRoomTariff({offer,room,draft,onChoose,onSelect,onTerms}){
 const facts=keysRoomTariffFacts(offer),radioId=E.useId(),[discountOpen,setDiscountOpen]=E.useState(false);
 return n.jsxs('div',{className:'keys-room-tariff'+(offer.selected?' is-selected':''),onClick:event=>{if(event.currentTarget.contains(event.target)&&!event.target.closest('button,input,label'))onChoose();},children:[
  n.jsxs('div',{className:'keys-tariff-title',children:[n.jsx('h3',{children:n.jsxs('label',{htmlFor:radioId,className:'keys-tariff-radio-label',children:[n.jsx('input',{id:radioId,type:'radio',name:'keys-room-tariff',checked:offer.selected,onChange:onChoose,'aria-label':'Тариф '+offer.name+' — '+room.name,className:'keys-tariff-radio'}),n.jsx('span',{children:offer.name})]})}),n.jsx('button',{type:'button',className:'keys-tariff-terms',onClick:onTerms,'aria-haspopup':'dialog','aria-label':'Условия тарифа '+offer.name+' — '+room.name,children:'Условия'})]}),
  n.jsx('div',{className:'keys-tariff-facts',children:facts.map(fact=>n.jsxs('div',{className:'keys-tariff-fact',children:[n.jsx(D,{name:fact.icon,className:'size-4'+(fact.positive?' is-included':'')}),n.jsxs('span',{children:[n.jsx('span',{className:'keys-tariff-fact-title'+(fact.positive?' is-positive':''),children:fact.title}),fact.icon==='shield'&&offer.freeCancellation&&n.jsx('span',{children:fact.detail})]})]},fact.icon))}),
  n.jsxs('div',{className:'keys-tariff-footer',children:[n.jsxs('span',{className:'keys-tariff-price',children:[n.jsx('strong',{children:Te(offer.price)}),offer.discountLabel&&n.jsx('button',{type:'button',className:'keys-result-hotel-discount keys-tariff-discount','aria-label':'Скидка '+offer.discountLabel+' по тарифу '+offer.name+' — '+room.name,'aria-haspopup':'dialog',onClick:()=>setDiscountOpen(true),children:offer.discountLabel.replace(/\s+(?=%)/,'')})]}),n.jsx(H,{onClick:onSelect,'aria-label':'Выбрать тариф '+offer.name+' — '+room.name,children:'Выбрать'})]}),
  discountOpen&&n.jsx(KeysRoomTariffDiscount,{offer,room,basePrice:Ul({...draft,room},'flexible'),onClose:()=>setDiscountOpen(false)})
 ]});
}

function KeysRoomTariffDiscount({offer,room,basePrice,onClose}){
 const savings=Math.max(0,basePrice-offer.price);
 const row=(label,value,className='')=>n.jsxs('div',{className:'keys-hotel-discount-row '+className,children:[n.jsx('span',{children:label}),n.jsx('strong',{children:value})]});
 return n.jsx(ct,{title:'Скидка по тарифу',onClose,children:n.jsxs('div',{className:'keys-hotel-discount-details',children:[
  n.jsx('p',{className:'keys-tariff-discount-context',children:room.name}),
  row('Цена по гибкому тарифу',Te(basePrice)),
  n.jsx('div',{className:'keys-hotel-discount-sources',children:row('Тариф «'+offer.name+'» · '+offer.discountLabel.replace(/\s+(?=%)/,''),'−'+Te(savings),'keys-hotel-discount-total')}),
  row('Стоимость проживания',Te(offer.price),'keys-hotel-discount-final')
 ]})});
}
