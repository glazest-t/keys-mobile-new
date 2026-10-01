/* One late-checkout flow, attached to the phone from which it was opened. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 const overlay=document.createElement('section');
 overlay.className='kh-overlay klc-overlay';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','klc-title');
 overlay.innerHTML='<header class="kh-detail-header"><button type="button" class="kh-back" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6"/></svg></button><h2 id="klc-title">Поздний выезд</h2></header><div class="kh-detail-content"></div>';
 const content=overlay.querySelector('.kh-detail-content');
 let origin=null,background=[],chosenTime='15:00',returnLabel='На главную';
 function close(restoreFocus=true){
  overlay.hidden=true;
  background.forEach(({element,inert,ariaHidden})=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);});
  background=[];
  if(restoreFocus)origin?.focus({preventScroll:true});
  origin=null;
 }
 function open(button){
  const phone=button.closest('.k3-phone,.ksd-phone');if(!phone)return;
  if(!overlay.hidden)close(false);
  origin=button;chosenTime='15:00';
  returnLabel=button.closest('.ksd-detail-layer')?'К услугам':button.closest('#keysStayDetails')?'К деталям брони':'На главную';
  phone.append(overlay);
  background=[...phone.children].filter(element=>element!==overlay).map(element=>({element,inert:element.inert,ariaHidden:element.getAttribute('aria-hidden')}));
  background.forEach(({element})=>{element.inert=true;element.setAttribute('aria-hidden','true');});
  content.innerHTML=`<p class="kh-intro">До какого времени вам нужен номер 19 сентября?</p><div class="ksc-time-options" role="group" aria-label="Время позднего выезда">${['15:00','18:00'].map(time=>`<button type="button" data-late-time="${time}" aria-pressed="${time===chosenTime}">До ${time}</button>`).join('')}</div><p class="kh-note">Возможность и стоимость подтвердит отель. Стандартный выезд — до 12:00.</p><button type="button" class="kh-primary" data-late-submit>Запросить поздний выезд</button>`;
  overlay.hidden=false;overlay.scrollTop=0;overlay.querySelector('.kh-back').focus({preventScroll:true});
 }
 // Capture before the original prototype's sheet and service handlers.
 window.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!app.contains(button))return;
  const isEntry=button.matches('[data-open="Поздний выезд"],[data-stay-action="late"],[data-late-checkout]')||button.hasAttribute('data-service-note')&&button.querySelector('strong')?.textContent.trim()==='Поздний выезд';
  if(isEntry){event.preventDefault();event.stopImmediatePropagation();open(button);return;}
  if(!overlay.contains(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  if(button.matches('.kh-back,[data-late-close]'))close();
  else if(button.hasAttribute('data-late-time')){
   chosenTime=button.dataset.lateTime;
   content.querySelectorAll('[data-late-time]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
  }else if(button.hasAttribute('data-late-submit')){
   content.innerHTML=`<section class="kh-detail-card"><h3>Запрос на выезд до ${chosenTime}</h3><p>Отель подтвердит возможность и стоимость. Пока ориентируйтесь на выезд до 12:00.</p></section><button type="button" class="kh-primary" data-late-close>${returnLabel}</button>`;
   overlay.scrollTop=0;overlay.querySelector('.kh-back').focus({preventScroll:true});
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
 app.addEventListener('keys-scenario-change',()=>{if(!overlay.hidden)close(false);});
})();
