export function adaptCheckin(js){
 const start=js.indexOf('function Mq() {'),end=js.indexOf('function Pq()',start);
 if(start<0||end<0)throw Error('Checkin source anchor missing');
 let part=js.slice(start,end);
 const replace=(a,b)=>{if(!part.includes(a))throw Error('Checkin anchor missing: '+a.slice(0,70));part=part.replace(a,b);};
 replace('n.jsxs("p", { className: "mb-5 text-13 leading-relaxed text-muted", children: [r.name, " · ", Ct(e.booking.arrival), n.jsx("br", {}), Ag(e.booking.party)] }), ','');
 replace('E.useState(Ac(e.booking.contact))','E.useState(e.booking.guestName || Ac(e.booking.contact))');
 replace('E.useState("15:00–16:00")','E.useState(e.booking.arrivalTime || "14:00–16:00")');
 replace('["15:00–16:00", "16:00–18:00", "После 18:00"]','["14:00–16:00", "16:00–18:00", "После 18:00"]');
 replace('arrivalTime: u });','arrivalTime: u, guestName: l.trim() });');
 replace('title: "Паспорт добавлен"','title: "Документы гостей"');
 replace('description: "Демонстрационные данные"','description: "Паспорт и другие документы"');
 replace('"Ваш номер 408 уже ждёт вас."','"По приезде подойдите на ресепшен с документами."');
 replace('description: "Вход со стороны моря"','description: "Адрес, вход и порядок заселения"');
 replace('children: x ? "Получить ключ" : "Вернуться к поездке"','children: "Вернуться к поездке"');
 js=js.slice(0,start)+part+js.slice(end);
 const anchor='checkedIn: true, arrivalTime: t.arrivalTime';
 if(!js.includes(anchor))throw Error('Checkin reducer anchor missing');
 return js.replace(anchor,'checkedIn: true, arrivalTime: t.arrivalTime, guestName: t.guestName ?? e.booking.guestName');
}
