/* Shared desktop dashboard for all trip scenarios. Mobile components keep their state and handlers. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const screen=home?.querySelector('.kpa-home'),toolbar=document.getElementById('keysScenarioControls');
 if(!root||!screen||!toolbar)return;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const paths={route:'<path d="m21 3-6 18-4-8-8-4 18-6Z"/>',monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',mobile:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',arrow:'<path d="m9 5 7 7-7 7"/>',gift:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M12 7v14M3 7h18v4H3zM12 7C7 7 5 6 5 4a2 2 0 0 1 4-1l3 4Zm0 0c5 0 7-1 7-3a2 2 0 0 0-4-1l-3 4Z"/>',file:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',chat:'<path d="M16 10a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"></path><path d="M20 8a2 2 0 0 1 2 2v12l-4-4h-8a2 2 0 0 1-2-2"></path>',edit:'<path d="M12 4H4v16h16v-8M10 14l1-4L19 2l3 3-8 8-4 1Z"/>',check:'<path d="m5 12 4 4L19 6"/>',shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>'};
 const icon=name=>svg(paths[name]);
 const modes=document.createElement('div');modes.className='kd-view-switch';modes.setAttribute('role','group');modes.setAttribute('aria-label','Формат прототипа');
 modes.innerHTML=`<button type="button" data-view="desktop" aria-pressed="false">${icon('monitor')}<span>Десктоп</span></button><button type="button" data-view="mobile" aria-pressed="true">${icon('mobile')}<span>Мобильная</span></button>`;toolbar.append(modes);
 const main=document.createElement('div');main.className='kd-booking-column';
 const side=document.createElement('aside');side.className='kd-planning-column';side.setAttribute('aria-label','Подготовка и привилегии');
 [...screen.children].forEach(el=>(el.matches('.kh-nearby-v2,[data-nearby-slot]')?side:main).append(el));screen.append(main,side);
 const intro=document.createElement('div');intro.className='kd-page-heading';intro.innerHTML='<h1>Ваша поездка</h1>';screen.before(intro);
 const header=home.querySelector('.keys-app-header');
 const tripSearch=document.createElement('button');tripSearch.type='button';tripSearch.className='kd-trip-search-toggle';tripSearch.setAttribute('aria-haspopup','dialog');tripSearch.setAttribute('aria-expanded','false');tripSearch.innerHTML=`${icon('search')}<strong>Найти новый отель</strong><span>Куда, когда, кто едет</span>`;
 header.querySelector('.keys-app-logo').after(tripSearch);
 const searchOverlay=document.createElement('div');searchOverlay.className='kd-trip-search-overlay';searchOverlay.hidden=true;document.body.append(searchOverlay);
 let tripSearchFrame=null,tripSearchBackground=[],tripSearchOverflow='';
 const positionTripSearch=()=>{
  if(!tripSearchFrame)return;
  const box=tripSearch.getBoundingClientRect();
  tripSearchFrame.contentWindow.postMessage({source:'keys-home-search-host',anchor:{left:box.left,bottom:box.bottom}},location.origin);
 };
 window.addEventListener('resize',positionTripSearch);
 const closeTripSearch=()=>{
  if(searchOverlay.hidden)return;
  searchOverlay.hidden=true;searchOverlay.classList.remove('is-ready');searchOverlay.replaceChildren();tripSearchFrame=null;
  tripSearchBackground.forEach(([node,inert])=>node.inert=inert);tripSearchBackground=[];
  document.body.style.overflow=tripSearchOverflow;tripSearch.setAttribute('aria-expanded','false');tripSearch.focus({preventScroll:true});
 };
 tripSearch.addEventListener('click',()=>{
  if(!searchOverlay.hidden)return;
  tripSearchFrame=document.createElement('iframe');tripSearchFrame.title='Поиск нового отеля';tripSearchFrame.id='keysTripSearchFrame';
  tripSearchFrame.src='./sections/index.html?headerSearch=1&v=trip-search-popup&brand='+encodeURIComponent(document.body.dataset.keysBrand||'base');
  searchOverlay.replaceChildren(tripSearchFrame);searchOverlay.hidden=false;tripSearch.setAttribute('aria-expanded','true');
  tripSearchBackground=[...document.body.children].filter(node=>node!==searchOverlay).map(node=>[node,node.inert]);tripSearchBackground.forEach(([node])=>node.inert=true);
  tripSearchOverflow=document.body.style.overflow;document.body.style.overflow='hidden';tripSearchFrame.focus();
 });
 window.addEventListener('message',event=>{
  if(!tripSearchFrame||event.source!==tripSearchFrame.contentWindow||event.origin!==location.origin||event.data?.source!=='keys-header-search')return;
  if(event.data.type==='ready'){positionTripSearch();if(searchContext)tripSearchFrame.contentWindow.postMessage({source:'keys-home-search-host',search:searchContext},location.origin);}
  if(event.data.type==='painted')searchOverlay.classList.add('is-ready');
  if(event.data.type==='close')closeTripSearch();
  if(event.data.type==='submit'){const {search,hotelId}=event.data;searchContext=search;closeTripSearch();searchOpen({searchRequest:search,hotelId});}
  if(event.data.type==='advice'){closeTripSearch();searchOpen({mode:'advice',wish:event.data.wish});}
 });
 root.addEventListener('keys-scenario-change',closeTripSearch);

 const hotel=document.createElement('button');hotel.type='button';hotel.className='kd-header-hotel kd-web-only';hotel.dataset.before='details';hotel.innerHTML=`<img src="./scenarios/maidens-hotel.jpg" alt=""><span><strong>Maidens Hotel</strong><small data-kd-arrival>Заезд сегодня</small></span>${icon('arrow')}`;
 const points=document.createElement('button');points.type='button';points.className='kd-header-points kd-web-only';points.dataset.desktopAction='benefits';points.setAttribute('aria-label','Ваши баллы Ключей');points.innerHTML=`${icon('gift')}<strong data-kd-points>2 400</strong>`;
 header.querySelector('.keys-app-actions').before(hotel,points);
 const profile=header.querySelector('.keys-app-profile');const identity=document.createElement('span');identity.className='kd-profile-name kd-web-only';identity.textContent='Татьяна';profile.querySelector('svg').before(identity);profile.setAttribute('aria-label','Профиль Татьяны');
 const about=document.createElement('button');about.type='button';about.className='kd-about-hotel kd-web-only';about.dataset.before='hotel';about.innerHTML=`Об отеле ${icon('arrow')}`;screen.querySelector('.kpa-hotel-visual').append(about);
 const action=(id,title,copy,ico,extra='')=>`<button type="button" data-before="${id}" ${extra}>${icon(ico)}<span><strong>${title}</strong><small>${copy}</small></span>${icon('arrow')}</button>`;
 const actions=document.createElement('section');actions.className='kd-before-actions kd-web-only';actions.setAttribute('aria-label','Управление поездкой');
 actions.innerHTML=`<div class="kd-before-links" role="group" aria-label="Действия с поездкой">${action('route','Построить маршрут','','route','data-kd-route')}${action('details','Детали брони','','file')}${action('chat','Чат с отелем','','chat')}${action('instruction','Инструкция по заселению','','pin','data-kd-instruction hidden')}</div>`;
 screen.querySelector('.kpa-reservation').after(actions);
 const walletSource=root.querySelector('.keys-benefits-wallet');
 const pointsMarkup=`<header><span class="kd-points-icon">${icon('gift')}</span><h2>Баллы Ключей</h2></header><div class="kd-points-balance"><strong></strong><span>баллов доступно</span></div><p class="kd-points-copy"></p><button type="button" class="kd-points-link" data-desktop-action="points-program"><span>Как использовать</span>${icon('arrow')}</button>`;
 const syncPoints=card=>{
  const signedIn=document.body.dataset.keysGuestSearch!=='true'||document.body.dataset.keysGuestAuthorized==='true';
  const amount=document.body.dataset.keysGuestSearch==='true'?'0':walletSource.querySelector('.keys-benefits-amount strong')?.textContent||'0';
  card.querySelector('.kd-points-balance').hidden=!signedIn;
  card.querySelector('.kd-points-balance strong').textContent=amount;
  card.querySelector('.kd-points-copy').textContent=signedIn?'1 балл = 1 ₽ скидки':'Копите баллы за бронирования и оплачивайте ими следующие поездки.';
 };
 const createPoints=()=>{const card=document.createElement('section');card.className='kd-points-card';card.dataset.desktopPoints='';card.setAttribute('aria-label','Баллы Ключей');card.innerHTML=pointsMarkup;syncPoints(card);return card;};
 window.KeysDesktopPoints={create:createPoints,sync:syncPoints};
 const benefits=document.createElement('div');benefits.className='kd-wallet kd-web-only';const wallet=createPoints();benefits.append(wallet);side.prepend(benefits);wallet.id='kd-loyalty';wallet.tabIndex=-1;
 const discovery=document.createElement('section');discovery.className='kd-discovery kd-web-only';discovery.setAttribute('aria-labelledby','kd-discovery-title');
 discovery.innerHTML=`<header><div><h2 id="kd-discovery-title">Подборки для новых впечатлений</h2><p>Пока ждёте эту поездку — найдите следующую</p></div><button type="button" class="kd-text-link" data-desktop-action="search">Перейти к поиску ${icon('arrow')}</button></header><div class="kd-discovery-features"><button type="button" class="kd-photo-pick" data-discovery-mode="photo"><span class="kd-photo-stack" aria-hidden="true"><img src="./sections/images/sochi/swissotel/92b13884e717.webp" alt=""><img src="./sections/images/sochi/seagalaxy/73d929a6ee5c.webp" alt=""></span><span><strong>Отели свайпом</strong><small>Листайте отели, сохраняйте любимые.</small><span class="kd-feature-link">Найти свой отель ${icon('arrow')}</span></span></button><button type="button" class="kd-advice-pick" data-discovery-mode="advice"><span><strong>Нужен совет?</strong><small>Расскажите, какой отдых хотите. Подберём подходящие отели.</small><span class="kd-feature-link">Подобрать отель ${icon('arrow')}</span></span><img src="./scenarios/ai-hotel-match.png" alt=""></button></div><div class="kd-theme-collections" aria-label="Тематические подборки">${[['deals','Горячие скидки','Отели со скидкой от 10%']].map(([id,title,copy])=>`<button type="button" data-discovery-collection="${id}"><span><strong>${title}</strong><small>${copy}</small></span><img src="./sections/collections/${id}.svg" alt="">${icon('arrow')}</button>`).join('')}</div>`;
 screen.after(discovery);
 // Mount the existing in-stay blocks; their handlers and service state stay shared.
 const stay=home.querySelector('.kh-home'),stayCard=stay.querySelector('.kh-stay-card');
 const stayNearby=stay.querySelector('.kh-nearby-v2');
 const nearbyAnchor=document.createComment('Mobile nearby position');stayNearby.before(nearbyAnchor);
 const staySide=document.createElement('aside');staySide.className='kd-stay-side kd-web-only';staySide.setAttribute('aria-label','Места рядом и привилегии');stay.append(staySide);
 const stayPhoto=document.createElement('div');stayPhoto.className='kd-stay-photo kd-web-only';
 stayPhoto.innerHTML=`<img src="./scenarios/maidens-premium-king.jpg" alt="Премиум Кинг с видом во двор — номер гостя в Maidens Hotel" width="480" height="360"><button type="button" class="kd-about-hotel" data-before="hotel">Об отеле ${icon('arrow')}</button>`;
 stayCard.querySelector('.kh-stay-heading').after(stayPhoto);
 const stayActions=document.createElement('section');stayActions.className='kd-trip-actions kd-stay-actions kd-web-only';stayActions.setAttribute('aria-label','Связь с отелем');
 stayActions.innerHTML=action('chat','Чат с отелем','Свяжитесь с ресепшеном','chat');
 staySide.append(stayActions);
 // Keep mobile DOM order intact; only mount existing blocks in columns on desktop.
 const scenarioLayouts={};
 for(const [name,selector,sideSelectors] of [
  ['search','.kse-home',['.kse-benefits']],
  ['after','.ka-home:not(.kpa-home)',['.ka-reward']]
 ]){
  const page=home.querySelector(selector),children=[...page.children];
  const primary=document.createElement('div');primary.className='kd-scenario-main';
  const rail=document.createElement('aside');rail.className='kd-scenario-side';
  rail.setAttribute('aria-label',name==='search'?'Привилегии и баллы':'Баллы за поездку и привилегии');
  scenarioLayouts[name]={page,children,primary,rail,sideSelectors};
 }
 function syncScenarioLayouts(name,desktop){
  for(const [key,layout] of Object.entries(scenarioLayouts)){
   const {page,children,primary,rail,sideSelectors}=layout;
   if(desktop&&key===name){
    if(primary.parentElement!==page){
     children.forEach(el=>(sideSelectors.some(selector=>el.matches(selector))?rail:primary).append(el));
     page.append(primary,rail);
    }
    if(benefits.parentElement!==rail){if(key==='search')rail.prepend(benefits);else rail.append(benefits);}
   }else if(primary.parentElement===page){
    children.forEach(el=>page.append(el));primary.remove();rail.remove();
   }
  }
 }
 // Reuse the same search controls and pickers as Find in a dedicated home slot.
 const searchHome=home.querySelector('.kse-home'),searchHeading=searchHome.querySelector('.kse-heading');
 const searchSlot=document.createElement('div');searchSlot.className='kd-home-search-slot kd-web-only';
 const searchFrame=document.createElement('iframe');searchFrame.title='Поиск отеля на главной';searchFrame.id='keysHomeSearchFrame';searchSlot.append(searchFrame);
 let searchContext=null,searchReady=false,searchModal=false,modalBackground=[];
 const syncHomeSearch=()=>{if(searchReady&&searchContext)searchFrame.contentWindow?.postMessage({source:'keys-home-search-host',search:searchContext},location.origin);};
 const setSearchModal=active=>{
  if(searchModal===active)return;searchModal=active;searchSlot.classList.toggle('is-modal',active);
  if(active){
   modalBackground=[];let node=searchSlot;
   while(node&&node!==document.body){for(const sibling of node.parentElement.children)if(sibling!==node){modalBackground.push([sibling,sibling.inert]);sibling.inert=true;}node=node.parentElement;}
  }else{modalBackground.forEach(([node,inert])=>node.inert=inert);modalBackground=[];}
 };
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin)return;
  const runtime=root.querySelector('#keysSectionsFrame');
  if(event.source===runtime?.contentWindow&&event.data?.source==='keys-arbana'&&event.data.type==='search-context'){
   searchContext=event.data.search;syncHomeSearch();return;
  }
  if(event.source!==searchFrame.contentWindow||event.data?.source!=='keys-home-search')return;
  if(event.data.type==='ready'){searchReady=true;syncHomeSearch();}
  if(event.data.type==='size'){
   setSearchModal(!!event.data.modal);
   if(Number.isFinite(event.data.height))searchFrame.style.setProperty('--search-frame-height',Math.min(520,Math.max(112,event.data.height))+'px');
  }
  if(event.data.type==='submit'){
   searchContext=event.data.search;setSearchModal(false);
   searchOpen({searchRequest:searchContext,hotelId:event.data.hotelId});
  }
 });
 function syncBooking(){if(document.body.dataset.keysScenario!=='booked')return;hotel.querySelector('[data-kd-arrival]').textContent=screen.querySelector('.kpa-arrival-countdown').textContent.replace(/\s+/g,' ').trim();}
 new MutationObserver(syncBooking).observe(screen.querySelector('.kpa-arrival-countdown'),{childList:true,subtree:true,characterData:true});syncBooking();
 const searchOpen=detail=>root.dispatchEvent(new CustomEvent('keys-open-hotel-search',{detail}));
 root.addEventListener('click',event=>{const button=event.target.closest('[data-desktop-action],[data-discovery-mode],[data-discovery-collection]');if(!button)return;if(['benefits','points-program'].includes(button.dataset.desktopAction)){if(button.dataset.desktopAction==='points-program'&&document.body.dataset.keysBenefitsPage==='points'&&document.body.dataset.keysDesktopSecondary==='benefits')root.querySelector('.keys-benefits-guide')?.scrollIntoView({behavior:'smooth',block:'start'});else root.dispatchEvent(new CustomEvent('keys-open-benefits',{detail:{page:button.dataset.desktopAction==='points-program'?'points':'overview'}}));}else searchOpen(button.dataset.discoveryCollection?{collection:button.dataset.discoveryCollection}:button.dataset.discoveryMode?{mode:button.dataset.discoveryMode}:{});});
 let view=new URLSearchParams(location.search).get('view')==='desktop'?'desktop':'mobile';
 function render(){
  const guestSearch=document.body.dataset.keysGuestSearch==='true';
  if(view!=='desktop')closeTripSearch();
  if(guestSearch){view='desktop';const url=new URL(location.href);url.searchParams.set('view','desktop');history.replaceState(history.state,'',url);}
  const scenario=document.body.dataset.keysScenario,inStay=scenario==='stay',supported=['stay','booked','search','after'].includes(scenario),desktop=view==='desktop'&&supported;
  document.body.dataset.keysView=desktop?'desktop':'mobile';document.body.dataset.keysDesktopHome=String(desktop&&!home.closest('.ku-section').hidden);
  // Move, rather than clone, shared discovery/loyalty so there is one source of state.
  syncScenarioLayouts(scenario,desktop);
  if(desktop&&scenario==='search'&&!guestSearch){
   if(searchSlot.parentElement!==searchHome.parentElement){searchReady=false;searchHome.before(searchHeading,searchSlot);}
   if(!searchFrame.hasAttribute('src'))searchFrame.src='./sections/index.html?homeSearch=1&brand='+encodeURIComponent(document.body.dataset.keysBrand||new URLSearchParams(location.search).get('brand')||'base');
  }else{setSearchModal(false);const parent=scenarioLayouts.search.primary.parentElement?scenarioLayouts.search.primary:searchHome;parent.prepend(searchHeading);searchSlot.remove();}

  if(desktop&&scenarioLayouts[scenario]){
   const page=scenarioLayouts[scenario].page;
   if(stayNearby.parentElement!==stay)nearbyAnchor.after(stayNearby);
   if(intro.nextElementSibling!==page)page.before(intro);
   if(page.nextElementSibling!==discovery)page.after(discovery);
  }else if(inStay&&desktop){
   if(stayNearby.parentElement!==staySide)staySide.append(stayNearby,benefits,stayActions);
   if(intro.nextElementSibling!==stay)stay.before(intro);
   if(stay.nextElementSibling!==discovery)stay.after(discovery);
  }else{
   if(stayNearby.parentElement!==stay)nearbyAnchor.after(stayNearby);
   if(benefits.parentElement!==side)side.prepend(benefits);
   if(intro.nextElementSibling!==screen)screen.before(intro);
   if(screen.nextElementSibling!==discovery)screen.after(discovery);
  }
  intro.hidden=scenario==='search';
  intro.querySelector('h1').textContent=scenario==='after'?'Ваша поездка завершена':'Ваша поездка';
  hotel.hidden=scenario==='search';
  delete hotel.dataset.after;
  if(scenario==='after'){delete hotel.dataset.before;delete hotel.dataset.info;hotel.dataset.after='stay';hotel.querySelector('[data-kd-arrival]').textContent='Поездка завершена';}
  else if(inStay){delete hotel.dataset.before;hotel.dataset.info='stay';hotel.querySelector('[data-kd-arrival]').textContent=document.body.dataset.keysStayDay==='checkout'?'Выезд сегодня до 12:00':'Проживает в отеле';}
  else{delete hotel.dataset.info;hotel.dataset.before='details';syncBooking();}
  discovery.querySelector('header p').textContent=scenario==='search'?'Выберите настроение — найдём подходящий отель':scenario==='after'||inStay?'Вдохновение для следующей поездки':'Пока ждёте эту поездку — найдите следующую';
  actions.querySelector('[data-kd-route]').hidden=false;
  actions.querySelector('[data-kd-instruction]').hidden=false;
  actions.classList.add('has-instruction');
  root.querySelectorAll('[data-desktop-points]').forEach(syncPoints);
  points.querySelector('strong').textContent=document.body.dataset.keysGuestSearch==='true'?'0':walletSource.querySelector('.keys-benefits-amount strong').textContent;
  delete hotel.dataset.before;delete hotel.dataset.info;delete hotel.dataset.after;
  modes.querySelectorAll('button').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.view===(desktop?'desktop':'mobile')));button.disabled=guestSearch?button.dataset.view==='mobile':button.dataset.view==='desktop'&&!supported;button.title=button.disabled?(guestSearch?'Этот сценарий доступен только на десктопе':'Веб-версия недоступна для этого сценария'):'';});
 }
 modes.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button||button.disabled)return;view=button.dataset.view;const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(history.state,'',url);render();});
 window.addEventListener('popstate',()=>{view=new URLSearchParams(location.search).get('view')==='desktop'?'desktop':'mobile';render();});root.addEventListener('keys-scenario-change',event=>{if(event.detail?.resetView)view='mobile';render();});
 new MutationObserver(()=>root.querySelectorAll('[data-desktop-points]').forEach(syncPoints)).observe(document.body,{attributes:true,attributeFilter:['data-keys-guest-search','data-keys-guest-authorized']});
 new MutationObserver(render).observe(home.closest('.ku-section'),{attributes:true,attributeFilter:['hidden']});render();
})();
