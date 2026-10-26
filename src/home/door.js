import {createDoorController} from './door-controller.mjs';

const app=document.getElementById('keysUnifiedPrototype');
const controls='button[data-info="key"],button[data-flow="door"],button[data-approved-door],button[data-trip-menu-action="key"]';
const paths={key:'<circle cx="8" cy="8" r="4.5"/><path d="m11.3 11.3 8.2 8.2m-2.7-2.7 2.7-2.7m-5.5 0 2.6-2.6"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
let origin=null,sheet=null;
const announcement=document.createElement('p');announcement.className='keys-door-status';announcement.setAttribute('role','status');app.append(announcement);

// The dedicated stay subscenario keeps the lock unavailable until switched off.
function request({signal}){
 return new Promise((resolve,reject)=>{
  const fail=document.body.dataset.keysScenario==='stay'&&document.body.dataset.keysStayDay==='key-error';
  const timer=setTimeout(()=>resolve({opened:!fail}),1400);
  signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new Error('cancelled'));},{once:true});
 });
}
function render(){
 const state=controller.state;
 app.querySelectorAll(controls).forEach(button=>{
  if(button.dataset.doorState===state)return;
  button.dataset.doorState=state;
  button.setAttribute('aria-busy',String(state==='opening'));
  button.setAttribute('aria-disabled',String(state==='opening'||state==='success'));
  const label=state==='opening'?'Открываем дверь…':state==='success'?'Дверь открыта':button.dataset.tripMenuAction==='key'?'Открыть номер 412':'Открыть дверь';
  button.innerHTML=(state==='opening'?'<span class="keys-door-spinner" aria-hidden="true"></span>':icon(state==='success'?'check':'key'))+`<span class="keys-door-label">${label}</span>`;
 });
 // Remove obsolete authentication advice from the retained legacy details.
 app.querySelectorAll('.ksd-flow-note').forEach(note=>{if(note.textContent.includes('Face ID'))note.textContent='Подойдите к двери и нажмите «Открыть дверь». Держите телефон рядом с замком.';});
}
function closeError({restoreFocus=true}={}){
 if(!sheet)return;
 sheet.close();sheet.remove();sheet=null;
 if(restoreFocus&&origin?.isConnected)origin.focus({preventScroll:true});
}
function positionError(){
 if(!sheet)return;
 const phone=origin?.closest('.k3-phone,.ksd-phone,.ktd-phone');
 const rect=phone?.getBoundingClientRect();
 sheet.style.setProperty('--door-sheet-bottom',Math.max(0,innerHeight-(rect?.bottom??innerHeight))+'px');
}
function showError(){
 closeError({restoreFocus:false});
 // A native dialog traps focus and supports Escape; mobile presentation is a sheet.
 sheet=document.createElement('dialog');sheet.className='keys-door-error';
 sheet.setAttribute('aria-labelledby','keys-door-error-title');sheet.setAttribute('aria-describedby','keys-door-error-copy');
 sheet.innerHTML=`<div class="keys-door-handle" aria-hidden="true"></div><header><h2 id="keys-door-error-title">Не удалось открыть дверь</h2><button type="button" data-door-dismiss aria-label="Закрыть">${icon('close')}</button></header><p id="keys-door-error-copy">Замок не ответил. Возможно, телефон слишком далеко или Bluetooth выключен. Подойдите ближе к двери и проверьте Bluetooth.</p><button type="button" class="keys-door-retry" data-door-retry>Попробовать ещё раз</button><button type="button" class="keys-door-reception" data-door-reception>Связаться с ресепшеном</button><p class="keys-door-physical">Можно открыть дверь физической ключ-картой. Если её нет с собой, обратитесь на ресепшен — там помогут попасть в номер.</p>`;
 document.body.append(sheet);positionError();sheet.showModal();sheet.querySelector('[data-door-retry]').focus();
 sheet.addEventListener('cancel',event=>{event.preventDefault();closeError();});
 sheet.addEventListener('click',event=>{
  if(event.target.closest('[data-door-dismiss]'))closeError();
  else if(event.target.closest('[data-door-retry]')){closeError();controller.open();}
  else if(event.target.closest('[data-door-reception]')){
   closeError({restoreFocus:false});
   origin?.closest('[popover]')?.hidePopover();
   app.dispatchEvent(new CustomEvent('keys-open-hotel-chat'));
  }
 });
}
const controller=createDoorController({request,onChange(state){
 render();announcement.textContent=state==='opening'?'Открываем дверь номера 412':state==='success'?'Дверь открыта. Можно входить.':'';
 if(state==='error')showError();
}});
// Capture before retained document handlers can navigate to the old door flow.
window.addEventListener('click',event=>{
 const button=event.target.closest?.(controls);if(!button||!app.contains(button))return;
 event.preventDefault();event.stopImmediatePropagation();
 if(controller.state==='opening'||controller.state==='success')return;
 origin=button;controller.open();
},true);
app.addEventListener('keys-scenario-change',()=>{closeError({restoreFocus:false});controller.reset();});
window.addEventListener('pagehide',()=>{closeError({restoreFocus:false});controller.reset();});
window.addEventListener('resize',positionError);
new MutationObserver(render).observe(app,{childList:true,subtree:true});
render();
