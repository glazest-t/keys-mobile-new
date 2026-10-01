/* React integration inside the isolated Arbana runtime. Upstream components and reducers are retained. */
function keysPost(type, value) {
  if (window.parent !== window) window.parent.postMessage({source:'keys-arbana', type, ...value}, window.location.origin === 'null' ? '*' : window.location.origin);
}
function keysRouteToHost(action) {
  if(globalThis.PoraDemo.state?.keysChangeSession){
    if(globalThis.PoraDemo.state?.keysCheckinSession&&action.type==='OPEN'&&action.screen?.type==='info'){keysPost('navigate',{target:'checkin-instruction'});return true;}
    if(action.type==='HOME'||action.type==='NAV_TAB'){keysPost('change-close',{});return true;}
    if(action.type==='HANDOFF'||action.type==='OPEN'&&action.screen?.type==='chat'){keysPost('navigate',{target:'change-chat'});return true;}
    if(action.type==='OPEN'&&action.screen?.type==='booking'){keysPost('change-close',{});return true;}
    return false;
  }
  const tab = action.type === 'HOME' ? 'trips' : action.type === 'NAV_TAB' ? action.tab : null;
  let target = tab === 'trips' ? 'trips' : tab === 'bonuses' ? 'benefits' : null;
  if(action.type === 'OPEN' && action.screen?.type === 'profile') target='profile';
  if(action.type==='HOTEL_OPEN'&&action.id==='maidens') target='stay-details';
  if(action.type==='OPEN'&&action.screen?.type==='hotel'&&action.screen.hotelId==='maidens') target='stay-details';
  if(action.type==='OPEN'&&action.screen?.type==='problem'&&globalThis.PoraDemo.state?.booking.hotelId==='maidens') target='problem';
  if(action.type === 'OPEN' && action.screen?.type === 'booking' && globalThis.PoraDemo.state?.booking.hotelId === 'maidens') target='stay-details';
  if(action.type==='OPEN'&&['stay-feedback','checkout-feedback'].includes(action.screen?.type)) target='feedback';
  if(!target) return false;
  keysPost('navigate',{target,feedbackKind:action.screen?.type==='checkout-feedback'?'stay':'first-night'}); return true;
}
function KeysBridge() {
  const {state,dispatch} = J();
  const notifications=Qg(),refresh=E.useRef(null);refresh.current=notifications?.refresh;
  E.useEffect(()=>keysPost('header',{unread:!!notifications?.page?.unread}),[notifications?.page?.unread]);
  E.useEffect(() => {
    const receive = event => {
      if(event.source !== window.parent || event.data?.source !== 'keys-host') return;
      if(event.origin !== window.location.origin && window.location.protocol !== 'file:') return;
      const {tab,hotelId,screen,stayDay} = event.data;
      if(['day-1','day-2','checkout','after'].includes(stayDay)){
        const changed=globalThis.PoraDemo.keysStayDay!==stayDay;
        globalThis.PoraDemo.keysStayDay=stayDay;
        if(changed)refresh.current?.();
      }
      if(!['find','chats','favorites'].includes(tab)) return;
      dispatch({type:'NAV_TAB',tab});
      if(['booking','notifications'].includes(screen)) dispatch({type:'OPEN',screen:{type:screen}});
      if(hotelId) dispatch({type:'OPEN',screen:{type:'chat',hotelId}});
    };
    window.addEventListener('message',receive); keysPost('ready',{});
    return () => window.removeEventListener('message',receive);
  }, [dispatch]);
  E.useEffect(()=>{if(state.reservation?.status==='confirmed'&&state.reservation.bookedId===state.booking.id){keysPost('reservation',{booking:{id:state.booking.id,hotel:eHotelName(state.booking.hotelId),arrival:state.booking.arrival,departure:state.booking.departure}});}},[state.reservation?.status,state.booking.id]);
  E.useEffect(() => { keysPost('state',{tab:state.navigation.tab,screen:state.navigation.screen?.type ?? null}); },[state.navigation]);
  return null;
}
function PH({children}) {
  RH(); LH();
  const scrollRef=E.useRef(null);
  const {state,dispatch} = J(), screen=state.navigation.screen;
  const favorites=screen?.type==='saved'||(!screen&&state.navigation.tab==='favorites');
  const discovery=!screen && state.navigation.tab==='find' && state.search.intent==='discover';
  const conversation=screen?.type==='chat'||screen?.type==='describe'||discovery;
  const full=['hotel-map','story','stories','friend-stories','swipe','shared-swipe'].includes(screen?.type);
  E.useLayoutEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;},[state.navigation.tab,screen?.type,screen?.rooms,state.search.results]);
  E.useLayoutEffect(()=>{document.documentElement.classList.toggle('keys-share-sheet',!!state.keysShareSession&&screen?.type==='keys-trip-share');},[state.keysShareSession,screen?.type]);
  const results=!screen && state.navigation.tab==='find' && state.search.results && state.search.intent==='known';
  return n.jsxs('div',{'data-testid':'app-screen','data-screen-type':screen?.type??(discovery?'discovery':'root'),className:'keys-module-screen bg-card',children:[
    new URLSearchParams(location.search).has('keysBookingChange')?n.jsx(KeysChangeBridge,{state,dispatch}):n.jsx(KeysBridge,{}),
    n.jsxs('div',{ref:scrollRef,className:'keys-module-scroll'+(conversation?' keys-conversation':'')+(full?' keys-fullscreen':''),children:[
      !screen&&!results&&!discovery&&n.jsx(CH,{}),
      n.jsx('main',{className:F('animate-tab-content min-w-0 flex-1',conversation?'flex min-h-0 flex-col overflow-hidden':full?'relative min-h-0':'px-(--gutter)',!conversation&&!full&&(screen?'pt-4 pb-5':'pt-[25px] pb-3')),children:state.keysShareSession&&screen?.type==='keys-trip-share'?n.jsx(KeysTripShare,{onClose:()=>keysPost('change-close',{})}):state.keysPublicTrip?n.jsx(KeysPublicTrip,{}):favorites?n.jsx(KeysFavorites,{}):children},state.navigation.tab)
    ]}),
    !screen&&!discovery&&n.jsx(AH,{}),n.jsx(OH,{})
  ]});
}
function keysInitialState() {
  const state=Xg('stay',Date.now());
  const photo={src:'../scenarios/maidens-hotel.jpg',alt:'Maidens Hotel'};
  const maidens={...Ie('more'),id:'maidens',name:'Maidens Hotel',city:'Москва',area:'Хамовники',address:'Москва, Зубовская площадь, 3, стр. 1',location:'Хамовники · Москва',coordinates:[55.7364,37.5912],description:'Ваше текущее проживание: 12–19 сентября, номер 412.',photos:[photo],image:photo.src,beach:false,pool:false,spa:false,breakfast:false,room:'Премиум Кинг с видом во двор'};
  if(!_n.some(h=>h.id==='maidens')) _n.push(maidens);
  state.navigation={tab:'find',screen:null,history:[]};
  state.tripContext.today='2026-09-13';
  state.booking={...state.booking,id:'keys-maidens-412',hotelId:'maidens',arrival:'2026-09-12',departure:'2026-09-19',party:{adults:1,childrenAges:[],pet:false,business:true},room:{...state.booking.room,name:maidens.room,photo,photos:[photo]},contact:{...state.booking.contact,firstName:'Татьяна',lastName:'Глазырина'},tariff:{...state.booking.tariff,name:'Деловой тариф',includesBreakfast:false}};
  state.orders=[];
  state.chat.conversations.maidens={hotelId:'maidens',staffName:'Анна',human:false,unread:0,draft:'',lastActivity:6,updatedLabel:'Сейчас',messages:[{id:'maidens-welcome',sender:'ai',text:'Татьяна, добро пожаловать в чат Maidens Hotel! Ваш номер — 412, проживание 12–19 сентября. Здесь можно задать вопрос об отеле или связаться с сотрудником.',bookingId:state.booking.id}]};
  state.chat.sequence=6;
  if(typeof location==='undefined')return state;
  const linked=y8(state,new URLSearchParams(location.search));
  linked.keysPublicTrip=new URLSearchParams(location.search).get('hotel')==='maidens';
  return linked;
}
function keysMaidensAnswer(text,context) {
  const sender=context.human?'staff':'ai';
  const answer=value=>[{message:{sender,text:value,bookingId:context.booking?.id}}];
  if(/завтрак|питан|ресторан/i.test(text)) return answer('Завтрак «Шведский стол» — в LEA на 3-м этаже, с 07:00 до 12:00. В деловой тариф он не включён. Стоимость — 800 ₽ в сутки, для Silver — 680 ₽. Подключить завтрак можно в услугах вашего отеля.');
  if(/номер|брон|дат|прожив/i.test(text)&& !/убор|принес|полотен/i.test(text)) return answer('Ваша бронь в Maidens Hotel: 12–19 сентября, 1 гость. Номер 412, «Премиум Кинг с видом во двор», деловой тариф.');
  if(/адрес|где.*отель/i.test(text)) return answer('Maidens Hotel: Москва, Зубовская площадь, 3, стр. 1.');
  if(/ключ|двер/i.test(text)) return answer('Цифровой ключ от номера 412 доступен на главной странице в разделе «Поездки».');
  return [{handoff:true,message:{sender,text:'Передам вопрос сотруднику Maidens Hotel. История переписки сохранится.'}}];
}

