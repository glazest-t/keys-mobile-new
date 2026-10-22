import KeysShareQRCode from 'qrcode';
/* React integration inside the isolated Arbana runtime. Upstream components and reducers are retained. */
function keysPost(type, value) {
  if (window.parent !== window) window.parent.postMessage({source:'keys-arbana', type, ...value}, window.location.origin === 'null' ? '*' : window.location.origin);
}
// Host pages and runtime pages share one logical back path.
function keysReturnsToHost(state,action,entry){
  if(!entry||!state)return false;
  if(action.type==='KEYS_SEARCH_BACK')return entry.kind==='results'&&!state.navigation.screen;
  return action.type==='BACK'&&entry.kind==='screen'&&state.navigation.screen?.type===entry.screen&&state.navigation.history.length<=1&&!state.navigation.screen?.collectionId;
}
function keysSameScreen(first,second){
  if(!first||!second)return false;
  const keys=[...new Set([...Object.keys(first),...Object.keys(second)])];
  return keys.every(key=>JSON.stringify(first[key])===JSON.stringify(second[key]));
}
function keysRouteToHost(action) {
  if(keysReturnsToHost(globalThis.PoraDemo.state,action,globalThis.keysHostEntry)){
    globalThis.keysHostEntry=null;keysPost('return-to-entry',{});return true;
  }
  if(action.type==='NAV_TAB'||action.type==='HOME')globalThis.keysHostEntry=null;

  // Only the success CTA advances the demo scenario; ordinary Home keeps its context.
  if(action.type==='HOME'&&action.confirmedBookingId&&globalThis.PoraDemo.state?.keysCreatedBookings?.[action.confirmedBookingId]){
    keysPost('navigate',{target:'trips',scenario:'booked',bookingId:action.confirmedBookingId});return true;
  }
  if(globalThis.keysGuestMode){
    if(action.type==='HOME'||action.type==='NAV_TAB'&&action.tab==='trips'){keysPost('guest-home',{});return true;}
    const payment=action.type==='RESERVATION_NEXT'||action.type==='RESERVATION_PAY'||action.type==='OPEN'&&action.screen?.type==='reservation-payment';
    if(!globalThis.keysGuestAuthorized&&payment){globalThis.keysGuestPendingAction=action;keysPost('guest-auth-required',{});return true;}
    if(!globalThis.keysGuestAuthorized&&(action.type==='OPEN'&&action.screen?.type==='profile'||action.type==='NAV_TAB'&&['bonuses','chats'].includes(action.tab))){keysPost('guest-auth-required',{});return true;}
  }

  if(globalThis.PoraDemo.state?.keysChangeSession){
    if(globalThis.PoraDemo.state?.keysCheckinSession&&action.type==='OPEN'&&action.screen?.type==='info'){keysPost('navigate',{target:'checkin-instruction'});return true;}
    if(action.type==='NAV_TAB'){keysPost('bottom-navigate',{tab:action.tab});return true;}
    if(action.type==='HOME'){keysPost('change-close',{});return true;}
    if(action.type==='HANDOFF'||action.type==='OPEN'&&action.screen?.type==='chat'){keysPost('navigate',{target:'change-chat'});return true;}
    if(action.type==='OPEN'&&action.screen?.type==='booking'){keysPost('change-close',{});return true;}
    return false;
  }
  const tab = action.type === 'HOME' ? 'trips' : action.type === 'NAV_TAB' ? action.tab : null;
  let target = tab === 'trips' ? 'trips' : tab === 'bonuses' ? 'benefits' : null;
  if(action.type === 'OPEN' && action.screen?.type === 'profile') target='profile';
  const programmeHotel=globalThis.keysHostEntry?.kind==='screen'&&globalThis.keysHostEntry.screen==='hotel';
  if(!globalThis.keysGuestMode&&!programmeHotel&&action.type==='HOTEL_OPEN'&&action.id==='maidens') target='stay-details';
  if(!globalThis.keysGuestMode&&!programmeHotel&&action.type==='OPEN'&&action.screen?.type==='hotel'&&action.screen.hotelId==='maidens') target='stay-details';
  if(action.type==='OPEN'&&action.screen?.type==='problem'&&globalThis.PoraDemo.state?.booking.hotelId==='maidens') target='problem';
  if(action.type === 'OPEN' && action.screen?.type === 'booking' && globalThis.PoraDemo.state?.booking.hotelId === 'maidens') target='stay-details';
  if(action.type==='OPEN'&&['stay-feedback','checkout-feedback'].includes(action.screen?.type)) target='feedback';
  if(!target) return false;
  keysPost('navigate',{target,feedbackKind:action.screen?.type==='checkout-feedback'?'stay':'first-night'}); return true;
}
function KeysBridge() {
  const {state,dispatch} = J();
  const searchRef=E.useRef(state.search);searchRef.current=state.search;
  E.useEffect(()=>keysPost('search-context',{search:state.search}),[state.search]);
  const notifications=Qg(),refresh=E.useRef(null);refresh.current=notifications?.refresh;
  E.useEffect(()=>{if(!state.keysProfileSaved)return;try{localStorage.setItem('keys-booking-profile-v1',JSON.stringify(state.profile));}catch{}keysPost('checkout-profile',{contact:state.profile});},[state.keysProfileSaved]);
  E.useEffect(()=>{
    keysPost('hotel-loyalty',{missing:!!state.keysHotelLoyaltyMissing,cards:Object.values(state.keysConnectedHotelCards||{}).map(card=>({hotelId:card.hotelId,name:eHotelName(card.hotelId),discount:card.discount}))});
  },[state.keysHotelLoyaltyMissing,state.keysConnectedHotelCards]);
  E.useEffect(()=>keysPost('header',{unread:!!notifications?.page?.unread}),[notifications?.page?.unread]);
  E.useEffect(() => {
    const receive = event => {
      if(event.source !== window.parent || event.data?.source !== 'keys-host') return;
      if(event.origin !== window.location.origin && window.location.protocol !== 'file:') return;
      const {tab,hotelId,screen,stayDay,discovery,bookingId} = event.data;
      if(typeof event.data.guestMode==='boolean'){
        const entering=event.data.guestMode&&!globalThis.keysGuestMode;
        globalThis.keysGuestMode=event.data.guestMode;
        globalThis.keysGuestAuthorized=!!event.data.guestAuthorized;
        document.documentElement.dataset.guestSearch=String(globalThis.keysGuestMode);
        if(event.data.resetGuest||entering){globalThis.keysGuestPendingAction=null;dispatch({type:'KEYS_GUEST_START'});}
      }
      if(event.data.cancelGuestAuth){globalThis.keysGuestPendingAction=null;return;}
      if(event.data.guestLogin){
        globalThis.keysGuestAuthorized=true;
        dispatch({type:'KEYS_LOGIN_CONTACT',contact:event.data.guestLogin,preserveReservation:true});
        const pending=globalThis.keysGuestPendingAction;globalThis.keysGuestPendingAction=null;
        if(pending)dispatch(pending);return;
      }
      if(event.data.guestHome){dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});return;}

      if(typeof event.data.hotelLoyaltyMissing==='boolean')dispatch({type:'KEYS_HOTEL_LOYALTY_SCENARIO',enabled:event.data.hotelLoyaltyMissing});
      if(typeof event.data.partnerApproved==='boolean')dispatch({type:'KEYS_PARTNER',approved:event.data.partnerApproved});
      if(event.data.loyaltyTier)dispatch({type:'KEYS_LOYALTY',tier:event.data.loyaltyTier});
      if(event.data.cancelledBooking){dispatch({type:'KEYS_BOOKING_CANCELLED',bookingId:event.data.cancelledBooking.id,result:event.data.cancelledBooking.result});return;}
      if(event.data.loginContact){dispatch({type:'KEYS_LOGIN_CONTACT',contact:event.data.loginContact});return;}
      if(event.data.openFavorites){dispatch({type:'OPEN',screen:{type:'saved'}});return;}
      if(event.data.openNotification){dispatch({type:'OPEN',screen:{type:'notifications'}});return;}
      if(typeof event.data.desktopAccount==='boolean')document.documentElement.dataset.desktopAccount=String(event.data.desktopAccount);
      if(Number.isFinite(event.data.desktopHeight))document.documentElement.style.setProperty('--keys-desktop-height',Math.max(560,event.data.desktopHeight)+'px');
      if(['day-1','day-2','checkout','after'].includes(stayDay)){
        const changed=globalThis.PoraDemo.keysStayDay!==stayDay;
        globalThis.PoraDemo.keysStayDay=stayDay;
        if(changed)refresh.current?.();
      }
      if(!['find','chats','favorites'].includes(tab)) return;
      dispatch({type:'NAV_TAB',tab});
      globalThis.keysHostEntry=event.data.entryReturn||null;
      if(screen==='created-booking'&&typeof bookingId==='string')dispatch({type:'OPEN',screen:{type:screen,bookingId}});
      if(['booking','notifications','saved'].includes(screen)) dispatch({type:'OPEN',screen:{type:screen}});
      if(screen==='hotel-loyalty-connect'&&hotelId)dispatch({type:'OPEN',screen:{type:screen,hotelId}});
      else if(screen==='hotel'&&hotelId)dispatch({type:'HOTEL_OPEN',id:hotelId});
      else if(hotelId) dispatch({type:'OPEN',screen:{type:'chat',hotelId}});
      if(tab==='find'&&discovery){
        if(typeof discovery.wish==='string'&&discovery.wish.trim()){
          dispatch({type:'SEARCH_PATCH',patch:{intent:'discover',results:false,keysCollection:null}});
          dispatch({type:'OPEN',screen:{type:'describe',keysWish:discovery.wish.trim()}});
        }
        else if(discovery.searchRequest){
          const request=discovery.searchRequest;
          dispatch({type:'SEARCH_PATCH',patch:{city:request.city,arrival:request.arrival,departure:request.departure,party:request.party,intent:'known',results:false,keysCollection:null}});
          if(typeof discovery.hotelId==='string')dispatch({type:'HOTEL_OPEN',id:discovery.hotelId});
          else dispatch({type:'SEARCH_SUBMIT',city:request.city});
        }
        else if(['deals','weekend','anywhere'].includes(discovery.collection)) keysOpenCollection(dispatch,searchRef.current,discovery.collection);
        else if(discovery.mode==='photo') dispatch({type:'OPEN',screen:{type:'swipe'}});
        else if(discovery.mode==='advice'){
          dispatch({type:'SEARCH_PATCH',patch:{intent:'discover',results:false,keysCollection:null}});
          dispatch({type:'OPEN',screen:{type:'describe',keysIdeasEntry:Date.now(),...(discovery.resume?{keysIdeasResume:true}:{keysStartMode:discovery.ideaMode==='topics'?'topics':'feed',keysStartLike:discovery.ideaLike})}});
        }
        else if(discovery.mode==='known') dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false,keysCollection:null}});
        else if(typeof discovery.city==='string'&&discovery.city.trim()){
          const city=discovery.city.trim().slice(0,120);
          dispatch({type:'SEARCH_PATCH',patch:{city,keysCollection:null,intent:'known',results:false}});
          dispatch({type:'SEARCH_SUBMIT',city});
        }
      }
    };
    window.addEventListener('message',receive); keysPost('ready',{});
    return () => window.removeEventListener('message',receive);
  }, [dispatch]);
  E.useEffect(()=>{if(state.reservation?.status==='confirmed'&&state.reservation.bookedId===state.booking.id){keysPost('reservation',{booking:{id:state.booking.id,hotel:eHotelName(state.booking.hotelId),arrival:state.booking.arrival,departure:state.booking.departure,room:state.booking.room.name,photo:state.booking.room.photo?.src,guests:Rt(state.booking.party)}});}},[state.reservation?.status,state.booking.id]);
  E.useEffect(() => { keysPost('state',{tab:state.navigation.tab,screen:state.navigation.screen?.type ?? null,results:!state.navigation.screen&&state.navigation.tab==='find'&&state.search.results&&state.search.intent==='known'}); },[state.navigation,state.search.results,state.search.intent]);
  E.useEffect(()=>{
    const page=document.querySelector('.keys-module-screen main');if(!page)return;
    const report=()=>{if(document.documentElement.dataset.desktopAccount==='true'&&(state.navigation.tab==='find'||['reservation-success','created-booking','notifications','notification-settings'].includes(state.navigation.screen?.type)))keysPost('account-height',{height:Math.ceil(((state.navigation.tab==='find'||['reservation-success','created-booking'].includes(state.navigation.screen?.type))?page.closest('.keys-module-screen'):page).getBoundingClientRect().height)+32});};
    const resize=new ResizeObserver(report);resize.observe(page);
    const attributes=new MutationObserver(report);attributes.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});report();
    return()=>{resize.disconnect();attributes.disconnect();};
  },[state.navigation.tab,state.navigation.screen?.type,state.search.intent,state.search.results]);
  return null;
}
function keysShowBottomNav(state){
  if(state.keysShareSession)return false;
  const {screen,history=[]}=state.navigation;
  if(!screen)return true;
  const bookingScreen=page=>page&&(['hotel','hotel-reviews','hotel-loyalty-connect','shopping-checkout','reservation-payment','reservation-success'].includes(page.type)||page.type==='hotel-map'&&page.selectedOnly);
  return !bookingScreen(screen)&&!history.some(bookingScreen);
}
function PH({children}) {
  if(new URLSearchParams(location.search).has('headerSearch'))return n.jsx(KeysHeaderSearchPopup,{});
  if(new URLSearchParams(location.search).has('homeSearch'))return n.jsx(KeysHomeSearchWidget,{});
  RH(); LH();
  const scrollRef=E.useRef(null);
  const {state,dispatch} = J(), screen=state.navigation.screen;
  const favorites=screen?.type==='saved'||(!screen&&state.navigation.tab==='favorites');
  const conversation=screen?.type==='chat'||screen?.type==='describe';
  const full=['hotel-map','story','stories','friend-stories','swipe','shared-swipe'].includes(screen?.type);
  E.useLayoutEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;if(document.documentElement.dataset.desktopAccount==='true')window.scrollTo(0,0);},[state.navigation.tab,screen?.type,screen?.rooms,screen?.collectionId,state.search.results]);
  E.useLayoutEffect(()=>{document.documentElement.classList.toggle('keys-share-sheet',!!state.keysShareSession&&screen?.type==='keys-trip-share');},[state.keysShareSession,screen?.type]);
  const results=!screen && state.navigation.tab==='find' && state.search.results && state.search.intent==='known';
  return n.jsxs('div',{'data-testid':'app-screen','data-runtime-tab':state.navigation.tab,'data-find-layout':state.navigation.tab==='find'?(screen?.type==='describe'?'advice':results?'results':!screen?'landing':'detail'):undefined,'data-screen-type':screen?.type??'root',className:'keys-module-screen bg-card',children:[
    new URLSearchParams(location.search).has('keysBookingChange')?n.jsx(KeysChangeBridge,{state,dispatch}):n.jsx(KeysBridge,{}),
    n.jsxs('div',{ref:scrollRef,className:'keys-module-scroll'+(conversation?' keys-conversation':'')+(full?' keys-fullscreen':''),children:[
      !screen&&!results&&n.jsx(CH,{}),
      n.jsx('main',{className:F('animate-tab-content min-w-0 flex-1',conversation?'flex min-h-0 flex-col overflow-hidden':full?'relative min-h-0':'px-(--gutter)',!conversation&&!full&&(screen?'pt-4 pb-5':'pt-[25px] pb-3')),children:screen?.type==='hotel-map'&&screen.collectionId?n.jsx(KeysFavoriteMap,{collectionId:screen.collectionId},screen.collectionId):screen?.type==='hotel-loyalty-connect'?n.jsx(KeysHotelLoyaltyBanner,{hotelId:screen.hotelId,standalone:true}):screen?.type==='created-booking'?n.jsx(KeysCreatedBookingDetails,{bookingId:screen.bookingId}):state.keysShareSession&&screen?.type==='keys-trip-share'?n.jsx(KeysTripShare,{onClose:()=>keysPost('change-close',{})}):state.keysPublicTrip?n.jsx(KeysPublicTrip,{}):favorites?n.jsx(KeysFavorites,{}):children},state.navigation.tab)
    ]}),
    keysShowBottomNav(state)&&n.jsx(AH,{}),n.jsx(OH,{}),n.jsx(KeysFavoriteStorage,{})
  ]});
}
function keysInitialState() {
  const state=Xg('stay',Date.now());
  const photo={src:'../scenarios/maidens-hotel.jpg',alt:'Maidens Hotel'};
  const maidens={...Ie('more'),id:'maidens',name:'Maidens Hotel',city:'Москва',isSeasideCity:false,seaDistance:null,centerDistance:null,area:'Хамовники',address:'Москва, Зубовская площадь, 3, стр. 1',location:'Хамовники · Москва',coordinates:[55.7364,37.5912],description:'Ваше текущее проживание: 12–19 сентября, номер 412.',photos:[photo],image:photo.src,beach:false,pool:false,spa:false,breakfast:false,room:'Премиум Кинг с видом во двор'};
  if(!_n.some(h=>h.id==='maidens')) _n.push(maidens);
  state.navigation={tab:'find',screen:null,history:[]};
  state.tripContext.today='2026-09-13';
  state.booking={...state.booking,id:'keys-maidens-412',hotelId:'maidens',arrival:'2026-09-12',departure:'2026-09-19',party:{adults:1,childrenAges:[],pet:false,business:true},room:{...state.booking.room,name:maidens.room,photo,photos:[photo]},contact:{...state.booking.contact,firstName:'Татьяна',lastName:'Глазырина'},tariff:{...state.booking.tariff,name:'Деловой тариф',includesBreakfast:false}};
  state.keysCheckoutIdentity=true;
  state.profile={firstName:'Татьяна',lastName:'',phone:'+7 (900) 123-45-67',email:''};
  try{const login=JSON.parse(sessionStorage.getItem('keys-login-contact-v1')||'null');if(login?.firstName&&login?.phone)state.profile={...state.profile,firstName:login.firstName,phone:login.phone};const saved=JSON.parse(localStorage.getItem('keys-booking-profile-v1')||'null');if(saved&&um(saved)&&saved.phone.replace(/\D/g,'')===state.profile.phone.replace(/\D/g,''))state.profile=saved,state.keysProfileSaved=1;}catch{}
  state.orders=[];
  state.chat.conversations.maidens={hotelId:'maidens',staffName:'Анна',human:false,unread:0,draft:'',lastActivity:6,updatedLabel:'Сейчас',messages:[{id:'maidens-welcome',sender:'ai',text:'Татьяна, добро пожаловать в чат Maidens Hotel! Ваш номер — 412, проживание 12–19 сентября. Здесь можно задать вопрос об отеле или связаться с сотрудником.',bookingId:state.booking.id}]};
  state.chat.sequence=6;
  keysRestoreFavorites(state);
  if(typeof location==='undefined')return state;
  globalThis.keysGuestMode=new URLSearchParams(location.search).get('guestSearch')==='true';
  globalThis.keysGuestAuthorized=false;
  document.documentElement.dataset.guestSearch=String(globalThis.keysGuestMode);
  if(globalThis.keysGuestMode){state.profile={firstName:'',lastName:'',phone:'',email:''};state.loyalty={...state.loyalty,balance:0};state.keysHotelPoints={more:0};state.reservation=null;}
  const linked=y8(state,new URLSearchParams(location.search));
  linked.keysPublicTrip=new URLSearchParams(location.search).get('hotel')==='maidens';
  return keysSetLoyalty(linked,new URLSearchParams(location.search).get('loyalty'));
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
    if(action==='favorites')open({type:'saved'});
    if(action==='notifications')open({type:'notifications'});
  }});
}

