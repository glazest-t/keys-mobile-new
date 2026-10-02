/* In-stay booking details. Legacy routing anchors and scenario handlers stay intact. */
(() => {
 const root=document.getElementById('keysStayDetails');
 if(!root)return;
 const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
 const icons={file:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',bed:'<path d="M3 18v3M21 18v3M3 18h18V9H3v9ZM5 9V4h14v5M7 6h3v3M14 6h3v3"/>',check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8ZM7 8h10M7 12h7"/>',phone:'<path d="m6 3 4 5-3 3a13 13 0 0 0 6 6l3-3 5 4-1 3C11 23 1 13 3 4l3-1Z"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',fitness:'<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>'};
 const arrow=svg('<path d="m9 5 7 7-7 7"/>');
 const row=(icon,title,copy,attr)=>`<button type="button" class="kb-row" ${attr}><span class="kb-icon">${svg(icons[icon])}</span><span class="kb-copy"><strong>${title}</strong><small>${copy}</small></span><span class="kb-arrow">${arrow}</span></button>`;
 function install(){
  const scroll=root.querySelector('.ksd-scroll'),head=scroll.querySelector('.ksd-head');
  const legacy=document.createElement('div');legacy.hidden=true;legacy.className='kb-legacy';
  [...scroll.children].forEach(node=>{if(node!==head)legacy.append(node)});
  scroll.append(legacy);scroll.classList.add('kb-scroll');
  head.querySelector('small')?.remove();
  head.querySelector('[data-open="Поделиться бронью"]')?.remove();
  const view=document.createElement('div');view.className='kb-details';
  view.innerHTML=`
   <section class="kb-section" aria-label="Условия брони">
    <div class="kb-card kb-reservation">
     <div class="kb-guest"><span class="kb-guest-icon">${svg(icons.user)}</span><div><small>Основной гость · 1 взрослый</small><strong>Татьяна Глазырина</strong></div></div>
     <div class="kb-room"><span class="kb-icon">${svg(icons.bed)}</span><div><strong>Премиум Кинг</strong><small>Номер с видом во двор</small></div></div>
     <dl class="kb-facts"><div><dt>Тариф</dt><dd>Деловой</dd></div><div><dt>Стоимость проживания</dt><dd>56 000 ₽</dd></div></dl>
     <div class="kb-paid">${svg(icons.check)}<span>Проживание оплачено</span></div>
     <div class="kb-included"><span class="kb-icon">${svg(icons.fitness)}</span><div><small class="kb-included-label">Включено в тариф</small><strong>Фитнес-студия</strong><small>2 этаж · ежедневно 07:00–23:00</small></div></div>
    </div>
   </section>
   <section class="kb-section kb-documents-section" aria-label="Документы брони">
    <button type="button" class="kb-row kb-documents-entry" data-booking-documents><span class="kb-icon">${svg(icons.file)}</span><span class="kb-copy"><strong>Документы</strong><small>Проживание и чеки</small></span><span class="kb-arrow">${arrow}</span></button>
   </section>
   <section class="kb-section" aria-label="Отель на связи">
    <div class="kb-contacts">
     ${row('phone','Ресепшен','Круглосуточно','data-open="Ресепшен"')}
     ${row('pin','Адрес и вход','Москва, Зубовская площадь, 3, стр. 1','data-open="Инструкция по заселению"')}
    </div>
   </section>`;
  const completed=document.createElement('div');completed.className='kb-details kb-completed-details';completed.hidden=true;
  completed.innerHTML=`
   <section class="kb-card kb-reservation" aria-label="Информация о проживании">
    <div class="kb-guest"><span class="kb-guest-icon">${svg(icons.user)}</span><div><small>Основной гость · 1 взрослый</small><strong>Татьяна Глазырина</strong></div></div>
    <div class="kb-room"><span class="kb-icon">${svg(icons.bed)}</span><div><strong>Премиум Кинг</strong><small>Номер 412 · 4 этаж · вид во двор</small></div></div>
    <dl class="kb-facts"><div><dt>Даты проживания</dt><dd>12–19 сентября 2026</dd></div><div><dt>Ночей</dt><dd>7</dd></div><div><dt>Тариф</dt><dd>Деловой</dd></div></dl>
   </section>
   <section class="kb-card kb-completed-bill" aria-labelledby="kb-completed-cost-title"><h2 id="kb-completed-cost-title">Расходы поездки</h2><dl class="kb-facts"><div><dt>Проживание</dt><dd>56 000 ₽</dd></div><div><dt>Услуги отеля</dt><dd>480 ₽</dd></div><div class="kb-completed-total"><dt>Всего</dt><dd>56 480 ₽</dd></div></dl></section>
   <section class="kh-quick-actions kb-completed-links" aria-label="Документы и связь с отелем"><button type="button" data-completed-documents><span>${svg(icons.file)}</span><strong>Документы поездки</strong></button><button type="button" data-completed-contact><span>${svg(icons.chat)}</span><strong>Связаться с отелем</strong></button></section>`;
  const documentEntry=completed.querySelector('[data-completed-documents]');
  documentEntry.addEventListener('click',()=>window.KeysTripDocuments.open(documentEntry));
  completed.querySelector('[data-completed-contact]').addEventListener('click',()=>document.getElementById('keysUnifiedPrototype').dispatchEvent(new CustomEvent('keys-open-hotel-chat')));
  scroll.append(view,completed);
  document.getElementById('keysUnifiedPrototype').addEventListener('keys-scenario-change',event=>{
   const after=event.detail.scenario==='after';view.hidden=after;completed.hidden=!after;
   head.querySelector('h1').textContent=after?'Детали проживания':'Детали брони';
   root.querySelectorAll('.ksd-detail-layer,.ksd-sheet-layer').forEach(layer=>layer.hidden=true);
  });
  return true;
 }
 // Discard obsolete inline type overrides applied before the UI-kit CSS loads.
 root.querySelectorAll('.ksd-sheet [style]').forEach(element=>{
  ['font-size','font-weight','line-height','letter-spacing'].forEach(property=>element.style.removeProperty(property));
 });
 install();
 // Keep the original problem flow reachable even when the old hotel/help
 // sections are replaced by the current booking layout.
 if(!root.querySelector('[data-problem-entry]')){
  const entry=document.createElement('button');
  entry.type='button';entry.hidden=true;entry.dataset.problemEntry='';
  entry.textContent='Сообщить о проблеме';root.append(entry);
 }
})();