function eHotelName(id){return Ie(id).name;}

// The host and React screens render exactly the same header markup and stylesheet.
function CH() {
  const {dispatch,open}=J();
  const unread=!!_8();
  E.useEffect(()=>keysPost('header',{unread}),[unread]);
  return n.jsx('header',{className:'keys-app-header',dangerouslySetInnerHTML:{__html:window.KeysAppHeader.markup(unread)},onClick:event=>{
    const action=event.target.closest('[data-header-action]')?.dataset.headerAction;
    if(action==='home')dispatch({type:'HOME'});
    if(action==='profile')open({type:'profile'});
    if(action==='notifications')open({type:'notifications'});
  }});
}

// The same items, SVGs and CSS are used by the host's existing navigation buttons.
function AH() {
  const {state,selectTab}=J();
  const active=state.navigation.screen?.type==='saved'?'favorites':state.navigation.tab;
  const unread=zA(state)>0;
  E.useEffect(()=>keysPost('nav',{unread}),[unread]);
  return n.jsx('nav',{className:'keys-bottom-nav','aria-label':'Разделы приложения',children:window.KeysAppNav.getItems(state.discovery.savedIds.length).map(item=>n.jsx('button',{
    type:'button',className:'keys-bottom-tab','data-bottom-tab':item.id,
    'aria-current':active===item.id?'page':undefined,
    onClick:()=>selectTab(item.id),dangerouslySetInnerHTML:{__html:window.KeysAppNav.content(item,unread)}
  },item.id))});
}

