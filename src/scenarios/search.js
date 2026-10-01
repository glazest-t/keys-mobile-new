/* No upcoming booking: a focused entry to the existing hotel search. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const scroll=home.querySelector('.k3-scroll');
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const arrow=svg('<path d="m9 5 7 7-7 7"/>');
 const screen=document.createElement('section');screen.className='kse-home';screen.hidden=true;screen.setAttribute('aria-label','Поездки без бронирования');
 screen.innerHTML=`
  <header class="kse-heading"><span class="kse-welcome">Рады видеть вас, Татьяна <span aria-hidden="true">${svg('<path d="M12 3c0 6-3 9-9 9 6 0 9 3 9 9 0-6 3-9 9-9-6 0-9-3-9-9Z"/>')}</span></span><h1>Куда отправимся?</h1><p>Броней пока нет — начнём с выбора отеля.</p></header>
  <article class="kse-inspiration" aria-labelledby="kse-inspiration-title">
   <div class="kse-inspiration-top"><h2 id="kse-inspiration-title">За новыми впечатлениями</h2></div>
   <div class="kse-visual" aria-label="Вдохновение для следующей поездки">
    <figure class="kse-postcard kse-postcard-sea"><img src="./scenarios/next-trip.jpg" width="1200" height="876" alt="Солнечная терраса и бассейн у моря"><figcaption>Ближе к морю</figcaption></figure>
    <figure class="kse-postcard kse-postcard-city"><img src="./home/nearby/nearby-cafe-generated.jpg" alt="Уютное кафе для неспешного утра"><figcaption>Без будильника</figcaption></figure>
    <span class="kse-spark" aria-hidden="true">${svg('<path d="M12 2v20M2 12h20M5 5l14 14M5 19 14-14"/>')}</span>
   </div>
   <div class="kse-inspiration-copy"><p>Цены напрямую от отелей<br>и баллы на будущие поездки.</p><button type="button" class="kse-find" data-empty-action="find">Подобрать отель ${svg('<path d="M5 12h14m-6-6 6 6-6 6"/>')}</button></div>
  </article>
  ${window.KeysReferralCard.render()}
  <button type="button" class="kse-benefits" data-empty-action="benefits">
   <span class="kse-benefits-heading"><strong>Двойная выгода</strong></span>
   <span class="kse-benefits-list">
    <span class="kse-benefits-item"><span class="kse-benefits-icon">${svg('<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M9 7h1m4 0h1M9 11h1m4 0h1M10 21v-6h4v6"/>')}</span><span><strong>От отеля</strong><span>Выгодные цены напрямую и привилегии по вашей программе лояльности.</span></span></span>
    <span class="kse-benefits-item"><span class="kse-benefits-icon">${svg('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>')}</span><span><strong>От «Ключей»</strong><span>Баллы за проживание — на скидку в следующей поездке.</span></span></span>
   </span>
   <span class="kse-card-action"><span>Все преимущества</span>${arrow}</span>
  </button>`;
 scroll.append(screen);
 // All referral cards open the same flow, including the completed trip.
 const referralView=document.createElement('section');referralView.className='kh-overlay kse-referral-view';referralView.hidden=true;
 referralView.setAttribute('role','dialog');referralView.setAttribute('aria-modal','true');referralView.setAttribute('aria-labelledby','keys-referral-title');
 referralView.innerHTML=`<header class="kh-detail-header"><button type="button" class="kh-back" data-referral-back aria-label="Назад">${svg('<path d="M19 12H5m7-7-7 7 7 7"/>')}</button><h2 id="keys-referral-title">Пригласить друзей</h2></header><div class="kh-detail-content"></div>`;
 let referralOrigin=null,referralBackground=[];
 const closeReferral=()=>{
  referralView.hidden=true;
  referralBackground.forEach(({el,inert,aria})=>{el.inert=inert;if(aria===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',aria);});
  referralBackground=[];referralOrigin?.focus({preventScroll:true});
 };
 const openReferral=trigger=>{
  referralOrigin=trigger;const phone=trigger.closest('.k3-phone,.kf-phone');phone.append(referralView);
  referralBackground=[...phone.children].filter(el=>el!==referralView).map(el=>({el,inert:el.inert,aria:el.getAttribute('aria-hidden')}));
  referralBackground.forEach(({el})=>{el.inert=true;el.setAttribute('aria-hidden','true');});
  referralView.querySelector('.kh-detail-content').innerHTML=`<section class="kse-referral-detail"><span class="kse-referral-reward">+500 баллов за друга</span><h3>Поделитесь ссылкой на «Ключи»</h3><ol><li>Отправьте другу свою ссылку.</li><li>Друг установит приложение по ней — вам начислятся 500 баллов.</li><li>Сразу используйте баллы для скидки при бронировании новой поездки.</li></ol><label for="kse-invite-link">Ваша ссылка</label><input id="kse-invite-link" class="ka-referral-link" readonly value="https://keys.example/r/tatyana"><button type="button" class="kh-primary" data-empty-share>Поделиться ссылкой</button><p class="kse-share-status" role="status" aria-live="polite"></p></section>`;
  referralView.hidden=false;referralView.scrollTop=0;referralView.querySelector('[data-referral-back]').focus({preventScroll:true});
 };
 referralView.querySelector('[data-referral-back]').addEventListener('click',closeReferral);
 referralView.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeReferral();}
  if(event.key==='Tab'){
   const nodes=[...referralView.querySelectorAll('button,input')],first=nodes[0],last=nodes.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 const benefits=app.querySelector('.keys-benefits');
 if(benefits)benefits.querySelector('.keys-benefits-guide').insertAdjacentHTML('afterend',window.KeysReferralCard.render());
 app.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-referral-open]');
  if(trigger){event.preventDefault();openReferral(trigger);}
 });

 screen.addEventListener('click',event=>{
  const button=event.target.closest('[data-empty-action]');if(!button)return;
  if(button.dataset.emptyAction==='find')app.dispatchEvent(new CustomEvent('keys-open-hotel-search'));
  if(button.dataset.emptyAction==='benefits')home.querySelector('nav [data-bottom-tab="bonuses"],nav [data-nav="benefits"]')?.click();
 });
 referralView.addEventListener('click',async event=>{
  const button=event.target.closest('[data-empty-share]');if(!button)return;
  const field=referralView.querySelector('#kse-invite-link'),status=referralView.querySelector('.kse-share-status');
  if(!field||button.disabled)return;
  button.disabled=true;
  try{
   if(navigator.share){
    try{await navigator.share({title:'Присоединяйтесь к «Ключам»',text:'Находите отели и копите баллы для новых поездок.',url:field.value});status.textContent='Ссылка отправлена';return;}
    catch(error){if(error.name==='AbortError')return;}
   }
   try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(field.value);status.textContent='Ссылка скопирована — отправьте её другу';}
   catch{field.focus();field.select();status.textContent='Скопируйте выделенную ссылку и отправьте другу';}
  }finally{button.disabled=false;}
 });
 let active=false;
 app.addEventListener('keys-scenario-change',event=>{
  if(!referralView.hidden)closeReferral();
  const visible=event.detail.scenario==='search';screen.hidden=!visible;
  if(visible!==active){
   window.KeysHomeViews.close();
   app.querySelectorAll(':scope>.ku-section').forEach(section=>section.hidden=section.dataset.unifiedSection!=='trips');
   scroll.scrollTop=0;active=visible;
  }
 });
})();