/* Booking-owned document navigation: details → list → document → list → details. */
(() => {
 const root=document.getElementById('keysStayDetails'),app=document.getElementById('keysUnifiedPrototype');
 const phone=root.querySelector('.ksd-phone'),scroll=root.querySelector('.ksd-scroll'),nav=phone.querySelector('nav'),entry=root.querySelector('[data-booking-documents]');
 const overlay=document.createElement('section');overlay.className='kh-overlay kb-documents-view';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','kb-documents-title');
 overlay.innerHTML='<header class="kh-detail-header"><button type="button" class="kh-back" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65"><path d="M20 12H5m6-6-6 6 6 6"/></svg></button><h2 id="kb-documents-title"></h2></header><div class="kh-detail-content"></div>';
 phone.append(overlay);let current=null,origin=entry,background=[];
 const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
 const file=svg('<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'),arrow=svg('<path d="m9 5 7 7-7 7"/>');
 const documents=[{id:'stay',title:'Подтверждение проживания',copy:'12–19 сентября · 7 ночей',rows:[['Гость','Татьяна Глазырина'],['Отель','Maidens Hotel'],['Даты','12–19 сентября 2026'],['Номер','412 · Премиум Кинг'],['Стоимость','56 000 ₽']]},{id:'room',title:'Чек за проживание',copy:'56 000 ₽ · оплачено',rows:[['Получатель','Татьяна Глазырина'],['Услуга','Проживание, 7 ночей'],['Сумма','56 000 ₽'],['Оплата','Оплачено']]},{id:'services',title:'Чек за услуги',copy:'480 ₽ · ресторан LEA',rows:[['Получатель','Татьяна Глазырина'],['Услуга','Сырники со сметаной'],['Сумма','480 ₽'],['Оплата','Из депозита']]}];
 function show(id=null){
  current=id;const doc=documents.find(item=>item.id===id);
  overlay.querySelector('h2').textContent=doc?.title??'Документы';
  overlay.querySelector('.kh-detail-content').innerHTML=doc?`<section class="kh-detail-card">${doc.rows.map(([label,value])=>`<div class="kh-fact"><span>${label}</span><strong>${value}</strong></div>`).join('')}</section><button type="button" class="kh-primary" data-documents-list>Все документы</button>`:`<p class="kh-intro">Всё для отчёта о поездке — в одном месте.</p><div class="kb-document-list">${documents.map(item=>`<button type="button" class="kb-document-row" data-document="${item.id}"><span class="kb-icon">${file}</span><span class="kb-copy"><strong>${item.title}</strong><small>${item.copy}</small></span><span class="kb-arrow">${arrow}</span></button>`).join('')}</div>`;
  overlay.hidden=false;overlay.scrollTop=0;overlay.querySelector('.kh-back').focus({preventScroll:true});
 }
 function close(focus=true){overlay.hidden=true;background.forEach(({element,inert,ariaHidden})=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);});background=[];current=null;if(focus)origin.focus({preventScroll:true});}
 function open(trigger=entry){
  origin=trigger;const target=trigger.closest('.k3-phone,.ksd-phone')??phone;target.append(overlay);
  background=[...target.children].filter(element=>element!==overlay).map(element=>({element,inert:element.inert,ariaHidden:element.getAttribute('aria-hidden')}));
  background.forEach(({element})=>{element.inert=true;element.setAttribute('aria-hidden','true');});show();
 }
 window.KeysTripDocuments={open};
 const back=()=>current?show():close();
 entry.addEventListener('click',()=>open());
 overlay.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  event.stopPropagation();
  if(button.matches('.kh-back'))back();
  if(button.hasAttribute('data-document'))show(button.dataset.document);
  if(button.hasAttribute('data-documents-list'))show();
 });
 overlay.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();back();}
  if(event.key==='Tab'){const items=[...overlay.querySelectorAll('button')],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 app.addEventListener('keys-scenario-change',()=>{if(!overlay.hidden)close(false);});
})();

// Scope the current design to the problem flow, including its confirmation state.
(() => {
 const layer=document.querySelector('#keysStayDetails .ksd-detail-layer');
 if(!layer)return;
 const sync=()=>{
  layer.classList.toggle('kb-problem-page',layer.querySelector('h1')?.textContent.trim()==='Сообщить о проблеме');
  if(!layer.classList.contains('kb-problem-page'))return;
  layer.querySelector('.ksd-other-text')?.setAttribute('aria-label','Что случилось');
 };
 new MutationObserver(sync).observe(layer,{childList:true,subtree:true});
 sync();
})();
