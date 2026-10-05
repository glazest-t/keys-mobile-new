/* Contextual trip popover: the header is an overview, existing flows stay shared. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const trigger=home?.querySelector('.kd-header-hotel');if(!trigger)return;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={arrow:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',file:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',key:'<circle cx="8" cy="8" r="4.5"/><path d="m11.3 11.3 8.2 8.2m-2.7-2.7 2.7-2.7m-5.5 0 2.6-2.6"/>',service:'<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 10V7M10 7h4M4 21h16"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',history:'<path d="M3 11a9 9 0 1 1 2.4 7M3 5v6h6M12 7v5l3 2"/>',chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8ZM7 8h10M7 12h7"/>',star:'<path d="m12 3 2.8 5.7 6.3.9-4.55 4.45 1.07 6.28L12 17.36l-5.62 2.97 1.07-6.28L2.9 9.6l6.3-.9Z"/>',check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
 const panel=document.createElement('section');panel.id='keysDesktopTripMenu';panel.className='kd-trip-menu';panel.setAttribute('popover','auto');panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','kd-trip-menu-title');home.querySelector('.keys-app-header').append(panel);
 trigger.setAttribute('popovertarget',panel.id);trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','false');trigger.querySelector(':scope>svg').outerHTML=icon('down');
 const scenario=()=>document.body.dataset.keysScenario;
 const close=()=>{if(panel.matches(':popover-open'))panel.hidePopover();};
 const row=(action,label,name)=>`<button type="button" class="kd-trip-menu-row" data-trip-menu-action="${action}">${icon(name)}<span>${label}</span>${icon('arrow')}</button>`;
 function render(){
  const state=scenario(),after=state==='after',stay=state==='stay',soon=document.body.dataset.keysArrivalDay!=='day-8';
  const status=after?'Поездка завершена':stay?(document.body.dataset.keysStayDay==='checkout'?'Выезд сегодня до 12:00':'Проживание'):home.querySelector('.kpa-arrival-countdown').textContent.trim();
  const dates=state==='booked'?home.querySelector('.kpa-trip-schedule').getAttribute('aria-label').replace('Проживание: ',''):'12–19 сентября · 7 ночей';
  const orders=window.KeysActiveServices?.getOrders()||[];
  panel.innerHTML=`<header><h2 id="kd-trip-menu-title">${after?'Завершённая поездка':'Ваша поездка'}</h2><button type="button" data-trip-menu-close aria-label="Закрыть окно поездки">${icon('close')}</button></header>
   <button type="button" class="kd-trip-menu-hotel" data-trip-menu-action="details"><img src="./scenarios/maidens-hotel.jpg" alt=""><span><strong>Maidens Hotel</strong><small>Москва · ${esc(dates)}</small><span class="kd-trip-menu-status">${icon(after?'check':stay?'key':'clock')}${esc(status)}</span></span>${icon('arrow')}</button>
   ${stay?`<button type="button" class="kd-primary kd-trip-menu-primary" data-trip-menu-action="key">${icon('key')}Открыть номер 412</button>`:state==='booked'&&soon?`<button type="button" class="kd-primary kd-trip-menu-primary" data-trip-menu-action="checkin">${icon('check')}${home.querySelector('.kpa-checkin').classList.contains('is-complete')?'Регистрация пройдена':'Онлайн-регистрация'}</button>`:''}
   ${orders.length?`<div class="kd-trip-menu-orders"><div class="kd-trip-menu-label">Активные услуги · ${orders.length}</div>${orders.slice(0,1).map(order=>`<button type="button" data-trip-menu-action="services">${icon(order.state==='approved'?'check':'clock')}<span><strong>${esc(order.title)}</strong><small>${esc(order.time)}</small><span class="kd-trip-menu-order-status${order.state==='pending'?' is-pending':''}">${esc(order.status)}</span></span>${icon('arrow')}</button>`).join('')}</div>`:''}
   <nav aria-label="Действия с поездкой">${row('details',after?'Детали проживания':'Бронь и документы','file')}${after?row('documents','Документы поездки','file')+row('review','Оставить отзыв','star'):row('services','Все услуги отеля','service')+row('route','Как добраться','pin')}${after?row('chat','Связаться с отелем','chat'):''}${row('history','Прошлые поездки','history')}</nav>`;
 }
 function position(){const box=trigger.getBoundingClientRect(),width=Math.min(380,innerWidth-32);panel.style.width=width+'px';panel.style.left=Math.max(16,Math.min(box.right-width,innerWidth-width-16))+'px';panel.style.top=Math.min(box.bottom+12,innerHeight-100)+'px';panel.style.maxHeight=Math.max(80,innerHeight-box.bottom-28)+'px';}
 panel.addEventListener('beforetoggle',event=>{if(event.newState==='open'){render();position();}});
 panel.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(panel.matches(':popover-open'))));
 panel.addEventListener('focusout',event=>{if(event.relatedTarget&&!panel.contains(event.relatedTarget)&&event.relatedTarget!==trigger)close();});
 panel.addEventListener('click',event=>{
  if(event.target.closest('[data-trip-menu-close]')){close();trigger.focus();return;}
  const button=event.target.closest('[data-trip-menu-action]');if(!button)return;
  const action=button.dataset.tripMenuAction,state=scenario();close();trigger.focus({preventScroll:true});
  const click=selector=>home.querySelector(selector)?.click();
  if(action==='details'){if(state==='booked')click('.kpa-actions [data-before="details"]');else app.dispatchEvent(new CustomEvent('keys-open-stay-details'));}
  if(action==='key')click('.kh-open-door');
  if(action==='services')click(state==='booked'?'.kpa-services-all':'.kh-home>.kh-quick-actions [data-info="services"]');
  if(action==='checkin')click('.kpa-checkin');
  if(action==='route')click('.kd-trip-actions [data-before="route"]');
  if(action==='chat')app.dispatchEvent(new CustomEvent('keys-open-hotel-chat'));
  if(action==='documents')window.KeysTripDocuments.open(trigger);
  if(action==='review')app.dispatchEvent(new CustomEvent('keys-open-trip-review',{detail:{trigger}}));
  if(action==='history')window.KeysHomeViews.open('Прошлые поездки',state==='after'?`<button type="button" class="kd-trip-menu-hotel kd-history-trip" data-after="stay"><img src="./scenarios/maidens-hotel.jpg" alt=""><span><strong>Maidens Hotel</strong><small>Москва · 12–19 сентября · 7 ночей</small><span class="kd-trip-menu-status">${icon('check')}Поездка завершена</span></span>${icon('arrow')}</button>`:'<p class="kh-intro">Здесь появятся завершённые поездки, их документы и отзывы.</p>','trip-history',trigger);
 });
 app.addEventListener('keys-scenario-change',close);
 new MutationObserver(close).observe(document.body,{attributes:true,attributeFilter:['data-keys-view','data-keys-desktop-home']});
 window.addEventListener('resize',()=>{if(panel.matches(':popover-open'))position();});
 window.addEventListener('scroll',close,{passive:true});
})();
