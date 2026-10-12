// The demo tier is explicit state, never inferred from a global price or CSS class.
export function adaptGoldLoyalty(source,components){
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Gold loyalty anchor missing: '+a);js=js.replace(a,b);};
 replace('hm = qc.tariffs.concat([','hm = qc.tariffs.concat([{id:"loyalty-gold",name:"Для уровня Gold",multiplier:0.8,includesBreakfast:true,refundable:false,freeCancellationDays:0,penaltyNights:0,changesAllowed:true,requiresPrepayment:false,loyaltyTier:"Gold"},');
 replace('_g = (e) => hm.filter(t => (!t.hotelId || t.hotelId === e) && (Ie(e).freeCancellation || !t.refundable))','_g = (e, tier) => hm.filter(t => (!t.loyaltyTier || t.loyaltyTier === tier) && (!t.hotelId || t.hotelId === e) && (Ie(e).freeCancellation || !t.refundable)).sort((a,b)=>Number(b.loyaltyTier === "Gold")-Number(a.loyaltyTier === "Gold"))');
 replace('tariffId: _g(t)[0].id','keysLoyaltyTier:e.keysLoyaltyTier, tariffId: _g(t,e.keysLoyaltyTier)[0].id');
 replace('_g(r.hotelId).some((c) => c.id === t.id)','_g(r.hotelId,e.keysLoyaltyTier).some((c) => c.id === t.id)');
 replace('_g(e.hotelId).map((a) =>','_g(e.hotelId,e.keysLoyaltyTier).map((a) =>');
 replace('function Pt(e, t) {','function Pt(e, t) {\n if(t.type === "KEYS_LOYALTY") return keysSetLoyalty(e,t.tier);');
 // Price filters use the amount displayed to this member, not the open rate.
 const listStart=js.indexOf('function ls('),listEnd=js.indexOf('\nconst ',listStart);
 if(listStart<0||listEnd<0)throw Error('Gold search filter missing');
 const listing=js.slice(listStart,listEnd).replaceAll('qE(u, e, t)','tx(u,e,t).nightly').replaceAll('qE(u,e,t)','tx(u,e,t).nightly').replaceAll('Yn(u, e, t)','tx(u,e,t).total');
 js=js.slice(0,listStart)+listing+js.slice(listEnd);
 // Underlying baseTotal stays undiscounted; Ul applies the selected tariff once.
 replace('function tx(e, t, a = 0) {','function keysStandardHotelPrice(e, t, a = 0) {');
 return js+'\n'+components;
}
