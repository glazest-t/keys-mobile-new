/* In-stay booking details. Legacy routing anchors and scenario handlers stay intact. */
(() => {
 const root=document.getElementById('keysStayDetails');
 if(!root)return;
 const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
 const icons={file:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',bed:'<path d="M3 18v3M21 18v3M3 18h18V9H3v9ZM5 9V4h14v5M7 6h3v3M14 6h3v3"/>',check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',chat:'<path d="M16 10a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"></path><path d="M20 8a2 2 0 0 1 2 2v12l-4-4h-8a2 2 0 0 1-2-2"></path>',phone:'<path d="m6 3 4 5-3 3a13 13 0 0 0 6 6l3-3 5 4-1 3C11 23 1 13 3 4l3-1Z"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',fitness:'<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>'};
 const arrow=svg('<path d="m9 5 7 7-7 7"/>');
 const row=(icon,title,copy,attr)=>`<button type="button" class="kb-row" ${attr}><span class="kb-icon">${svg(icons[icon])}</span><span class="kb-copy"><strong>${title}</strong><small>${copy}</small></span><span class="kb-arrow">${arrow}</span></button>`;
 function install(){
  const scroll=root.querySelector('.ksd-scroll'),head=scroll.querySelector('.ksd-head');
  const legacy=document.createElement('div');legacy.hidden=true;legacy.className='kb-legacy';
  [...scroll.children].forEach(node=>{if(node!==head)legacy.append(node)});
  scroll.append(legacy);scroll.classList.add('kb-scroll');
  head.querySelector('small')?.remove();
  head.querySelector('[data-open="Поделиться бронью"]')?.remove();
  const view=document.createElement('div');view.className='kb-unified-details kpa-booking-details';
  view.innerHTML='<div data-booking-summary></div><button type="button" class="kh-primary kpa-download" data-booking-documents>Документы поездки</button><section class="kb-section" aria-label="Отель на связи"><div class="kb-contacts">'+row('phone','Ресепшен','Круглосуточно','data-open="Ресепшен"')+row('pin','Адрес и вход','Москва, Зубовская площадь, 3, стр. 1','data-open="Инструкция по заселению"')+'</div></section>';
  scroll.append(view);
  window.KeysHostBookingModel=()=>{
   const scenario=document.body.dataset.keysScenario,after=scenario==='after',stay=scenario==='stay';
   const b=window.KeysBeforeBooking?.()||{id:'MD-120926',arrival:'2026-09-12',departure:'2026-09-19',nights:7,total:56000,paid:56000,guest:'Татьяна Глазырина',room:'Премиум Кинг',adults:1};
   const services=after?[{title:'Сырники со сметаной',price:480}]:window.KeysActiveServices?.getOrders()||[];
   if(!after&&!b.cancellation&&window.KeysHomeViews?.isBreakfastAdded())services.push({title:'Завтрак · '+b.nights+' ночей',price:680*b.nights});
   return {...b,hotel:'Maidens Hotel',address:'Москва, Зубовская площадь, 3, стр. 1',status:b.cancellation?'Бронь отменена':after?'Поездка завершена':stay?'Проживание':'Бронь подтверждена',roomNumber:stay||after?'412':null,party:[b.adults+' взр.',b.party?.childrenAges?.length?b.party.childrenAges.length+' дет.':null].filter(Boolean).join(' · '),tariff:'Деловой',included:['Wi-Fi и фитнес-студия включены',window.KeysHomeViews?.isBreakfastAdded()?'Завтрак добавлен за доплату':null],roomTotal:b.total,pointsAwarded:after&&!b.cancellation?2240:0,paid:after?b.total+480:b.paid,services,refundPending:(b.refunds||[]).filter(item=>item.status==='processing').reduce((sum,item)=>sum+item.amount,0)};
  };
  const refresh=()=>{view.querySelector('[data-booking-summary]').innerHTML=window.KeysBookingDetails.render(window.KeysHostBookingModel());head.querySelector('h1').textContent='Детали брони';view.querySelector('[aria-label="Отель на связи"]').hidden=['stay','after'].includes(document.body.dataset.keysScenario);};
  const app=document.getElementById('keysUnifiedPrototype');
  app.addEventListener('keys-scenario-change',()=>{queueMicrotask(refresh);root.querySelectorAll('.ksd-detail-layer,.ksd-sheet-layer').forEach(layer=>layer.hidden=true);});
  new MutationObserver(()=>{if(!root.hidden)refresh();}).observe(root.closest('.ku-section'),{attributes:true,attributeFilter:['hidden']});
  app.addEventListener('keys-breakfast-change',refresh);app.addEventListener('keys-service-requests-change',refresh);
  refresh();
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
 phone.append(overlay);let current=null,origin=entry,background=[],booking=null;
 const escape=value=>window.KeysBookingDocuments.escape(value);
 const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
 const file=svg('<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'),arrow=svg('<path d="m9 5 7 7-7 7"/>');
 const getDocuments=()=>window.KeysBookingDocuments.list(booking);
 function downloadDocument(doc){
  const url=URL.createObjectURL(new Blob([window.KeysBookingDocuments.html(booking,doc)],{type:'text/html;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=doc.title+'-'+String(booking.id).replace(/[^a-zа-яё0-9_-]/gi,'_')+'.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function show(id=null){
  current=id;const documents=getDocuments(),doc=documents.find(item=>item.id===id);
  overlay.querySelector('h2').textContent=doc?.title??'Документы';
  overlay.querySelector('.kh-detail-content').innerHTML=doc?`<section class="kh-detail-card">${doc.rows.map(([label,value])=>`<div class="kh-fact"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</section><button type="button" class="kh-primary kb-document-save" data-document-download="${escape(doc.id)}">Сохранить документ</button>`:`<div class="kb-document-list">${documents.map(item=>`<button type="button" class="kb-document-row" data-document="${item.id}"><span class="kb-icon">${file}</span><span class="kb-copy"><strong>${escape(item.title)}</strong><small>${escape(item.copy)}</small></span><span class="kb-arrow">${arrow}</span></button>`).join('')}</div>`;
  overlay.hidden=false;overlay.scrollTop=0;overlay.querySelector('.kh-back').focus({preventScroll:true});
 }
 function close(focus=true){overlay.hidden=true;background.forEach(({element,inert,ariaHidden})=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);});background=[];current=null;if(focus)origin.focus({preventScroll:true});}
 function open(trigger=entry,model=null){
  if(!overlay.hidden)close(false);
  booking=model||window.KeysHostBookingModel();
  origin=trigger;const target=trigger.closest('.k3-phone,.ksd-phone,.kf-phone')??phone;target.append(overlay);
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
  if(button.hasAttribute('data-document-download')){const doc=getDocuments().find(item=>item.id===button.dataset.documentDownload);if(doc)downloadDocument(doc);}
 });
 overlay.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();back();}
  if(event.key==='Tab'){const items=[...overlay.querySelectorAll('button')],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 app.addEventListener('keys-scenario-change',()=>{if(!overlay.hidden)close(false);});
 window.addEventListener('popstate',()=>{if(!overlay.hidden)close(false);});
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

/* Match the pre-arrival desktop dialog while preserving the existing routes. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),details=document.getElementById('keysStayDetails');
 const section=details?.closest('.ku-section'),trips=app?.querySelector('[data-unified-section="trips"]');
 if(!section||!trips)return;
 let active=false,previousInert=false;
 function sync(){
  const enabled=document.body.dataset.keysView==='desktop'&&!section.hidden;
  if(enabled===active)return;
  active=enabled;
  if(enabled){
   previousInert=trips.inert;trips.hidden=false;trips.inert=true;
   document.body.dataset.keysBookingDialog='true';
   details.setAttribute('role','dialog');details.setAttribute('aria-modal','true');details.setAttribute('aria-label','Детали брони');
   details.querySelector('.ksd-back[data-exit]')?.focus({preventScroll:true});
  }else{
   trips.inert=previousInert;delete document.body.dataset.keysBookingDialog;
   details.removeAttribute('role');details.removeAttribute('aria-modal');details.removeAttribute('aria-label');
   if(!section.hidden)trips.hidden=true;
  }
 }
 new MutationObserver(sync).observe(section,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-keys-view']});
 details.addEventListener('keydown',event=>{
  if(!active||details.querySelector('.kh-overlay:not([hidden]),.ksd-detail-layer:not([hidden]),.ksd-sheet-layer:not([hidden])'))return;
  if(event.key==='Escape'){event.preventDefault();details.querySelector('.ksd-back[data-exit]')?.click();}
  if(event.key==='Tab'){
   const items=[...details.querySelectorAll('button,a,input,select,textarea')].filter(el=>!el.disabled&&el.getClientRects().length&&!el.closest('[inert]'));
   const first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 });
 sync();
})();
