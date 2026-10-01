import {transform} from 'esbuild';

export async function adaptPayment(source){
 let js=(await transform(source,{charset:'utf8',minify:false})).code;
 const replace=(from,to)=>{if(!js.includes(from))throw Error('Payment style anchor missing: '+from.slice(0,80));js=js.replace(from,to);};
 replace('e.jsx("span", { className: "ml-auto text-12 text-muted", children: "по желанию" }), ','');
 replace(', e.jsx("p", { className: "mt-2.5 text-11 text-muted", children: "Будет готово к приезду. Можно добавить и позже, уже из поездки." })','');
 replace('x("mb-6 flex items-start gap-3 rounded-card bg-surface p-3.5", t)','x("keys-payment-booking mb-6 flex items-start gap-3 rounded-card bg-surface p-3.5", t)');
 replace('x("mb-6", a)','x("keys-payment-extras mb-6", a)');
 replace('className: "hidden gap-1.5 self-center [@media(pointer:fine)]:flex"','className: "ml-auto hidden gap-1.5 self-center [@media(pointer:fine)]:flex"');
 replace('x("my-5 flex flex-col gap-1 rounded-card bg-surface px-4 pt-3.5 pb-4", t)','x("keys-payment-total my-5 flex flex-col gap-1 rounded-card bg-surface px-4 pt-3.5 pb-4", t)');
 replace('className: "text-14 font-medium", children: "Когда в день заезда, "','className: "keys-payment-service-title text-14 font-medium", children: "Когда в день заезда, "');
 replace('Баллы Пора','Баллы Ключей');
 return js;
}

export function adaptPaymentSummaries(source,bookingComponent){
 const start=source.indexOf('function Z('),end=source.indexOf('function Q(',start);
 if(start<0||end<0)throw Error('Payment booking summary not found');
 return (source.slice(0,start)+bookingComponent+'\n'+source.slice(end)).replace('compact: s, wide: t, className: a','compact: s, paymentSummary: true, wide: t, className: a');
}

export function adaptPaymentContact(source){
 const signature='function CG({ contact: e, edited: t, fromProfile: a, onChange: r, onReset: l, compact: c = false, wide: u = false, className: m }) {';
 if(!source.includes(signature))throw Error('Contact summary signature missing');
 let js=source.replace(signature,signature.replace('className: m','className: m, paymentSummary = false'));
 const start=js.indexOf('function CG('),anchor=js.indexOf('  return c && !g ?',start);
 if(anchor<0)throw Error('Contact summary branch missing');
 const branch=`  if(paymentSummary&&c&&!g)return n.jsxs('section',{'aria-label':'Контакты гостя',className:F('keys-payment-summary keys-payment-guest-summary',m),children:[
 n.jsxs('div',{className:'keys-payment-summary-heading',children:[n.jsx(D,{name:'users',className:'keys-payment-summary-icon'}),n.jsx('h2',{children:'Гость'})]}),
 n.jsxs('div',{className:'keys-payment-summary-body',children:[n.jsx('strong',{children:Ac(e)}),n.jsx('p',{children:e.phone}),n.jsx('p',{children:e.email})]}),
 n.jsxs('button',{type:'button',className:'keys-payment-summary-action',onClick:()=>f(true),children:['Изменить данные',n.jsx(D,{name:'chevron',className:'size-3.5'})]})
 ]});\n`;
 return js.slice(0,anchor)+branch+js.slice(anchor);
}

export async function adaptReservationSuccess(source){
 const js=(await transform(source,{charset:'utf8',minify:false})).code;
 const link=', e.jsx(n, { variant: "text", className: "mt-2", onClick: () => a({ type: "booking" }), children: "Открыть бронь" })';
 if(!js.includes(link))throw Error('Success booking link missing');
 return js.replace(link,'');
}
