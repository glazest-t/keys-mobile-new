export const partnerInviter={name:'Анна Смирнова',hotel:'Maidens Hotel'};
export function createPartnerBenefits(root,svg){
 const dialog=document.createElement('dialog');dialog.className='kpi-benefits-dialog';dialog.setAttribute('aria-labelledby','kpi-benefits-title');
 dialog.innerHTML=`<div class="kpi-benefits-sheet"><div class="kpi-sheet-handle" aria-hidden="true"></div><header><span class="kpi-club-label">TravelLine Partners Club</span><button type="button" aria-label="Закрыть пояснение Friendly Rate">${svg('<path d="m6 6 12 12M6 18 18 6"/>')}</button></header><h2 id="kpi-benefits-title">Friendly Rate</h2><p>Дружественный тариф со скидкой на бронирование отелей — только для отельеров, участников TravelLine Partners Club.</p><section class="kpi-inviter"><span>Вас пригласила</span><strong>${partnerInviter.name}</strong><span>${partnerInviter.hotel}</span></section><div class="kpi-rate-note">${svg('<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>')}<span>Статус отельера подтверждён. Ищите Friendly Rate при выборе номера.</span></div><button type="button" class="kpi-benefits-done">Понятно</button></div>`;
 root.append(dialog);
 let trigger;
 const position=()=>{
  const phone=root.querySelector('.kf-phone[data-screen="profile"]');
  const mobile=document.body.dataset.keysView==='mobile',rect=mobile&&phone?.getBoundingClientRect();
  const left=rect?Math.max(0,rect.left):0,top=rect?Math.max(0,rect.top):0;
  dialog.style.left=left+'px';dialog.style.top=top+'px';
  dialog.style.width=(rect?Math.min(rect.right,innerWidth)-left:innerWidth)+'px';
  dialog.style.height=(rect?Math.min(rect.bottom,innerHeight)-top:innerHeight)+'px';
 };
 const reposition=()=>{if(dialog.open)position();};
 window.addEventListener('resize',reposition);window.addEventListener('scroll',reposition,true);
 const close=()=>dialog.close();
 dialog.querySelector('header button').addEventListener('click',close);dialog.querySelector('.kpi-benefits-done').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
 dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
 return {open:button=>{trigger=button;if(!dialog.open){position();dialog.showModal();}},close};
}