// Notification history shares the same navigation, API and read-state persistence.
function EV() {
 const {user,openLogin}=yt(),{open}=J(),resource=Qg(),api=Gn();
 const [extra,setExtra]=E.useState([]),[cursor,setCursor]=E.useState(undefined);
 const [busy,setBusy]=E.useState(false),[error,setError]=E.useState('');
 const page=resource?.page,items=[...(page?.items??[]),...extra.filter(item=>!page?.items.some(other=>other.id===item.id))].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 const next=cursor===undefined?page?.nextCursor:cursor;
 const run=async task=>{if(busy)return;setBusy(true);setError('');try{await task();}catch(e){setError(Ot(e));}finally{setBusy(false);}};
 const icon=(name)=>n.jsx(D,{name,className:'keys-notice-svg'});
 const day=date=>new Date(date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',timeZone:'Europe/Moscow'});
 return n.jsxs(n.Fragment,{children:[
  n.jsx(Ae,{title:'Уведомления',action:user&&n.jsx('button',{type:'button',className:'keys-notice-settings','aria-label':'Настроить уведомления',title:'Настроить уведомления',onClick:()=>open({type:'notification-settings'}),children:n.jsxs('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true,children:[n.jsx('path',{d:'M4 7h7m4 0h5M4 17h2m4 0h10'}),n.jsx('circle',{cx:13,cy:7,r:2}),n.jsx('circle',{cx:8,cy:17,r:2})]})})}),
  !user?n.jsx(H,{onClick:openLogin,children:'Войти'}):n.jsxs('div',{className:'keys-notices',children:[
   !!page?.unread&&n.jsx('div',{className:'keys-notice-tools',children:n.jsxs('button',{type:'button',disabled:busy,onClick:()=>run(async()=>{await api('notifications/read','POST',{through:page.items[0].id});setExtra([]);setCursor(undefined);await resource?.refresh();}),children:[icon('bell-check'),'Прочитать все']})}),
   !page&&!resource?.error?n.jsx(on,{className:'mx-auto my-8 size-5'}):items.length?n.jsx('div',{className:'keys-notice-list',children:items.map((item,index)=>n.jsxs(E.Fragment,{children:[
    (index===0||day(items[index-1].createdAt)!==day(item.createdAt))&&n.jsx('h2',{className:'keys-notice-date',children:day(item.createdAt)}),
    n.jsxs('button',{type:'button',className:'keys-notice-item','data-kind':['stay-feedback','checkout-feedback'].includes(item.target)?'review':item.category,'data-unread':!item.readAt,disabled:busy,onClick:()=>run(async()=>{await api('notifications/'+item.id+'/read','POST');setExtra(list=>list.map(other=>other.id===item.id?{...other,readAt:new Date().toISOString()}:other));await resource?.refresh();if(item.target!=='notifications')open({type:item.target});}),children:[
     n.jsx('span',{className:'keys-notice-icon','aria-hidden':true,children:icon(['stay-feedback','checkout-feedback'].includes(item.target)?'star':item.category==='account'?'shield':'bell')}),
     n.jsxs('span',{className:'keys-notice-copy',children:[n.jsxs('span',{className:'keys-notice-heading',children:[n.jsx('strong',{children:item.title}),!item.readAt&&n.jsx('span',{className:'keys-notice-dot','aria-label':'Не прочитано'})]}),n.jsx('span',{className:'keys-notice-body',children:item.body}),n.jsxs('span',{className:'keys-notice-meta',children:[n.jsx('time',{dateTime:item.createdAt,children:new Date(item.createdAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'})}),['stay-feedback','checkout-feedback'].includes(item.target)&&n.jsx('span',{className:'keys-notice-link',children:'Оставить отзыв →'})]})]})
    ]})
   ]},item.id))}):!resource?.error&&n.jsx('p',{className:'keys-notice-empty',children:'Новых уведомлений пока нет.'}),
   (error||resource?.error)&&n.jsxs('div',{children:[n.jsx('p',{role:'alert',className:'text-12 text-danger',children:error||'Не удалось загрузить уведомления.'}),n.jsx(H,{variant:'text',onClick:()=>resource?.refresh(),children:'Повторить'})]}),
   next&&n.jsx(H,{variant:'secondary',disabled:busy,onClick:()=>run(async()=>{const result=await api('notifications?cursor='+encodeURIComponent(next));setExtra(list=>[...list,...result.items]);setCursor(result.nextCursor);}),children:'Показать ещё'})
  ]})
 ]});
}

// Separate instance for the host's confirmed pre-arrival booking.
function keysChangeInitial(state, source) {
 const base=Xg('booked',Date.now()),party=source.party??{adults:source.adults,childrenAges:[],pet:false,business:true};
 const hotel=Ie('maidens');hotel.keysNightly=8000;
 return {...base,keysChangeSession:true,keysShareSession:source.flow==='share',social:source.social??base.social,keysCheckinSession:source.flow==='checkin',keysChangeRevision:source.revision??0,
  discovery:{...base.discovery,priceTick:0},orders:[],
  tripContext:{...base.tripContext,preset:'booked',today:source.today??'2026-09-04',hasBooking:true},
  booking:{...base.booking,id:source.id,hotelId:'maidens',arrival:source.arrival,departure:source.departure,party:sn(party),paid:source.paid,revision:source.revision??0,pointsDiscount:0,refunds:source.refunds??[],changeRequest:null,updated:false,keyOpened:false,checkedIn:source.flow==='checkin'&&!!source.registration,arrivalTime:source.registration?.time??'14:00–16:00',guestName:source.registration?.name??source.guest,checkedOut:false,stayStarted:false,
   room:{...state.booking.room,name:source.room,nightlySupplement:0},
   contact:{...state.booking.contact,firstName:'Татьяна',lastName:'Глазырина'},tariff:{...state.booking.tariff,name:'Деловой тариф',multiplier:1,changesAllowed:true,includesBreakfast:false}},
  navigation:{tab:'trips',screen:{type:source.flow==='share'?'keys-trip-share':source.flow==='checkin'?'checkin':'change-booking'},history:[null]}};
}
function KeysChangeBridge({state,dispatch}) {
 const ready=E.useRef(false),done=E.useRef(false),registered=E.useRef(false);
 E.useEffect(()=>{
  const receive=event=>{
   if(event.source!==window.parent||event.data?.source!=='keys-host'||(event.origin!==location.origin&&location.protocol!=='file:')||!event.data.bookingChange)return;
   dispatch({type:'KEYS_CHANGE_START',booking:event.data.bookingChange});
  };
  window.addEventListener('message',receive);keysPost('ready',{});
  return ()=>window.removeEventListener('message',receive);
 },[dispatch]);
 E.useEffect(()=>{
  if(!state.keysChangeSession)return;
  if(state.keysShareSession)keysPost('share-state',{social:state.social});
  if(!ready.current){ready.current=true;keysPost('change-ready',{});}
  if(state.keysCheckinSession&&state.booking.checkedIn&&!registered.current){registered.current=true;keysPost('checkin-complete',{registration:{name:state.booking.guestName,time:state.booking.arrivalTime}});}
  if(!state.keysCheckinSession&&state.booking.revision>state.keysChangeRevision&&!done.current){done.current=true;keysPost('change-complete',{booking:{arrival:state.booking.arrival,departure:state.booking.departure,party:state.booking.party,paid:state.booking.paid,total:state.booking.paid,revision:state.booking.revision,refunds:state.booking.refunds}});}
  else if(!state.navigation.screen&&!done.current)keysPost('change-close',{});
 },[state]);
 return null;
}

// A shared link contains only the hotel's public information and selected dates.
function KeysPublicTrip(){
 const {state}=J(),hotel=Ie('maidens'),canManage=new URLSearchParams(location.search).get('access')==='manage';
 return n.jsxs('article',{className:'keys-public-trip',children:[
  n.jsx('img',{src:hotel.photos[0].src,alt:hotel.name}),
  n.jsx('p',{className:'text-12 text-muted mt-5',children:'Поездка · Ключи'}),
  n.jsx('h1',{className:'text-20 font-medium mt-2',children:hotel.name}),
  n.jsx('p',{className:'text-14 text-muted mt-2',children:hotel.city}),
  n.jsx('p',{className:'text-17 font-medium mt-5',children:it(state.search.arrival,state.search.departure)}),
  n.jsx('p',{className:'text-12 text-muted mt-2',children:Xe(Ge(state.search.arrival,state.search.departure))}),
  n.jsx('p',{className:'text-14 mt-5',children:hotel.address}),
  canManage&&n.jsx('p',{className:'text-14 text-muted mt-5',children:'Добавьте поездку в приложение, чтобы изменять даты и гостей.'}),
  canManage&&n.jsx(H,{className:'mt-5',onClick:()=>{
   const url=new URL('../index.html',location.href);
   url.search=new URLSearchParams({scenario:'booked',arrivalDay:'day-8',sharedTrip:'manage',arrival:state.search.arrival,departure:state.search.departure,adults:String(state.search.party.adults)}).toString();
   location.assign(url.href);
  },children:'Добавить поездку'})
 ]});
}

// One link action with an explicit access choice; no friend recipients.
function KeysTripShare({onClose}){
 const {state}=J(),hotel=Ie(state.booking.hotelId);
 const [access,setAccess]=E.useState('read'),[busy,setBusy]=E.useState(false),[fallback,setFallback]=E.useState(false);
 const url=new URL(WH(state));url.searchParams.set('access',access);
 const share=async()=>{
  if(busy)return;setBusy(true);setFallback(false);
  try{
   if(typeof navigator.share==='function')await navigator.share({title:'Поездка · Ключи',text:QH(state),url:url.href});
   else{await navigator.clipboard.writeText(QH(state)+'\n'+url.href);keysPost('share-copied',{});}
   onClose();
  }catch(error){
   if(error?.name!=='AbortError'){
    try{await navigator.clipboard.writeText(QH(state)+'\n'+url.href);keysPost('share-copied',{});onClose();}
    catch{setFallback(true);}
   }
  }finally{setBusy(false);}
 };
 return n.jsx(ct,{title:'Поделиться поездкой',onClose,children:n.jsxs('div',{className:'keys-trip-share',children:[
  n.jsxs('div',{className:'keys-trip-share-hotel',children:[n.jsx('img',{src:hotel.photos[0].src,alt:''}),n.jsxs('div',{children:[n.jsx('strong',{children:hotel.name}),n.jsx('p',{children:hotel.city+' · '+it(state.booking.arrival,state.booking.departure)})]})]}),
  n.jsxs('fieldset',{disabled:busy,children:[n.jsx('legend',{children:'Тип ссылки'}),...[
   ['read','Только просмотр','Получатель сможет только посмотреть поездку.'],
   ['manage','Управление поездкой','Получатель сможет добавить поездку к себе и изменять её.']
  ].map(([value,title,copy])=>n.jsxs('label',{className:'keys-trip-share-option',children:[n.jsx('input',{type:'radio',name:'trip-link-access',value,checked:access===value,onChange:()=>{setAccess(value);setFallback(false);}}),n.jsxs('span',{children:[n.jsx('strong',{children:title}),n.jsx('small',{children:copy})]})]},value))]}),
  fallback&&n.jsxs('label',{className:'keys-trip-share-fallback',children:['Скопируйте ссылку',n.jsx('input',{readOnly:true,value:url.href,onFocus:event=>event.target.select()})]}),
  n.jsx(H,{disabled:busy,onClick:share,children:busy?'Подготовка…':'Поделиться ссылкой'})
 ]})});
}

// One saved-hotel collection, shared with every heart button in search and details.
function KeysFavorites(){
 const {state,dispatch}=J(),resource=Dn('favorites'),ids=state.discovery.savedIds;
 const source=tt(),[city,setCity]=E.useState('');
 const hotels=ids.map(id=>{
  const summary=resource.value?.items.find(item=>item.hotelId===id)?.hotel??source.getSummary?.(id);
  const name=(_n.find(hotel=>hotel.id===id)?.city??summary?.city??'').trim();
  return {id,summary,city:name,key:name.toLocaleLowerCase('ru-RU')};
 });
 const cities=[...new Map(hotels.filter(hotel=>hotel.city).map(hotel=>[hotel.key,hotel.city])).entries()].sort((a,b)=>a[1].localeCompare(b[1],'ru'));
 const activeCity=cities.some(([key])=>key===city)?city:'';
 E.useEffect(()=>{if(city&&!activeCity)setCity('');},[city,activeCity]);
 const visibleHotels=activeCity?hotels.filter(hotel=>hotel.key===activeCity):hotels;

 const previous=E.useRef(ids.length);
 E.useEffect(()=>{
  if(previous.current>0&&!ids.length){dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});}
  previous.current=ids.length;
 },[ids.length,dispatch]);
 return n.jsxs('section',{className:'keys-favorites-page','aria-label':'Избранные отели',children:[
  n.jsx(Ae,{title:'Избранные отели'}),
  cities.length>0&&n.jsx('div',{className:'keys-results-filters keys-favorites-cities',role:'group','aria-label':'Город отеля',children:[['','Все'],...cities].map(([key,label])=>n.jsx('button',{type:'button','aria-pressed':activeCity===key,onClick:()=>setCity(key),children:label},key))}),
  resource.error&&n.jsxs('div',{role:'alert',children:[n.jsx('p',{children:'Не удалось обновить сохранённые отели.'}),n.jsx(H,{variant:'secondary',onClick:()=>resource.reload(),children:'Повторить'})]}),
  n.jsx('div',{className:'keys-favorites-list',children:visibleHotels.map(hotel=>n.jsx(jx,{hotelId:hotel.id,summary:hotel.summary??undefined},hotel.id))}),
  !ids.length&&n.jsxs('div',{className:'keys-favorites-empty',children:[n.jsx(D,{name:'heart'}),n.jsx('h2',{children:'Сохраняйте отели, которые нравятся'}),n.jsx('p',{children:'Они будут здесь — вернитесь к ним, когда будете готовы к поездке.'}),n.jsx(H,{onClick:()=>{dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});},children:'Найти отель'})]})
 ]});
}
