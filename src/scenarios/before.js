/* Pre-arrival and arrival-day home. Reuses approved home cards and the shared overlay. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree'),base=home.querySelector('.kh-home'),scroll=home.querySelector('.k3-scroll');
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={check:svg('<path d="m5 12 4 4L19 6"/>'),pin:svg('<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>'),arrow:svg('<path d="m9 5 7 7-7 7"/>'),file:svg('<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'),chat:svg('<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8ZM7 8h10M7 12h7"/>'),edit:svg('<path d="M12 4H4v16h16v-8M10 14l1-4L19 2l3 3-8 8-4 1Z"/>'),share:svg('<path d="M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8"/>')};
 const booking={id:'MD-120926',arrival:'2026-09-12',departure:'2026-09-19',nights:7,total:56000,paid:56000,guest:'Татьяна Глазырина',room:'Премиум Кинг',adults:1};
 // A management invitation adds a local prototype trip with the shared dates.
 const incoming=new URLSearchParams(location.search);
 if(incoming.get('sharedTrip')==='manage'){
  const arrival=incoming.get('arrival'),departure=incoming.get('departure'),adults=Number(incoming.get('adults'));
  const valid=value=>/^\d{4}-\d{2}-\d{2}$/.test(value??'')&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  const nights=(Date.parse(departure)-Date.parse(arrival))/86400000;
  if(valid(arrival)&&valid(departure)&&nights>0&&nights<=30&&Number.isInteger(adults)&&adults>=1&&adults<=10)Object.assign(booking,{arrival,departure,nights,adults,total:nights*8000,paid:nights*8000});
 }
 const money=n=>n.toLocaleString('ru-RU')+' ₽',escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
 const screen=document.createElement('section');screen.className='ka-home kpa-home';screen.hidden=true;screen.setAttribute('aria-label','За 8 дней до заезда');scroll.append(screen);
 let origin=null,active=false,currentBefore=null,detailsSession=false,arrivalDay='day-8',registration=null;
 const scenarioToday=()=>arrivalDay==='arrival'?'2026-09-12':arrivalDay==='day-3'?'2026-09-09':'2026-09-04';
 const beforeHistory=[];
 const fact=(label,value)=>`<div class="kh-fact"><span>${label}</span><strong>${escape(value)}</strong></div>`;
 const renderBefore=view=>{currentBefore=view;window.KeysHomeViews.open(view.title,view.html,'before-'+view.type,origin);const overlay=home.querySelector('.kh-overlay');overlay.querySelector('.kh-back').setAttribute('aria-label','Назад');if(view.formValues){const form=overlay.querySelector('[data-booking-change]');if(form)Object.entries(view.formValues).forEach(([key,value])=>{form.elements[key].value=value;});}if(view.scrollTop)overlay.scrollTop=view.scrollTop;};
 const show=(title,html,type,button=origin)=>{origin=button;if(detailsSession&&currentBefore){const overlay=home.querySelector('.kh-overlay'),form=overlay.querySelector('[data-booking-change]');beforeHistory.push({...currentBefore,scrollTop:overlay.scrollTop,formValues:form?Object.fromEntries(new FormData(form)):null});}renderBefore({title,html,type});};
 const returnBefore=event=>{if(currentBefore?.type==='route-go'){event.preventDefault();event.stopImmediatePropagation();detailsSession=false;beforeHistory.length=0;currentBefore=null;window.KeysHomeViews.close();return;}if(!detailsSession||home.querySelector('.kh-overlay').hidden)return;if(beforeHistory.length){event.preventDefault();event.stopImmediatePropagation();renderBefore(beforeHistory.pop());}else{detailsSession=false;currentBefore=null;}};
 home.addEventListener('click',event=>{if(event.target.closest('.kh-overlay .kh-back'))returnBefore(event);},true);
 home.addEventListener('keydown',event=>{if(event.key==='Escape'&&event.target.closest('.kh-overlay'))returnBefore(event);},true);
 screen.innerHTML=`<article class="kpa-reservation" aria-label="Ваша предстоящая поездка">
 <div class="kpa-welcome-ribbon">${svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>')}<p>Готовимся к вашему приезду</p></div>
 <div class="kpa-hotel-visual">

  <img class="kpa-hotel-photo" src="./scenarios/maidens-hotel.jpg" alt="Фасад Maidens Hotel" width="480" height="360">
  <button type="button" class="kpa-hero-share" data-before="share" aria-label="Поделиться бронью" title="Поделиться бронью">${icons.share}</button>
  <header class="kpa-hotel-heading"><h1>Maidens Hotel</h1><span>${icons.pin} Москва</span></header>
 </div>
 <div class="kh-room-pass kpa-reservation-body">
  <div class="kpa-stay-overview"><strong class="kpa-arrival-countdown"><b>8</b> дней до заезда</strong></div>
  <div class="kpa-trip-schedule" aria-label="Проживание: 12–19 сентября, 7 ночей">
   <div class="kpa-schedule-stops">
    <div class="kpa-schedule-stop"><span class="kpa-stop-dot" aria-hidden="true"></span><div><span>Заезд</span><p><time datetime="2026-09-12T14:00">12 сентября</time><small>с 14:00</small></p></div></div>
    <div class="kpa-schedule-stop"><span class="kpa-stop-dot" aria-hidden="true"></span><div><span>Выезд</span><p><time datetime="2026-09-19T12:00">19 сентября</time><small>до 12:00</small></p></div></div>
   </div>
   <div class="kpa-duration-count"><strong>7</strong><span>ночей</span></div>
  </div>
  <div class="kpa-payment"><div class="kpa-total"><strong>${money(booking.total)}</strong></div><div class="kpa-payment-status ${booking.paid>=booking.total?'is-paid':'is-partial'}">${booking.paid>=booking.total?`<strong>${icons.check} Оплачено полностью</strong>`:`<strong>Внесено ${money(booking.paid)}</strong><span>Осталось ${money(booking.total-booking.paid)}</span>`}</div></div>
 </div>

 </article>
 <div class="kpa-booking-buttons" role="group" aria-label="Подготовка к заезду" hidden><button type="button" class="kpa-manage kpa-route" data-before="route" hidden>Построить маршрут</button><button type="button" class="kpa-manage kpa-checkin" data-before="checkin" hidden>Онлайн-регистрация</button></div>
 <section class="kh-quick-actions kpa-actions" aria-label="Бронь и связь с отелем"><button type="button" data-before="details"><span>${icons.file}</span><strong>Бронь и документы</strong></button><button type="button" data-before="chat"><span>${icons.chat}</span><strong>Чат с отелем</strong></button><button type="button" data-before="instruction" hidden><span>${icons.pin}</span><strong>Инструкция по заселению</strong></button></section>
 <button type="button" class="kpa-manage" data-before="manage">${icons.edit}<span data-manage-label>Изменить бронь</span></button>
 <section class="kpa-preparation" aria-labelledby="kpa-preparation-title"><header class="kpa-preparation-heading"><h2 id="kpa-preparation-title">Добавьте к поездке</h2><p>Услуги можно выбрать до заезда</p></header><div class="kpa-services"><div data-early-slot></div><div data-breakfast-slot></div></div><button type="button" class="kpa-services-all" data-info="services">Все услуги отеля ${icons.arrow}</button></section>
 <div data-nearby-slot></div>`;
 const earlyIcon=svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
 const coffeeIcon=base.querySelector('.kh-meal-row .kh-round-icon').innerHTML;
 const serviceCard=({action,icon,title,label})=>`<button type="button" class="kpa-service" ${action}><span class="kpa-service-icon" aria-hidden="true">${icon}</span><span class="kpa-service-copy"><strong>${title}</strong><span class="kpa-service-status">Не включён в бронь</span></span><span class="kpa-service-action"><span class="kpa-service-link">${label}</span>${svg('<path d="M12 5v14M5 12h14"/>')}</span></button>`;
 screen.querySelector('[data-early-slot]').outerHTML=serviceCard({action:'data-before="early"',icon:earlyIcon,title:'Ранний заезд',label:'Добавить'});
 screen.querySelector('[data-breakfast-slot]').outerHTML=serviceCard({action:'data-home-action="breakfast"',icon:coffeeIcon,title:'Завтрак',label:'Добавить'});
 const breakfastButton=screen.querySelector('[data-home-action="breakfast"]');
 const syncBreakfast=()=>{
  const added=window.KeysHomeViews.isBreakfastAdded();
  breakfastButton.classList.toggle('is-added',added);
  breakfastButton.querySelector('.kpa-service-status').textContent=added?'Добавлен за доплату':'Не включён в бронь';
  breakfastButton.querySelector('.kpa-service-action').innerHTML=added?'<span class="kpa-service-link">Изменить</span>'+icons.arrow:'<span class="kpa-service-link">Добавить</span>'+svg('<path d="M12 5v14M5 12h14"/>');
 };
 app.addEventListener('keys-breakfast-change',syncBreakfast);syncBreakfast();
 window.KeysHomeViews.getBookingDates=()=>({arrival:booking.arrival,departure:booking.departure});
 window.KeysStayServices.sync();
 const nearby=base.querySelector('.kh-nearby-v2').cloneNode(true);nearby.id='kpa-nearby';nearby.setAttribute('aria-labelledby','kpa-nearby-title');nearby.querySelector('h2').id='kpa-nearby-title';screen.querySelector('[data-nearby-slot]').replaceWith(nearby);
 // The same recommendation engine handles the cloned entry and keeps its summary current.
 new MutationObserver(()=>{nearby.querySelector('.kh-nearby-heading p').textContent=base.querySelector('.kh-nearby-heading p').textContent;nearby.querySelector('[data-nearby-count]').textContent=base.querySelector('[data-nearby-count]').textContent;}).observe(base.querySelector('.kh-nearby-summary'),{subtree:true,childList:true,characterData:true});
 function bookingDetails(){
  const detailRow=(label,value,hint='')=>`<div><dt>${label}</dt><dd>${escape(value)}${hint?`<span class="kpa-field-hint">${escape(hint)}</span>`:''}</dd></div>`;
  show('Бронь и документы',`<div class="kpa-booking-details">
   <section class="kpa-confirmation-sheet" aria-label="Подтверждение бронирования">
    <header class="kpa-sheet-header"><span class="kpa-booking-reference">№ ${escape(booking.id)}</span><span class="kpa-state-badge" aria-label="Бронь подтверждена">${icons.check}Бронь подтверждена</span></header>
    <section class="kpa-voucher-section" aria-labelledby="kpa-dates-title"><h3 id="kpa-dates-title">Проживание</h3><dl class="kpa-voucher-facts">${detailRow('Заезд',date(booking.arrival)+' · с 14:00')}${detailRow('Выезд',date(booking.departure)+' · до 12:00')}${detailRow('Срок',nightsLabel(booking.nights)+' · '+booking.arrival.slice(0,4)+' год')}</dl></section>
    <section class="kpa-voucher-section" aria-labelledby="kpa-room-title"><h3 id="kpa-room-title">Номер и гости</h3><dl class="kpa-voucher-facts">${detailRow('Номер',booking.room,'King size · вид во двор')}${detailRow('Гости',partyLabel())}${detailRow('На имя',booking.guest)}</dl></section>
    <section class="kpa-voucher-section" aria-labelledby="kpa-tariff-title"><h3 id="kpa-tariff-title">Тариф «Деловой»</h3><dl class="kpa-voucher-facts kpa-tariff-services">${detailRow('Wi-Fi','Включено')}${detailRow('Фитнес-студия','Включено')}${detailRow('Завтрак',window.KeysHomeViews.isBreakfastAdded()?'Добавлен за доплату':'Не включено')}</dl></section>
    <section class="kpa-voucher-section" aria-labelledby="kpa-pay-title"><div class="kpa-payment-title"><h3 id="kpa-pay-title">Оплата проживания</h3><span class="kpa-state-badge ${booking.paid>=booking.total?'':'is-partial'}" aria-label="${booking.paid>=booking.total?'Проживание оплачено полностью':'Проживание оплачено частично'}">${booking.paid>=booking.total?icons.check:''}${booking.paid>=booking.total?'Полностью':'Частично'}</span></div><dl class="kpa-voucher-facts kpa-voucher-payment">${detailRow('Всего',money(booking.total))}${detailRow('Оплачено',money(booking.paid))}${booking.paid<booking.total?detailRow('К доплате',money(booking.total-booking.paid)):''}</dl>${booking.refunds?.some(item=>item.status==='processing')?'<p class="kh-note">Возврат '+money(booking.refunds.filter(item=>item.status==='processing').reduce((sum,item)=>sum+item.amount,0))+' — в обработке</p>':''}</section>
   </section>
   <button type="button" class="kpa-manage" data-before="manage">${icons.edit}<span>Изменить бронь</span></button>
   <button type="button" class="kh-primary kpa-download" data-before="documents">Скачать документы</button>
  </div>`,'details');
 }
 const downloadIcon=svg('<path d="M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5"/>');
 const documentKinds=[
  {id:'receipt',title:'Чек на проживание',copy:()=>money(booking.paid)+' · оплата проживания'},
  {id:'booking',title:'Подтверждение брони',copy:()=>'№ '+booking.id+' · '+date(booking.arrival)+' — '+date(booking.departure)}
 ];
 function documents(){
  show('Документы поездки',`<div class="kpa-documents"><div class="kpa-document-list">${documentKinds.map(doc=>`<button type="button" class="kpa-document-row" data-before="download-document" data-document="${doc.id}" aria-label="Скачать: ${doc.title}"><span class="kpa-document-icon">${icons.file}</span><span class="kpa-document-copy"><strong>${doc.title}</strong><small>${doc.copy()}</small></span><span class="kpa-document-download">${downloadIcon}</span></button>`).join('')}</div><button type="button" class="kh-primary kpa-save-documents" data-before="download-all">${downloadIcon}<span>Сохранить все документы</span></button></div>`,'documents');
 }
 function documentHTML(kind){
  const receipt=kind==='receipt',title=receipt?'Чек на проживание':'Подтверждение брони';
  const rows=[['Бронь',booking.id],['Гость',booking.guest],['Проживание',date(booking.arrival)+' — '+date(booking.departure)+' '+booking.departure.slice(0,4)+' · '+nightsLabel(booking.nights)],...(receipt?[['Услуга','Оплата проживания'],['Оплачено',money(booking.paid)],['Стоимость проживания',money(booking.total)]]:[['Время','Заезд с 14:00 · выезд до 12:00'],['Номер',booking.room+' · '+partyLabel()],['Адрес','Зубовская площадь, 3, стр. 1'],['Стоимость проживания',money(booking.total)],['Оплачено',money(booking.paid)],['Питание',window.KeysHomeViews.isBreakfastAdded()?'Завтрак добавлен за доплату':'Завтрак не включён']]),...(booking.paid<booking.total?[['Осталось оплатить',money(booking.total-booking.paid)]]:[])];
  return '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' '+booking.id+'</title><style>body{font:16px/1.6 system-ui;max-width:640px;margin:40px auto;padding:20px;color:#172032}h1{font-size:24px}h2{font-size:18px;font-weight:500}dl>div{display:flex;justify-content:space-between;gap:24px;padding:12px 0;border-bottom:1px solid #e8ecf4}dt,small{color:#657086}dd{margin:0;text-align:right}small{display:block;margin-top:24px}</style><h1>'+title+'</h1><h2>Maidens Hotel · Москва</h2><dl>'+rows.map(([label,value])=>'<div><dt>'+escape(label)+'</dt><dd>'+escape(value)+'</dd></div>').join('')+'</dl><small>'+(receipt?'Образец документа прототипа. Не является кассовым чеком.':'Образец документа прототипа. Не является подтверждением реальной брони.')+'</small></html>';
 }
 function saveDocument(blob,name){
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 // Store both UTF-8 HTML documents in one ZIP, avoiding multiple-download prompts.
 function createDocumentArchive(files){
  const encoder=new TextEncoder(),local=[],central=[];let offset=0;
  const crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
  for(const file of files){
   const name=encoder.encode(file.name),data=encoder.encode(file.content),crc=crc32(data);
   const header=new Uint8Array(30+name.length),view=new DataView(header.buffer);
   view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);view.setUint16(12,33,true);view.setUint32(14,crc,true);view.setUint32(18,data.length,true);view.setUint32(22,data.length,true);view.setUint16(26,name.length,true);header.set(name,30);
   const entry=new Uint8Array(46+name.length),index=new DataView(entry.buffer);
   index.setUint32(0,0x02014b50,true);index.setUint16(4,20,true);index.setUint16(6,20,true);index.setUint16(8,0x800,true);index.setUint16(14,33,true);index.setUint32(16,crc,true);index.setUint32(20,data.length,true);index.setUint32(24,data.length,true);index.setUint16(28,name.length,true);index.setUint32(42,offset,true);entry.set(name,46);
   local.push(header,data);central.push(entry);offset+=header.length+data.length;
  }
  const end=new Uint8Array(22),view=new DataView(end.buffer);
  view.setUint32(0,0x06054b50,true);view.setUint16(8,files.length,true);view.setUint16(10,files.length,true);view.setUint32(12,central.reduce((size,entry)=>size+entry.length,0),true);view.setUint32(16,offset,true);
  return new Blob([...local,...central,end],{type:'application/zip'});
 }
 function manage(trigger){
  window.KeysBookingChange.open({booking:{...structuredClone(booking),today:scenarioToday()},trigger,onComplete:updated=>{
   Object.assign(booking,updated,{adults:updated.party.adults,nights:Math.round((Date.parse(updated.departure)-Date.parse(updated.arrival))/86400000)});
   registration=null;updateCheckinButton();
   updateBookingSummary();beforeHistory.length=0;currentBefore=null;detailsSession=false;
   window.KeysHomeViews.close();scroll.scrollTop=0;
   const heading=screen.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});
   const toast=home.querySelector('.k3-toast');
   clearTimeout(home._t);toast.textContent='Бронь успешно изменена';toast.hidden=false;
   home._t=setTimeout(()=>toast.hidden=true,5000);
  }});
 }
 const nightsLabel=n=>n+' '+(n%100>=11&&n%100<=14?'ночей':n%10===1?'ночь':n%10>=2&&n%10<=4?'ночи':'ночей');
 const partyLabel=()=>{const p=booking.party??{adults:booking.adults,childrenAges:[]};return [p.adults+' '+(p.adults===1?'взрослый':'взрослых'),p.childrenAges.length?p.childrenAges.length+' '+(p.childrenAges.length===1?'ребёнок':'детей'):null,p.pet?'с питомцем':null].filter(Boolean).join(' · ');};
 function updateBookingSummary(){
  const remaining=Math.max(0,Math.round((Date.parse(booking.arrival)-Date.parse(scenarioToday()))/86400000));
  screen.querySelector('.kpa-arrival-countdown').innerHTML=remaining===0?'Заезд сегодня':'<b>'+remaining+'</b> '+(remaining%100>=11&&remaining%100<=14?'дней':remaining%10===1?'день':remaining%10>=2&&remaining%10<=4?'дня':'дней')+' до заезда';
  const times=screen.querySelectorAll('.kpa-schedule-stop time');
  times[0].dateTime=booking.arrival+'T14:00';times[0].textContent=date(booking.arrival);
  times[1].dateTime=booking.departure+'T12:00';times[1].textContent=date(booking.departure);
  screen.querySelector('.kpa-duration-count strong').textContent=booking.nights;
  screen.querySelector('.kpa-duration-count span').textContent=nightsLabel(booking.nights).split(' ')[1];
  screen.querySelector('.kpa-trip-schedule').setAttribute('aria-label','Проживание: '+date(booking.arrival)+' — '+date(booking.departure)+', '+nightsLabel(booking.nights));
  screen.querySelector('.kpa-total strong').textContent=money(booking.total);
  screen.querySelector('.kpa-payment-status').innerHTML='<strong>'+icons.check+' Оплачено полностью</strong>';
 }

 function taxiRoute(){
  detailsSession=true;
  show('Построить маршрут',`<div class="kpa-route-chooser"><p>Выберите приложение</p><a class="kpa-route-option" href="https://2gis.ru/directions/tab/car/points/|37.585621,55.737954" target="_blank" rel="noopener noreferrer"><span class="kpa-route-app kpa-route-maps">${icons.pin}</span><strong>Открыть 2ГИС</strong>${icons.arrow}</a><button type="button" class="kpa-route-option" data-before="route-go"><span class="kpa-route-app kpa-route-go">Go</span><strong>Открыть Яндекс Go</strong>${icons.arrow}</button></div>`,'route-choice');
 }
 function launchTaxi(){
  const previous=currentBefore;
  detailsSession=false;
  show('Открываем Яндекс Go',`<div class="kpa-go-launch" role="status"><span class="kpa-go-launch-icon">Go</span><h3>Яндекс Go</h3><p>Переходим в приложение</p><span class="kpa-go-launch-progress" aria-hidden="true"></span></div>`,'route-launch');
  const launch=home.querySelector('.kpa-go-launch');
  setTimeout(()=>{if(!launch.isConnected||home.querySelector('.kh-overlay').hidden||currentBefore?.type!=='route-launch')return;currentBefore=previous;detailsSession=true;taxiPreview();},900);
 }
 function taxiPreview(){
  show('Яндекс Go',`<div class="kpa-go-preview"><div class="kpa-go-map" role="img" aria-label="Схема маршрута от вашего местоположения до Maidens Hotel"><svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="300" fill="#eeeDE8"/><g fill="#e1e2d9"><rect x="15" y="20" width="75" height="60" rx="10"/><rect x="110" y="20" width="82" height="60" rx="10"/><rect x="213" y="18" width="125" height="66" rx="10"/><rect x="15" y="111" width="71" height="65" rx="10"/><rect x="115" y="110" width="81" height="65" rx="10"/><rect x="216" y="113" width="124" height="64" rx="10"/><rect x="112" y="205" width="85" height="77" rx="10"/><rect x="215" y="207" width="123" height="75" rx="10"/></g><path d="M-20 260Q80 175 72 330" fill="none" stroke="#bedfe7" stroke-width="38"/><g fill="none" stroke="white" stroke-width="14"><path d="M0 96H360M0 190H360M101 0V230M204 0V300"/></g><path d="M101 228V190H204V96H276" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="M101 228V190H204V96H276" fill="none" stroke="#f4bd13" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="101" cy="228" r="10" fill="#fff"/><circle cx="101" cy="228" r="6" fill="#222"/><circle cx="276" cy="96" r="13" fill="#222"/><circle cx="276" cy="96" r="5" fill="#ffdb4d"/></svg><span class="kpa-go-hotel-label">Maidens Hotel</span><span class="kpa-go-wordmark">Go</span></div><section class="kpa-go-panel" aria-label="Маршрут поездки"><span class="kpa-go-handle" aria-hidden="true"></span><div class="kpa-go-endpoint"><span class="kpa-go-point" aria-hidden="true"></span><div><small>Откуда</small><strong>Ваше местоположение</strong></div></div><div class="kpa-go-endpoint"><span class="kpa-go-point is-hotel" aria-hidden="true"></span><div><small>Куда</small><strong>Maidens Hotel</strong><p>Москва, Зубовская площадь, 3, стр. 1</p></div></div><div class="kpa-go-tariffs" aria-label="Тарифы такси">${['Эконом','Комфорт','Комфорт+'].map((name,i)=>`<button type="button" data-before="go-tariff" aria-pressed="${i===0}"><svg viewBox="0 0 100 48" aria-hidden="true"><path d="m14 29 8-15h45l14 14 11 4v9H8V32Z" fill="${i===0?'#ffcf27':i===1?'#ccd1d4':'#41464b'}"/><path d="m29 17-5 11h48L62 17Z" fill="#35434e"/><path d="M47 17v12" stroke="white" stroke-width="2"/><circle cx="25" cy="39" r="7" fill="#26282c"/><circle cx="77" cy="39" r="7" fill="#26282c"/><circle cx="25" cy="39" r="3" fill="#eee"/><circle cx="77" cy="39" r="3" fill="#eee"/></svg><span>${name}</span></button>`).join('')}</div><p class="kpa-go-ready" role="status">Маршрут в Яндекс Go</p></section></div>`,'route-go');
  const back=home.querySelector('.kh-overlay .kh-back');back.setAttribute('aria-label','Вернуться в Ключи');
  mountTaxiMap();

 }
 // This remains a taxi-app preview; its geographic background uses the shared map provider.
 function mountTaxiMap(){
  if(!window.KeysMaps?.enabled())return;
  const overlay=home.querySelector('.kh-overlay'),target=overlay.querySelector('.kpa-go-map');
  if(!target)return;
  let native,marker,disposed=false;
  const observer=new MutationObserver(()=>{if(!target.isConnected||overlay.hidden)dispose();});
  const dispose=()=>{if(disposed)return;disposed=true;observer.disconnect();marker?.destroy();native?.destroy();};
  observer.observe(overlay,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  window.KeysMaps.load().then(api=>{
   if(disposed||!target.isConnected||overlay.hidden){dispose();return;}
   target.replaceChildren();target.removeAttribute('role');target.setAttribute('aria-label','Расположение Maidens Hotel на карте 2ГИС');
   target.classList.add('kpa-go-map-live');
   native=window.KeysMaps.create(target,{center:[37.585621,55.737954],zoom:15,controls:false,scrollZoom:false});
   const label=document.createElement('div');label.textContent='Maidens Hotel';label.style.cssText='background:white;color:#171717;border-radius:10px;padding:8px 12px;font:500 13px/1.5 var(--font-sans);box-shadow:0 2px 10px #0002;transform:translate(-50%,-100%)';
   marker=new api.HtmlMarker(native,{coordinates:[37.585621,55.737954],html:label,anchor:[0,0]});
  }).catch(()=>{dispose();if(target.isConnected){target.textContent='Карта не загрузилась. Адрес отеля указан ниже.';target.removeAttribute('role');}});
 }
 function instruction(){
  show('Инструкция по заселению',`<div class="kpa-instruction">
   <section class="kpa-instruction-card" aria-labelledby="kpa-entrance-title"><h3 id="kpa-entrance-title">Адрес и вход</h3><p class="kpa-instruction-address">Москва, Зубовская площадь, 3, стр. 1</p><p>Вход со стороны двора. На домофоне нажмите «Отель».</p></section>
   <section class="kpa-instruction-card" aria-labelledby="kpa-reception-title"><div class="kpa-instruction-arrival"><span>Заезд ${date(booking.arrival)}</span><strong>с 14:00</strong></div><h3 id="kpa-reception-title">На ресепшене</h3><p>Сотрудник проверит документы и выдаст ключ от номера.</p><div class="kpa-instruction-documents"><h3>Что взять с собой</h3><p>Оригиналы документов всех гостей. Для ребёнка — свидетельство о рождении или паспорт.</p></div></section>
   <button type="button" class="kpa-manage" data-before="chat">${icons.chat}Чат с отелем</button>
  </div>`,'instruction');
 }
 function updateCheckinButton(){
  const button=screen.querySelector('[data-before="checkin"]');
  button.classList.toggle('is-complete',!!registration);
  button.setAttribute('aria-label',registration?'Онлайн-регистрация пройдена':'Онлайн-регистрация');
  button.innerHTML=registration?'<span class="kpa-checkin-title">Регистрация</span><span class="kpa-checkin-status">'+icons.check+'Пройдена</span>':'Онлайн-регистрация';
 }
 function checkin(trigger){
  window.KeysBookingChange.open({flow:'checkin',booking:{...structuredClone(booking),today:scenarioToday()},registration,trigger,
   onRegistered:value=>{registration=value;updateCheckinButton();},
   onInstruction:()=>instruction()
  });
 }

 let shareSocial=null;
 function shareBooking(trigger){
  window.KeysBookingChange.open({flow:'share',booking:structuredClone(booking),social:shareSocial,trigger,
   onSocial:value=>{shareSocial=value;},
   onCopied:()=>{const toast=home.querySelector('.k3-toast');clearTimeout(home._t);toast.textContent='Ссылка на отель и даты скопирована';toast.hidden=false;home._t=setTimeout(()=>toast.hidden=true,3500);}
  });
 }
 home.addEventListener('click',async event=>{
  const button=event.target.closest('[data-before]');if(!button)return;event.preventDefault();event.stopPropagation();const action=button.dataset.before;
  if(screen.contains(button)){origin=button;detailsSession=action==='details';beforeHistory.length=0;currentBefore=null;}
  if(action==='details')bookingDetails();
  if(action==='checkin')checkin(button);
  if(action==='instruction')instruction();
  if(action==='route')taxiRoute();
  if(action==='route-go')launchTaxi();
  if(action==='go-tariff'){home.querySelectorAll('[data-before="go-tariff"]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}
  if(action==='route-return'){detailsSession=false;beforeHistory.length=0;currentBefore=null;window.KeysHomeViews.close();}
  if(action==='documents'||action==='voucher')documents();
  if(action==='chat'){window.KeysHomeViews.close();detailsSession=false;beforeHistory.length=0;currentBefore=null;app.dispatchEvent(new CustomEvent('keys-open-hotel-chat'));}
  if(action==='manage')manage(button);


  if(action==='close'){detailsSession=false;beforeHistory.length=0;currentBefore=null;window.KeysHomeViews.close();}
  if(action==='download-document'){
   const doc=documentKinds.find(item=>item.id===button.dataset.document);
   if(doc)saveDocument(new Blob([documentHTML(doc.id)],{type:'text/html;charset=utf-8'}),doc.title+'-'+booking.id+'.html');
  }
  if(action==='download-all')saveDocument(createDocumentArchive(documentKinds.map(doc=>({name:doc.title+'-'+booking.id+'.html',content:documentHTML(doc.id)}))),'Документы-'+booking.id+'.zip');
  if(action==='share')shareBooking(button);
 });
 app.addEventListener('keys-scenario-change',event=>{
  const visible=event.detail.scenario==='booked'&&['day-8','day-3','arrival'].includes(event.detail.arrivalDay),changed=arrivalDay!==event.detail.arrivalDay;screen.hidden=!visible;
  if(visible){
   arrivalDay=event.detail.arrivalDay;const arriving=arrivalDay==='arrival',soon=arrivalDay!=='day-8';
   screen.setAttribute('aria-label',arriving?'День заезда':soon?'За 3 дня до заезда':'За 8 дней до заезда');
   screen.querySelector('.kpa-welcome-ribbon p').textContent=arriving?'Ждем вам':'Готовимся к вашему приезду';
   screen.querySelector('.kpa-stay-overview').hidden=false;
   const buttons=screen.querySelector('.kpa-booking-buttons'),manageButton=screen.querySelector('[data-before="manage"]');
   buttons.hidden=!soon;
   manageButton.hidden=arriving;
   screen.querySelector('.kpa-route').hidden=!arriving;
   if(soon)buttons.prepend(manageButton);else screen.querySelector('.kpa-actions').after(manageButton);
   screen.querySelector('[data-before="checkin"]').hidden=!soon;
   screen.querySelector('[data-before="instruction"]').hidden=!soon;
   screen.querySelector('.kpa-actions').classList.toggle('kpa-actions-three',soon);
   updateBookingSummary();
   if(changed){detailsSession=false;beforeHistory.length=0;currentBefore=null;window.KeysHomeViews.close();scroll.scrollTop=0;}
  }
  if(active!==visible){detailsSession=false;beforeHistory.length=0;currentBefore=null;window.KeysHomeViews.close();if(visible||active){app.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s.dataset.unifiedSection!=='trips');scroll.scrollTop=0;}active=visible;}
 });
})();
