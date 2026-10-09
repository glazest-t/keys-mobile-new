import {transform} from 'esbuild';
export function adaptCheckoutEngine(source,components){
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Checkout anchor missing: '+a.slice(0,90));js=js.replace(a,b);};
 replace('function Pt(e, t) {','function Pt(e, t) {\n  if(t.type === "KEYS_BOOKING_CANCELLED") return keysCancelCreatedBooking(e,t);');
 replace('rs = { cost: 1e4, discount: 1e3 }','rs = { cost: 1e3, discount: 1e3 }');
 replace('ME = qc.payment.methods','ME = qc.payment.methods.concat([{id:"arrival",name:"При заселении"},{id:"digital-ruble",name:"Цифровой рубль"},{id:"sberpay",name:"SberPay"},{id:"yandexpay",name:"Яндекс Пэй"}])');
 replace('paymentMethod: "card", status: "editing"','paymentMethod: "", status: "editing"');
 replace('a = e.usePoints ? Math.min(t, rs.discount) : 0','a = keysPointsDiscount(e)');
 replace('return !t.enabled || e.loyalty.balance >= rs.cost ? l({ usePoints: t.enabled }) : e;', 'return l(keysPointsSelection(e,r,t.enabled));');
 replace('if (!um(r.contact))', 'if(!keysAdditionalGuestComplete(r))return l({error:"Заполните имя и фамилию второго гостя или очистите оба поля"});\n      if(!keysCheckoutMethods.some(method=>method.id===r.paymentMethod))return l({error:"Выберите способ оплаты"});\n      if (!um(r.contact))');
 replace('r.usePoints && e.loyalty.balance < rs.cost','!keysPointsValid(e,r)');
 replace('a.usePoints && e.loyalty.balance < rs.cost','!keysPointsValid(e,a)');
 replace('booking: m, orders: h, reservation:', 'booking: m, profile:a.saveContact?{...a.contact}:e.profile,keysProfileSaved:(e.keysProfileSaved||0)+(a.saveContact?1:0), keysCreatedBookings: {...e.keysCreatedBookings,[m.id]:{booking:m,draft:{...a,status:"confirmed",bookedId:m.id}}}, orders: h, reservation:');
 replace('pointsSpent: a.usePoints ? rs.cost : 0','pointsSpent: keysPointsUsed(a), hotelPointsSpent: keysHotelPointsUsed(a)');
 replace('orders: h, reservation:', 'keysHotelPoints:{...e.keysHotelPoints,[a.hotelId]:keysHotelPointsBalance(e,a.hotelId)-keysHotelPointsUsed(a)}, orders: h, reservation:');
 replace('l({ status: "processing", attempt: r.attempt + 1, nextUpdateAt: a + Ig })', 'r.paymentMethod === "arrival" ? KA(ZE(e,{...r,status:"processing",attempt:r.attempt+1,nextUpdateAt:a}),a) : l({ status: "processing", attempt: r.attempt + 1, nextUpdateAt: a + Ig })');
 replace('const r = a.paymentOutcomes[', 'const r = a.paymentMethod === "arrival" ? "success" : a.paymentOutcomes[');
 replace('method: a.paymentMethod, amount: c.total', 'method: a.paymentMethod, amount: a.paymentMethod === "arrival" ? 0 : c.total, status: a.paymentMethod === "arrival" ? "pending" : "paid"');
 replace('payment: u, paid: c.accommodation', 'payment: u, dueAtHotel: a.paymentMethod === "arrival" ? c.total : 0, paid: a.paymentMethod === "arrival" ? 0 : c.accommodation');
 replace('price: g.price, paid: true', 'price: g.price, paid: a.paymentMethod !== "arrival"');
 replace('g.price ? "Оплачен вместе с бронью"', 'g.price ? a.paymentMethod === "arrival" ? "Оплата при заселении" : "Оплачен вместе с бронью"');
 replace('". Оплачено " + Te(c.total)', '(a.paymentMethod === "arrival" ? ". Оплата при заселении: " : ". Оплачено ") + Te(c.total)');
 // This step only stores the payment method, never bank card details.
 return js+'\n'+components+'\nexport {keysAdditionalGuestComplete,KeysPaymentOptions,KeysPaymentPoints,KeysCheckoutLayout,KeysBookingConfirmation,KeysCancellationPolicy,KeysCancelledBooking,keysRequestBookingCancellation};\n';
}
export async function adaptCheckoutPage(source){
 let js=(await transform(source,{charset:'utf8',minify:false})).code;
 const old='e.jsx(d, { value: t.paymentMethod, onChange: (n) => a({ type: "RESERVATION_METHOD", method: n }) })';
 if(!js.includes(old))throw Error('Payment selector missing');
 js=js.replace(old,'e.jsx(KeysPaymentOptions, {})');
 js=js.replace('e.jsx(P, { draft: t })','e.jsx(KeysCancellationPolicy,{draft:t})');
 js=js.replace('e.jsx(u, { draft: t })', 'e.jsx(KeysCheckoutLayout,{draft:t,processing:true,children:e.jsx(u,{draft:t})})');
 js=js.replace('e.jsxs(e.Fragment, { children: [e.jsx(l, { title: "Оплата" })','e.jsxs(KeysCheckoutLayout, { draft:t, children: [e.jsx(l, { title: "Оплата" })');
 js=js.replace('children: t.status === "failed" ?', 'children: t.paymentMethod === "arrival" ? "Подтвердить бронь" : t.status === "failed" ?');
 js=js.replace('disabled: !m(t.contact)','disabled: !m(t.contact) || !t.paymentMethod || !keysAdditionalGuestComplete(t)');
 return 'import {KeysPaymentOptions,KeysCheckoutLayout,keysAdditionalGuestComplete,KeysCancellationPolicy} from "./index-C4VobzN0.js";\n'+js;
}
export function adaptCheckoutExtras(source){
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Checkout extras missing: '+a.slice(0,80));js=js.replace(a,b);};
 replace('onClick: () => j ? n(r) : l({ type: "RESERVATION_EXTRA", id: r, selected: true })','onClick: () => l({ type: "RESERVATION_EXTRA", id: r, selected: true })');
 replace('b && j ? e.jsxs("button"','false ? e.jsxs("button"');
 replace('R(n.serviceId).length > 1 && e.jsx("span"','false && e.jsx("span"');
 replace('keys-payment-extras mb-6','keys-checkout-panel keys-payment-extras mb-6');
 replace('keys-payment-total my-5','keys-checkout-panel keys-payment-total my-5');
 replace('children: [e.jsx(y, { label: "Проживание', 'children: [e.jsx("h2",{className:"keys-checkout-total-heading",children:"К оплате"}),e.jsx(y, { label: "Проживание');
 replace('e.jsxs("div", { className: "mt-2 flex items-baseline justify-between gap-3 border-t border-edge-3 pt-3"', 'e.jsx(y,{label:"Налоги и сборы",value:"Включены"}), e.jsxs("div", { className: "mt-2 flex items-baseline justify-between gap-3 border-t border-edge-3 pt-3"');
 replace('children: "К оплате" }), e.jsx("strong"','children: s.paymentMethod === "arrival" ? "При заселении" : "Итого" }), e.jsx("strong"');
 replace('e.jsx(y,{label:"Налоги и сборы",value:"Включены"})', 'e.jsx(y,{label:"Налоги и сборы",value:"Включены"}),s.paymentMethod==="arrival"&&e.jsx(y,{label:"К оплате сейчас",value:p(0)})');
 replace('const { dispatch: l } = h(), [o, n]', 'const { dispatch: l } = h(), [topic,setTopic]=g.useState("all"), [o, n]');
 replace('  const I = (r) => {', `  const category=id=>({dinner:'food',breakfast:'food',spa:'wellness',crib:'family',petkit:'pets'}[id]||'other');
  const themes=[{id:'all',name:'Все'},{id:'food',name:'Еда'},{id:'wellness',name:'Спа и отдых'},{id:'family',name:'Для детей'},{id:'pets',name:'С питомцем'},{id:'other',name:'Другие'}].filter(theme=>theme.id==='all'||i.some(id=>category(id)===theme.id));
  const visible=i.filter(id=>topic==='all'||category(id)===topic);
  g.useEffect(()=>{d.current?.scrollTo({left:0});v();},[topic]);
  g.useEffect(()=>{if(topic!=="all"&&!i.some(id=>category(id)===topic))setTopic("all");},[i.join(","),topic]);
  const I = (r) => {`);
 replace('e.jsx("div", { ref: d, onScroll: v', 'e.jsx("div",{className:"keys-results-filters keys-pay-service-filters",role:"group","aria-label":"Темы услуг",children:themes.map(theme=>e.jsx("button",{type:"button","aria-pressed":topic===theme.id,onClick:()=>setTopic(theme.id),children:theme.name},theme.id))}), e.jsx("div", { ref: d, onScroll: v');
 replace('children: i.map((r) => {','children: visible.map((r) => {');
 replace('value: "−" + p(l.discount)', 'value: "−" + p(s.pointsAmount||0)');
 replace('!!l.discount && e.jsx(y', '!!s.usePoints && !!s.pointsAmount && e.jsx(y');
 replace('e.jsx(y,{label:"Налоги и сборы",value:"Включены"})', 's.usePoints&&s.hotelPointsAmount>0&&e.jsx(y,{label:"Баллы отеля",value:"−"+p(s.hotelPointsAmount),className:"text-success"}), e.jsx(y,{label:"Налоги и сборы",value:"Включены"})');
 const start=js.indexOf('function ae('),end=js.indexOf('function ne(',start);
 if(start<0||end<0)throw Error('Points control missing');
 js=js.slice(0,start)+'function ae({draft:s}){return e.jsx(KeysPaymentPoints,{draft:s});}\n'+js.slice(end);
 return 'import {KeysPaymentPoints} from "./index-C4VobzN0.js";\n'+js;
}
export function adaptDesktopCheckout(source){
 const old='e.jsx(Mn,{className:"mb-0 "+ic,value:t.paymentMethod,onChange:l=>a({type:"RESERVATION_METHOD",method:l})})';
 if(!source.includes(old))throw Error('Desktop checkout methods missing');
 return 'import {KeysPaymentOptions} from "./index-C4VobzN0.js";\n'+source.replace(old,'e.jsx(KeysPaymentOptions,{})').replace('children:s.status==="failed"?','children:s.paymentMethod==="arrival"?"Подтвердить бронь":s.status==="failed"?').replace('disabled:!Fn(s.contact),onClick:()=>a({type:"RESERVATION_PAY"','disabled:!Fn(s.contact)||!s.paymentMethod,onClick:()=>a({type:"RESERVATION_PAY"');
}