// The same items, SVGs and CSS are used by the host's existing navigation buttons.
function AH({beforeNavigate}={}) {
  const {state,selectTab}=J();
  const active=state.navigation.screen?.type==='saved'?'favorites':state.navigation.tab;
  const unread=zA(state)>0;
  E.useEffect(()=>keysPost('nav',{unread}),[unread]);
  return n.jsx('nav',{className:'keys-bottom-nav','aria-label':'Разделы приложения',children:window.KeysAppNav.getItems(state.discovery.savedIds.length).map(item=>n.jsx('button',{
    type:'button',className:'keys-bottom-tab','data-bottom-tab':item.id,
    'aria-current':active===item.id?'page':undefined,
    onClick:()=>{beforeNavigate?.();selectTab(item.id);},dangerouslySetInnerHTML:{__html:window.KeysAppNav.content(item,unread)}
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
  n.jsx(Ae,{title:'Уведомления',action:user&&n.jsx('button',{type:'button',className:'keys-notice-settings','aria-label':'Настроить уведомления',title:'Настроить уведомления',onClick:()=>keysPost('profile-settings'),children:n.jsxs('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true,children:[n.jsx('path',{d:'M4 7h7m4 0h5M4 17h2m4 0h10'}),n.jsx('circle',{cx:13,cy:7,r:2}),n.jsx('circle',{cx:8,cy:17,r:2})]})})}),
  !user?n.jsx(H,{onClick:openLogin,children:'Войти'}):n.jsxs('div',{className:'keys-notices',children:[
   !!page?.unread&&n.jsx('div',{className:'keys-notice-tools',children:n.jsxs('button',{type:'button',disabled:busy,onClick:()=>run(async()=>{await api('notifications/read','POST',{through:page.items[0].id});setExtra([]);setCursor(undefined);await resource?.refresh();}),children:[icon('bell-check'),'Прочитать все']})}),
   !page&&!resource?.error?n.jsx(on,{className:'mx-auto my-8 size-5'}):items.length?n.jsx('div',{className:'keys-notice-list',children:items.map((item,index)=>n.jsxs(E.Fragment,{children:[
    (index===0||day(items[index-1].createdAt)!==day(item.createdAt))&&n.jsx('h2',{className:'keys-notice-date',children:day(item.createdAt)}),
    n.jsxs('button',{type:'button',className:'keys-notice-item','data-kind':['stay-feedback','checkout-feedback'].includes(item.target)?'review':item.category,'data-unread':!item.readAt,disabled:busy,onClick:()=>run(async()=>{await api('notifications/'+item.id+'/read','POST');setExtra(list=>list.map(other=>other.id===item.id?{...other,readAt:new Date().toISOString()}:other));await resource?.refresh();if(item.target!=='notifications')open({type:item.target});}),children:[
     n.jsx('span',{className:'keys-notice-icon','aria-hidden':true,children:icon(['stay-feedback','checkout-feedback'].includes(item.target)?'star':item.category==='account'?'shield':'bell')}),
     n.jsxs('span',{className:'keys-notice-copy',children:[n.jsxs('span',{className:'keys-notice-heading',children:[n.jsx('strong',{children:item.title}),!item.readAt&&n.jsx('span',{className:'keys-notice-dot','aria-label':'Не прочитано'})]}),n.jsx('span',{className:'keys-notice-body',children:item.body}),n.jsxs('span',{className:'keys-notice-meta',children:[n.jsx('time',{dateTime:item.createdAt,children:new Date(item.createdAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'})}),['stay-feedback','checkout-feedback'].includes(item.target)&&n.jsx('span',{className:'keys-notice-link',children:['Оставить отзыв',n.jsx('svg',{viewBox:'0 0 24 24',width:14,height:14,fill:'none',stroke:'currentColor',strokeWidth:1.65,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,children:n.jsx('path',{d:'m9 5 7 7-7 7'})})]})]})]})
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
 return {...base,keysChangeSession:true,keysShareSession:source.flow==='share',keysShareStayDay:source.stayDay??null,keysShareBrand:source.brand??null,social:source.social??base.social,keysCheckinSession:source.flow==='checkin',keysChangeRevision:source.revision??0,
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
 const {state}=J(),hotel=Ie('maidens'),params=new URLSearchParams(location.search),canManage=params.get('access')==='manage',stayDay=params.get('stayDay');
 return n.jsxs('article',{className:'keys-public-trip',children:[
  n.jsx('img',{src:hotel.photos[0].src,alt:hotel.name}),
  n.jsx('p',{className:'text-12 text-muted mt-5',children:'Поездка · Ключи'}),
  n.jsx('h1',{className:'text-20 font-medium mt-2',children:hotel.name}),
  n.jsx('p',{className:'text-14 text-muted mt-2',children:hotel.city}),
  n.jsx('p',{className:'text-17 font-medium mt-5',children:it(state.search.arrival,state.search.departure)}),
  n.jsx('p',{className:'text-12 text-muted mt-2',children:Xe(Ge(state.search.arrival,state.search.departure))}),
  n.jsx('p',{className:'text-14 mt-5',children:hotel.address}),
  canManage&&n.jsx('p',{className:'text-14 text-muted mt-5',children:stayDay?'Добавьте поездку, чтобы открывать номер, заказывать услуги и управлять проживанием.':'Добавьте поездку в приложение, чтобы изменять даты и гостей.'}),
  canManage&&n.jsx(H,{className:'mt-5',onClick:()=>{
   const url=new URL('../index.html',location.href);
   url.search=new URLSearchParams({scenario:stayDay?'stay':'booked',...(stayDay?{stayDay}:{}),brand:params.get('brand')||'base',sharedTrip:'manage',arrival:state.search.arrival,departure:state.search.departure,adults:String(state.search.party.adults)}).toString();
   location.assign(url.href);
  },children:'Добавить поездку'})
 ]});
}

// One link action with an explicit access choice; no friend recipients.
function KeysTripShare({onClose}){
 const {state}=J(),hotel=Ie(state.booking.hotelId);
 const [access,setAccess]=E.useState('read'),[busy,setBusy]=E.useState(false),[fallback,setFallback]=E.useState(false);
 const inStay=!!state.keysShareStayDay;
 const url=new URL(keysTripShareUrl(WH(state),access,{stayDay:state.keysShareStayDay,brand:state.keysShareBrand||new URLSearchParams(location.search).get('brand')}));
 const [qr,setQr]=E.useState(null);
 E.useEffect(()=>{
  let active=true;setQr(null);
  KeysShareQRCode.toDataURL(url.href,{width:600,margin:4,errorCorrectionLevel:'M',color:{dark:'#111827',light:'#ffffff'}}).then(src=>{if(active)setQr({url:url.href,src});}).catch(()=>{if(active)setQr({url:url.href,error:true});});
  return()=>{active=false;};
 },[url.href]);
 // Reveal the host iframe only after the sheet, fonts and QR have settled.
 const shown=E.useRef(false);
 E.useEffect(()=>{
  if(shown.current||qr?.url!==url.href)return;
  let active=true;
  const reveal=async()=>{
   await document.fonts.ready;
   const dialog=document.querySelector('dialog[aria-label="Поделиться поездкой"]');
   if(!dialog)return;
   await Promise.allSettled([...dialog.querySelectorAll('img')].map(img=>img.decode()));
   await Promise.allSettled(dialog.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished));
   if(active){shown.current=true;keysPost('share-ready',{});}
  };
  reveal();return()=>{active=false;};
 },[qr,url.href]);
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
 return n.jsx(ct,{title:'Поделиться поездкой',onClose,children:n.jsxs('div',{className:'keys-trip-share keys-trip-share--stay',children:[
  n.jsxs('div',{className:'keys-trip-share-hotel',children:[n.jsx('img',{src:hotel.photos[0].src,alt:''}),n.jsxs('div',{children:[n.jsx('strong',{children:hotel.name}),n.jsx('p',{children:hotel.city+' · '+it(state.booking.arrival,state.booking.departure)})]})]}),
  n.jsxs('fieldset',{className:'keys-share-access-cards',disabled:busy,children:[n.jsx('legend',{className:'sr-only',children:'Доступ к поездке'}),...[
   ['read','Просмотр','Посмотреть отель и даты поездки.','doc'],
   ['manage','Управление',inStay?'Открывать номер, заказывать услуги и управлять поездкой.':'Добавить поездку к себе, изменять даты и гостей.','key']
  ].map(([value,title,copy,icon])=>n.jsxs('label',{className:'keys-share-access-card',children:[n.jsx('input',{type:'radio',name:'trip-link-access',value,checked:access===value,onChange:()=>{setAccess(value);setFallback(false);}}),n.jsx(D,{name:icon,className:'keys-share-access-icon'}),n.jsx('strong',{children:title}),n.jsx('small',{children:copy})]},value))]}),
  n.jsxs('figure',{className:'keys-share-qr',children:[
   n.jsx('div',{className:'keys-share-qr-image',children:qr?.url===url.href&&qr.src?n.jsx('img',{src:qr.src,alt:access==='manage'?'QR-код для управления поездкой':'QR-код для просмотра поездки',width:184,height:184}):n.jsx('span',{role:'status',children:qr?.error?'Не удалось создать QR-код. Поделитесь ссылкой.':'Готовим QR-код…'})}),
   n.jsxs('figcaption',{'aria-live':'polite',children:[n.jsx('strong',{children:access==='manage'?'QR-код для управления':'QR-код для просмотра'}),n.jsx('span',{children:'Покажите код вашему спутнику'})]})
  ]}),
  fallback&&n.jsxs('label',{className:'keys-trip-share-fallback',children:['Скопируйте ссылку',n.jsx('input',{readOnly:true,value:url.href,onFocus:event=>event.target.select()})]}),
  n.jsx(H,{disabled:busy,onClick:share,children:busy?'Подготовка…':'Поделиться ссылкой'})
 ]})});
}

// Preserve each screen's own back handler and reducer history. On desktop the
// header occupies its own row, so galleries cannot cover its controls.
function Ae(props) {
 const {back}=J();
 const roomHeaderRef=E.useRef(null);
 E.useLayoutEffect(()=>{
  const header=roomHeaderRef.current,parent=header?.parentElement;if(!parent)return;
  const measure=()=>parent.style.setProperty('--keys-room-header-height',header.getBoundingClientRect().height+'px');
  const observer=new ResizeObserver(measure);observer.observe(header);measure();
  return()=>{observer.disconnect();parent.style.removeProperty('--keys-room-header-height');};
 },[props.subtitle]);
 const [desktop,setDesktop]=E.useState(()=>document.documentElement.dataset.desktopAccount==='true');
 E.useEffect(()=>{
  const sync=()=>setDesktop(document.documentElement.dataset.desktopAccount==='true');
  const observer=new MutationObserver(sync);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-account']});
  sync();return()=>observer.disconnect();
 },[]);
 if(props.title==='Оплата'&&!props.subtitle)return n.jsx(KeysPaymentStayHeader,props);
 if(props.subtitle)return n.jsxs('header',{ref:roomHeaderRef,className:'keys-room-page-header'+(desktop?' is-desktop':''),children:[
  desktop?n.jsx('button',{type:'button',className:'keys-desktop-back','aria-label':'Назад',onClick:props.onBack??back,children:n.jsx(D,{name:'back',className:'size-5'})}):n.jsx(cs,{onClick:props.onBack??back}),
  n.jsxs('div',{className:'keys-room-header-copy',children:[n.jsx('h1',{tabIndex:-1,children:props.title}),n.jsx('p',{title:props.subtitle,children:props.subtitle})]}),
  props.action
 ]});
 if(!desktop)return n.jsx(KeysMobileScreenHeader,props);
 return n.jsxs('header',{className:'keys-desktop-screen-header',children:[
  n.jsx('button',{type:'button',className:'keys-desktop-back','aria-label':'Назад',onClick:props.onBack??back,children:n.jsx(D,{name:'back',className:'size-5'})}),
  n.jsx(props.overPhoto?'p':'h1',{className:'keys-desktop-screen-title',children:props.overPhoto?'Об отеле':props.title}),
  props.action&&n.jsx('div',{className:'keys-desktop-screen-actions',children:props.action})
 ]});
}

function KeysPaymentStayHeader(props){
 const {state}=J(),[editing,setEditing]=E.useState(false),desktop=useKeysDesktopBooking(),draft=state.reservation;
 if(!draft)return n.jsx(KeysMobileScreenHeader,props);
 if(desktop){
  const disabled=draft.status==='processing'||draft.status==='confirmed';
  const parameter=(section,label,value,icon)=>n.jsxs('button',{type:'button',className:'keys-hotel-stay-parameter','aria-label':'Изменить '+(section==='dates'?'даты поездки':'количество гостей'),'aria-haspopup':'dialog',disabled,onClick:()=>setEditing(section),children:[n.jsx(D,{name:icon,className:'size-5'}),n.jsxs('span',{children:[n.jsx('span',{children:label}),n.jsx('strong',{children:value})]}),n.jsx(D,{name:'down',className:'size-4'})]});
  return n.jsxs(n.Fragment,{children:[n.jsx(Ae,{...props,title:props.title==='Оплата'?'Оформление брони':props.title}),n.jsxs('section',{className:'keys-hotel-stay-bar keys-checkout-stay-bar','aria-label':'Даты и гости',children:[parameter('dates','Даты поездки',zt(draft.arrival,draft.departure),'calendar'),parameter('guests','Гости',Rt(draft.party),'users')]}),editing&&n.jsx(xh,{roomStay:true,section:editing,onClose:()=>setEditing(false)})]});
 }
 return n.jsxs(n.Fragment,{children:[
  n.jsx(Ae,{...props,subtitle:zt(draft.arrival,draft.departure)+' · '+Rt(draft.party),action:n.jsx('button',{type:'button',className:'keys-room-edit','aria-label':'Изменить даты и количество гостей',disabled:draft.status==='processing'||draft.status==='confirmed',onClick:()=>setEditing(true),children:'Изменить'})}),
  editing&&n.jsx(xh,{roomStay:true,onClose:()=>setEditing(false)})
 ]});
}

const KeysCreatedBookingCard=E.lazy(()=>import('./ReservationSuccessCard-uN5FuBj0.js').then(module=>({default:module.R})));
function KeysCreatedBookingDetails({bookingId}){
 const {state}=J(),record=state.keysCreatedBookings?.[bookingId],back=()=>keysPost('navigate',{target:'trips'});
 if(!record)return n.jsxs(n.Fragment,{children:[n.jsx(Ae,{title:'Детали брони',onBack:back}),n.jsx('p',{children:'Бронирование не найдено'})]});
 return n.jsx(E.Suspense,{fallback:n.jsx('p',{role:'status',children:'Загружаем бронь…'}),children:n.jsx(KeysCreatedBookingCard,{draft:record.draft,booking:record.booking,details:true,onBack:back})});
}
