export function styleCheckin(js){
 const start=js.indexOf('function Mq() {'),end=js.indexOf('function Pq()',start);
 if(start<0||end<0)throw Error('Checkin style anchor missing');
 let part=js.slice(start,end);
 const old='n.jsxs("div", { className: "mb-[22px] flex items-center gap-3 text-12 text-muted", children: [n.jsxs("span", { className: "text-brand", children: [e.booking.checkedIn ? "✓" : "1", " · Данные гостей"] }), n.jsx(D, { name: "arrow", className: "size-[15px]" }), n.jsx("span", { children: "2 · Ключ" })] })';
 if(!part.includes(old))throw Error('Checkin steps missing');
 part=part.replace(old,`n.jsxs("ol", { className: "keys-checkin-steps", "aria-label": "Этапы заселения", children: [n.jsxs("li", { className: e.booking.checkedIn ? "is-complete" : "is-current", "aria-current": e.booking.checkedIn ? undefined : "step", children: [n.jsx("span", { className: "keys-checkin-step-number", "aria-hidden": true, children: e.booking.checkedIn ? n.jsx(D, {name:"check"}) : "1" }), n.jsx("span", {children: e.booking.checkedIn ? "Данные переданы" : "Данные гостей"})] }), n.jsxs("li", { className: e.booking.checkedIn ? "is-current" : "", "aria-current": e.booking.checkedIn ? "step" : undefined, children: [n.jsx("span", {className:"keys-checkin-step-number", "aria-hidden":true, children:"2"}), n.jsx("span", {children:"Ключ от номера"})] })] })`);
 const help=', n.jsx(H, { variant: "text", icon: "chat", className: "mt-3", onClick: () => t({ type: "HANDOFF" }), children: "Помощь сотрудника" })';
 if(!part.includes(help))throw Error('Checkin help missing');part=part.replace(help,'');
 part=part.replace('className: "border border-line bg-mist"','className: "keys-checkin-result"');
 part=part.replace('className: "mb-5 grid size-[50px] place-items-center rounded-full bg-soft text-brand"','className: "keys-checkin-success-icon"');
 part=part.replace('children: x ? "Всё готово" : "Регистрация пройдена"','children: "Регистрация пройдена"');
 part=part.replace('className: "mt-[22px]", icon: x ? "key" : "arrow"','className: "keys-checkin-home"');
 return js.slice(0,start)+part+js.slice(end);
}
