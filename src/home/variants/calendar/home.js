/* Current-stay dashboard. Original scenario handlers remain available. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const scroll=home.querySelector('.k3-scroll'),phone=home.querySelector('.k3-phone');
 const paths={arrow:'<path d="m9 5 7 7-7 7"/>',wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h15m3 4h-6v5h6m-3-2.5h.01"/>',wifi:'<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4.5 4.5 0 0 1 6 0"/><circle cx="12" cy="20" r=".7" fill="currentColor"/>',food:'<path d="M5 4v6a2 2 0 0 0 4 0V4M7 4v17M18 21V4c-3 1-4 5-4 9h4"/>',service:'<path d="M3 17h18M5 17v-2a7 7 0 0 1 14 0v2M12 5v3M10 5h4M5 21h14"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
 const arrow=`<span class="kh-chevron">${icon('arrow')}</span>`;
 const dashboard=document.createElement('div');dashboard.className='kh-home';
 dashboard.innerHTML=`
  <section class="kh-stay" aria-label="Текущее проживание">
   <div class="kh-hotel"><div class="kh-hotel-title"><h1>Maidens Hotel</h1><span class="kh-status">Проживание</span></div><button class="kh-booking-link" data-info="stay">Детали брони ${arrow}</button></div>
   <div class="kh-stay-calendar" aria-label="Календарь проживания с 12 по 19 сентября">
    <div class="kh-calendar-caption"><strong>Сегодня · день 2 из 7</strong><span>Сентябрь</span></div>
    <ol class="kh-calendar-days" aria-label="Даты проживания"><li class="past" aria-label="12 сентября, заезд, день завершён">12</li><li class="current" aria-current="date" aria-label="13 сентября, сегодня, второй день проживания">13</li><li aria-label="14 сентября">14</li><li aria-label="15 сентября">15</li><li aria-label="16 сентября">16</li><li aria-label="17 сентября">17</li><li aria-label="18 сентября">18</li><li class="departure" aria-label="19 сентября, выезд">19</li></ol>
    <div class="kh-calendar-ends"><span>12 сен · заезд</span><span>19 сен · выезд</span></div>
   </div>
  </section>
  <div class="kh-key-slot"></div>
  <div class="kh-essentials">
   <button class="kh-tile kh-deposit" data-home-action="deposit"><span class="kh-tile-title">${icon('wallet')} Депозит ${arrow}</span><strong>9 520 ₽</strong><small>Остаток на счёте</small></button>
   <button class="kh-tile" data-home-action="wifi"><span class="kh-tile-title">${icon('wifi')} Wi-Fi ${arrow}</span><strong class="kh-network">Maidens_Guest</strong><small>Логин и пароль</small></button>
  </div>
  <button class="kh-breakfast" data-home-action="breakfast"><span class="kh-icon">${icon('food')}</span><span class="kh-copy"><strong>Завтрак · шведский стол</strong><span>LEA · 3 этаж</span><small>Не включён · 680 ₽ с Silver</small></span><span class="kh-hours">с 07:00<span>до 12:00</span></span>${arrow}</button>
  <section class="kh-actions" aria-label="Услуги и помощь">
   <button data-info="services"><span class="kh-icon">${icon('service')}</span><span class="kh-copy"><strong>Все услуги отеля</strong><small>Еда, уборка, трансфер и другое</small></span>${arrow}</button>
   <button data-home-action="problem"><span class="kh-icon">${icon('help')}</span><span class="kh-copy"><strong>Сообщить о проблеме</strong><small>Поможем во время проживания</small></span>${arrow}</button>
  </section>
  <section class="kh-nearby"><div class="kh-section-title"><h2>Места рядом</h2><button data-home-action="nearby">Смотреть все ${icon('arrow')}</button></div><button class="kh-nearby-card" data-home-action="nearby"><span class="kh-nearby-art">${icon('pin')}</span><span class="kh-copy"><strong>Куда сходить сегодня</strong><span>Культура, прогулки и кофе</span><small>Подобрано по вашим интересам</small></span>${arrow}</button></section>`;
 // Keep legacy elements as routing anchors, outside the visible dashboard.
 const legacy=document.createElement('div');legacy.hidden=true;legacy.className='kh-legacy';
 const key=scroll.querySelector('.k3-access');
 Array.from(scroll.children).forEach(node=>{if(!node.classList.contains('keys-app-header'))legacy.append(node);});
 scroll.append(legacy,dashboard);dashboard.querySelector('.kh-key-slot').append(key);
 const overlay=document.createElement('section');overlay.className='kh-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','kh-detail-title');
 overlay.innerHTML=`<header class="kh-detail-header"><button class="kh-back" aria-label="Назад">${icon('back')}</button><div><small>Maidens Hotel</small><h2 id="kh-detail-title"></h2></div></header><div class="kh-detail-content"></div><p class="kh-copy-status" role="status"></p>`;phone.append(overlay);
 let origin=null,detail=null,problemFromHome=false;
 const close=()=>{overlay.hidden=true;scroll.inert=false;scroll.removeAttribute("aria-hidden");phone.querySelector('nav').inert=false;phone.querySelector('nav').removeAttribute("aria-hidden");origin?.focus({preventScroll:true});detail=null;};
 const open=(title,html,type,trigger)=>{origin=trigger??origin;detail=type;overlay.querySelector('h2').textContent=title;overlay.querySelector('.kh-detail-content').innerHTML=html;overlay.querySelector('.kh-copy-status').textContent='';overlay.hidden=false;overlay.scrollTop=0;scroll.inert=true;phone.querySelector('nav').inert=true;overlay.querySelector('.kh-back').focus({preventScroll:true});scroll.setAttribute('aria-hidden','true');phone.querySelector('nav').setAttribute('aria-hidden','true');};
 const places=[{name:'Большой театр',type:'Культура',why:'Для вас: театр и культурные события',address:'Театральная площадь, 1',description:'Идея для культурного вечера. Выберите спектакль и проверьте наличие билетов перед посещением.'},{name:'Парк «Зарядье»',type:'Прогулки',why:'Для вас: прогулки и городские виды',address:'Варварка, 6',description:'Прогулка по парку и виды на исторический центр — вариант для свободного времени в поездке.'},{name:'Кофемания на Покровке',type:'Кофе и еда',why:'Для вас: кафе и гастрономия',address:'Покровка, 18',description:'Идея для кофе или неспешного обеда. Выбрано из сохранённых рекомендаций текущей поездки.'}];
 function showNearby(trigger){open('Места рядом',`<p class="kh-intro">Идеи для вашей поездки, подобранные по интересам.</p><div class="kh-tags"><span>Культура</span><span>Прогулки</span><span>Кофе и еда</span></div><div class="kh-place-list">${places.map((p,i)=>`<button data-place="${i}"><span class="kh-icon">${icon('pin')}</span><span class="kh-copy"><small>${p.type}</small><strong>${p.name}</strong><span>${p.why}</span></span>${arrow}</button>`).join('')}</div>`,'nearby',trigger);}
 home.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.classList.contains('kh-back')){event.preventDefault();if(detail==='place')showNearby();else close();return;}
  if(button.hasAttribute('data-place')){const p=places[Number(button.dataset.place)];open(p.name,`<div class="kh-tags"><span>${p.type}</span></div><p class="kh-intro">${p.why}</p><section class="kh-detail-card"><p>${p.description}</p><strong>${p.address}</strong></section><a class="kh-primary" target="_blank" rel="noopener" href="https://2gis.ru/moscow/search/${encodeURIComponent('Москва '+p.address+' '+p.name)}">Посмотреть на карте</a>`,'place');return;}
  if(button.hasAttribute('data-copy')){const value=button.dataset.copy;navigator.clipboard?.writeText(value).then(()=>overlay.querySelector('.kh-copy-status').textContent='Скопировано',()=>overlay.querySelector('.kh-copy-status').textContent='Не удалось скопировать. Выделите данные вручную.');return;}
  if(button.hasAttribute('data-show-password')){overlay.querySelector('[data-wifi-password]').textContent='Maidens412';button.removeAttribute('data-show-password');button.dataset.copy='Maidens412';button.textContent='Копировать';button.setAttribute('aria-label','Скопировать пароль');return;}
  const action=button.dataset.homeAction;if(!action)return;event.preventDefault();event.stopPropagation();
  if(action==='deposit')open('Депозит и счёт',`<div class="kh-balance"><small>Остаток на счёте</small><strong>9 520 ₽</strong><span>Из внесённых 10 000 ₽</span></div><h3>Движение средств</h3><div class="kh-ledger"><div><span><strong>Пополнение депозита</strong><small>12 сентября · при заселении</small></span><b>+10 000 ₽</b></div><div><span><strong>Сырники со сметаной</strong><small>13 сентября · ресторан LEA</small></span><b>−480 ₽</b></div></div><div class="kh-total"><span>Всего расходов</span><strong>480 ₽</strong></div><p class="kh-note">Демонстрационный счёт. Проживание оплачено отдельно.</p>`,'deposit',button);
  if(action==='wifi')open('Wi-Fi',`<p class="kh-intro">Подключитесь к сети отеля и введите данные на странице авторизации.</p><section class="kh-credentials">${[['Сеть','Maidens_Guest'],['Логин','room_guest']].map(([name,value])=>`<div><span><small>${name}</small><strong>${value}</strong></span><button data-copy="${value}" aria-label="Скопировать ${name.toLowerCase()}">${icon('copy')}</button></div>`).join('')}<div><span><small>Пароль</small><strong data-wifi-password>••••••••••</strong></span><button class="kh-text-button" data-show-password>Показать</button></div></section><p class="kh-note">Демо-данные подключения для прототипа.</p>`,'wifi',button);
  if(action==='breakfast')open('Завтрак',`<div class="kh-tags"><span>Шведский стол</span><span>Ежедневно</span></div><section class="kh-detail-card"><div class="kh-fact"><span>Где</span><strong>Ресторан LEA · 3 этаж</strong></div><div class="kh-fact"><span>Время</span><strong>07:00–12:00</strong></div><div class="kh-fact"><span>Ваш тариф</span><strong>Завтрак не включён</strong></div><div class="kh-fact"><span>С уровнем Silver</span><strong>680 ₽ / сутки</strong></div></section><p class="kh-note">Обычная цена — 800 ₽. Скидка Silver — 15%.</p><button class="kh-primary" data-home-breakfast-services>Перейти к услугам отеля</button>`,'breakfast',button);
  if(action==='nearby')showNearby(button);
  if(action==='problem'){
   home.querySelector('.k3-stay-head').click();
   root.querySelector('#keysStayDetails [data-problem-entry]').click();problemFromHome=true;
  }
 });
 overlay.addEventListener('click',event=>{if(event.target.closest('[data-home-breakfast-services]')){close();dashboard.querySelector('[data-info="services"]').click();}});
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Tab'){const nodes=[...overlay.querySelectorAll('button,a[href]')];const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
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
