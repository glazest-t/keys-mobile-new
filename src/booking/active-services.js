/* A shared status list: example stages plus requests actually submitted in the prototype. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 const root=document.getElementById('keysStayDetails'),layer=root.querySelector('.ksd-detail-layer');
 const key='keys-active-requests-MD-120926-v1';
 let requests=[];
 try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))requests=data.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string'&&Number.isFinite(item.price));}catch{}
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={food:'<path d="M5 4v6a2 2 0 0 0 4 0V4M7 4v17M18 21V4c-3 1-4 5-4 9h4"/>',clean:'<path d="m16 3-7 9M6 11l7 6-4 5-7-6 4-5Zm-2 6 4 3M17 12v6m-3-3h6"/>',supplies:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 5v5m6-5v5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',check:'<path d="m5 12 4 4L19 6"/>',progress:'<path d="M12 3a9 9 0 1 1-9 9M3 7V3h4"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.supplies}</svg>`;
 const examples=[
  {id:'example-food',title:'Сырники со сметаной',price:480,icon:'food',state:'progress',status:'Готовится',time:'Сегодня · к 15:00',note:'Отель подтвердил заказ · доставим в номер'},
  {id:'example-cleaning',title:'Уборка номера',price:0,icon:'clean',state:'approved',status:'Подтверждено',time:'Сегодня · 16:00–17:00',note:'Администратор одобрил заявку'},
  {id:'example-towels',title:'Дополнительные полотенца',price:0,icon:'supplies',state:'pending',status:'Ждёт подтверждения',time:'Время уточнит отель',note:''}
 ];
 function all(){
  const scenario=document.body.dataset.keysScenario;
  if(!['stay','booked'].includes(scenario))return [];
  const items=[...(scenario==='stay'?examples:[]),...requests.map(item=>({...item,state:'pending',status:'Ждёт подтверждения',time:'Время уточнит отель',note:item.description||''}))];
  const times=window.KeysStayServices?.getRequests()||{};
  if(times.early&&scenario==='booked')items.push({id:'early',title:'Ранний заезд',icon:'clock',state:'pending',status:'Ждёт подтверждения',time:'Запрошен к '+times.early,note:'Возможность и стоимость подтвердит отель'});
  if(times.late)items.push({id:'late',title:'Поздний выезд',icon:'clock',state:'pending',status:'Ждёт подтверждения',time:'Запрошен до '+times.late,note:'Возможность и стоимость подтвердит отель'});
  return items;
 }
 const completedExamples=[
  {id:'done-room',title:'Подготовка номера',price:0,icon:'clean',state:'done',status:'Выполнено',time:'Вчера · 14:00',note:''},
  {id:'done-water',title:'Доставка воды',price:0,icon:'supplies',state:'done',status:'Выполнено',time:'Вчера · 19:20',note:''}
 ];
 let expanded=false,selected='active';
 const money=value=>value.toLocaleString('ru-RU')+' ₽';
 const plural=(n,forms)=>forms[n%100>=11&&n%100<=14?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];
 const history=()=>document.body.dataset.keysScenario==='stay'?completedExamples:[];
 const signature=()=>JSON.stringify([all(),history()]);
 const rows=items=>items.map(item=>`<li class="ksvc-order is-${item.state}" data-active-order="${escape(item.id)}"><span class="ksvc-order-icon">${icon(item.icon)}</span><div class="ksvc-order-body"><div class="ksvc-order-heading"><h3>${escape(item.title)}</h3>${Number.isFinite(item.price)?`<span class="ksvc-order-price">${item.price?money(item.price):'Бесплатно'}</span>`:''}</div><div class="ksvc-order-status">${icon(['approved','done'].includes(item.state)?'check':item.state==='progress'?'progress':'clock')}<span>${item.status}</span></div><p class="ksvc-order-time">${escape(item.time)}</p>${item.note?`<p class="ksvc-order-note">${escape(item.note)}</p>`:''}</div></li>`).join('');
 function render(){
  const items=all(),completed=history();if(!items.length&&!completed.length)return null;
  const charged=[...items,...completed].filter(item=>item.state!=='pending').reduce((sum,item)=>sum+(item.price||0),0);
  const pending=items.filter(item=>item.state==='pending').length;
  const next=items.find(item=>['progress','approved'].includes(item.state));
  const section=document.createElement('section');section.className='ksvc-active-orders';section.setAttribute('aria-label','Услуги и счёт');section.dataset.signature=signature();
  section.innerHTML=`<header class="ksvc-orders-heading"><div><h2>Услуги и счёт</h2><p class="ksvc-orders-count">${items.length?`${items.length} ${plural(items.length,['активная','активные','активных'])}`:'Нет активных заказов'}${pending?` · ${pending} ${plural(pending,['ждёт','ждут','ждут'])} ответа`:''}</p></div>${document.body.dataset.keysScenario==='stay'?`<button type="button" class="ksvc-orders-bill" data-subpage="bill" aria-label="Текущий счёт ${money(charged)}. Открыть детализацию"><span>${money(charged)} ${icon('chevron')}</span><small>Текущий счёт</small></button>`:''}</header>
  ${next?`<p class="ksvc-orders-next">${icon('clock')}<span><strong>${escape(next.time)}</strong> · ${escape(next.title)}</span></p>`:''}
  <button type="button" class="ksvc-orders-toggle" data-orders-toggle aria-expanded="${expanded}" aria-controls="ksvc-orders-details"><span>${expanded?'Свернуть заказы':'Посмотреть заказы'}</span>${icon('down')}</button>
  <div id="ksvc-orders-details" class="ksvc-orders-details" ${expanded?'':'hidden'}>
   <div class="kn-switch ksvc-orders-switch" role="group" aria-label="Статус заказов"><button type="button" data-orders-tab="active" aria-pressed="${selected==='active'}" aria-controls="ksvc-active-list">Активные · ${items.length}</button><button type="button" data-orders-tab="done" aria-pressed="${selected==='done'}" aria-controls="ksvc-done-list">Выполненные · ${completed.length}</button></div>
   <div id="ksvc-active-list" ${selected==='active'?'':'hidden'}>${items.length?`<ul aria-label="Активные услуги">${rows(items)}</ul>`:'<p class="ksvc-orders-empty">Активных заказов пока нет.</p>'}</div>
   <div id="ksvc-done-list" ${selected==='done'?'':'hidden'}>${completed.length?`<ul aria-label="Выполненные услуги">${rows(completed)}</ul>`:'<p class="ksvc-orders-empty">Выполненные услуги появятся здесь.</p>'}</div>
  </div>`;
  return section;
 }
 function refresh(){
  if(layer.querySelector('h1')?.textContent.trim()!=='Все услуги отеля')return;
  const content=layer.querySelector('.ksd-detail-content');if(!content.querySelector('.ksvc-catalog'))return;
  const existing=content.querySelector('.ksvc-active-orders');
  if(existing?.dataset.signature===signature())return;
  const next=render();if(existing){if(next)existing.replaceWith(next);else existing.remove();}else if(next)content.prepend(next);
 }
 layer.addEventListener('click',event=>{
  const button=event.target.closest('[data-orders-toggle],[data-orders-tab]');if(!button)return;
  event.preventDefault();event.stopPropagation();
  const section=button.closest('.ksvc-active-orders');
  if(button.hasAttribute('data-orders-toggle')){
   expanded=!expanded;button.setAttribute('aria-expanded',String(expanded));button.querySelector('span').textContent=expanded?'Свернуть заказы':'Посмотреть заказы';
   section.querySelector('.ksvc-orders-details').hidden=!expanded;
  }else{
   selected=button.dataset.ordersTab;
   section.querySelectorAll('[data-orders-tab]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.ordersTab===selected)));
   section.querySelector('#ksvc-active-list').hidden=selected!=='active';section.querySelector('#ksvc-done-list').hidden=selected!=='done';
  }
 });
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(requests));}catch{}refresh();};
 window.KeysActiveServices={render};
 app.addEventListener('keys-service-requests-change',refresh);
 app.addEventListener('keys-scenario-change',()=>queueMicrotask(refresh));
 // Capture the submitted basket before the original handler clears or hides it.
 window.addEventListener('click',event=>{
  const button=event.target.closest('#keysStayDetails [data-send-request],#keysStayDetails [data-delete-request]');if(!button)return;
  const content=layer.querySelector('.ksd-detail-content');
  if(button.hasAttribute('data-send-request')){
   const items=Object.entries(content._requestItems||{}).map(([name,item])=>({name,...item})).filter(item=>item.qty>0);if(!items.length)return;
   const page=layer.querySelector('h1')?.textContent.trim();
   const id='request-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
   const order={id,title:items.length===1?items[0].name:page,description:items.length===1?(items[0].qty>1?items[0].qty+' шт.':''):items.map(item=>item.name+' × '+item.qty).join(' · '),price:items.reduce((sum,item)=>sum+item.price*item.qty,0),icon:page==='Еда в номер'?'food':page==='Уборка номера'?'clean':'supplies'};
   setTimeout(()=>{const status=content.querySelector('[data-request-status]');if(!status||status.hidden)return;requests.push(order);content.dataset.activeRequest=id;save();});
  }else{
   const id=content.dataset.activeRequest;
   setTimeout(()=>{const status=content.querySelector('[data-request-status]');if(id&&status?.hidden){requests=requests.filter(item=>item.id!==id);delete content.dataset.activeRequest;save();}});
  }
 },true);
})();
