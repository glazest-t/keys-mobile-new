/* Shared booking details for upcoming, active, completed and newly created stays. */
(() => {
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=value=>Number(value||0).toLocaleString('ru-RU')+' ₽';
 const date=value=>new Date(value+'T12:00:00Z').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 const row=(label,value,total=false)=>`<div${total?' class="kbd-total"':''}><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`;
 function account(model){
  const services=(model.services||[]).filter(item=>item.state!=='pending'&&Number.isFinite(item.price));
  const servicesTotal=services.reduce((sum,item)=>sum+item.price,0),discount=model.discount||0;
  const total=Math.max(0,model.roomTotal+servicesTotal-discount),paid=model.paid||0;
  return {services,servicesTotal,total,paid,due:Math.max(0,total-paid)};
 }
 function bill(model){
  const a=account(model),cancel=model.cancellation;
  return `<section class="kbd-card kbd-account" aria-label="Общий счёт"><h2>Общий счёт</h2><dl>${row('Проживание',money(model.roomTotal))}${a.services.map(item=>row(item.title,money(item.price))).join('')}${model.discount?row('Списано баллами','−'+money(model.discount)):''}${row('Итого',money(a.total),true)}${row('Оплачено',money(a.paid))}${cancel?row('Удержание',money(cancel.fee))+row(cancel.status==='refunded'?'Возвращено':'К возврату',money(cancel.refund))+row('К оплате',money(cancel.due||0)):row('Осталось оплатить',money(a.due))}</dl>${cancel?.refund>0&&cancel.status!=='refunded'?'<p class="kbd-note">Возврат в обработке. Деньги поступят тем же способом оплаты.</p>':!cancel&&!a.due&&!model.refundPending?'<span class="kbd-paid-label" role="status">Всё оплачено</span>':!cancel&&a.paid>0&&a.due>0?'<span class="kbd-paid-label" role="status">Частичная оплата</span>':''}${model.refundPending>0&&!cancel?`<p class="kbd-note">Возврат ${money(model.refundPending)} — в обработке</p>`:''}</section>`;
 }
 function mapLinks(address){
  const query=encodeURIComponent(address);
  return [['2ГИС','https://2gis.ru/search/'+query],['Яндекс Карты','https://yandex.ru/maps/?text='+query],['Google Maps','https://www.google.com/maps/search/?api=1&query='+query],['Apple Maps','https://maps.apple.com/?q='+query]];
 }
 function mapHref(address,userAgent=globalThis.navigator?.userAgent||''){
  return /Android/i.test(userAgent)?'geo:0,0?q='+encodeURIComponent(address):mapLinks(address)[0][1];
 }
 // A browser cannot discover the preferred map app on iOS. Let the guest choose;
 // Android geo links use the system's default handler or its app chooser.
 globalThis.document?.addEventListener?.('click',event=>{
  const link=event.target.closest?.('[data-booking-map-address]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||/Android/i.test(navigator.userAgent))return;
  event.preventDefault();
  const dialog=document.createElement('dialog');dialog.className='kbd-map-dialog';dialog.setAttribute('aria-label','Открыть в картах');
  const address=link.dataset.bookingMapAddress;
  dialog.innerHTML=`<h2>Открыть в картах</h2><p>${escape(address)}</p><div class="kbd-map-options">${mapLinks(address).map(([name,href])=>`<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${name}</a>`).join('')}</div><button type="button">Отмена</button>`;
  dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('button,a'))dialog.close();});
  dialog.addEventListener('close',()=>{dialog.remove();link.focus({preventScroll:true});},{once:true});
  document.body.append(dialog);dialog.showModal();
 });
 function contacts(model){
  // Keep the existing Maidens demo contact consistent across booking entry points.
  const maidens=model.hotelId==='maidens'||model.hotel==='Maidens Hotel';
  const camelia=model.hotelId==='more'||model.hotel==='Swissôtel Камелия';
  const address=maidens?'Москва, Зубовская площадь, 3, стр. 1':camelia?'Сочи, Курортный проспект, 89':model.address;
  // Swissôtel contact: hotel brochure https://s01.cdn-pegast.net/get/02/e3/c8/abc08e720d75111d889b313597502a02fa2f9dddc81f047f905cee0b2a/68ca7c33e936b.pdf
  const phone=model.phone||(maidens?'+7 495 120-70-70':camelia?'+7 862 296-88-01':'');
  const number=String(phone).replace(/[^+0-9]/g,'');
  return address||phone?`<div class="kbd-hotel-contacts">${address?`<a href="${escape(mapHref(address))}" data-booking-map-address="${escape(address)}" aria-label="Открыть адрес на карте: ${escape(address)}">${escape(address)}</a>`:''}${phone&&number?`<a href="tel:${escape(number)}" aria-label="Позвонить в отель: ${escape(phone)}">${escape(phone)}</a>`:''}</div>`:'';
 }
 function render(model){
  return `<div class="kbd-view"><section class="kbd-card" aria-label="Проживание"><div class="kbd-heading"><span>${escape(model.status)}</span><small>№ ${escape(model.id)}</small></div><h2>${escape(model.hotel)}</h2>${contacts(model)}<div class="kbd-dates"><div><span>Заезд</span><strong>${escape(date(model.arrival))}</strong><small>с ${escape(model.checkIn||'14:00')}</small></div><div><span>Выезд</span><strong>${escape(date(model.departure))}</strong><small>до ${escape(model.checkOut||'12:00')}</small></div></div></section><section class="kbd-card" aria-label="Номер и гости"><h2>Номер и гости</h2><dl>${row('Категория',model.room)}${model.roomNumber?row('Номер',model.roomNumber):''}${row('Гости',model.party)}${model.guest?row('Основной гость',model.guest):''}</dl></section>${model.tariff?`<section class="kbd-card" aria-label="Тариф"><h2>Тариф «${escape(model.tariff)}»</h2>${(model.included||[]).filter(Boolean).map(text=>`<p class="kbd-note">${escape(text)}</p>`).join('')}</section>`:''}${bill(model)}${model.pointsAwarded?`<section class="kbd-points" aria-label="Баллы за поездку"><span class="kbd-points-symbol" aria-hidden="true"></span><div class="kbd-points-copy"><strong>Баллы Ключей</strong><span>Начислены за поездку</span></div><strong class="kbd-points-amount">+${Number(model.pointsAwarded).toLocaleString('ru-RU')}</strong></section>`:''}</div>`;
 }
 globalThis.KeysBookingDetails={render,bill,account,mapHref,mapLinks};
})();
