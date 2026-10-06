// Adapt the imported Find screen without changing the original Arbana snapshot.
export function adaptFind(source, recentComponent, resultsComponent) {
 let js=source;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Find anchor missing: '+a.slice(0,100));js=js.replace(a,b);};
 replace('pet: false, business: false }), Bt =', 'pet: false, business: false, car: false }), Bt =');
 replace('n.jsx(DN, { label: "Командировка", hint: "Подготовим документы для компании", value: e.business, onChange: (r) => t({ ...e, business: r }) })', 'n.jsx(DN, { label: "Командировка", hint: "Подготовим документы для компании", value: e.business, onChange: (r) => t({ ...e, business: r }) }), n.jsx(DN, { label: "На машине", hint: "Планирую приехать на автомобиле", value: !!e.car, onChange: (r) => t({ ...e, car: r }) })');
 // Backwards-compatible history records keep every selected search setting.
 replace('pet: t.pet === true, business: t.business === true', 'pet: t.pet === true, business: t.business === true, car: t.car === true');
 replace('party: r, at: t.at }]', 'party: r, filters: Array.isArray(t.filters) ? t.filters.filter(v => typeof v === "string") : [], sort: t.sort ?? "recommended", recommendedHotelIds: Array.isArray(t.recommendedHotelIds) ? t.recommendedHotelIds.filter(v => typeof v === "string") : [], at: t.at }]');
 replace('e.business === t.business && e.childrenAges.join()', 'e.business === t.business && !!e.car === !!t.car && e.childrenAges.join()');
 replace('YB(e.party, t.party);', 'YB(e.party, t.party) && JSON.stringify([...(e.filters ?? [])].sort()) === JSON.stringify([...(t.filters ?? [])].sort()) && (e.sort ?? "recommended") === (t.sort ?? "recommended") && JSON.stringify([...(e.recommendedHotelIds ?? [])].sort()) === JSON.stringify([...(t.recommendedHotelIds ?? [])].sort());');
 replace('pet: t.party.pet, business: t.party.business }, at: a', 'pet: t.party.pet, business: t.party.business, car: !!t.party.car }, filters: [...(t.filters ?? [])], sort: t.sort ?? "recommended", recommendedHotelIds: [...(t.recommendedHotelIds ?? [])], at: a');
 replace('JSON.stringify({ city: l.trim(), arrival: c, departure: u, party: m })', 'JSON.stringify({ city: l.trim(), arrival: c, departure: u, party: m, filters: e.search.filters, sort: e.search.sort, recommendedHotelIds: e.search.recommendedHotelIds })');
 const start=js.indexOf('function B4() {'),end=js.indexOf('function XN(',start);
 if(start<0||end<0)throw Error('Recent component missing');
 js=js.slice(0,start)+recentComponent+'\n'+js.slice(end);
 const skeleton=js.indexOf('function nF() {'),skeletonEnd=js.indexOf('function aF()',skeleton);
 if(skeleton<0||skeletonEnd<0)throw Error('Find skeleton missing');
 js=js.slice(0,skeleton)+'function nF() { return n.jsxs(n.Fragment, { children: [n.jsx(B4, {})] }); }\n'+js.slice(skeletonEnd);
 replace('n.jsx(B4, {}), n.jsx(UB, {}), n.jsx(WU, {})', 'n.jsx(B4, {})');
 replace(', n.jsx(Ue, { icon: "users", title: "Друзья советуют", description: l ? be : "Отзывы своих и общие подборки", onClick: l ? void 0 : () => a({ type: "friends" }) })', '');
 replace(', n.jsx(Ue, { icon: "heart", title: "Сохранённые", description: h ? "В коллекции: " + h : "Отели, к которым хочется вернуться", onClick: () => a({ type: "saved" }) })', '');
 if(resultsComponent){
  replace('return e.sort === "price" ? c.sort((u, m) => Yn(u, e, t) - Yn(m, e, t)) : c;', 'return keysSortHotels(keysFilterDistrict(c, e), e, t);');
  replace('}, C = f ? Zc(f).reviews.length : null, A = Zw(x.id);', '}, C = f ? Zc(f).reviews.length : null, A = Zw(x.id);\n  if (r.navigation.screen?.type === "saved" || !r.navigation.screen && (r.navigation.tab === "favorites" || r.navigation.tab === "find" && r.search.results)) return n.jsx(KeysResultsHotelCard, {hotel:x, local:f, summary:g, price:y, offer:v, onOpen:S, impressionRef:h?m.ref:void 0});');
  // District is part of the same filter draft and reset/apply flow.
  replace('n.jsx(ru, { variant: "pill", label: "Сортировка", value: c, options: pV, onChange: u })', 'n.jsxs("label", {className:"keys-district-field",children:["Сортировка",n.jsx(St, {"aria-label":"Сортировка",value:c,options:keysSearchSortOptions,onChange:u})]}), n.jsx(KeysDistrictFilter, {search:e.search,filters:r,onChange:l})');
  replace('sort: c === "price" ? "price" : void 0', 'sort: c');
  const start=js.indexOf('function FU() {'),end=js.indexOf('\nfunction ',start+1);
  if(start<0||end<0)throw Error('Find result header missing');
  js=js.slice(0,start)+resultsComponent+'\n'+js.slice(end);
 }
 return js;
}
