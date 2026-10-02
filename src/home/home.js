/* Current-stay dashboard. Original scenario handlers remain available. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const scroll=home.querySelector('.k3-scroll'),phone=home.querySelector('.k3-phone');
 const paths={coffee:"<path d=\"M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2m4-2v2M3 22h17\"></path>",arrow:'<path d="m9 5 7 7-7 7"/>',wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h15m3 4h-6v5h6m-3-2.5h.01"/>',wifi:'<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4.5 4.5 0 0 1 6 0"/><circle cx="12" cy="20" r=".7" fill="currentColor"/>',food:'<path d="M5 4v6a2 2 0 0 0 4 0V4M7 4v17M18 21V4c-3 1-4 5-4 9h4"/>',service:'<path d="M3 17h18M5 17v-2a7 7 0 0 1 14 0v2M12 5v3M10 5h4M5 21h14"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
 const arrow=`<span class="kh-chevron">${icon('arrow')}</span>`;
 const dashboard=document.createElement('div');dashboard.className='kh-home';
 dashboard.innerHTML=`
  <section class="kh-stay-card" aria-label="Текущее проживание"><div class="kh-stay-heading"><div class="kh-hotel-summary"><span class="kh-live"><i aria-hidden="true"></i> Проживание</span><h1>Maidens Hotel</h1></div><button data-info="stay" class="kh-booking-link kh-detail-link">Детали брони ${arrow}</button></div>
  <section class="kh-room-pass" aria-label="Ваше проживание и цифровой ключ">
   <div class="kh-pass-room"><div class="kh-pass-room-id"><span>Ваш номер</span><div class="kh-pass-room-line"><strong>412</strong><span>4 этаж</span></div><small>Премиум Кинг</small></div><div class="kh-pass-today"><span>Сегодня</span><strong>День 2 <span>из 7</span></strong><time datetime="2026-09-13">13 сентября</time></div></div>
   <div class="kh-pass-stay">
    <div class="kh-pass-progress" role="img" aria-label="Идёт второй день проживания из семи. Один день завершён."><span></span></div>
    <div class="kh-pass-endpoints"><div><span>Заезд</span><time datetime="2026-09-12T14:00">12 сентября</time></div><div><span>Выезд</span><time datetime="2026-09-19T12:00">19 сентября · 12:00</time></div></div>
   </div>
   <button class="kh-open-door" data-info="key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="4.5"/><path d="m11.3 11.3 8.2 8.2m-2.7-2.7 2.7-2.7m-5.5 0 2.6-2.6"/></svg><span>Открыть дверь</span>${arrow}</button>
  </section>
  </section>
  <section class="kh-quick-actions" aria-label="Быстрые действия">
   <button data-info="services"><span>${icon('service')}</span><strong>Все услуги</strong></button>
   <button data-home-action="wifi"><span>${icon('wifi')}</span><strong>Wi-Fi</strong></button>
   <button data-home-action="problem"><span>${icon('help')}</span><strong>Есть проблема</strong></button>
  </section>
  <section class="kh-daily" aria-label="Счёт и питание">
   <button class="kh-account-row" data-home-action="deposit"><span class="kh-round-icon">${icon('wallet')}</span><span class="kh-copy"><strong>Депозит</strong><small>На вашем счёте</small></span><span class="kh-account-value"><strong>9 520 ₽</strong><small class="kh-detail-link">Детализация ${icon('arrow')}</small></span></button>
   <button class="kh-meal-row" data-home-action="breakfast"><span class="kh-round-icon">${icon('coffee')}</span><strong class="kh-meal-title">Завтрак</strong><span class="kh-copy"><span>Шведский стол · LEA, 3 этаж</span><small>Не включён · 680 ₽ с Silver</small></span><span class="kh-meal-time">07:00–12:00 ${arrow}</span></button>
  </section>
  <section class="kh-nearby-v2" aria-labelledby="kh-nearby-title">
   <button type="button" class="kh-nearby-card-link" data-home-action="nearby" data-nearby-view="list" aria-label="Рядом с вами — посмотреть места"></button>
   <div class="kh-nearby-heading"><div class="kh-nearby-summary"><h2 id="kh-nearby-title">Рядом с вами</h2><p>По вашим интересам</p><span class="kh-nearby-count" data-nearby-count>5 мест · от отеля</span></div><span class="kh-nearby-visual"><span class="kh-nearby-map" aria-hidden="true"><span class="kh-map-grid"></span><span class="kh-nearby-map-pin">${icon('pin')}</span></span><img class="kh-nearby-photo kh-nearby-photo-front" src="./home/nearby/nearby-cafe-generated.jpg" alt="Уютное городское кафе — сгенерированная иллюстрация" width="56" height="70" loading="lazy"></span></div>
   <div class="kh-nearby-actions"><button class="kh-detail-link" data-home-action="nearby" data-nearby-view="list" aria-label="Все места рядом">Все места ${arrow}</button><button class="kh-detail-link" data-home-action="nearby" data-nearby-view="map">Места на карте ${icon('pin')}</button></div>
  </section>`;
 // Keep legacy elements as routing anchors, outside the visible dashboard.
 const legacy=document.createElement('div');legacy.hidden=true;legacy.className='kh-legacy';
 Array.from(scroll.children).forEach(node=>{if(!node.classList.contains('keys-app-header'))legacy.append(node);});
 scroll.append(legacy,dashboard);// The original key remains a hidden routing anchor; the pass uses the same data-info action.
 const overlay=document.createElement('section');overlay.className='kh-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','kh-detail-title');
 overlay.innerHTML=`<header class="kh-detail-header"><button class="kh-back" aria-label="Назад">${icon('back')}</button><div><h2 id="kh-detail-title"></h2></div></header><div class="kh-detail-content"></div><p class="kh-copy-status" role="status"></p>`;phone.append(overlay);
 let origin=null,detail=null,problemFromHome=false,returnFromBreakfast=null;
 const close=()=>{overlay.hidden=true;scroll.inert=false;scroll.removeAttribute("aria-hidden");phone.querySelector('nav').inert=false;phone.querySelector('nav').removeAttribute("aria-hidden");origin?.focus({preventScroll:true});detail=null;const onReturn=returnFromBreakfast;returnFromBreakfast=null;onReturn?.();};
 const open=(title,html,type,trigger)=>{origin=trigger??origin;detail=type;overlay.querySelector('h2').textContent=title;overlay.querySelector('.kh-detail-content').innerHTML=html;overlay.querySelector('.kh-copy-status').textContent='';overlay.hidden=false;overlay.scrollTop=0;scroll.inert=true;phone.querySelector('nav').inert=true;overlay.querySelector('.kh-back').focus({preventScroll:true});scroll.setAttribute('aria-hidden','true');phone.querySelector('nav').setAttribute('aria-hidden','true');};
 const breakfastStorageKey='keys-breakfast-MD-120926-v1';
 let breakfastAdded=false;
 try{breakfastAdded=localStorage.getItem(breakfastStorageKey)==='added';}catch{}
 const isBreakfastAdded=()=>breakfastAdded;
 const syncBreakfast=()=>{dashboard.querySelector('.kh-meal-row .kh-copy small').textContent=breakfastAdded?'Добавлен за доплату · 680 ₽ / сутки':'Не включён · 680 ₽ с Silver';};
 const openBreakfast=(button,onReturn=null)=>{
  returnFromBreakfast=onReturn;
  open('Завтрак',`<div class="kh-tags"><span>Шведский стол</span><span>Ежедневно</span></div><section class="kh-detail-card"><div class="kh-fact"><span>Где</span><strong>Ресторан LEA · 3 этаж</strong></div><div class="kh-fact"><span>Время</span><strong>07:00–12:00</strong></div><div class="kh-fact"><span>${breakfastAdded?'Ваша услуга':'Ваш тариф'}</span><strong>${breakfastAdded?'Добавлен за доплату':'Завтрак не включён'}</strong></div><div class="kh-fact"><span>С уровнем Silver</span><strong>680 ₽ / сутки</strong></div></section>${breakfastAdded?'<p class="kh-note">Завтрак добавлен к проживанию и оплачивается отдельно.</p>':''}<button type="button" class="kh-primary${breakfastAdded?' kh-breakfast-remove':''}" ${breakfastAdded?'data-home-breakfast-remove':'data-home-breakfast-add'}>${breakfastAdded?'Убрать завтрак':'Добавить услугу'}</button>`,'breakfast',button);
 };
 const notifyService=message=>{
  const section=root.querySelector(':scope>.ku-section:not([hidden])');
  const toast=section?.querySelector('.k3-toast,.ksd-toast');
  if(!toast)return;
  const owner=toast.closest('#keysHomeVariantThree,#keysStayDetails');
  clearTimeout(owner._t);toast.textContent=message;toast.setAttribute('role','status');toast.hidden=false;
  owner._t=setTimeout(()=>toast.hidden=true,4000);
 };
 window.KeysHomeViews={open,close,openBreakfast,isBreakfastAdded,notifyService};
 syncBreakfast();
 const nearby=window.KeysNearby.create({open,overlay,dashboard,icon});
 const showNearby=trigger=>nearby.show(trigger,trigger.dataset.nearbyView);
 home.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(nearby.handle(button,event))return;
  if(button.classList.contains('kh-back')){event.preventDefault();if(!nearby.back(detail))close();return;}
  if(button.hasAttribute('data-copy')){const value=button.dataset.copy;navigator.clipboard?.writeText(value).then(()=>overlay.querySelector('.kh-copy-status').textContent='Скопировано',()=>overlay.querySelector('.kh-copy-status').textContent='Не удалось скопировать. Выделите данные вручную.');return;}
  if(button.hasAttribute('data-show-password')){overlay.querySelector('[data-wifi-password]').textContent='Maidens412';button.removeAttribute('data-show-password');button.dataset.copy='Maidens412';button.textContent='Копировать';button.setAttribute('aria-label','Скопировать пароль');return;}
  const action=button.dataset.homeAction;if(!action)return;event.preventDefault();event.stopPropagation();
  if(action==='deposit')open('Депозит и счёт',`<div class="kh-balance"><small>Остаток на счёте</small><strong>9 520 ₽</strong><span>Из внесённых 10 000 ₽</span></div><h3>Движение средств</h3><div class="kh-ledger"><div><span><strong>Пополнение депозита</strong><small>12 сентября · при заселении</small></span><b>+10 000 ₽</b></div><div><span><strong>Сырники со сметаной</strong><small>13 сентября · ресторан LEA</small></span><b>−480 ₽</b></div></div><div class="kh-total"><span>Всего расходов</span><strong>480 ₽</strong></div><p class="kh-note">Проживание оплачено отдельно.</p>`,'deposit',button);
  if(action==='wifi')open('Wi-Fi',`<p class="kh-intro">Подключитесь к сети отеля и введите данные на странице авторизации.</p><section class="kh-credentials">${[['Сеть','Maidens_Guest'],['Логин','room_guest']].map(([name,value])=>`<div><span><small>${name}</small><strong>${value}</strong></span><button data-copy="${value}" aria-label="Скопировать ${name.toLowerCase()}">${icon('copy')}</button></div>`).join('')}<div><span><small>Пароль</small><strong data-wifi-password>••••••••••</strong></span><button class="kh-text-button" data-show-password>Показать</button></div></section>`,'wifi',button);
  if(action==='breakfast')openBreakfast(button);
  if(action==='nearby')showNearby(button);
  if(action==='problem'){
   home.querySelector('.k3-stay-head').click();
   root.querySelector('#keysStayDetails [data-problem-entry]').click();problemFromHome=true;
  }
 });
 overlay.addEventListener('click',event=>{
  if(event.target.closest('[data-home-breakfast-add],[data-home-breakfast-remove]')){
   breakfastAdded=!!event.target.closest('[data-home-breakfast-add]');
   try{if(breakfastAdded)localStorage.setItem(breakfastStorageKey,'added');else localStorage.removeItem(breakfastStorageKey);}catch{}
   syncBreakfast();root.dispatchEvent(new CustomEvent('keys-breakfast-change'));
   close();
   notifyService(breakfastAdded?'Услуга добавлена':'Завтрак убран из поездки');
  }
 });
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();if(!nearby.back(detail))close();}if(event.key==='Tab'){const nodes=[...overlay.querySelectorAll('button,a[href],input,[tabindex="0"]')];const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 // Returning from a problem opened on the dashboard returns directly to its origin.
 document.addEventListener('click',event=>{
  if(!problemFromHome)return;
  const button=event.target.closest('button');if(!button)return;
  if(button.closest('nav')){problemFromHome=false;return;}
  if(button.matches('#keysStayDetails .ksd-detail-back')){
   event.preventDefault();event.stopImmediatePropagation();problemFromHome=false;
   root.querySelector('#keysStayDetails .ksd-detail-layer').hidden=true;
   root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s.dataset.unifiedSection!=='trips');
  }
 },true);
})();
