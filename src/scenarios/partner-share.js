import {partnerInvitationURL} from './partner-sharing.mjs';
export function createPartnerShare(root,svg){
 const dialog=document.createElement('dialog');dialog.className='kpi-benefits-dialog kpi-share-dialog';dialog.setAttribute('aria-labelledby','kpi-share-title');
 dialog.innerHTML=`<div class="kpi-benefits-sheet"><div class="kpi-sheet-handle" aria-hidden="true"></div><header><span class="kpi-club-label">TravelLine Partners Club</span><button type="button" aria-label="Закрыть приглашение коллеги">${svg('<path d="m6 6 12 12M6 18 18 6"/>')}</button></header><div class="kpi-share-symbol">${svg('<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2m4-13v6m-3-3h6"/>')}</div><h2 id="kpi-share-title">Пригласите коллегу</h2><p>Поделитесь «Ключами» с другом-отельером. После подтверждения статуса ему станут доступны тарифы Friendly Rate.</p><section class="kpi-inviter"><span>Приглашение от вас</span><strong data-share-name></strong><span data-share-hotel></span></section><label class="kpi-share-label" for="kpi-share-link">Ссылка на приглашение</label><input id="kpi-share-link" class="kpi-share-link" readonly><div class="kpi-share-actions"><button type="button" class="kpi-benefits-done" data-share-send>Поделиться приглашением</button><button type="button" class="kpi-share-copy" data-share-copy>Копировать ссылку</button></div><p class="kpi-share-status" role="status" aria-live="polite"></p></div>`;
 root.append(dialog);let trigger,animation;
 const sheet=dialog.querySelector('.kpi-benefits-sheet');
 const position=()=>{const phone=root.querySelector('.kf-phone[data-screen="profile"]'),rect=document.body.dataset.keysView==='mobile'&&phone?.getBoundingClientRect();const left=rect?Math.max(0,rect.left):0,top=rect?Math.max(0,rect.top):0;Object.assign(dialog.style,{left:left+'px',top:top+'px',width:(rect?Math.min(rect.right,innerWidth)-left:innerWidth)+'px',height:(rect?Math.min(rect.bottom,innerHeight)-top:innerHeight)+'px'});};
 const close=()=>{animation?.cancel();if(dialog.open)dialog.close();};
 window.addEventListener('resize',()=>{if(dialog.open)position();});window.addEventListener('scroll',()=>{if(dialog.open)position();},true);
 dialog.querySelector('header button').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close();});dialog.addEventListener('close',()=>trigger?.isConnected&&trigger.focus({preventScroll:true}));
 const field=dialog.querySelector('input'),status=dialog.querySelector('[role=status]');
 async function copy(){try{await navigator.clipboard.writeText(field.value);status.textContent='Ссылка скопирована — отправьте её коллеге.';}catch{field.focus();field.select();status.textContent='Скопируйте выделенную ссылку и отправьте коллеге.';}}
 dialog.querySelector('[data-share-copy]').addEventListener('click',copy);
 dialog.querySelector('[data-share-send]').addEventListener('click',async event=>{
  const button=event.currentTarget;if(button.disabled)return;button.disabled=true;
  try{if(navigator.share){try{await navigator.share({title:'Приглашение в «Ключи» · Friendly Rate',text:'Присоединяйтесь к TravelLine Partners Club: подтвердите статус отельера и бронируйте по дружественным тарифам.',url:field.value});status.textContent='Приглашение передано для отправки.';return;}catch(error){if(error.name==='AbortError')return;}}await copy();}finally{button.disabled=false;}
 });
 return {close,open(button,{name,hotel}){if(document.body.dataset.keysPartnerApproved!=='true')return;trigger=button;field.value=partnerInvitationURL({href:location.href,name,hotel,brand:document.documentElement.dataset.keysBrand});dialog.querySelector('[data-share-name]').textContent=name;dialog.querySelector('[data-share-hotel]').textContent=hotel;status.textContent='';
  if(dialog.open)return;
  animation?.cancel();position();dialog.showModal();
  // Let native dialog focus settle before moving the panel; otherwise it scrolls
  // its own container to follow the close button while that button is animating.
  dialog.scrollTop=0;sheet.scrollTop=0;dialog.querySelector('header button').focus({preventScroll:true});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animation=sheet.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});
 }};
}
