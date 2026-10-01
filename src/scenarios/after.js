/* Completed trip: rewards; shared documents and hotel chat. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const dashboard=home.querySelector('.kh-home'),scroll=home.querySelector('.k3-scroll');
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={check:svg('<path d="m5 12 4 4L19 6"/>'),pin:svg('<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>'),arrow:svg('<path d="m9 5 7 7-7 7"/>'),file:svg('<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'),chat:svg('<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8ZM7 8h10M7 12h7"/>'),gift:svg('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>'),star:svg('<path d="m12 3 2.8 5.7 6.3.9-4.55 4.45 1.07 6.28L12 17.36l-5.62 2.97 1.07-6.28L2.9 9.6l6.3-.9Z"/>')};
 // One referral card is reused on Trips and Benefits.
 window.KeysReferralCard={render:()=>`<button type="button" class="ka-referral-card" data-referral-open><span class="ka-referral-main"><span class="ka-referral-copy"><strong>Путешествуйте с друзьями</strong><span>Пригласите друга — получите<br>500 бонусных баллов</span></span><span class="ka-invite-art" aria-hidden="true"><span class="ka-invite-back"></span><span class="ka-invite-front">${icons.gift}</span></span></span><span class="ka-referral-footer kh-detail-link">Пригласить друзей ${icons.arrow}</span></button>`};
 let previousScenario=null;
 const screen=document.createElement('section');screen.className='ka-home';screen.hidden=true;screen.setAttribute('aria-label','Завершённая поездка');dashboard.after(screen);
 function render(){
  screen.innerHTML=`<article class="ka-trip kh-stay-card" aria-label="Завершённое проживание"><div class="ka-trip-heading kh-stay-heading"><div class="ka-trip-copy"><span class="ka-status">${icons.check} Поездка завершена</span><h1>Maidens Hotel</h1><span class="ka-city">${icons.pin} Москва</span></div><img class="ka-trip-photo" src="./scenarios/maidens-hotel.jpg" alt="Фасад Maidens Hotel в Москве" width="480" height="360"></div><button type="button" class="ka-trip-pass kh-room-pass" data-after="stay" aria-label="Детали проживания"><div><small>Проживание · 2026</small><strong>12–19 сентября</strong></div><div><small>Длительность</small><strong>7 ночей</strong></div><span class="ka-stay-details">Детали проживания ${icons.arrow}</span></button></article>
   <section class="ka-reward" aria-labelledby="ka-reward-title"><div class="ka-reward-summary"><div class="ka-reward-badge">${icons.gift}<p class="ka-reward-amount"><strong>+2 240</strong><span>баллов</span></p></div><div class="ka-reward-description"><h2 id="ka-reward-title">Баллы за поездку</h2><p class="ka-reward-copy">Используйте их для скидки на следующее бронирование.</p><span class="ka-reward-status">${icons.check} Уже на вашем счёте</span></div></div><div class="ka-reward-actions"><button type="button" class="kh-detail-link" data-after="points">Как использовать ${icons.arrow}</button><button type="button" class="ka-reward-search" data-after="find">Выбрать отель</button></div></section>
   <section class="kh-quick-actions ka-actions" aria-label="Документы, связь с отелем и отзыв"><button type="button" data-after="documents"><span>${icons.file}</span><strong>Документы поездки</strong></button><button type="button" data-after="contact"><span>${icons.chat}</span><strong>Связаться с отелем</strong></button><button type="button" data-after="review"><span>${icons.star}</span><strong>Оставить отзыв</strong></button></section>
   ${window.KeysReferralCard.render()}`;
 }
 home.addEventListener('click',event=>{
  const button=event.target.closest('[data-after]');if(!button)return;
  event.preventDefault();event.stopPropagation();const action=button.dataset.after;
  if(action==='stay')app.dispatchEvent(new CustomEvent('keys-open-stay-details'));
  if(action==='find'){window.KeysHomeViews.close();app.dispatchEvent(new CustomEvent('keys-open-hotel-search'));}
  if(action==='review')app.dispatchEvent(new CustomEvent('keys-open-trip-review',{detail:{trigger:button}}));
  if(action==='documents')window.KeysTripDocuments.open(button);
  if(action==='contact')app.dispatchEvent(new CustomEvent('keys-open-hotel-chat'));
  if(action==='points')window.KeysHomeViews.open('Баллы за поездку',`<section class="kh-detail-card"><div class="ka-points-detail">${icons.gift}<strong>+2 240 баллов</strong></div><p>Maidens Hotel · 12–19 сентября</p><div class="kh-fact"><span>Статус</span><strong>Начислены</strong></div><div class="kh-fact"><span>Дата начисления</span><strong>19 сентября 2026</strong></div></section><h3>На скидку в следующей поездке</h3><p class="kh-intro">Выберите отель в «Ключах» и используйте баллы при бронировании. Доступная скидка и условия списания будут показаны при оформлении.</p><button type="button" class="kh-primary" data-after="find">Выбрать отель</button>`,'after-points',button);

 });
 app.addEventListener('keys-scenario-change',event=>{
  const scenario=event.detail.scenario;screen.hidden=scenario!=='after';
  if(scenario!==previousScenario&&(scenario==='after'||previousScenario==='after')){
   if(!home.querySelector('.kh-overlay').hidden)window.KeysHomeViews.close();
   app.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s.dataset.unifiedSection!=='trips');
   scroll.scrollTop=0;
  }
  previousScenario=scenario;
 });
 render();
})();
