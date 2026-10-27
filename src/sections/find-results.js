// Shared selection connects map markers to the result list without changing search filters.
let keysResultsSelectionContext;
function keysResultsContext(){return keysResultsSelectionContext??=E.createContext(null);}
function useKeysDesktopList(){
 const [desktop,setDesktop]=E.useState(false);
 E.useEffect(()=>{
  const media=matchMedia('(min-width:900px)');
  const update=()=>setDesktop(document.documentElement.dataset.desktopAccount==='true'&&media.matches);
  const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});
  media.addEventListener('change',update);update();return()=>{observer.disconnect();media.removeEventListener('change',update);};
 },[]);
 return desktop;
}
function useKeysSelectedHotelScroll(list,selected,desktop){
 E.useEffect(()=>{
  if(!desktop||!selected||!list.current)return;
  const card=Array.from(list.current.querySelectorAll('[data-hotel-id]')).find(item=>item.dataset.hotelId===String(selected));
  if(!card)return;
  const container=list.current,top=card.getBoundingClientRect().top-container.getBoundingClientRect().top+container.scrollTop;
  container.scrollTo({top:Math.max(0,top-4),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 },[desktop,selected]);
}
function KeysResultsLayout({children}){
 const {state}=J(),[selected,setSelected]=E.useState(null),desktop=useKeysDesktopList(),list=E.useRef(null);
 E.useEffect(()=>setSelected(null),[state.search]);
 useKeysSelectedHotelScroll(list,selected,desktop);
 return n.jsx(keysResultsContext().Provider,{value:desktop?selected:null,children:n.jsxs(n.Fragment,{children:[children[0],n.jsxs('div',{className:'keys-results-workspace'+(desktop?' has-sidebar':''),children:[
  desktop&&n.jsx('aside',{className:'keys-results-sidebar','aria-label':'Фильтры отелей',children:n.jsx(tt().source==='travelline'?xV:vV,{inline:true})}),
  n.jsx(KeysResultsMap,{desktop,onSelectionChange:setSelected}),
  n.jsx('div',{ref:list,className:'keys-results-list','aria-label':'Отели в результатах поиска',children:children.slice(1)})
 ]})]})});
}
// One result page: filters, an inline expandable map, and the existing hotel list.
function keysQuickFilters(current, value) {
 if(current.includes(value))return current.filter(item=>item!==value);
 const rest=value==='От 4 звёзд'?current.filter(item=>item!=='5 звёзд'):current;
 return [...rest,value];
}
function keysIsMapCollapseSwipe(start, end) {
 return !!start && start.y-end.y>40 && start.y-end.y>Math.abs(start.x-end.x)*1.2;
}
function keysDistrictOptions(hotels,city){
 const normalized=(city||'').trim().toLocaleLowerCase('ru-RU');
 if(!normalized)return [];
 return [...new Set(hotels.filter(hotel=>(hotel.city||'').trim().toLocaleLowerCase('ru-RU')===normalized).map(hotel=>hotel.district||hotel.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru-RU'));
}
function keysDistrictValue(search){
 const prefix='Район: '+(search.city||'').trim()+' · ';
 return (search.filters||[]).find(value=>value.startsWith(prefix))?.slice(prefix.length)||'';
}
function keysSetDistrict(search,district){
 const filters=(search.filters||[]).filter(value=>!value.startsWith('Район: '));
 return district?[...filters,'Район: '+search.city.trim()+' · '+district]:filters;
}
function keysFilterDistrict(hotels,search){
 const district=keysDistrictValue(search);
 return district?hotels.filter(hotel=>(hotel.district||hotel.area)===district):hotels;
}
function KeysDistrictFilter({search,filters,onChange}){
 const options=keysDistrictOptions(_n,search.city);
 if(!options.length)return null;
 return n.jsxs('label',{className:'keys-district-field',children:['Район города',n.jsx(St,{'aria-label':'Район города',value:keysDistrictValue({...search,filters}),options:[{value:'',label:'Все районы'},...options.map(value=>({value,label:value}))],onChange:value=>onChange(keysSetDistrict({...search,filters},value))})]});
}
function keysSearchSortValue(value){
 return value==='rating-desc'?'stars-desc':value==='rating-asc'?'stars-asc':value||'recommended';
}
function keysSortHotels(hotels,search,priceTick=0){
 const result=[...hotels];
 search={...search,sort:keysSearchSortValue(search.sort)};
 if(['stars-desc','stars-asc'].includes(search.sort)){
  const stars=hotel=>hotel.stars!==null&&hotel.stars!==undefined&&String(hotel.stars).trim()!==''&&Number.isFinite(Number(hotel.stars))&&Number(hotel.stars)>=0&&Number(hotel.stars)<=5?Number(hotel.stars):null;
  return result.sort((a,b)=>{
   const first=stars(a),second=stars(b);
   if(first===null)return second===null?0:1;
   if(second===null)return -1;
   return search.sort==='stars-asc'?first-second:second-first;
  });
 }
 if(search.sort==='reviews-desc'){
  const score=hotel=>{
   const raw=hotel.rating;
   if(raw===null||raw===undefined||String(raw).trim()==='')return null;
   const value=Number(String(raw).replace(',','.'));
   return Number.isFinite(value)&&value>=0&&value<=5?value:null;
  };
  const counts=search.sort==='reviews-desc'?new Map(result.map(hotel=>[hotel.id,Zc(hotel).reviews.length])):null;
  return result.sort((a,b)=>{
   const first=score(a),second=score(b);
   if(first===null)return second===null?0:1;
   if(second===null)return -1;
   const difference=second-first;
   return difference||(counts?counts.get(b.id)-counts.get(a.id):0);
  });
 }
 if(search.sort==='price'||search.sort==='price-desc'){
  const prices=new Map(result.map(hotel=>[hotel.id,tx(hotel,search,priceTick).total]));
  return result.sort((a,b)=>{
   const first=prices.get(a.id),second=prices.get(b.id);
   if(!Number.isFinite(first))return Number.isFinite(second)?1:0;
   if(!Number.isFinite(second))return -1;
   return search.sort==='price-desc'?second-first:first-second;
  });
 }
 return result;
}
const keysSearchSortOptions=[
 {value:'recommended',label:'По вашим предпочтениям'},
 {value:'stars-desc',label:'Звездность отеля (от 5 до 0)'},
 {value:'stars-asc',label:'Звездность отеля (от 0 до 5)'},
 {value:'reviews-desc',label:'Лучшие по отзывам вначале'},
 {value:'price',label:'Цена (сначала низкая)'},
 {value:'price-desc',label:'Цена (сначала высокая)'}
];
function FU() {
 const {state,dispatch,open}=J(), search=state.search, [editing,setEditing]=E.useState(false),[sorting,setSorting]=E.useState(false),[districtOpen,setDistrictOpen]=E.useState(false);
 const districts=keysDistrictOptions(_n,search.city),district=keysDistrictValue(search);
 const remote=tt().source==='travelline', filters=remote?Sw(search.filters):search.filters;
 const collection=keysFindCollections.find(item=>item.id===search.keysCollection);
 const popular=[{value:'С завтраком',label:'Завтрак'},{value:'С бассейном',label:'Бассейн'},{value:'Со спа',label:'Спа'},{value:'От 4 звёзд',label:'4–5 звёзд'},{value:'Бесплатная отмена',label:'Бесплатная отмена'}];
 const options=[...popular,...filters.filter(value=>!value.startsWith('Район: ')&&!popular.some(item=>item.value===value||keysQuickFilterCanonical(item.value)===value)).map(value=>({value,label:value}))];
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('div',{className:'keys-results-sticky',children:[
  n.jsxs('div',{className:'keys-results-header',children:[
   n.jsx(cs,{onClick:()=>dispatch({type:'KEYS_SEARCH_BACK'})}),
   n.jsxs('button',{type:'button',className:'keys-results-query','aria-label':'Изменить параметры поиска','aria-haspopup':'dialog',onClick:()=>setEditing(true),children:[
    n.jsxs('span',{className:'keys-results-city',children:[n.jsx('span',{className:'keys-results-city-name',title:collection?.title||search.city||'Все отели',children:collection?.title||search.city||'Все отели'}),n.jsx(D,{name:'down',className:'size-4'})]}),
    n.jsx('span',{className:'keys-results-dates',children:(collection?(search.city||'Все направления')+' · ':'')+zt(search.arrival,search.departure)+' · '+Bm(search.party)})
   ]}),n.jsx('span',{className:'keys-results-header-spacer','aria-hidden':true})
  ]}),
  n.jsxs('div',{className:'keys-results-filters','aria-label':'Быстрые фильтры',role:'group',children:[
   n.jsxs('button',{type:'button',className:'keys-results-all-filters','aria-label':'Все фильтры','aria-haspopup':'dialog',onClick:()=>open({type:'filters'}),children:[n.jsx(D,{name:'sliders',className:'size-4'}),filters.length>0&&n.jsx('span',{className:'keys-results-filter-count',children:filters.length})]}),
   n.jsxs('button',{type:'button',className:'keys-results-sort',title:'Сортировка','aria-label':'Сортировка: '+(keysSearchSortOptions.find(option=>option.value===keysSearchSortValue(search.sort))?.label||'По вашим предпочтениям'),'aria-haspopup':'dialog','aria-pressed':!!search.sort&&search.sort!=='recommended',onClick:()=>setSorting(true),children:[n.jsx('svg',{viewBox:'0 0 24 24',width:18,height:18,fill:'none',stroke:'currentColor',strokeWidth:1.65,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,children:n.jsx('path',{d:'M8 20V4m-4 4 4-4 4 4M16 4v16m-4-4 4 4 4-4'})})]}),
   districts.length>0&&n.jsxs('button',{type:'button','aria-label':'Район города: '+(district||'Все районы'),'aria-haspopup':'dialog','aria-pressed':!!district,onClick:()=>setDistrictOpen(true),children:[district||'Район',n.jsx(D,{name:'down',className:'size-4'})]}),
   options.map(option=>n.jsx('button',{type:'button','aria-pressed':filters.includes(option.value)||filters.includes(keysQuickFilterCanonical(option.value)),onClick:()=>dispatch({type:'SEARCH_PATCH',patch:{filters:keysToggleResultsFilter(search.filters,option.value)}}),children:option.label},option.value))
  ]}),
  ]}),
  districtOpen&&n.jsx(ct,{title:'Район города',onClose:()=>setDistrictOpen(false),children:n.jsx('div',{className:'keys-sort-options',role:'group','aria-label':'Районы города '+search.city,children:['',...districts].map(value=>n.jsxs('button',{type:'button','aria-pressed':district===value,onClick:()=>{dispatch({type:'SEARCH_PATCH',patch:{filters:keysSetDistrict(search,value)}});setDistrictOpen(false);},children:[n.jsx('span',{children:value||'Все районы'}),district===value&&n.jsx(D,{name:'check',className:'size-5'})]},value))})}),
  editing&&n.jsx(xh,{onClose:()=>setEditing(false)}),
  sorting&&n.jsx(ct,{title:'Сортировка',onClose:()=>setSorting(false),children:n.jsx('div',{className:'keys-sort-options',role:'group','aria-label':'Порядок отелей',children:keysSearchSortOptions.map(option=>n.jsxs('button',{type:'button','aria-pressed':keysSearchSortValue(search.sort)===option.value,onClick:()=>{dispatch({type:'SEARCH_PATCH',patch:{sort:option.value}});setSorting(false);},children:[n.jsx('span',{children:option.label}),keysSearchSortValue(search.sort)===option.value&&n.jsx(D,{name:'check',className:'size-5'})]},option.value))})})
 ]});
}

// Search cards share the original data, pricing and navigation actions.
function keysHotelLocation(searchCity, hotel = {}) {
 const city=searchCity?.trim()||hotel.city||'';
 const valid=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
 const seaside=hotel.isSeasideCity??(['сочи','адлер','сириус','анапа','геленджик','ялта','алушта','туапсе'].includes((hotel.city||city).toLocaleLowerCase('ru-RU'))||valid(hotel.seaDistance));
 const meters=seaside?hotel.seaDistance:hotel.centerDistance;
 // Missing catalogue distances must not become zero or a made-up estimate.
 if(!valid(meters))return city;
 const distance=meters<1000?meters.toLocaleString('ru-RU')+' м':(meters/1000).toLocaleString('ru-RU',{maximumFractionDigits:1})+' км';
 return [city,distance+(seaside?' до моря':' до центра')].filter(Boolean).join(' · ');
}
function KeysResultsHotelCard({hotel,local,summary,price,offer,onOpen,impressionRef,locationCity}) {
 const {state,dispatch}=J();
 const selected=E.useContext(keysResultsContext())===hotel.id;
 const [discountOpen,setDiscountOpen]=E.useState(false);
 const missingLoyalty=!!state.keysHotelLoyaltyMissing;
 const possibleHotelLoyalty=missingLoyalty&&!state.keysConnectedHotelCards?.[hotel.id];
 const priceDetails=!!price&&(missingLoyalty||!!price.friendlyRate||!!price.goldDiscount||!!price.registrationDiscount);
 const saved=state.discovery.savedIds.includes(hotel.id);
 const reviews=local?Zc(local).reviews.length:null;
 const location=keysHotelLocation(locationCity??(state.navigation.tab==='favorites'||state.navigation.screen?.type==='saved'?(local?.city||summary?.city||''):state.search.city),local||summary);
 return n.jsxs('article',{ref:impressionRef,className:'keys-result-hotel'+(selected?' is-map-selected':''),'aria-label':selected?hotel.name+' — выбран на карте':undefined,'data-hotel-id':hotel.id,children:[
  n.jsx('div',{className:'keys-result-hotel-photo',children:n.jsx(jO,{photos:hotel.photos,name:hotel.name,onOpen})}),
  n.jsx('button',{type:'button',className:'keys-result-hotel-save','aria-label':saved?'Убрать '+hotel.name+' из сохранённых':'Сохранить '+hotel.name,'aria-pressed':saved,onClick:()=>dispatch({type:'FAVORITE_TOGGLE',id:hotel.id}),children:n.jsx(D,{name:'heart',className:F('size-[18px]',saved&&'fill-current')})}),
  n.jsxs(priceDetails?'div':'button',{type:priceDetails?undefined:'button',className:'keys-result-hotel-body'+(priceDetails?' has-gold-price':''),'aria-label':priceDetails?undefined:'Подробнее об отеле '+hotel.name,onClick:priceDetails?undefined:onOpen,children:[
   priceDetails&&n.jsx('button',{type:'button',className:'keys-result-hotel-open','aria-label':'Подробнее об отеле '+hotel.name,onClick:onOpen}),
   n.jsx('span',{className:'keys-result-hotel-title',children:n.jsx('span',{className:'keys-result-hotel-name',role:'heading','aria-level':3,children:hotel.name})}),
   location&&n.jsxs('span',{className:'keys-result-hotel-location',children:[n.jsx(D,{name:'pin',className:'size-3.5'}),n.jsx('span',{children:location})]}),
   local&&n.jsxs('span',{className:'keys-result-hotel-reviews',children:[
    n.jsx('span',{className:'keys-result-hotel-rating','aria-label':'Рейтинг '+local.rating,children:String(local.rating).replace('.',',')}),
    n.jsx('span',{children:Ym(reviews)})
   ]}),
   n.jsxs(priceDetails?'button':'span',{type:priceDetails?'button':undefined,className:'keys-result-hotel-price','aria-label':priceDetails?(price.registrationDiscount?'Цена после регистрации ':price.friendlyRate?'Цена Friendly Rate ':price.goldDiscount?'Цена Gold ':'Цена ')+Te(price.total)+' — детали скидки':undefined,'aria-haspopup':priceDetails?'dialog':undefined,onClick:priceDetails?()=>setDiscountOpen(true):undefined,children:[
    n.jsx('strong',{title:'Стоимость за всё проживание',children:local?(price?Te(price.total):be):n.jsx(Dz,{hotelId:hotel.id})}),
    price?.ownPrice&&n.jsxs(n.Fragment,{children:[
     n.jsx('s',{children:Te(price.usualTotal)}),
     n.jsx('span',{className:'keys-result-hotel-discount',children:'−'+eT(price.total,price.usualTotal)+'%'})
    ]}),
    price?.registrationDiscount>0&&n.jsx('span',{className:'keys-registration-price-caption',children:'После регистрации'}),
    missingLoyalty&&priceDetails&&n.jsxs('span',{className:'keys-result-price-details',children:['О цене',n.jsx(D,{name:'chevron',className:'size-3'})]})
   ]})
  ]}),
  discountOpen&&n.jsx(KeysHotelDiscount,{price:{...price,hotelId:hotel.id,possibleHotelLoyalty},onClose:()=>setDiscountOpen(false)})
 ]});
}
function KeysResultsMap({desktop=false,onSelectionChange=()=>{}}) {
 const {state,dispatch,open}=J(), source=tt(), remote=source.source==='travelline';
 const hotels=E.useMemo(()=>remote?source.list.page?.items??[]:ls(state.search,state.discovery.priceTick),[remote,source.list.page,state.search,state.discovery.priceTick]);
 const expanded=desktop||!!state.search.keysMapExpanded, [selected,setSelected]=E.useState([]), [active,setActive]=E.useState(0), [previewHeight,setPreviewHeight]=E.useState(300), preview=E.useRef(null), start=E.useRef(null), dragged=E.useRef(false), section=E.useRef(null);
 const chosen=selected.map(id=>hotels.find(hotel=>hotel.id===id)).filter(Boolean);
 const selectedHotel=chosen[Math.min(active,Math.max(0,chosen.length-1))];
 E.useEffect(()=>{onSelectionChange(selectedHotel?.id??null);},[selectedHotel?.id]);
 E.useEffect(()=>{setSelected([]);setActive(0);},[state.search]);
 E.useEffect(()=>{
  if(!preview.current)return;
  const measure=()=>setPreviewHeight(Math.ceil(preview.current?.getBoundingClientRect().height||0));
  const observer=new ResizeObserver(measure);observer.observe(preview.current);measure();
  return()=>observer.disconnect();
 },[expanded,selectedHotel?.id]);
 const fitPadding=E.useMemo(()=>({topLeft:[48,28],bottomRight:[64,28],fitAll:true,compact:!expanded,maxZoom:expanded?12:10}),[expanded]);
 const resize=value=>dispatch({type:'SEARCH_PATCH',patch:{keysMapExpanded:value}});
 const collapse=()=>resize(false);
 E.useEffect(()=>{
  if(!expanded||desktop)return;
  const onKey=event=>{if(event.key==='Escape'){event.stopPropagation();collapse();}};
  window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
 },[expanded,desktop]);
 const select=ids=>{setActive(0);setSelected(Array.isArray(ids)?ids:[ids]);};
 const pointerDown=event=>{start.current={x:event.clientX,y:event.clientY};dragged.current=false;event.currentTarget.setPointerCapture?.(event.pointerId);};
 const pointerUp=event=>{
  const shouldCollapse=keysIsMapCollapseSwipe(start.current,{x:event.clientX,y:event.clientY});
  start.current=null;if(shouldCollapse&&expanded){dragged.current=true;collapse();}
 };
 const toggle=()=>{if(dragged.current){dragged.current=false;return;}resize(!expanded);};
 return n.jsxs('section',{ref:section,className:'keys-results-map'+(expanded?' is-expanded':''),'aria-label':'Карта результатов поиска',children:[
  n.jsxs('div',{id:'keys-results-map-canvas',className:'keys-results-map-canvas',children:[
   hotels.length>0?n.jsx('div',{className:'keys-results-map-layer',inert:expanded?undefined:true,children:remote?
    n.jsx(GV,{hotels,selectedId:selectedHotel?.id,onSelect:select,className:'h-full w-full'}):
    n.jsx(E.Suspense,{fallback:n.jsx('p',{className:'keys-results-map-empty',children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels,fitPadding,selectedId:selectedHotel?.id,previewHeight:!desktop&&expanded&&chosen.length?previewHeight:0,onSelect:select,onDismiss:()=>setSelected([]),dates:state.search,priceTick:state.discovery.priceTick,booked:false})})
   }):n.jsx('p',{className:'keys-results-map-empty',children:source.list.status==='loading'?'Загружаем отели…':'Нет отелей по выбранным условиям'}),
   !expanded&&n.jsx('button',{type:'button',className:'keys-results-map-cover','aria-label':'Развернуть карту отелей','aria-expanded':false,'aria-controls':'keys-results-map-canvas',onClick:()=>resize(true)}),
   !desktop&&expanded&&selectedHotel&&n.jsxs('div',{ref:preview,className:'keys-results-map-preview','aria-label':'Выбранный отель на карте',children:[
    n.jsxs('div',{className:'keys-results-map-preview-toolbar',children:[
     chosen.length>1?n.jsxs('div',{className:'keys-results-map-pager',children:[
      n.jsx('button',{type:'button','aria-label':'Предыдущий отель на карте',disabled:active===0,onClick:()=>setActive(index=>Math.max(0,index-1)),children:n.jsx(D,{name:'chevron',className:'size-4 keys-results-map-prev'})}),
      n.jsx('span',{'aria-live':'polite',children:(Math.min(active,chosen.length-1)+1)+' из '+chosen.length}),
      n.jsx('button',{type:'button','aria-label':'Следующий отель на карте',disabled:active>=chosen.length-1,onClick:()=>setActive(index=>Math.min(chosen.length-1,index+1)),children:n.jsx(D,{name:'chevron',className:'size-4'})})
     ]}):n.jsx('span',{}),
     n.jsx('button',{type:'button',className:'keys-results-map-dismiss','aria-label':'Скрыть карточку отеля',onClick:()=>setSelected([]),children:n.jsx(D,{name:'close',className:'size-4'})})
    ]}),
    n.jsx(jx,{hotelId:selectedHotel.id,summary:remote?selectedHotel:undefined},selectedHotel.id)
   ]})
  ]}),
  !desktop&&n.jsxs('button',{type:'button',className:'keys-results-map-handle','aria-label':expanded?'Свернуть карту':'Развернуть карту','aria-expanded':expanded,'aria-controls':'keys-results-map-canvas',onPointerDown:pointerDown,onPointerUp:pointerUp,onPointerCancel:()=>{start.current=null;},onClick:toggle,children:[
   n.jsx('span',{className:'keys-results-map-grip','aria-hidden':true})
  ]})
 ]});
}

function keysNightlyPriceRange(filters){
 const raw=(filters||[]).find(value=>/^(?:От|До) [\d\s]+(?: до [\d\s]+)? ₽\/ночь$/.test(value));
 if(!raw)return {min:null,max:null};
 const values=raw.match(/\d[\d\s]*/g).map(value=>Number(value.replace(/\s/g,'')));
 return raw.startsWith('До ')?{min:null,max:values[0]}:{min:values[0],max:values[1]??null};
}
function keysSetNightlyPrice(filters,min,max){
 const rest=filters.filter(value=>!/^(?:От|До) [\d\s]+(?: до [\d\s]+)? ₽\/ночь$/.test(value));
 const format=value=>Number(value).toLocaleString('ru-RU');
 const hasMin=min!==null&&min!=='',hasMax=max!==null&&max!=='';
 if(!hasMin&&!hasMax)return rest;
 return [...rest,(hasMin?'От '+format(min)+(hasMax?' до '+format(max):''):'До '+format(max))+' ₽/ночь'];
}
function keysNightlyPriceMatches(price,filters){
 const {min,max}=keysNightlyPriceRange(filters);
 if(min===null&&max===null)return true;
 return Number.isFinite(price)&&(min===null||price>=min)&&(max===null||price<=max);
}
function keysNightlySliderBounds(filters){
 const {min,max}=keysNightlyPriceRange(filters);
 const limit=Math.max(30000,Math.ceil(Math.max(min||0,max||0)/10000)*10000);
 return {low:min??0,high:max??limit,limit};
}
function keysMoveNightlySlider(filters,edge,value,limit){
 const {low,high}=keysNightlySliderBounds(filters);
 const next=Math.max(0,Math.min(limit,Number(value)||0));
 return edge==='min'
  ?keysSetNightlyPrice(filters,Math.min(next,high)||null,high===limit?null:high)
  :keysSetNightlyPrice(filters,low||null,Math.max(next,low)===limit?null:Math.max(next,low));
}
function keysStayPriceRange(filters){
 const raw=(filters||[]).find(value=>/^(?:От|До) [\d\s]+(?: до [\d\s]+)? ₽ за проживание$/.test(value));
 if(!raw)return {min:null,max:null};
 const values=raw.match(/\d[\d\s]*/g).map(value=>Number(value.replace(/\s/g,'')));
 return raw.startsWith('До ')?{min:null,max:values[0]}:{min:values[0],max:values[1]??null};
}
function keysSetStayPrice(filters,min,max){
 const rest=filters.filter(value=>!/^(?:От|До) [\d\s]+(?: до [\d\s]+)? ₽ за проживание$/.test(value));
 const format=value=>Number(value).toLocaleString('ru-RU');
 const hasMin=min!==null&&min!=='',hasMax=max!==null&&max!=='';
 if(!hasMin&&!hasMax)return rest;
 return [...rest,(hasMin?'От '+format(min)+(hasMax?' до '+format(max):''):'До '+format(max))+' ₽ за проживание'];
}
function keysStayPriceMatches(price,filters){
 const {min,max}=keysStayPriceRange(filters);
 if(min===null&&max===null)return true;
 return Number.isFinite(price)&&(min===null||price>=min)&&(max===null||price<=max);
}
function keysStaySliderBounds(filters){
 const {min,max}=keysStayPriceRange(filters);
 const limit=Math.max(100000,Math.ceil(Math.max(min||0,max||0)/10000)*10000);
 return {low:min??0,high:max??limit,limit};
}
function keysMoveStaySlider(filters,edge,value,limit){
 const {low,high}=keysStaySliderBounds(filters);
 const next=Math.max(0,Math.min(limit,Number(value)||0));
 return edge==='min'
  ?keysSetStayPrice(filters,Math.min(next,high)||null,high===limit?null:high)
  :keysSetStayPrice(filters,low||null,Math.max(next,low)===limit?null:Math.max(next,low));
}
function keysPricePeriodTitle(nights,perNight=false){
 if(perNight)return 'Цена за ночь';
 const count=Math.max(1,Math.round(Number(nights)||1)),last=count%10,teen=count%100;
 return 'Цена за '+count+' '+(last===1&&teen!==11?'день':last>=2&&last<=4&&(teen<12||teen>14)?'дня':'дней');
}
function keysConvertPricePeriod(filters,perNight,nights){
 const count=Math.max(1,Number(nights)||1),range=(perNight?keysStayPriceRange:keysNightlyPriceRange)(filters);
 const rest=keysSetStayPrice(keysSetNightlyPrice(filters,null,null),null,null);
 const convert=value=>value===null?null:Math.round(perNight?value/count:value*count);
 return (perNight?keysSetNightlyPrice:keysSetStayPrice)(rest,convert(range.min),convert(range.max));
}
function KeysStayPriceFilter({filters,onChange,compact=false,perNight=false,nights=1,onPeriodChange}){
 const range=perNight?keysNightlyPriceRange:keysStayPriceRange,setRange=perNight?keysSetNightlyPrice:keysSetStayPrice,moveSlider=perNight?keysMoveNightlySlider:keysMoveStaySlider;
 const title=keysPricePeriodTitle(nights,perNight);
 const {min,max}=range(filters),invalid=min!==null&&max!==null&&min>max;
 const errorId=E.useId(),{low,high,limit}=(perNight?keysNightlySliderBounds:keysStaySliderBounds)(filters);
 const field=(label,value,key)=>n.jsxs('label',{className:'keys-price-bound',children:[
  n.jsxs('span',{className:'keys-price-bound-control',children:[n.jsx('span',{className:'keys-price-bound-prefix','aria-hidden':true,children:label}),n.jsx('input',{type:'text',inputMode:'numeric',autoComplete:'off','aria-label':title+' '+label.toLowerCase(),value:value??'',placeholder:key==='min'?'0':compact?'∞':'Без лимита',maxLength:9,'aria-invalid':invalid,'aria-describedby':invalid?errorId:undefined,onChange:event=>{const clean=event.target.value.replace(/[^0-9]/g,'');onChange(setRange(filters,key==='min'?clean:min,key==='max'?clean:max));}}),n.jsx('span',{'aria-hidden':true,children:'₽'})]})
 ]});
 return n.jsxs('fieldset',{className:'keys-nightly-price',children:[
  n.jsxs('legend',{className:'keys-price-heading',children:[n.jsx('span',{children:title}),n.jsxs('button',{type:'button',role:'switch',className:'keys-price-period-switch','aria-label':'За ночь','aria-checked':perNight,onClick:()=>onPeriodChange?.(!perNight),children:[n.jsx('span',{children:'За ночь'}),n.jsx('span',{className:'keys-price-period-track','aria-hidden':true})]})]}),
  n.jsxs('div',{className:'keys-nightly-slider',children:[
   n.jsxs('div',{className:'ki-budget-slider',style:{'--range-from':(low/limit*100)+'%','--range-to':(high/limit*100)+'%'},children:[
    n.jsx('div',{className:'ki-budget-track','aria-hidden':true}),
    ...['min','max'].map(edge=>n.jsx('input',{type:'range',min:0,max:limit,step:100,value:edge==='min'?low:high,'aria-label':(edge==='min'?'Минимальная ':'Максимальная ')+title.toLowerCase(),'aria-valuetext':edge==='max'&&high===limit?'Без ограничения':(edge==='min'?low:high).toLocaleString('ru-RU')+' рублей',onChange:event=>onChange(moveSlider(filters,edge,event.target.value,limit))},edge))
   ]}),
  ]}),
  n.jsxs('div',{className:'keys-price-bounds',children:[field('От',min,'min'),field('До',max,'max')]}),
  invalid&&n.jsx('p',{id:errorId,role:'alert',className:'keys-price-range-error',children:'Цена «До» должна быть не меньше цены «От».'}),

 ]});
}

// The local prototype uses explicit catalogue facets; unsupported types/chains return no matches.
const keysHotelFilterGroups=[
 {id:'type',title:'Тип размещения',any:true,options:['Гостиница','Квартира','Апарт-отель','Гостевой дом','Хостел','Загородный дом','База отдыха','Санаторий']},
 {id:'benefits',title:'Бонусы и скидки',any:true,options:['Горячие скидки','Программа лояльности отеля','Программа лояльности «Ключи»']},
 {id:'stars',title:'Звездность отеля',filterKey:'Звёздность объекта',any:true,options:['Без звёзд','1 звезда','2 звезды','3 звезды','4 звезды','5 звёзд']},
 {id:'chain',title:'Сеть отеля',any:true,options:['ibis','Cosmos Hotel Group','Hyatt','Novotel','Mercure','AZIMUT Hotels','Грейс','Alean Collection','Marriott','Rixos','Mövenpick','Pullman','Swissôtel','Mantera']},
 {id:'meals',title:'Питание',any:true,options:['Завтрак включён','Собственная кухня','Завтрак и ужин включены','Полный пансион','Всё включено','Без питания']},
 {id:'bed',title:'Выбор кровати',any:true,options:['Две односпальные','Одна двуспальная']},
 {id:'rooms',title:'Комнаты и кровати',counters:['Спальни','Кровати','Ванные комнаты']},
 {id:'suitable',title:'Возможности бронирования',options:['Можно с питомцем','Можно с детьми','Доступная среда','Можно курить']},
 {id:'parking',title:'Парковка',options:['Есть парковка','Бесплатная парковка']},
 {id:'general',title:'Общие удобства',options:['Бассейн','Wi-Fi','Круглосуточная стойка регистрации','Камера хранения','Лифт','Ресторан','Спа','Фитнес-центр']},
 {id:'room',title:'Удобства в номере',options:['Ванная комната в номере','Балкон','Телевизор','Кофемашина','Кондиционер','Холодильник','Стиральная машина','Сейф']},
 {id:'payment',title:'Оплата',options:['Бесплатная отмена','Оплата картой','Оплата на месте']}
];
function keysHotelFilterValue(group,label){return (group.filterKey||group.title)+': '+label;}
function keysHotelFilterCounter(filters,label){return Number(filters.find(v=>v.startsWith(label+': '))?.split(': ')[1])||0;}
function keysSetHotelFilterCounter(filters,label,value){
 const rest=filters.filter(v=>!v.startsWith(label+': ')),count=Math.max(0,Math.min(10,Math.round(Number(value)||0)));
 return count?[...rest,label+': '+count]:rest;
}
const keysFilterAliases={'Завтрак включён':'С завтраком','Бассейн':'С бассейном','Спа':'Со спа','Можно с питомцем':'С питомцем','Можно с детьми':'С детьми','Бесплатная отмена':'Бесплатная отмена','Горячие скидки':'Спецпредложения'};
function keysNormalizeHotelFilters(filters,search){
 if(search&&!search.keysPricePerNight&&filters.some(value=>/₽\/ночь$/.test(value))){
  const {min,max}=keysNightlyPriceRange(filters),nights=Math.max(1,Ge(search.arrival,search.departure));
  filters=keysSetStayPrice(filters.filter(value=>!/₽\/ночь$/.test(value)),min===null?null:min*nights,max===null?null:max*nights);
 }
 const next=filters.flatMap(value=>{
  if(value==='От 4 звёзд')return ['Звёздность объекта: 4 звезды','Звёздность объекта: 5 звёзд'];
  if(value==='5 звёзд')return ['Звёздность объекта: 5 звёзд'];
  for(const group of keysHotelFilterGroups)for(const label of group.options||[])if(keysFilterAliases[label]===value)return [keysHotelFilterValue(group,label)];
  return [value];
 });
 return [...new Set(next)];
}
function keysFilterSelected(filters,group,label){return filters.includes(keysHotelFilterValue(group,label))||!!keysFilterAliases[label]&&filters.includes(keysFilterAliases[label]);}
function keysToggleHotelFilter(filters,group,label){
 const selected=keysFilterSelected(filters,group,label);
 const rest=filters.filter(v=>v!==keysHotelFilterValue(group,label)&&v!==keysFilterAliases[label]&&(group.id!=='stars'||!['От 4 звёзд','5 звёзд'].includes(v)));
 return selected?rest:[...rest,keysHotelFilterValue(group,label)];
}
// Sample additional inventory for demonstrating the new filters, not a live hotel feed.
const keysHotelDemoFacets={
 'more':{bedrooms:2,beds:3,bathrooms:2,suitable:['Можно с питомцем','Можно с детьми','Доступная среда'],room:['Ванная комната в номере','Балкон','Телевизор','Кофемашина','Кондиционер','Холодильник','Сейф']},
 'wave':{meals:['Завтрак включён','Завтрак и ужин включены','Полный пансион','Всё включено'],parking:['Есть парковка','Бесплатная парковка']},
 'quiet-coast':{room:['Ванная комната в номере','Балкон','Телевизор','Кондиционер','Холодильник','Сейф']},
 'park':{bedrooms:2,beds:3,bathrooms:1,parking:['Есть парковка','Бесплатная парковка']},
 'south':{bedrooms:3,beds:4,bathrooms:2,room:['Ванная комната в номере','Балкон','Телевизор','Кофемашина','Кондиционер','Холодильник','Сейф']}
};
function keysHotelFilterFacts(hotel){
 const name=hotel.name||'',facets=hotel.filterFacets||{};
 const chain=[['Cosmos Hotel Group',/cosmos/i],['Грейс',/грейс/i],['Alean Collection',/alean/i],['Marriott',/marriott|марриотт/i],...['ibis','Hyatt','Novotel','Mercure','AZIMUT Hotels','Rixos','Mövenpick','Pullman','Swissôtel','Mantera'].map(v=>[v,new RegExp(v.split(' ')[0],'i')])].find(([,pattern])=>pattern.test(name))?.[0]||'';
 // Additional amenities are demo catalogue data, not live availability or verified hotel policies.
 return {type:'Гостиница',chain,bed:['Две односпальные','Одна двуспальная'],bedrooms:1,beds:2,bathrooms:1,
  meals:hotel.breakfast?['Завтрак включён']:['Без питания'],
  benefits:[...(hotel.offer?['Горячие скидки']:[]),...(chain?['Программа лояльности отеля']:[]),'Программа лояльности «Ключи»'],
  suitable:[...(hotel.pets?['Можно с питомцем']:[]),...(hotel.family?['Можно с детьми']:[]),...(hotel.smokingAllowed===true?['Можно курить']:[])],
  parking:hotel.parking?['Есть парковка']:[],
  general:['Wi-Fi','Круглосуточная стойка регистрации','Камера хранения',...(hotel.stars>=3?['Лифт']:[]),...(hotel.pool?['Бассейн']:[]),...(hotel.spa?['Спа']:[]),...(hotel.stars>=4?['Ресторан','Фитнес-центр']:[])],
  room:['Ванная комната в номере','Телевизор','Кондиционер',...(hotel.stars>=4?['Холодильник','Сейф']:[])],
  payment:['Оплата картой','Оплата на месте',...(hotel.freeCancellation?['Бесплатная отмена']:[])],...(keysHotelDemoFacets[hotel.id]||{}),...facets};
}
function keysHotelFiltersMatch(hotel,filters){
 const facts=keysHotelFilterFacts(hotel);
 for(const group of keysHotelFilterGroups){
  if(group.counters){
   if(['bedrooms','beds','bathrooms'].some((key,i)=>(Number(facts[key])||0)<keysHotelFilterCounter(filters,group.counters[i])))return false;
   continue;
  }
  const selected=group.options.filter(label=>filters.includes(keysHotelFilterValue(group,label)));
  if(!selected.length)continue;
  const match=label=>group.id==='stars'?Number(hotel.stars)===(label==='Без звёзд'?0:Number(label[0])):Array.isArray(facts[group.id])?facts[group.id].includes(label):facts[group.id]===label;
  if(!(group.any?selected.some(match):selected.every(match)))return false;
 }
 return true;
}
function KeysHotelFilters({inline=false}){
 const {state,dispatch,back}=J(),[draft,setDraft]=E.useState(()=>keysNormalizeHotelFilters(state.search.filters,state.search)),[draftPerNight,setDraftPerNight]=E.useState(!!state.search.keysPricePerNight);
 const liveFilters=E.useMemo(()=>keysNormalizeHotelFilters(state.search.filters,state.search),[state.search]);
 const filters=inline?liveFilters:draft,perNight=inline?!!state.search.keysPricePerNight:draftPerNight,nights=Math.max(1,Ge(state.search.arrival,state.search.departure)||1);
 const change=values=>inline?dispatch({type:'SEARCH_PATCH',patch:{filters:values}}):setDraft(values);
 const changePeriod=value=>{const next=keysConvertPricePeriod(filters,value,nights);if(inline)dispatch({type:'SEARCH_PATCH',patch:{filters:next,keysPricePerNight:value}});else{setDraft(next);setDraftPerNight(value);}};
 const reset=()=>{if(inline)dispatch({type:'SEARCH_PATCH',patch:{filters:[],keysPricePerNight:false}});else{setDraft([]);setDraftPerNight(false);}};
 const {min,max}=(perNight?keysNightlyPriceRange:keysStayPriceRange)(filters),invalid=min!==null&&max!==null&&min>max;
 const count=E.useMemo(()=>invalid?0:ls({...state.search,filters},state.discovery.priceTick).length,[state.search,filters,state.discovery.priceTick,invalid]);
 const selectedCount=group=>group.counters?group.counters.filter(label=>keysHotelFilterCounter(filters,label)>0).length:group.options.filter(label=>keysFilterSelected(filters,group,label)).length;
 return n.jsxs('div',{className:'keys-hotel-filters'+(inline?' is-inline':''),children:[
  n.jsxs('header',{className:'keys-new-filter-heading',children:[!inline&&n.jsx(cs,{onClick:back}),n.jsx(inline?'h2':'h1',{children:'Фильтры'}),n.jsx('button',{type:'button',className:'keys-filter-reset',disabled:!filters.length&&!perNight,onClick:reset,children:'Сбросить'})]}),
  n.jsxs('form',{className:'keys-filter-form keys-new-filter-form',onSubmit:event=>{event.preventDefault();if(invalid)return;dispatch({type:'SEARCH_PATCH',patch:{filters,results:true,keysPricePerNight:perNight}});if(!inline)back();},children:[
   n.jsx('section',{'data-filter-section':'price',className:'keys-filter-price-section',children:n.jsx(KeysStayPriceFilter,{filters,onChange:change,compact:inline,perNight,nights,onPeriodChange:changePeriod})}),
   ...keysHotelFilterGroups.map(group=>n.jsxs('details',{open:true,'data-filter-section':group.id,className:'keys-filter-section',children:[
    n.jsxs('summary',{children:[n.jsx('span',{children:group.title}),!group.counters&&selectedCount(group)>0&&n.jsx('span',{className:'keys-filter-section-count',children:selectedCount(group)}),n.jsx(D,{name:'down',className:'size-4'})]}),
    group.counters?n.jsx('div',{className:'keys-filter-counters',children:group.counters.map(label=>{
     const value=keysHotelFilterCounter(filters,label);return n.jsxs('div',{className:'keys-filter-counter',children:[n.jsx('span',{children:label}),n.jsxs('div',{children:[n.jsx('button',{type:'button',disabled:value===0,'aria-label':'Уменьшить: '+label,onClick:()=>change(keysSetHotelFilterCounter(filters,label,value-1)),children:'−'}),n.jsx('output',{'aria-live':'polite','aria-label':label,children:value||'Любое'}),n.jsx('button',{type:'button',disabled:value===10,'aria-label':'Увеличить: '+label,onClick:()=>change(keysSetHotelFilterCounter(filters,label,value+1)),children:'+'})]})]},label);
    })}):n.jsx('div',{className:'keys-filter-choices'+(group.id==='stars'?' is-stars':''),children:group.options.map(label=>n.jsx('button',{type:'button',className:'keys-filter-choice','aria-pressed':keysFilterSelected(filters,group,label),onClick:()=>change(keysToggleHotelFilter(filters,group,label)),children:label},label))}),
   ]},group.id)),
   !inline&&n.jsxs('div',{className:'keys-filter-footer keys-new-filter-footer',children:[!invalid&&count===0&&n.jsx('span',{className:'keys-filter-result-count','aria-live':'polite',children:'Нет вариантов. Попробуйте изменить фильтры'}),n.jsx(H,{type:'submit',disabled:invalid,children:count?'Показать отели · '+count:'Показать результаты'})]})
  ]})
 ]});
}

function keysQuickFilterCanonical(value){
 for(const group of keysHotelFilterGroups)for(const label of group.options||[])if(keysFilterAliases[label]===value)return keysHotelFilterValue(group,label);
 return value;
}
function keysToggleResultsFilter(filters,value){
 const canonical=keysQuickFilterCanonical(value);
 if(canonical!==value)return filters.includes(canonical)||filters.includes(value)?filters.filter(v=>v!==canonical&&v!==value):[...filters,canonical];
 if(value==='От 4 звёзд'){
  const selected=filters.includes(value)||['Звёздность объекта: 4 звезды','Звёздность объекта: 5 звёзд'].every(v=>filters.includes(v));
  const rest=filters.filter(v=>v!==value&&v!=='5 звёзд'&&!v.startsWith('Звёздность объекта: '));
  return selected?rest:[...rest,'Звёздность объекта: 4 звезды','Звёздность объекта: 5 звёзд'];
 }
 return keysQuickFilters(filters,value);
}
