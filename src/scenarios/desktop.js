/* Shared desktop dashboard for all trip scenarios. Mobile components keep their state and handlers. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const screen=home?.querySelector('.kpa-home'),toolbar=document.getElementById('keysScenarioControls');
 if(!root||!screen||!toolbar)return;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const paths={monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',mobile:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',arrow:'<path d="m9 5 7 7-7 7"/>',gift:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M12 7v14M3 7h18v4H3zM12 7C7 7 5 6 5 4a2 2 0 0 1 4-1l3 4Zm0 0c5 0 7-1 7-3a2 2 0 0 0-4-1l-3 4Z"/>',file:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8ZM7 8h10M7 12h7"/>',edit:'<path d="M12 4H4v16h16v-8M10 14l1-4L19 2l3 3-8 8-4 1Z"/>',check:'<path d="m5 12 4 4L19 6"/>',shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>'};
 const icon=name=>svg(paths[name]);
 const modes=document.createElement('div');modes.className='kd-view-switch';modes.setAttribute('role','group');modes.setAttribute('aria-label','Формат прототипа');
 modes.innerHTML=`<button type="button" data-view="desktop" aria-pressed="false">${icon('monitor')}<span>Десктоп</span></button><button type="button" data-view="mobile" aria-pressed="true">${icon('mobile')}<span>Мобильная</span></button>`;toolbar.append(modes);
 const main=document.createElement('div');main.className='kd-booking-column';
 const side=document.createElement('aside');side.className='kd-planning-column';side.setAttribute('aria-label','Подготовка и привилегии');
 [...screen.children].forEach(el=>(el.matches('.kh-nearby-v2,[data-nearby-slot]')?side:main).append(el));screen.append(main,side);
 const intro=document.createElement('div');intro.className='kd-page-heading';intro.innerHTML='<h1>Ваша поездка</h1>';screen.before(intro);
 const cancelTrip=document.createElement('button');cancelTrip.type='button';cancelTrip.className='keys-cancel-entry kd-cancel-trip';cancelTrip.textContent='Отменить бронирование';
 cancelTrip.addEventListener('click',()=>document.body.dataset.keysScenario==='stay'?window.KeysStayCancellation.open(cancelTrip):window.KeysBeforeCancellation.open(cancelTrip));
 const header=home.querySelector('.keys-app-header');
 const search=document.createElement('form');search.className='kd-header-search kd-web-only';search.setAttribute('role','search');
 search.innerHTML=`<label class="kd-search-label" for="kd-destination">Найти новый отель</label><input id="kd-destination" name="city" placeholder="Город или направление" autocomplete="off"><button type="submit" aria-label="Найти отель">${icon('search')}</button>`;
 const hotel=document.createElement('button');hotel.type='button';hotel.className='kd-header-hotel kd-web-only';hotel.dataset.before='details';hotel.innerHTML=`<img src="./scenarios/maidens-hotel.jpg" alt=""><span><strong>Maidens Hotel</strong><small data-kd-arrival>8 дней до заезда</small></span>${icon('arrow')}`;
 const points=document.createElement('button');points.type='button';points.className='kd-header-points kd-web-only';points.dataset.desktopAction='benefits';points.setAttribute('aria-label','Ваши баллы Ключей');points.innerHTML=`${icon('gift')}<strong data-kd-points>2 400</strong>`;
 header.querySelector('.keys-app-actions').before(search,hotel,points);
 const profile=header.querySelector('.keys-app-profile');const identity=document.createElement('span');identity.className='kd-profile-name kd-web-only';identity.textContent='Татьяна';profile.querySelector('svg').before(identity);profile.setAttribute('aria-label','Профиль Татьяны');
 const about=document.createElement('button');about.type='button';about.className='kd-about-hotel kd-web-only';about.dataset.before='hotel';about.innerHTML=`Об отеле ${icon('arrow')}`;screen.querySelector('.kpa-hotel-visual').append(about);
 const action=(id,title,copy,ico,extra='')=>`<button type="button" data-before="${id}" ${extra}>${icon(ico)}<span><strong>${title}</strong><small>${copy}</small></span>${icon('arrow')}</button>`;
 const actions=document.createElement('section');actions.className='kd-before-actions kd-web-only';actions.setAttribute('aria-label','Управление поездкой');
 actions.innerHTML=`<div class="kd-before-management" role="group" aria-label="Управление бронированием"><button type="button" class="keys-cancel-entry" data-before="manage" data-kd-manage>Изменить бронь</button></div><div class="kd-before-buttons" role="group" aria-label="Подготовка к заезду"><button type="button" class="kd-before-button" data-before="route" data-kd-route hidden>Построить маршрут</button><button type="button" class="kd-before-button" data-kd-registration hidden>Онлайн-регистрация</button></div><div class="kd-before-links" role="group" aria-label="Бронь и связь с отелем">${action('details','Бронь и документы','','file')}${action('chat','Чат с отелем','','chat')}${action('instruction','Инструкция по заселению','','pin','data-kd-instruction hidden')}</div>`;
 const beforeButtons=actions.querySelector('.kd-before-buttons'),beforeManagement=actions.querySelector('.kd-before-management');
 screen.querySelector('.kpa-reservation').after(actions);
 const checkin=document.createElement('section');checkin.className='kd-checkin kd-web-only';checkin.setAttribute('aria-labelledby','kd-checkin-title');
 checkin.innerHTML=`<header>${icon('shield')}<div><h2 id="kd-checkin-title">Онлайн-регистрация</h2><span data-kd-checkin-state>Пара минут — и всё готово</span></div></header><p data-kd-checkin-copy>Заполните данные заранее. В отеле останется только получить ключ.</p><button class="kd-primary" type="button" data-before="checkin"><span data-kd-checkin-label>Пройти онлайн-регистрацию</span>${icon('arrow')}</button>`;
 side.prepend(checkin);
 const walletSource=root.querySelector('.keys-benefits-wallet');
 const benefits=document.createElement('div');benefits.className='keys-benefits kd-wallet kd-web-only';const wallet=walletSource.cloneNode(true);benefits.append(wallet);checkin.after(benefits);wallet.id='kd-loyalty';wallet.tabIndex=-1;
 const walletHelp=document.createElement('details');walletHelp.className='keys-benefits-level-details';walletHelp.innerHTML=`<summary><span>Как копить и тратить</span>${icon('arrow')}</summary><div class="keys-benefits-reveal"><ul class="keys-benefits-perks"><li><strong>7% баллами за поездку</strong><span>Начислим после выезда и оплаты счёта.</span></li><li><strong>До 20% оплаты баллами</strong><span>Используйте при бронировании или оплате услуг. Скидку увидите до оплаты.</span></li></ul></div>`;wallet.append(walletHelp);
 const discovery=document.createElement('section');discovery.className='kd-discovery kd-web-only';discovery.setAttribute('aria-labelledby','kd-discovery-title');
 discovery.innerHTML=`<header><div><h2 id="kd-discovery-title">Подборки для новых впечатлений</h2><p>Пока ждёте эту поездку — найдите следующую</p></div><button type="button" class="kd-text-link" data-desktop-action="search">Перейти к поиску ${icon('arrow')}</button></header><div class="kd-discovery-features"><button type="button" class="kd-photo-pick" data-discovery-mode="photo"><span class="kd-photo-stack" aria-hidden="true"><img src="./sections/images/sochi/swissotel/92b13884e717.webp" alt=""><img src="./sections/images/sochi/seagalaxy/73d929a6ee5c.webp" alt=""></span><span><strong>Отели свайпом</strong><small>Листайте отели, сохраняйте любимые.</small><span class="kd-feature-link">Найти свой отель ${icon('arrow')}</span></span></button><button type="button" class="kd-advice-pick" data-discovery-mode="advice"><span><strong>Нужен совет?</strong><small>Расскажите, какой отдых хотите. Подберём подходящие отели.</small><span class="kd-feature-link">Подобрать отель ${icon('arrow')}</span></span><img src="./scenarios/ai-hotel-match.png" alt=""></button></div><div class="kd-theme-collections" aria-label="Тематические подборки">${[['deals','Горячие скидки','Выгоднее прямо сейчас'],['weekend','На пару дней','Маленькая перезагрузка'],['anywhere','Куда угодно','Главное — новые впечатления']].map(([id,title,copy])=>`<button type="button" data-discovery-collection="${id}"><span><strong>${title}</strong><small>${copy}</small></span><img src="./sections/collections/${id}.svg" alt="">${icon('arrow')}</button>`).join('')}</div>`;
 screen.after(discovery);
 // Mount the existing in-stay blocks; their handlers and service state stay shared.
 const stay=home.querySelector('.kh-home'),stayCard=stay.querySelector('.kh-stay-card');
 const stayNearby=stay.querySelector('.kh-nearby-v2');
 const nearbyAnchor=document.createComment('Mobile nearby position');stayNearby.before(nearbyAnchor);
 const staySide=document.createElement('aside');staySide.className='kd-stay-side kd-web-only';staySide.setAttribute('aria-label','Места рядом и привилегии');stay.append(staySide);
 const stayPhoto=document.createElement('div');stayPhoto.className='kd-stay-photo kd-web-only';
 stayPhoto.innerHTML=`<img src="./scenarios/maidens-hotel.jpg" alt="Фасад Maidens Hotel" width="480" height="360"><button type="button" class="kd-about-hotel" data-before="hotel">Об отеле ${icon('arrow')}</button>`;
 stayCard.querySelector('.kh-stay-heading').after(stayPhoto);
 const stayActions=document.createElement('section');stayActions.className='kd-trip-actions kd-stay-actions kd-web-only';stayActions.setAttribute('aria-label','Связь с отелем');
 stayActions.innerHTML=action('chat','Чат с отелем','Свяжитесь с ресепшеном','chat');
 staySide.append(stayActions);
 // Keep mobile DOM order intact; only mount existing blocks in columns on desktop.
 const scenarioLayouts={};
 for(const [name,selector,sideSelectors] of [
  ['search','.kse-home',['.ka-referral-card']],
  ['after','.ka-home:not(.kpa-home)',['.ka-reward']]
 ]){
  const page=home.querySelector(selector),children=[...page.children];
  const primary=document.createElement('div');primary.className='kd-scenario-main';
  const rail=document.createElement('aside');rail.className='kd-scenario-side';
  rail.setAttribute('aria-label',name==='search'?'Баллы и приглашение друзей':'Баллы за поездку и привилегии');
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
 const originalCheckin=screen.querySelector('.kpa-checkin');
 actions.querySelector('[data-kd-registration]').addEventListener('click',()=>originalCheckin.click());
 function syncCheckin(){const complete=originalCheckin.classList.contains('is-complete');actions.querySelector('[data-kd-registration]').textContent=complete?'Регистрация пройдена':'Онлайн-регистрация';checkin.classList.toggle('is-complete',complete);checkin.querySelector('[data-kd-checkin-state]').textContent=complete?'Регистрация пройдена':'Пара минут — и всё готово';checkin.querySelector('[data-kd-checkin-copy]').textContent=complete?'Данные переданы отелю. Мы готовы к вашему приезду.':'Заполните данные заранее. В отеле останется только получить ключ.';checkin.querySelector('[data-kd-checkin-label]').textContent=complete?'Посмотреть данные':'Пройти онлайн-регистрацию';}
 new MutationObserver(syncCheckin).observe(originalCheckin,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});syncCheckin();
 function syncBooking(){if(document.body.dataset.keysScenario!=='booked')return;hotel.querySelector('[data-kd-arrival]').textContent=screen.querySelector('.kpa-arrival-countdown').textContent.replace(/\s+/g,' ').trim();}
 new MutationObserver(syncBooking).observe(screen.querySelector('.kpa-arrival-countdown'),{childList:true,subtree:true,characterData:true});syncBooking();
 const searchOpen=detail=>root.dispatchEvent(new CustomEvent('keys-open-hotel-search',{detail}));
 search.addEventListener('submit',event=>{event.preventDefault();searchOpen({city:new FormData(search).get('city')});});
 root.addEventListener('click',event=>{const button=event.target.closest('[data-desktop-action],[data-discovery-mode],[data-discovery-collection]');if(!button)return;if(button.dataset.desktopAction==='benefits'){root.dispatchEvent(new CustomEvent('keys-open-benefits'));}else searchOpen(button.dataset.discoveryCollection?{collection:button.dataset.discoveryCollection}:button.dataset.discoveryMode?{mode:button.dataset.discoveryMode}:{});});
 let view=new URLSearchParams(location.search).get('view')==='desktop'?'desktop':'mobile';
 function render(){
  const scenario=document.body.dataset.keysScenario,inStay=scenario==='stay',supported=['stay','booked','search','after'].includes(scenario),desktop=view==='desktop'&&supported,arriving=document.body.dataset.keysArrivalDay==='arrival';
  document.body.dataset.keysView=desktop?'desktop':'mobile';document.body.dataset.keysDesktopHome=String(desktop&&!home.closest('.ku-section').hidden);
  // Move, rather than clone, shared discovery/loyalty so there is one source of state.
  syncScenarioLayouts(scenario,desktop);
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
   if(benefits.parentElement!==side)checkin.after(benefits);
   if(intro.nextElementSibling!==screen)screen.before(intro);
   if(screen.nextElementSibling!==discovery)screen.after(discovery);
  }
  intro.hidden=scenario==='search';
  const cancellationActions=inStay?stayActions:beforeManagement;if(cancelTrip.parentElement!==cancellationActions)cancellationActions.append(cancelTrip);
  cancelTrip.hidden=!['booked','stay'].includes(scenario);cancelTrip.toggleAttribute('data-stay-cancel',inStay);cancelTrip.disabled=inStay&&window.KeysStayCancellation.isRequested();cancelTrip.textContent=cancelTrip.disabled?'Выезд запрошен':inStay?'Отменить бронирование':'Отменить бронь';
  intro.querySelector('h1').textContent=scenario==='after'?'Ваша поездка завершена':'Ваша поездка';
  hotel.hidden=scenario==='search';
  delete hotel.dataset.after;
  if(scenario==='after'){delete hotel.dataset.before;delete hotel.dataset.info;hotel.dataset.after='stay';hotel.querySelector('[data-kd-arrival]').textContent='Поездка завершена';}
  else if(inStay){delete hotel.dataset.before;hotel.dataset.info='stay';hotel.querySelector('[data-kd-arrival]').textContent=document.body.dataset.keysStayDay==='checkout'?'Выезд сегодня до 12:00':`Проживание · день ${document.body.dataset.keysStayDay==='day-1'?'1':'2'} из 7`;}
  else{delete hotel.dataset.info;hotel.dataset.before='details';syncBooking();}
  discovery.querySelector('header p').textContent=scenario==='search'?'Выберите настроение — найдём подходящий отель':scenario==='after'||inStay?'Вдохновение для следующей поездки':'Пока ждёте эту поездку — найдите следующую';
  actions.querySelector('[data-kd-manage]').hidden=false;actions.querySelector('[data-kd-route]').hidden=!arriving;
  const registrationAvailable=document.body.dataset.keysArrivalDay!=='day-8';
  checkin.hidden=true;
  actions.querySelector('[data-kd-registration]').hidden=!registrationAvailable;
  beforeButtons.hidden=!registrationAvailable;
  actions.querySelector('[data-kd-instruction]').hidden=!registrationAvailable;
  actions.classList.toggle('has-instruction',registrationAvailable);
  const balance=walletSource.querySelector('.keys-benefits-amount strong').textContent;
  points.querySelector('strong').textContent=balance;wallet.querySelector('.keys-benefits-amount strong').textContent=balance;
  delete hotel.dataset.before;delete hotel.dataset.info;delete hotel.dataset.after;
  modes.querySelectorAll('button').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.view===(desktop?'desktop':'mobile')));button.disabled=button.dataset.view==='desktop'&&!supported;button.title=button.disabled?'Веб-версия недоступна для этого сценария':'';});
 }
 modes.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button||button.disabled)return;view=button.dataset.view;const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(history.state,'',url);render();});
 window.addEventListener('popstate',()=>{view=new URLSearchParams(location.search).get('view')==='desktop'?'desktop':'mobile';render();});root.addEventListener('keys-scenario-change',render);
 new MutationObserver(render).observe(home.closest('.ku-section'),{attributes:true,attributeFilter:['hidden']});render();
})();
