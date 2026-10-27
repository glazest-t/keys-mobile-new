/* Documents use the exact booking model shown in details, regardless of entry point. */
(() => {
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=value=>Number(value||0).toLocaleString('ru-RU')+' ₽';
 const date=value=>new Date(value+'T12:00:00Z').toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 function list(b){
  const a=globalThis.KeysBookingDetails.account(b),completed=b.status==='Поездка завершена';
  const identity=[['Бронь',b.id],['Отель',b.hotel],...(b.guest?[['Гость',b.guest]]:[]),['Проживание',date(b.arrival)+' — '+date(b.departure)]];
  const roomPaid=Math.min(a.paid,Math.max(0,b.roomTotal-(b.discount||0)));
  return [{id:'stay',title:b.cancellation?'Подтверждение отмены':completed?'Подтверждение проживания':'Подтверждение брони',copy:date(b.arrival)+' — '+date(b.departure),rows:[...identity,['Статус',b.status],['Номер',b.room],...(b.party?[['Гости',b.party]]:[]),['Стоимость проживания',money(b.roomTotal)],...(b.cancellation?[['Удержание',money(b.cancellation.fee)],['Возвращено',money(b.cancellation.status==='refunded'?b.cancellation.refund:0)]]:[])]},
  ...(roomPaid>0?[{id:'room',title:'Чек за проживание',copy:money(roomPaid)+' · оплачено',rows:[...identity,['Услуга','Проживание'],['Сумма',money(roomPaid)],['Оплата','Оплачено']]}]:[]),
  ...(a.servicesTotal>0?[{id:'services',title:a.due===0?'Чек за услуги':'Счёт за услуги',copy:money(a.servicesTotal),rows:[...identity,...a.services.filter(item=>item.price>0).map(item=>[item.title,money(item.price)]),['Сумма',money(a.servicesTotal)],['Оплата',a.due===0?'Оплачено':'Есть неоплаченные услуги']]}]:[])];
 }
 function html(b,doc){
  return `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(doc.title)} · ${escape(b.id)}</title><style>body{font:16px/1.5 system-ui;max-width:640px;margin:40px auto;padding:20px;color:#14171f}h1{font-size:24px}dl>div{display:flex;justify-content:space-between;gap:24px;padding:12px 0;border-bottom:1px solid #eceef2}dt,small{color:#6b7280}dd{margin:0;text-align:right;overflow-wrap:anywhere}small{display:block;margin-top:24px}</style><h1>${escape(doc.title)}</h1><dl>${doc.rows.map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><small>Образец документа прототипа. Не является кассовым чеком или подтверждением реального проживания.</small></html>`;
 }
 globalThis.KeysBookingDocuments={list,html,escape};
})();
