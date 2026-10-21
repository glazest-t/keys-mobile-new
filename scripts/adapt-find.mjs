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
 // Reuse the main search autocomplete for city-only advice, without hotel suggestions.
 {
  const start=js.indexOf('function f4({'),end=js.indexOf('\nconst MU =',start);
  if(start<0||end<0)throw Error('Destination input missing');
  let field=js.slice(start,end);
  const patch=(a,b)=>{if(!field.includes(a))throw Error('Destination anchor missing: '+a);field=field.replace(a,b);};
  patch('onHotelChange: l })','onHotelChange: l, citiesOnly = false, onActivate, caption })');
  patch('n.jsx("input", { ref: x', 'caption && n.jsx("small", {className:"keys-search-city-caption",children:caption}), n.jsx("input", { ref: x');
  patch('].slice(0, 7), C =','].filter(I => !citiesOnly || I.place && I.caption.startsWith("Город")).slice(0, 7), C =');
  patch('onFocus: () => h(true)', 'onFocus: () => { h(!onActivate); onActivate?.(); }, onClick: () => { if(onActivate){h(false);onActivate();} }');
  patch('"aria-label": "Город или отель"','"aria-label": citiesOnly ? "Город" : "Город или отель"');
  patch('placeholder: "Город или название отеля"','placeholder: citiesOnly ? "Введите город" : caption ? "Город или отель" : "Город или название отеля"');
  js=js.slice(0,start)+field+js.slice(end);
 }
 // Native showModal chooses the first button unless focus is explicitly placed on the dialog.
 replace('m.showModal?.(), () => m?.close?.()', 'm.showModal?.(), new URLSearchParams(location.search).has("headerSearch") && m?.focus({preventScroll:true}), () => m?.close?.()');
 // Initial pointer focus belongs to the search dialog, not its close button.
 {
  const start=js.indexOf('function ct('),end=js.indexOf('\nfunction ',start+12);
  if(start<0||end<0)throw Error('Search dialog component missing');
  let dialog=js.slice(start,end);
  const focus='autoFocus: true, type: "button", "aria-label": "Закрыть"';
  if(!dialog.includes(focus)||!dialog.includes('ref: u, "aria-label": e'))throw Error('Search dialog focus anchor missing');
  dialog=dialog.replace('ref: u, "aria-label": e','ref: u, tabIndex: -1, autoFocus: new URLSearchParams(location.search).has("headerSearch"), "aria-label": e');
  dialog=dialog.replace(focus,'autoFocus: !new URLSearchParams(location.search).has("headerSearch"), type: "button", "aria-label": "Закрыть"');
  js=js.slice(0,start)+dialog+js.slice(end);
 }
 // Decorative filter icons stay blue on the plain surface in both checkbox states.
 for(const selected of ['h','v'])replace('className: F("grid size-8 shrink-0 place-items-center rounded-10", '+selected+' ? "bg-brand-solid text-on-brand" : "bg-card text-brand")','className: "keys-filter-option-icon"');
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
  replace('return n.jsxs(n.Fragment, { children: [n.jsx(FU, {}),', 'return n.jsxs(KeysResultsLayout, { children: [n.jsx(FU, {}),');
  replace('fV.map((f) => {', 'fV.map((f,index) => { if(index===0)return n.jsx(KeysNightlyPriceFilter,{filters:r,onChange:l},"nightly-price");');
  replace('if (a && !m.includes(a) || (r?.includes("/ночь") ? qE(u, e, t) : Yn(u, e, t)) > l) return false;', 'if (a && !m.includes(a) || (r?.includes("/ночь") ? qE(u, e, t) : Yn(u, e, t)) > l || !keysNightlyPriceMatches(qE(u,e,t),e.filters)) return false;');
  replace('return e.sort === "price" ? c.sort((u, m) => Yn(u, e, t) - Yn(m, e, t)) : c;', 'return keysSortHotels(keysFilterDistrict(c, e), e, t);');
  replace('}, C = f ? Zc(f).reviews.length : null, A = Zw(x.id);', '}, C = f ? Zc(f).reviews.length : null, A = Zw(x.id);\n  if (r.navigation.screen?.type === "saved" || !r.navigation.screen && (r.navigation.tab === "favorites" || r.navigation.tab === "find" && r.search.results)) return n.jsx(KeysResultsHotelCard, {hotel:x, local:f, summary:g, price:y, offer:v, onOpen:S, impressionRef:h?m.ref:void 0});');
  // District is part of the same filter draft and reset/apply flow.
  replace('n.jsx(ru, { variant: "pill", label: "Сортировка", value: c, options: pV, onChange: u })', 'n.jsxs("label", {className:"keys-district-field",children:["Сортировка",n.jsx(St, {"aria-label":"Сортировка",value:c,options:keysSearchSortOptions,onChange:u})]}), n.jsx(KeysDistrictFilter, {search:e.search,filters:r,onChange:l})');
  replace('sort: c === "price" ? "price" : void 0', 'sort: c');
  const start=js.indexOf('function FU() {'),end=js.indexOf('\nfunction ',start+1);
  if(start<0||end<0)throw Error('Find result header missing');
  js=js.slice(0,start)+resultsComponent+'\n'+js.slice(end);
 }
 // Mark both filter variants for one viewport-bottom primary action pattern.
 for(const name of ['xV','vV']){
  const start=js.indexOf('function '+name+'() {'),end=js.indexOf('\nfunction ',start+1);
  if(start<0||end<0)throw Error('Filter page missing: '+name);
  let part=js.slice(start,end);
  const form='n.jsxs("form", { onSubmit:',footer='className: "sticky bottom-0 z-10 -mx-(--gutter) border-t border-line bg-card px-(--gutter) pt-3 pb-[max(14px,env(safe-area-inset-bottom))]"';
  if(!part.includes(form)||!part.includes(footer))throw Error('Filter action layout missing: '+name);
  part=part.replace(form,'n.jsxs("form", { className: "keys-filter-form", onSubmit:').replace(footer,footer.replace('"sticky','"keys-filter-footer sticky'));
  // The desktop sidebar uses these exact mobile controls with immediate updates.
  part=part.replace('function '+name+'() {','function '+name+'({inline=false}={}) {');
  if(name==='vV'){
   part=part.replace('[r, l] = E.useState(e.search.filters), [c, u] = E.useState(e.search.sort ?? "recommended")', '[draft, setDraft] = E.useState(e.search.filters), [sortDraft, setSortDraft] = E.useState(e.search.sort ?? "recommended"), r=inline?e.search.filters:draft, c=inline?(e.search.sort??"recommended"):sortDraft, l=value=>inline?t({type:"SEARCH_PATCH",patch:{filters:value}}):setDraft(value), u=value=>inline?t({type:"SEARCH_PATCH",patch:{sort:value}}):setSortDraft(value)');
   part=part.replaceAll('=> fE(', '=> inline || fE(');
   part=part.replace('n.jsx(KeysNightlyPriceFilter,{filters:r,onChange:l}', 'n.jsx(KeysNightlyPriceFilter,{filters:r,onChange:l,compact:inline}');
  }else{
   part=part.replace('[r, l] = E.useState(() => Sw(e.search.filters))', '[draft, setDraft] = E.useState(() => Sw(e.search.filters)), r=inline?Sw(e.search.filters):draft, l=value=>inline?t({type:"SEARCH_PATCH",patch:{filters:value}}):setDraft(value)');
  }
  const headerStart=part.indexOf('n.jsx(Ae, { title: "Фильтры"'),headerEnd=part.indexOf('n.jsxs("form",',headerStart);
  if(headerStart<0||headerEnd<0)throw Error('Inline filter header missing');
  const mobileHeader=part.slice(headerStart,headerEnd).replace(/, $/,'');
  const inlineHeader='n.jsxs("header",{className:"keys-filter-sidebar-heading",children:[n.jsx("h2",{children:"Фильтры"}),n.jsx("button",{type:"button",disabled:!r.length&&(!e.search.sort||e.search.sort==="recommended"),onClick:()=>t({type:"SEARCH_PATCH",patch:{filters:[],sort:"recommended"}}),children:"Сбросить"})]})';
  part=part.slice(0,headerStart)+'inline?'+inlineHeader+':'+mobileHeader+', '+part.slice(headerEnd);
  part=part.replace('className: "keys-filter-footer sticky', 'hidden:inline, className: "keys-filter-footer sticky');
  part=part.replace(' }), a();', ' }), !inline&&a();');
  js=js.slice(0,start)+part+js.slice(end);
 }
 return js;
}
