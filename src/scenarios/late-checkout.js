/* Shared request/edit/remove flow for early arrival and late departure. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 const definitions={
  early:{title:'Ранний заезд',times:['09:00','12:00'],defaultTime:'12:00',prefix:'К',dateKey:'arrival',question:'Во сколько вы планируете приехать',note:'Стандартный заезд — с 14:00. Отель подтвердит возможность и стоимость раннего заселения.',submit:'Запросить ранний заезд',remove:'Убрать ранний заезд',status:'Запрошен к',empty:'Не включён в бронь'},
  late:{title:'Поздний выезд',times:['15:00','18:00'],defaultTime:'15:00',prefix:'До',dateKey:'departure',question:'До какого времени вам нужен номер',note:'Стандартный выезд — до 12:00. Отель подтвердит возможность и стоимость позднего выезда.',submit:'Запросить поздний выезд',remove:'Убрать поздний выезд',status:'Запрошен до',empty:'Не включён в бронь'}
 };
 const storageKey='keys-stay-services-MD-120926-v1';
 const saved={early:null,late:null};
 try{const data=JSON.parse(localStorage.getItem(storageKey)||'{}');for(const key of Object.keys(saved))if(definitions[key].times.includes(data[key]))saved[key]=data[key];}catch{}
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const arrow=svg('<path d="m9 5 7 7-7 7"/>'),plus=svg('<path d="M12 5v14M5 12h14"/>');
 const selector='[data-before="early"],[data-stay-service],[data-open="Поздний выезд"],[data-stay-action="late"],[data-late-checkout]';
 const serviceOf=button=>button.dataset.stayService||(button.dataset.before==='early'?'early':'late');
 const setText=(node,text)=>{if(node&&node.textContent!==text)node.textContent=text;};
 function sync(){
  app.querySelectorAll(selector).forEach(button=>{
   const kind=serviceOf(button),config=definitions[kind];if(!config)return;
   const time=saved[kind],label=time?'Изменить':'Добавить',status=time?config.status+' '+time:config.empty;
   setText(button.querySelector('.kpa-service-status,.kb-copy small,.ksvc-copy small'),status);
   button.classList.toggle('is-requested',!!time);
   const action=button.querySelector('.kpa-service-action,.kb-action-link');
   if(action&&action.dataset.serviceLabel!==label){action.innerHTML='<span class="kpa-service-link">'+label+'</span>'+(time?arrow:plus);action.dataset.serviceLabel=label;}
   setText(button.querySelector('.ksvc-trailing .ksd-flow-value'),label);
  });
 }
 window.KeysStayServices={sync,getRequests:()=>({...saved})};
 const overlay=document.createElement('section');
 overlay.className='kh-overlay klc-overlay';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','klc-title');
 overlay.innerHTML='<header class="kh-detail-header"><button type="button" class="kh-back" aria-label="Назад">'+svg('<path d="M20 12H5m6-6-6 6 6 6"/>')+'</button><h2 id="klc-title"></h2></header><div class="kh-detail-content"></div>';
 const content=overlay.querySelector('.kh-detail-content');
 let origin=null,background=[],chosenTime=null,kind=null;
 function close(restoreFocus=true){
  overlay.hidden=true;
  background.forEach(({element,inert,ariaHidden})=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);});
  background=[];
  if(restoreFocus)origin?.focus({preventScroll:true});
  origin=null;
 }
 function actions(){
  const config=definitions[kind],existing=saved[kind],changed=existing!==chosenTime;
  content.querySelector('[data-service-actions]').innerHTML=(changed?`<button type="button" class="kh-primary" data-service-submit>${existing?'Сохранить изменения':config.submit}</button>`:'')+(existing?`<button type="button" class="kh-primary kh-service-remove" data-service-remove>${config.remove}</button>`:'');
 }
 function open(button,type){
  const phone=button.closest('.k3-phone,.ksd-phone');if(!phone)return;
  if(!overlay.hidden)close(false);
  origin=button;kind=type;const config=definitions[kind];chosenTime=saved[kind]||config.defaultTime;
  phone.append(overlay);
  background=[...phone.children].filter(element=>element!==overlay).map(element=>({element,inert:element.inert,ariaHidden:element.getAttribute('aria-hidden')}));
  background.forEach(({element})=>{element.inert=true;element.setAttribute('aria-hidden','true');});
  const dates=window.KeysHomeViews.getBookingDates?.()||{arrival:'2026-09-12',departure:'2026-09-19'};
  const date=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(dates[config.dateKey]+'T12:00:00Z'));
  overlay.querySelector('h2').textContent=config.title;
  content.innerHTML=`${saved[kind]?`<p class="kh-note">${config.status} ${saved[kind]} · ожидает подтверждения отеля</p>`:''}<p class="kh-intro">${config.question} ${date}?</p><div class="ksc-time-options" role="group" aria-label="${config.title}: время">${config.times.map(time=>`<button type="button" data-service-time="${time}" aria-pressed="${time===chosenTime}">${config.prefix} ${time}</button>`).join('')}</div><p class="kh-note">${config.note}</p><div data-service-actions></div>`;
  actions();overlay.hidden=false;overlay.scrollTop=0;overlay.querySelector('.kh-back').focus({preventScroll:true});
 }
 window.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!app.contains(button))return;
  const legacyLate=button.hasAttribute('data-service-note')&&button.querySelector('strong')?.textContent.trim()==='Поздний выезд';
  if(button.matches(selector)||legacyLate){event.preventDefault();event.stopImmediatePropagation();open(button,serviceOf(button));return;}
  if(!overlay.contains(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  if(button.matches('.kh-back'))close();
  else if(button.hasAttribute('data-service-time')){
   chosenTime=button.dataset.serviceTime;
   content.querySelectorAll('[data-service-time]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
   actions();
  }else if(button.matches('[data-service-submit],[data-service-remove]')){
   const removing=button.hasAttribute('data-service-remove'),existing=saved[kind];
   saved[kind]=removing?null:chosenTime;
   try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}
   sync();app.dispatchEvent(new CustomEvent('keys-service-requests-change'));close();
   window.KeysHomeViews.notifyService(removing?'Запрос отменён':existing?'Запрос изменён':'Запрос отправлен');
  }
 },true);
 overlay.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
  if(event.key==='Tab'){
   const items=[...overlay.querySelectorAll('button')],first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 app.addEventListener('keys-scenario-change',()=>{if(!overlay.hidden)close(false);sync();});
 sync();
})();
