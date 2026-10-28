// One inbox for both test variants. A hotel route stays scoped when changing type tags.
function EV(){
 const {user,openLogin}=yt(),{state,open}=J(),resource=Qg(),api=Gn(),delivered=keysUseSystemInbox();
 const model=window.KeysNotificationModel,scopedHotel=state.navigation.screen?.hotelId||null;
 const [category,setCategory]=E.useState('all'),[hotel,setHotel]=E.useState(null),[busy,setBusy]=E.useState(false),[error,setError]=E.useState('');
 const [extra,setExtra]=E.useState([]),[cursor,setCursor]=E.useState(undefined);
 E.useEffect(()=>{setHotel(null);setCategory('all');},[scopedHotel]);
 const [desktop,setDesktop]=E.useState(()=>document.documentElement.dataset.desktopAccount==='true');
 E.useEffect(()=>{const sync=()=>setDesktop(document.documentElement.dataset.desktopAccount==='true');const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});sync();return()=>observer.disconnect();},[]);
 const page=resource?.page;
 const items=[...(page?.items||[]),...extra.filter(item=>!page?.items.some(other=>other.id===item.id))].map(model.legacy).concat(delivered.flatMap(entry=>{
  const type=model.get(entry.id);return type?[{...type,id:'push-'+entry.id,pushId:entry.id,createdAt:entry.receivedAt,readAt:entry.readAt}]:[];
 }));
 const hotels=model.group(model.select(items)).filter(group=>group.id!=='keys');
 const visible=model.select(items,{category,hotelId:scopedHotel||hotel}),groups=model.group(visible);
 const next=cursor===undefined?page?.nextCursor:cursor;
 const run=async task=>{if(busy)return;setBusy(true);setError('');try{await task();}catch(e){setError(Ot(e));}finally{setBusy(false);}};
 const read=async item=>{if(item.pushId)window.KeysSystemInbox.markRead(item.pushId);else await api('notifications/'+item.id+'/read','POST');};
 const readAllButton=(id,name)=>{
  const hotelItems=id?items.filter(item=>(item.hotelId||'keys')===id):visible;const readIds=new Set(hotelItems.map(item=>item.id));
  return hotelItems.some(item=>!item.readAt)&&n.jsx('button',{type:'button',className:'keys-notice-read-all',disabled:busy,'aria-label':name?'Прочитать все — '+name:'Прочитать все',onClick:()=>run(async()=>{
   for(const item of hotelItems.filter(item=>!item.readAt))await read(item);
   setExtra(list=>list.map(item=>readIds.has(item.id)?{...item,readAt:new Date().toISOString()}:item));await resource?.refresh();
  }),children:'Прочитать все'});
 };
 const hotelHeader=(id,name)=>n.jsxs('div',{className:'keys-notice-hotel-heading',children:[
  n.jsx('h2',{title:name,children:name}),readAllButton(id,name)
 ]});
 const stamp=value=>new Date(value).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 const renderItem=item=>n.jsxs('button',{type:'button',className:'keys-notice-item'+(desktop?' keys-notice-timeline-item':''),'data-kind':item.category,'data-unread':!item.readAt,disabled:busy,onClick:()=>run(async()=>{
  await read(item);setExtra(list=>list.map(other=>other.id===item.id?{...other,readAt:new Date().toISOString()}:other));await resource?.refresh();
  if(item.pushId)keysPost('system-notification-open',{id:item.pushId});else if(item.target!=='notifications')open({type:item.target});
 }),children:[
  desktop&&item.hotelId?n.jsx('img',{className:'keys-notice-hotel-photo',src:Ie(item.hotelId).photos[0].src,alt:'',loading:'lazy'}):n.jsx('span',{className:'keys-notice-icon','aria-hidden':true,children:n.jsx(D,{name:item.category==='review'?'star':item.category==='account'?'shield':'bell',className:'keys-notice-svg'})}),
  n.jsxs('span',{className:'keys-notice-copy',children:[
   desktop&&n.jsx('span',{className:'keys-notice-hotel-name',children:item.hotel||'Ключи'}),
   n.jsxs('span',{className:'keys-notice-heading',children:[n.jsx('strong',{children:item.title}),!item.readAt&&n.jsx('span',{className:'keys-notice-dot','aria-label':'Не прочитано'})]}),
   n.jsx('span',{className:'keys-notice-body',children:item.body}),
   n.jsx('span',{className:'keys-notice-meta',children:n.jsx('time',{dateTime:item.createdAt,children:desktop?new Date(item.createdAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):stamp(item.createdAt)})})
  ]}),
  desktop&&n.jsx(D,{name:'chevron',className:'keys-notice-chevron'})
 ]},item.id);
 return n.jsxs(n.Fragment,{children:[
  n.jsx(Ae,{title:'Уведомления',action:desktop?readAllButton(null,null):scopedHotel?readAllButton(scopedHotel,eHotelName(scopedHotel)):null}),
  !user?n.jsx(H,{onClick:openLogin,children:'Войти'}):n.jsxs('div',{className:'keys-notices',children:[
   n.jsx('div',{className:'keys-notice-filters',role:'group','aria-label':'Тип уведомления',children:model.categories.map(([id,label])=>n.jsx('button',{type:'button','aria-pressed':category===id,onClick:()=>setCategory(id),children:label},id))}),
   !scopedHotel&&hotels.length>0&&n.jsxs('div',{className:'keys-notice-filters keys-notice-hotel-filters',role:'group','aria-label':'Отель',children:[n.jsx('button',{type:'button','aria-pressed':!hotel,onClick:()=>setHotel(null),children:'Все отели'}),...hotels.map(group=>n.jsx('button',{type:'button','aria-pressed':hotel===group.id,onClick:()=>setHotel(group.id),children:group.hotel},group.id))]}),
   desktop?model.groupByDate(visible).map(group=>n.jsxs('section',{className:'keys-notice-day','aria-label':group.date,children:[n.jsxs('div',{className:'keys-notice-day-label',children:[n.jsx('h2',{children:group.label}),n.jsx('time',{dateTime:group.id,children:group.date})]}),n.jsx('div',{className:'keys-notice-day-items',children:group.items.map(renderItem)})]},group.id)):groups.map(group=>n.jsxs('section',{className:'keys-notice-hotel-group','aria-label':group.hotel,children:[!scopedHotel&&hotelHeader(group.id,group.hotel),...group.items.map(renderItem)]},group.id)),
   !groups.length&&n.jsx('p',{className:'keys-notice-empty',children:category!=='all'?'Уведомлений этого типа пока нет.':'Уведомлений пока нет.'}),
   (error||resource?.error)&&n.jsxs('div',{children:[n.jsx('p',{role:'alert',children:error||'Не удалось загрузить уведомления.'}),n.jsx(H,{variant:'text',onClick:()=>resource?.refresh(),children:'Повторить'})]}),
   next&&n.jsx(H,{variant:'secondary',disabled:busy,onClick:()=>run(async()=>{const result=await api('notifications?cursor='+encodeURIComponent(next));setExtra(list=>[...list,...result.items]);setCursor(result.nextCursor);}),children:'Показать ещё'})
  ]})
 ]});
}
