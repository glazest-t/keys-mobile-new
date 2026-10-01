// One result page: filters, an inline expandable map, and the existing hotel list.
function keysQuickFilters(current, value) {
 if(current.includes(value))return current.filter(item=>item!==value);
 const rest=value==='От 4 звёзд'?current.filter(item=>item!=='5 звёзд'):current;
 return [...rest,value];
}
function keysIsMapCollapseSwipe(start, end) {
 return !!start && start.y-end.y>40 && start.y-end.y>Math.abs(start.x-end.x)*1.2;
}
function FU() {
 const {state,dispatch,open}=J(), search=state.search, [editing,setEditing]=E.useState(false);
 const remote=tt().source==='travelline', filters=remote?Sw(search.filters):search.filters;
 const collection=keysFindCollections.find(item=>item.id===search.keysCollection);
 const popular=[{value:'С завтраком',label:'Завтрак'},{value:'С бассейном',label:'Бассейн'},{value:'Со спа',label:'Спа'},{value:'От 4 звёзд',label:'4–5 звёзд'},{value:'Бесплатная отмена',label:'Бесплатная отмена'}];
 const options=[...popular,...filters.filter(value=>!popular.some(item=>item.value===value)).map(value=>({value,label:value}))];
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('div',{className:'keys-results-sticky',children:[
  n.jsxs('div',{className:'keys-results-header',children:[
   n.jsx(cs,{onClick:()=>dispatch({type:'SEARCH_PATCH',patch:{results:false,keysMapExpanded:false,keysCollection:null}})}),
   n.jsxs('button',{type:'button',className:'keys-results-query','aria-label':'Изменить параметры поиска','aria-haspopup':'dialog',onClick:()=>setEditing(true),children:[
    n.jsxs('span',{className:'keys-results-city',children:[collection?.title||search.city||'Все отели',n.jsx(D,{name:'down',className:'size-4'})]}),
    n.jsx('span',{className:'keys-results-dates',children:(collection?(search.city||'Все направления')+' · ':'')+zt(search.arrival,search.departure)+' · '+Bm(search.party)})
   ]}),n.jsx('span',{className:'keys-results-header-spacer','aria-hidden':true})
  ]}),
  n.jsxs('div',{className:'keys-results-filters','aria-label':'Быстрые фильтры',role:'group',children:[
   n.jsxs('button',{type:'button',className:'keys-results-all-filters','aria-label':'Все фильтры','aria-haspopup':'dialog',onClick:()=>open({type:'filters'}),children:[n.jsx(D,{name:'sliders',className:'size-4'}),filters.length>0&&n.jsx('span',{className:'keys-results-filter-count',children:filters.length})]}),
   options.map(option=>n.jsx('button',{type:'button','aria-pressed':filters.includes(option.value),onClick:()=>dispatch({type:'SEARCH_PATCH',patch:{filters:keysQuickFilters(search.filters,option.value)}}),children:option.label},option.value))
  ]}),
  ]}),
  collection&&n.jsx('p',{className:'keys-collection-description',children:collection.description}),
  n.jsx(KeysResultsMap,{}),
  editing&&n.jsx(xh,{onClose:()=>setEditing(false)})
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
function KeysResultsHotelCard({hotel,local,summary,price,offer,onOpen,impressionRef}) {
 const {state,dispatch}=J();
 const saved=state.discovery.savedIds.includes(hotel.id);
 const reviews=local?Zc(local).reviews.length:null;
 const location=keysHotelLocation(state.navigation.tab==='favorites'||state.navigation.screen?.type==='saved'?(local?.city||summary?.city||''):state.search.city,local||summary);
 return n.jsxs('article',{ref:impressionRef,className:'keys-result-hotel','data-hotel-id':hotel.id,children:[
  n.jsxs('div',{className:'keys-result-hotel-photo',children:[
   n.jsx(jO,{photos:hotel.photos,name:hotel.name,onOpen}),
   n.jsx('button',{type:'button',className:'keys-result-hotel-save','aria-label':saved?'Убрать '+hotel.name+' из сохранённых':'Сохранить '+hotel.name,'aria-pressed':saved,onClick:()=>dispatch({type:'FAVORITE_TOGGLE',id:hotel.id}),children:n.jsx(D,{name:'heart',className:F('size-[18px]',saved&&'fill-current')})})
  ]}),
  n.jsxs('button',{type:'button',className:'keys-result-hotel-body','aria-label':'Подробнее об отеле '+hotel.name,onClick:onOpen,children:[
   n.jsx('span',{className:'keys-result-hotel-title',children:n.jsx('span',{className:'keys-result-hotel-name',role:'heading','aria-level':3,children:hotel.name})}),
   location&&n.jsxs('span',{className:'keys-result-hotel-location',children:[n.jsx(D,{name:'pin',className:'size-3.5'}),n.jsx('span',{children:location})]}),
   local&&n.jsxs('span',{className:'keys-result-hotel-reviews',children:[
    n.jsx('span',{className:'keys-result-hotel-rating','aria-label':'Рейтинг '+local.rating,children:String(local.rating).replace('.',',')}),
    n.jsx('span',{children:Ym(reviews)})
   ]}),
   n.jsxs('span',{className:'keys-result-hotel-price',children:[
    n.jsx('strong',{title:'Стоимость за всё проживание',children:local?(price?Te(price.total):be):n.jsx(Dz,{hotelId:hotel.id})}),
    price?.ownPrice&&n.jsxs(n.Fragment,{children:[
     n.jsx('s',{children:Te(price.usualTotal)}),
     n.jsx('span',{className:'keys-result-hotel-discount',children:'−'+eT(price.total,price.usualTotal)+'%'})
    ]})
   ]})
  ]})
 ]});
}
function KeysResultsMap() {
 const {state,dispatch,open}=J(), source=tt(), remote=source.source==='travelline';
 const hotels=E.useMemo(()=>remote?source.list.page?.items??[]:ls(state.search,state.discovery.priceTick),[remote,source.list.page,state.search,state.discovery.priceTick]);
 const expanded=!!state.search.keysMapExpanded, [selected,setSelected]=E.useState([]), [active,setActive]=E.useState(0), [previewHeight,setPreviewHeight]=E.useState(300), preview=E.useRef(null), start=E.useRef(null), dragged=E.useRef(false), section=E.useRef(null);
 const chosen=selected.map(id=>hotels.find(hotel=>hotel.id===id)).filter(Boolean);
 const selectedHotel=chosen[Math.min(active,Math.max(0,chosen.length-1))];
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
  if(!expanded)return;
  const onKey=event=>{if(event.key==='Escape'){event.stopPropagation();collapse();}};
  window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
 },[expanded]);
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
    n.jsx(E.Suspense,{fallback:n.jsx('p',{className:'keys-results-map-empty',children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels,fitPadding,selectedId:selectedHotel?.id,previewHeight:expanded&&chosen.length?previewHeight:0,onSelect:select,onDismiss:()=>setSelected([]),dates:state.search,priceTick:state.discovery.priceTick,booked:false})})
   }):n.jsx('p',{className:'keys-results-map-empty',children:source.list.status==='loading'?'Загружаем отели…':'Нет отелей по выбранным условиям'}),
   !expanded&&n.jsx('button',{type:'button',className:'keys-results-map-cover','aria-label':'Развернуть карту отелей','aria-expanded':false,'aria-controls':'keys-results-map-canvas',onClick:()=>resize(true)}),
   expanded&&selectedHotel&&n.jsxs('div',{ref:preview,className:'keys-results-map-preview','aria-label':'Выбранный отель на карте',children:[
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
  n.jsxs('button',{type:'button',className:'keys-results-map-handle','aria-label':expanded?'Свернуть карту':'Развернуть карту','aria-expanded':expanded,'aria-controls':'keys-results-map-canvas',onPointerDown:pointerDown,onPointerUp:pointerUp,onPointerCancel:()=>{start.current=null;},onClick:toggle,children:[
   n.jsx('span',{className:'keys-results-map-grip','aria-hidden':true})
  ]})
 ]});
}
