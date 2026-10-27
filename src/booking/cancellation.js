/* Shared cancellation confirmation for host and embedded booking screens. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 const money=value=>Number(value||0).toLocaleString('ru-RU')+' ₽';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let current=null;
 window.KeysBookingCancellation={open(options){
  current?.close();
  const dialog=document.createElement('dialog');dialog.className='keys-cancel-dialog';dialog.setAttribute('aria-labelledby','keys-cancel-title');
  const request=!!options.requestOnly;
  dialog.innerHTML=`<div class="keys-cancel-handle" aria-hidden="true"></div><header><h2 id="keys-cancel-title">${request?'Завершить проживание раньше?':'Отменить бронирование?'}</h2><button type="button" data-dismiss aria-label="Закрыть">×</button></header><p class="keys-cancel-hotel">${esc(options.hotel)}<span>${esc(options.dates)}</span></p><p>${request?'Вы уже заселились. Отправим в отель запрос на досрочный выезд. Администратор уточнит условия и итоговую стоимость.':'После отмены номер снова станет доступен для бронирования.'}</p>${request?'':`<dl><div><dt>Удержание по тарифу</dt><dd>${money(options.fee)}</dd></div><div><dt>К возврату</dt><dd>${money(options.refund)}</dd></div>${options.due>0?`<div><dt>К оплате по условиям отмены</dt><dd>${money(options.due)}</dd></div>`:''}</dl><p class="keys-cancel-note">${esc(options.policy)}${options.refund>0?' Возврат поступит тем же способом оплаты. Срок зависит от банка.':''}${options.points>0?' Баллы вернутся на счёт Ключей.':''}</p>`}<footer><button type="button" data-dismiss class="keys-cancel-keep">Сохранить бронь</button><button type="button" data-confirm class="keys-cancel-confirm">${request?'Отправить запрос':'Да, отменить бронь'}</button></footer>`;
  const origin=options.trigger??document.activeElement;
  const position=()=>{
   const mobile=document.body.dataset.keysView==='mobile';
   const phone=origin?.closest?.('.k3-phone,.ksd-phone,.kf-phone,#keysSectionsFrame')||[...app.querySelectorAll('.k3-phone,.ksd-phone,.kf-phone,#keysSectionsFrame')].find(el=>el.getClientRects().length&&!el.closest('[hidden]'));
   const rect=mobile&&phone?.getBoundingClientRect();
   dialog.style.setProperty('--cancel-sheet-bottom',Math.max(0,innerHeight-(rect?.bottom??innerHeight))+'px');
   dialog.style.setProperty('--cancel-sheet-width',rect?Math.min(rect.width,innerWidth)+'px':'480px');
   dialog.style.setProperty('--cancel-sheet-height',rect?Math.min(rect.bottom,innerHeight)-Math.max(0,rect.top)+'px':'calc(100dvh - 24px)');
  };
  const close=()=>{window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);dialog.close();dialog.remove();current=null;origin?.focus?.({preventScroll:true});};
  current={close};document.body.append(dialog);position();window.addEventListener('resize',position);window.addEventListener('scroll',position,true);dialog.showModal();dialog.querySelector('.keys-cancel-keep').focus();
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{
   if(event.target.closest('[data-dismiss]'))close();
   if(event.target.closest('[data-confirm]')){const result={status:request?'requested':'cancelled',fee:options.fee||0,refund:options.refund||0,due:options.due||0,points:options.points||0,keysPoints:options.keysPoints??options.points??0,hotelPoints:options.hotelPoints||0};close();options.onComplete?.(result);}
  });
 }};
 app.addEventListener('keys-scenario-change',()=>current?.close());
})();
