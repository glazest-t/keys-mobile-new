/* Scenario-specific home content. Day 1/2 retain the approved in-stay layout. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=document.getElementById('keysHomeVariantThree');
 const dashboard=home.querySelector('.kh-home'),pass=dashboard.querySelector('.kh-room-pass');
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={clock:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),file:svg('<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'),bag:svg('<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M9 7V3h6v4M8 11v6m8-6v6"/>'),arrow:svg('<path d="m9 5 7 7-7 7"/>')};
 const deadline=document.createElement('div');deadline.className='ksc-deadline';deadline.innerHTML=`<span>19 сентября · день выезда</span><strong>Выезд сегодня <span>до 12:00</span></strong>`;pass.prepend(deadline);
 const checkout=document.createElement('section');checkout.className='ksc-checkout';checkout.setAttribute('aria-label','Перед выездом');
 checkout.innerHTML=`
  <div data-late-checkout-slot></div>
  <section class="ksc-card ksc-deposit" aria-label="Депозит"><div data-deposit-slot></div><p class="ksc-note">Не забудьте вернуть неиспользованный остаток на ресепшене перед выездом.</p></section>
  <div data-checkout-actions-slot></div>
  <aside class="ksc-reminder">${icons.bag}<div><strong>Всё с собой?</strong><p>Проверьте шкаф, сейф и ванную. Не забудьте документы и зарядные устройства.</p></div></aside>`;
 // Late checkout belongs to the checkout home, not booking details.
 checkout.querySelector('[data-late-checkout-slot]').outerHTML=`<section class="ksc-service-card" aria-label="Поздний выезд">
    <button type="button" class="kpa-service" data-stay-service="late"><span class="kpa-service-icon">${icons.clock}</span><span class="kpa-service-copy"><strong>Поздний выезд</strong><small class="kpa-service-status">Не включён в бронь</small></span><span class="kpa-service-action"><span class="kpa-service-link">Добавить</span></span></button>
   </section>`;
 checkout.querySelector('[data-checkout-actions-slot]').replaceWith(dashboard.querySelector('.kh-quick-actions').cloneNode(true));
 const deposit=dashboard.querySelector('.kh-account-row').cloneNode(true);
 checkout.querySelector('[data-deposit-slot]').replaceWith(deposit);dashboard.querySelector('.kh-stay-card').after(checkout);
 const today=pass.querySelector('.kh-pass-today'),progress=pass.querySelector('.kh-pass-progress');
 function update({detail}){
  if(detail.scenario!=='stay')return;
  const day=detail.stayDay??'day-2',first=day==='day-1',last=day==='checkout';
  deadline.hidden=!last;checkout.hidden=!last;
  today.innerHTML=last?'<span>Сегодня</span><strong>День выезда</strong><time datetime="2026-09-19">19 сентября</time>':`<span>Сегодня</span><strong>День ${first?'1':'2'} <span>из 7</span></strong><time datetime="2026-09-${first?'12':'13'}">${first?'12':'13'} сентября</time>`;
  progress.setAttribute('aria-label',last?'Проживание завершается сегодня.':first?'Первый день проживания из семи.':'Идёт второй день проживания из семи. Один день завершён.');
  progress.querySelector('span').style.width=last?'100%':first?'0%':'14.285714%';
  // Close temporary home overlays when changing the demo day, keeping navigation intact.
  if(!home.querySelector('.kh-overlay').hidden)window.KeysHomeViews.close();
 }
 root.addEventListener('keys-scenario-change',update);
})();
