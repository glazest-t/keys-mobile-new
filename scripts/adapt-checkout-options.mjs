import {transform} from 'esbuild';
export function adaptCheckoutEngine(source,components){
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Checkout anchor missing: '+a.slice(0,90));js=js.replace(a,b);};
 replace('function Pt(e, t) {',`function Pt(e, t) {
  if(t.type==='KEYS_CARD_READY'){const draft=e.reservation;if(!draft||['processing','confirmed'].includes(draft.status))return e;return {...e,reservation:{...draft,cardReady:!!t.ready}};}`);
 replace('rs = { cost: 1e4, discount: 1e3 }','rs = { cost: 1e3, discount: 1e3 }');
 replace('ME = qc.payment.methods','ME = qc.payment.methods.concat([{id:"digital-ruble",name:"Цифровой рубль"},{id:"sberpay",name:"SberPay"},{id:"yandexpay",name:"Яндекс Пэй"}])');
 replace('paymentMethod: "card", status: "editing"','paymentMethod: "", cardReady: false, status: "editing"');
 replace('a = e.usePoints ? Math.min(t, rs.discount) : 0','a = keysPointsUsed(e) * rs.discount / rs.cost');
 replace('return !t.enabled || e.loyalty.balance >= rs.cost ? l({ usePoints: t.enabled }) : e;', 'return l({usePoints:!!t.enabled,pointsAmount:Math.max(0,Math.floor(Math.min(Number(t.amount ?? r.pointsAmount ?? rs.cost)||0,keysPointsLimit(r,e.loyalty.balance))))});');
 replace('if (!um(r.contact))', 'if(!keysCheckoutMethods.some(method=>method.id===r.paymentMethod))return l({error:"Выберите способ оплаты"});\n      if(r.paymentMethod==="card"&&!r.cardReady)return l({error:"Введите данные карты"});\n      if (!um(r.contact))');
 replace('r.usePoints && e.loyalty.balance < rs.cost','r.usePoints && e.loyalty.balance < keysPointsUsed(r)');
 replace('a.usePoints && e.loyalty.balance < rs.cost','a.usePoints && e.loyalty.balance < keysPointsUsed(a)');
 replace('booking: m, orders: h, reservation:', 'booking: m, keysCreatedBookings: {...e.keysCreatedBookings,[m.id]:{booking:m,draft:{...a,status:"confirmed",bookedId:m.id}}}, orders: h, reservation:');
 replace('pointsSpent: a.usePoints ? rs.cost : 0','pointsSpent: keysPointsUsed(a)');
 // Raw card details never enter application state or browser storage.
 return js+'\n'+components+'\nexport {KeysPaymentOptions,KeysPaymentPoints};\n';
}
export async function adaptCheckoutPage(source){
 let js=(await transform(source,{charset:'utf8',minify:false})).code;
 const old='e.jsx(d, { value: t.paymentMethod, onChange: (n) => a({ type: "RESERVATION_METHOD", method: n }) })';
 if(!js.includes(old))throw Error('Payment selector missing');
 js=js.replace(old,'e.jsx(KeysPaymentOptions, {})');
 js=js.replace('disabled: !m(t.contact)','disabled: !m(t.contact) || !t.paymentMethod || t.paymentMethod === "card" && !t.cardReady');
 return 'import {KeysPaymentOptions} from "./index-C4VobzN0.js";\n'+js;
}
export function adaptCheckoutExtras(source){
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Checkout extras missing: '+a.slice(0,80));js=js.replace(a,b);};
 replace('keys-payment-extras mb-6','keys-checkout-panel keys-payment-extras mb-6');
 replace('keys-payment-total my-5','keys-checkout-panel keys-payment-total my-5');
 replace('children: [e.jsx(y, { label: "Проживание', 'children: [e.jsx("h2",{className:"keys-checkout-total-heading",children:"К оплате"}),e.jsx(y, { label: "Проживание');
 replace('e.jsxs("div", { className: "mt-2 flex items-baseline justify-between gap-3 border-t border-edge-3 pt-3"', 'e.jsx(y,{label:"Налоги и сборы",value:"Включены"}), e.jsxs("div", { className: "mt-2 flex items-baseline justify-between gap-3 border-t border-edge-3 pt-3"');
 replace('children: "К оплате" }), e.jsx("strong"','children: "Итого" }), e.jsx("strong"');
 replace('const { dispatch: l } = h(), [o, n]', 'const { dispatch: l } = h(), [topic,setTopic]=g.useState("all"), [o, n]');
 replace('  const I = (r) => {', `  const category=id=>({dinner:'food',breakfast:'food',spa:'wellness',crib:'family',petkit:'pets'}[id]||'other');
  const themes=[{id:'all',name:'Все'},{id:'food',name:'Еда'},{id:'wellness',name:'Спа и отдых'},{id:'family',name:'Для детей'},{id:'pets',name:'С питомцем'},{id:'other',name:'Другие'}].filter(theme=>theme.id==='all'||i.some(id=>category(id)===theme.id));
  const visible=i.filter(id=>topic==='all'||category(id)===topic);
  g.useEffect(()=>{d.current?.scrollTo({left:0});v();},[topic]);
  g.useEffect(()=>{if(topic!=="all"&&!i.some(id=>category(id)===topic))setTopic("all");},[i.join(","),topic]);
  const I = (r) => {`);
 replace('e.jsx("div", { ref: d, onScroll: v', 'e.jsx("div",{className:"keys-results-filters keys-pay-service-filters",role:"group","aria-label":"Темы услуг",children:themes.map(theme=>e.jsx("button",{type:"button","aria-pressed":topic===theme.id,onClick:()=>setTopic(theme.id),children:theme.name},theme.id))}), e.jsx("div", { ref: d, onScroll: v');
 replace('children: i.map((r) => {','children: visible.map((r) => {');
 const start=js.indexOf('function ae('),end=js.indexOf('function ne(',start);
 if(start<0||end<0)throw Error('Points control missing');
 js=js.slice(0,start)+'function ae({draft:s}){return e.jsx(KeysPaymentPoints,{draft:s});}\n'+js.slice(end);
 return 'import {KeysPaymentPoints} from "./index-C4VobzN0.js";\n'+js;
}
export function adaptDesktopCheckout(source){
 const old='e.jsx(Mn,{className:"mb-0 "+ic,value:t.paymentMethod,onChange:l=>a({type:"RESERVATION_METHOD",method:l})})';
 if(!source.includes(old))throw Error('Desktop checkout methods missing');
 return 'import {KeysPaymentOptions} from "./index-C4VobzN0.js";\n'+source.replace(old,'e.jsx(KeysPaymentOptions,{})').replace('disabled:!Fn(s.contact),onClick:()=>a({type:"RESERVATION_PAY"','disabled:!Fn(s.contact)||!s.paymentMethod||s.paymentMethod==="card"&&!s.cardReady,onClick:()=>a({type:"RESERVATION_PAY"');
}
