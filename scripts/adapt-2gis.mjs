export function adapt2gis(source){
 const replace=(from,to)=>{if(!source.includes(from))throw new Error('2GIS integration anchor missing: '+from);source=source.replace(from,to);};
 replace('return Promise.resolve(window.PoraLocalMap);','return globalThis.KeysMaps?.enabled() ? globalThis.KeysMaps.load().then(() => globalThis.KeysMaps.hotelAdapter) : Promise.resolve(window.PoraLocalMap);');
 replace('function FV(e, t) {','function FV(e, t) {\n  if(e.project) return e.project(t);');
 replace('function NE(e, t, a) {','function NE(e, t, a) {\n  if(e.fit) return e.fit(t,a);');
 replace('function zX(e, t, a) {','function zX(e, t, a) {\n  if(e.ensureVisible) return e.ensureVisible(t,a);');
 replace('new v.YMapListener({ onStateChanged:', 'new v.YMapListener({ onError: () => { if(!g) u(true); }, onStateChanged:');
 replace('"Яндекс Карты выключены"','"Карта недоступна"');
 source=source.replace(/`Яндекс не отдал карту:[^`]+`/, '"Проверьте подключение к интернету. Отели по-прежнему доступны в списке."').replace(/`Бесплатный лимит[^`]+`/, '"Отели по-прежнему доступны в списке."');
 return source;
}

// The prototype's local API intercepts fetch. Let only the map provider reach the network.
export function adapt2gisRuntime(source){
 const anchor='  globalThis.fetch=async (input,options={})=>{';
 if(!source.includes(anchor))throw new Error('2GIS runtime fetch anchor missing');
 return source.replace(anchor, `  const keysMapFetch=globalThis.fetch.bind(globalThis);
  globalThis.fetch=async (input,options={})=>{
    const mapURL=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,globalThis.location.href);
    if(mapURL.protocol==='https:' && /(^|\\.)2gis\\.(com|ru)$/.test(mapURL.hostname))return keysMapFetch(input,options);`);
}
