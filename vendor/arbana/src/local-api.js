/* Local replacement for the prototype's HTTP services. No requests leave the browser. */
(() => {
  const bootstrap = __BOOTSTRAP__;
  const key = 'pora-static-data-v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const uid = () => globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now = () => new Date().toISOString();
  let db;
  try { db = JSON.parse(localStorage.getItem(key)); } catch {}
  db ??= { user: null, profiles: {}, accounts: {}, challenges: {} };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(db)); } catch {} };
  const person = id => bootstrap.personas.find(p => p.id === id) ?? bootstrap.personas[0];
  const account = () => {
    const id = db.user?.id ?? 'anonymous';
    return db.accounts[id] ??= {
      favorites: [], documents: [], trips: [], collections: [], chats: {},
      friends: bootstrap.personas.filter(p => p.id !== db.user?.personaId).map(p => ({id:p.id,name:p.firstName+' '+p.lastName,avatar:p.avatar})),
      notifications: [{id:'welcome',category:'account',title:'Вы вошли в профиль',body:'Поездки и сохранённые отели доступны в вашем профиле.',target:'profile',createdAt:now(),readAt:null}], preferences: {trips:true,offers:false,priceWatch:false,revision:0}, devices:[]
    };
  };
  const error = (code,status=400) => ({__error:true,status,error:{code}});
  const success = () => ({ok:true});
  const hotel = id => globalThis.PoraDemo.engine?.hotels.find(h => h.id === id);
  const member = id => id === db.user?.id ? {id,name:db.user.firstName+' '+db.user.lastName} : account().friends.find(p => p.id === id) ?? {id,name:'Друг'};
  const summary = id => {
    const h=hotel(id); if(!h)return null;
    return {...h, photos:h.photos.map(p=>({...p,url:p.src,caption:p.alt})), thumbnailUrl:h.image, mainPhoto:{url:h.image}, location:{city:h.city??'Сочи'}};
  };
  function saveTrip(state) {
    if (!db.user || !state.tripContext.hasBooking) return;
    const a=account(), b=state.booking, h=hotel(b.hotelId);
    if(!h)return;
    const id='scenario-'+b.id;
    const item={id,source:'demo',status:b.cancellation?'cancelled':'confirmed',hotel:{id:h.id,name:h.name,city:h.city??'Сочи'},room:b.room?.name??'',reference:b.id,arrival:b.arrival,departure:b.departure,guests: b.party.adults + b.party.childrenAges.length,total:{amountMinor:String(Math.round(b.paid*100)),currency:'RUB'},note:'',revision:b.revision??0,syncedAt:null};
    const old=a.trips.find(t=>t.id===id);
    if(old && JSON.stringify({...old,note:''})===JSON.stringify(item))return;
    item.note=old?.note??'';
    a.trips=[item,...a.trips.filter(t=>t.id!==id)]; save();
  }
  function collectionView(c) {
    return {...c,count:c.items.length,members:c.memberIds.map(member),items:c.items.map(i=>({...i,hotel:summary(i.hotelId)}))};
  }
  function handle(raw, method='GET', body={}) {
    const url=new URL(raw,'http://static.local'), p=decodeURIComponent(url.pathname).replace(/^.*\/api\/v1\//,''), a=account();
    if(p==='auth/bootstrap')return {...copy(bootstrap),user:db.user};
    if(p==='auth/demo/request-code') {
      if(!bootstrap.personas.some(p=>p.id===body.personaId))return error('INVALID_INPUT');
      const id=uid(); db.challenges[id]=body.personaId; save();
      return {challengeId:id,demoCode:'123456',maskedPhone:'+7 ••• •••-00-00',resendAvailableAt:now(),expiresAt:new Date(Date.now()+600000).toISOString()};
    }
    if(p==='auth/demo/verify-code'||p==='auth/mfa/verify') {
      const id=db.challenges[body.challengeId];
      if(!id)return error('CHALLENGE_EXPIRED');
      if(body.code!=='123456' && !/^DEMO-/.test(body.code??''))return error('INVALID_CODE');
      const per=person(id);
      db.user=db.profiles[id]??{id,personaId:id,firstName:per.firstName,lastName:per.lastName,email:id+'@example.test',phone:'+7 900 000-00-00',locale:'ru',avatar:per.avatar,mfaEnabled:false};
      db.profiles[id]=db.user; save();return {status:'authenticated',user:db.user,csrfToken:'static-demo-token'};
    }
    if(p==='auth/logout') {db.user=null;save();return {...bootstrap,user:null};}
    if(p==='auth/me'||p==='auth/avatar'||p==='auth/avatar/remove') {
      if(!db.user)return error('UNAUTHORIZED',401);
      if(p==='auth/me') Object.assign(db.user,body);
      else db.user.avatar=p.endsWith('remove')?null:{url:body.image};
      db.profiles[db.user.id]=db.user;save();return {user:db.user};
    }
    if(p==='auth/sessions')return {sessions:[{id:'local',current:true,userAgent:'Static prototype',lastSeenAt:now(),createdAt:now()}]};
    if(p==='auth/sessions/revoke')return success();
    if(p==='auth/mfa/setup')return {qrCodeDataUrl:__QR_DATA_URL__,setupId:'local',secret:'JBSWY3DPEHPK3PXP',otpauthUri:'otpauth://totp/Pora:demo?secret=JBSWY3DPEHPK3PXP&issuer=Pora',expiresAt:new Date(Date.now()+600000).toISOString()};
    if(p.startsWith('auth/mfa/')) {
      if(body.code!=='123456'&&!/^DEMO-/.test(body.code??''))return error('INVALID_CODE');
      db.user.mfaEnabled=!p.endsWith('disable');save();return {user:db.user,recoveryCodes:Array.from({length:8},(_,i)=>'DEMO-000'+i)};
    }
    if(p==='favorites/ids')return {ids:a.favorites};
    if(p==='favorites/view'||p.endsWith('/events')||p.endsWith('/widget-events'))return success();
    if(p==='favorites') {
      if(method!=='GET') {a.favorites=a.favorites.filter(id=>id!==body.hotelId);if(body.saved)a.favorites.push(body.hotelId);save();}
      return {ids:a.favorites,items:a.favorites.map(hotelId=>({hotelId,hotel:summary(hotelId),savedAt:now()})),nextCursor:null};
    }
    if(p==='social/friends')return {items:a.friends};
    if(/^social\/friends\/[^/]+\/remove$/.test(p)) {a.friends=a.friends.filter(f=>f.id!==p.split('/')[2]);save();return success();}
    if(p==='social/invites') {a.invite=uid();save();return {token:a.invite};}
    if(p==='social/invites/revoke'){a.invite=null;save();return success();}
    if(p==='social/invites/preview')return {sender:member('anya'),accepted:false};
    if(p==='social/invites/accept'){if(!a.friends.some(f=>f.id==='anya'))a.friends.push(member('anya'));save();return success();}
    if(p==='social/collections') {
      if(method!=='GET') {
        const c={id:uid(),title:body.title??'Выбираем вместе',ownerId:db.user?.id,memberIds:[...new Set([db.user?.id,...body.memberIds??body.members??body.friendIds??[]])],items:(body.hotelIds??[]).map(hotelId=>({hotelId,addedBy:db.user?.id,votes:[]})),search:body.search??null,revision:0};
        a.collections.push(c);save();return collectionView(c);
      }
      return {items:a.collections.map(collectionView),nextCursor:null};
    }
    if(p.startsWith('social/collections/')) {
      const [, ,id,action]=p.split('/'), c=a.collections.find(c=>c.id===id);
      if(!c)return error('NOT_FOUND',404);
      if(action==='remove'){a.collections=a.collections.filter(c=>c.id!==id);save();return success();}
      if(action==='members'){c.memberIds=c.memberIds.filter(id=>id!==body.userId);if(body.present)c.memberIds.push(body.userId);}
      if(action==='hotels'){c.items=c.items.filter(i=>i.hotelId!==body.hotelId);if(body.present)c.items.push({hotelId:body.hotelId,addedBy:db.user.id,votes:[]});}
      if(action==='vote'){const i=c.items.find(i=>i.hotelId===body.hotelId);if(i){i.votes=i.votes.filter(id=>id!==db.user.id);if(body.liked)i.votes.push(db.user.id);}}
      save();return collectionView(c);
    }
    if(p==='documents') {
      if(method==='GET')return {items:a.documents};
      const d={...body,id:uid(),revision:0,maskedNumber:'•••• '+(body.number??'0000').slice(-4)};delete d.number;
      a.documents.push(d);save();return d;
    }
    if(p.startsWith('documents/')) {
      const id=p.split('/')[1],d=a.documents.find(d=>d.id===id);
      if(!d)return error('NOT_FOUND',404);
      if(p.endsWith('/remove')){a.documents=a.documents.filter(d=>d.id!==id);save();return success();}
      Object.assign(d,body,{revision:d.revision+1});if(body.number){d.maskedNumber='•••• '+body.number.slice(-4);delete d.number;}save();return d;
    }
    if(p==='trips'||p==='trips/claim') {
      if(method==='GET'){
        const filter=url.searchParams.get('filter'),on=url.searchParams.get('on')??'2026-09-24';
        const items=a.trips.filter(t=>filter==='cancelled'?t.status==='cancelled':t.status!=='cancelled'&&(filter==='past'?t.departure<on:t.departure>=on));
        return {items,nextCursor:null};
      }
      const state=globalThis.PoraDemo.state, h=hotel('more');
      const b={id:uid(),source:'manual',status:'confirmed',hotel:{id:'more',name:h?.name??'Swissôtel Камелия',city:'Сочи'},room:'Стандарт',arrival:state?.booking.arrival??'2026-09-23',departure:state?.booking.departure??'2026-09-27',guests:2,note:'',revision:0,...body};
      a.trips.push(b);save();return {booking:b,history:[]};
    }
    if(p.startsWith('trips/')) {
      const id=p.split('/')[1], b=a.trips.find(t=>t.id===id);
      if(!b)return error('NOT_FOUND',404);
      if(p.endsWith('/remove')){a.trips=a.trips.filter(t=>t.id!==id);save();return success();}
      if(method!=='GET'){Object.assign(b,body,{revision:b.revision+1});save();}
      return {booking:b,history:[]};
    }
    if(p==='notifications/settings') {
      if(method==='PATCH'){Object.assign(a.preferences,body,{revision:a.preferences.revision+1});save();return a.preferences;}
      return {preferences:a.preferences,devices:a.devices,pushEnabled:true,vapidPublicKey:'local-demo',capabilities:{push:true}};
    }
    if(p==='notifications/push'){const d={id:uid(),current:true,name:'Это устройство',createdAt:now()};a.devices=[d];save();return d;}
    if(p.startsWith('notifications/push/')){a.devices=[];save();return success();}
    if(p==='notifications/read'||/^notifications\/[^/]+\/read$/.test(p)){
      const id=p.split('/')[1];a.notifications.forEach(n=>{if(id==='read'||n.id===id)n.readAt=now();});save();return success();
    }
    if(p==='notifications')return {items:a.notifications,unread:a.notifications.filter(n=>!n.readAt).length,nextCursor:null};
    if(p==='price-watches')return {items:[],nextCursor:null};
    if(p.startsWith('chats'))return chat(p,body,method);
    if(p==='hotel-content/descriptions')return {schemaVersion:'guest-portal-hotel-content/1',locale:'ru',items:[],missingProviderIds:body.providerIds??[]};
    globalThis.PoraDemo.unhandled.push({path:p,method});
    return error('NOT_FOUND',404);
  }
  // HTTP chat fallback. Main demo chats retain the original reducer-based replies.
  function chat(p,b,method){
    const a=account();if(p==='chats')return {items:Object.values(a.chats).map(c=>c.chat),nextOffset:null};
    const [,kind,id,action]=p.split('/'), h=hotel(id);
    const c=a.chats[id]??={chat:{id,kind:kind==='hotels'?'hotel':'discovery',hotelId:kind==='hotels'?id:null,hotelName:h?.name??'Подбор отелей',title:h?.name??'Подбор отелей',updatedAt:now(),unread:0},messages:[],runs:[],agentEnabled:true,presentation:{enabled:false,photos:false,availability:false},beforeTurn:null};
    if(action==='messages'){
      const runId=uid(),turn=c.messages.length/2;
      c.messages.push({id:uid(),runId,role:'user',text:b.text,turn,createdAt:now()},{id:uid(),runId,role:'assistant',text:reply(b.text,h),turn,createdAt:now()});
      c.runs.push({id:runId,status:'completed'});c.chat.updatedAt=now();save();return {runId};
    }
    return c;
  }
  function reply(text,h){
    if(/завтрак|поесть|ресторан/i.test(text))return 'Завтрак подаётся с 07:00 до 12:00. Можно заказать доставку в номер в разделе «Услуги».';
    if(/заезд|выезд/i.test(text))return 'Заезд с 15:00, выезд до 14:00. Ранний заезд и поздний выезд можно оформить в услугах отеля.';
    if(/wi.?fi|вай.?фай|интернет/i.test(text))return 'Wi-Fi доступен на всей территории. Данные для подключения находятся в карточке вашей поездки.';
    if(/спа|бассейн|массаж/i.test(text))return 'В отеле есть бассейн и спа. Массаж и другие процедуры можно выбрать в разделе «Услуги».';
    return h?`Здравствуйте! Помогу с проживанием в ${h.name}. Могу рассказать о номерах, завтраке, бассейне, заезде и услугах.`:'Для отдыха у моря подойдут Swissôtel Камелия, Pullman Сочи Центр и Mantera Supreme. Уточните, что важнее: цена, спа, бассейн или тишина?';
  }
  class LocalEventSource extends EventTarget {
    static CONNECTING=0;static OPEN=1;static CLOSED=2;
    constructor(url){super();this.url=url;this.readyState=1;queueMicrotask(()=>this.dispatchEvent(new Event('open')));}
    close(){this.readyState=2;}
  }
  globalThis.EventSource=LocalEventSource;
  globalThis.PoraDemo={engine:null,state:null,dispatch:null,unhandled:[],saveTrip,api:handle,reset(){try{localStorage.removeItem(key);}catch{}location.reload();}};
  globalThis.fetch=async (input,options={})=>{
    const raw=typeof input==='string'?input:input.url, method=options.method??input.method??'GET';
    if(!String(raw).includes('/api/v1/'))return new Response(JSON.stringify({error:{code:'OFFLINE_ONLY'}}),{status:503});
    let body={};try{body=JSON.parse(options.body??'{}');}catch{}
    const result=handle(raw,method,body);
    const status=result?.__error?result.status:200;
    return new Response(JSON.stringify(result?.__error?{error:result.error}:result),{status,headers:{'Content-Type':'application/json'}});
  };
})();
