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
  return `<section class="kbd-card kbd-account" aria-label="Общий счёт"><h2>Общий счёт</h2><dl>${row('Проживание',money(model.roomTotal))}${a.services.map(item=>row(item.title,money(item.price))).join('')}${model.discount?row('Списано баллами','−'+money(model.discount)):''}${row('Итого',money(a.total),true)}${row('Оплачено',money(a.paid))}${cancel?row('Удержание',money(cancel.fee))+row(cancel.status==='refunded'?'Возвращено':'К возврату',money(cancel.refund))+row('К оплате',money(cancel.due||0)):row('Осталось оплатить',money(a.due))}</dl>${cancel?.refund>0&&cancel.status!=='refunded'?'<p class="kbd-note">Возврат в обработке. Деньги поступят тем же способом оплаты.</p>':!cancel&&!a.due&&!model.refundPending?'<span class="kbd-paid-label" role="status">Всё оплачено</span>':''}${model.refundPending>0&&!cancel?`<p class="kbd-note">Возврат ${money(model.refundPending)} — в обработке</p>`:''}</section>`;
 }
 function render(model){
  return `<div class="kbd-view"><section class="kbd-card" aria-label="Проживание"><div class="kbd-heading"><span>${escape(model.status)}</span><small>№ ${escape(model.id)}</small></div><h2>${escape(model.hotel)}</h2>${model.address?`<p class="kbd-note">${escape(model.address)}</p>`:''}<div class="kbd-dates"><div><span>Заезд</span><strong>${escape(date(model.arrival))}</strong><small>с ${escape(model.checkIn||'14:00')}</small></div><div><span>Выезд</span><strong>${escape(date(model.departure))}</strong><small>до ${escape(model.checkOut||'12:00')}</small></div></div></section><section class="kbd-card" aria-label="Номер и гости"><h2>Номер и гости</h2><dl>${row('Категория',model.room)}${model.roomNumber?row('Номер',model.roomNumber):''}${row('Гости',model.party)}${model.guest?row('Основной гость',model.guest):''}</dl></section>${model.tariff?`<section class="kbd-card" aria-label="Тариф"><h2>Тариф «${escape(model.tariff)}»</h2>${(model.included||[]).filter(Boolean).map(text=>`<p class="kbd-note">${escape(text)}</p>`).join('')}</section>`:''}${bill(model)}${model.pointsAwarded?`<section class="kbd-points" aria-label="Баллы за поездку"><span class="kbd-points-symbol" aria-hidden="true"></span><div class="kbd-points-copy"><strong>Баллы Ключей</strong><span>Начислены за поездку</span></div><strong class="kbd-points-amount">+${Number(model.pointsAwarded).toLocaleString('ru-RU')}</strong></section>`:''}</div>`;
 }
 globalThis.KeysBookingDetails={render,bill,account};
})();
