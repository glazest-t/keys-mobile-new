export function adaptAdditionalGuest(source,component){
 let js=source;
 const replace=(from,to)=>{if(!js.includes(from))throw Error('Additional guest anchor missing: '+from.slice(0,70));js=js.replace(from,to);};
 replace('function CG(',component+'\nfunction CG(');
 const start=js.indexOf('if(paymentSummary&&c&&!g)'),end=js.indexOf('  return c && !g ?',start);
 if(start<0||end<0)throw Error('Payment contact summary missing');
 const branch="if(paymentSummary)return n.jsx(KeysPaymentGuestPanel,{contact:e,onChange:r,edited:t,onReset:l});\n";
 js=js.slice(0,start)+branch+js.slice(end);
 replace('function Pt(e, t) {','function Pt(e, t) {\n  if(t.type === "KEYS_LOGIN_CONTACT") return {...e,profile:{firstName:String(t.contact.firstName||""),phone:String(t.contact.phone||""),lastName:"",email:""},reservation:null,keysProfileSaved:0};\n  if(t.type === "KEYS_CHECKOUT_SAVE_CONTACT") return keysSetSaveContact(e,t);\n  if(t.type === "KEYS_RESERVATION_GUEST_PATCH") return keysPatchAdditionalGuest(e,t);\n  if(t.type === "KEYS_CHECKOUT_PROFILE_SAVE") return keysSaveCheckoutProfile(e,t);\n  if(t.type === "KEYS_RESERVATION_GUEST") return keysSaveAdditionalGuest(e,t);');
 replace('contact: { ...a.contact }, tariff:','contact: { ...a.contact }, additionalGuests: keysHasAdditionalGuest(a.party) ? (a.additionalGuests||[]).slice(0,1) : [], tariff:');
 const badge=', n.jsx("span", { className: "pointer-events-none absolute top-3 left-3 rounded-8 bg-photo-chip/92 px-[9px] py-[5px] text-11 font-medium text-ink", children: l ?? (t === null ? be : t + " м²") })';
 replace(badge,'');
 return js;
}
