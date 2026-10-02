import {adapt2gis,adapt2gisRuntime} from './adapt-2gis.mjs';
import {adaptLightTheme} from './adapt-light-theme.mjs';
import {adaptFindCollections} from './adapt-find-collections.mjs';
import {adaptSelectionStyle} from './adapt-selection-style.mjs';
import {adaptFindSearch} from './adapt-find-search.mjs';
import {adaptHotelShare} from './adapt-hotel-share.mjs';
import {adaptAdditionalGuest} from './adapt-additional-guest.mjs';
import {adaptPayment,adaptPaymentSummaries,adaptPaymentContact,adaptReservationSuccess} from './adapt-payment.mjs';
import {adaptHotelDetails} from './adapt-hotel-details.mjs';
import {adaptResultMap} from './adapt-result-map.mjs';
import {adaptFind} from './adapt-find.mjs';
import {adaptTripShare} from "./adapt-trip-share.mjs";
import {styleCheckin} from './style-checkin.mjs';
import {adaptCheckin} from './adapt-checkin.mjs';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {build,transform} from 'esbuild';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
export async function buildSections(){
 const vendor=path.join(root,'vendor/arbana'),stage=path.join(vendor,'.build');
 execFileSync(process.execPath,[path.join(vendor,'scripts/build.mjs')],{stdio:'pipe'});
 let js=(await transform(await readFile(path.join(stage,'assets/index-C4VobzN0.js'),'utf8'),{minify:false,charset:'utf8'})).code;
 const paymentPath=path.join(stage,'assets/ReservationProcessing-DLNoz2B4.js');
 await writeFile(paymentPath,adaptPaymentSummaries(await adaptPayment(await readFile(paymentPath,'utf8')),await readFile(path.join(root,'src/sections/payment-booking-summary.js'),'utf8')));
 js=adaptLightTheme(js);
 js=adapt2gis(js);
 js=adaptPaymentContact(js);
 js=adaptAdditionalGuest(js,await readFile(path.join(root,'src/sections/additional-guest.js'),'utf8'));
 const successPath=path.join(stage,'assets/ReservationSuccessCard-uN5FuBj0.js');
 await writeFile(successPath,await adaptReservationSuccess(await readFile(successPath,'utf8')));
 const mapPath=path.join(stage,'assets/HotelMapCanvas-BsuxVUsR.js');
 await writeFile(mapPath,await adaptResultMap(await readFile(mapPath,'utf8')));
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Arbana integration anchor missing: '+a.slice(0,100));js=js.replace(a,b);};
 replace('const Gv = typeof window < "u" && true','const Gv = false'); // Host owns browser history; reducer keeps screen history.
 replace('function Pt(e, t) {','function Pt(e, t) {\n  if(t.type === "KEYS_CHANGE_START") return keysChangeInitial(e,t.booking);');
 replace('FE = (e, t, a = 0) => Math.round(Rg(e, a) * BE(t))','FE = (e, t, a = 0) => e.keysNightly ?? Math.round(Rg(e, a) * BE(t))');
 replace('function CH({ compact: e = false }) {','function OriginalArbanaHeader({ compact: e = false }) {');
 replace('function EV() {','function OriginalArbanaNotifications() {');
 replace('function AH() {','function OriginalArbanaNav() {');
 replace('function PH({ children: e }) {','function OriginalArbanaLayout({ children: e }) {');
 replace('f ? G0(c.current, e) : b8(e, null, Date.now())','G0(c.current, e)');
 replace('n.jsx(yH, {})','null'); // Original demo scenario toolbar, outside application sections.
 replace('const k = c(T);','if (keysRouteToHost(T)) return;\n    const k = c(T);');
 replace('function F_(e, t) {','function F_(e, t) {\n  if(t.hotelId === "maidens") return keysMaidensAnswer(e,t);');
 replace('{ id: "bonuses", label: "Бонусы", icon: "gift" }','{ id: "bonuses", label: "Выгоды", icon: "gift" }');
 const mount='GC.createRoot(document.getElementById("root")).render(n.jsx(HC.StrictMode, { children: n.jsx(TX, {}) }));';
 replace(mount,'GC.createRoot(document.getElementById("root")).render(n.jsx(TX, {initialState:keysInitialState(),platform:"mobile"}));');
 // Shared semantic hooks let the host apply the same control geometry in the iframe.
 replace('n.jsxs("div", { ref: c, "aria-label": l, className: F("relative", r === "line"',
  'n.jsxs("div", { ref: c, "data-keys-tabs": r, "aria-label": l, className: F("relative", r === "line"');
 replace('return n.jsxs("button", { type: l, className: F("inline-flex items-center gap-2 transition-colors disabled:opacity-45",',
  'return n.jsxs("button", { "data-keys-button": e, type: l, className: F("inline-flex items-center gap-2 transition-colors disabled:opacity-45",');
 replace('const f = F("flex min-h-[65px] w-full items-center gap-3 border-b border-line py-[11px] text-left",',
  'const f = F("keys-ui-row flex min-h-[65px] w-full items-center gap-3 border-b border-line py-[11px] text-left",');
 // Keep the review focused on the new terms; secondary action is a back step.
 const reviewStart=js.indexOf('function Iq({ quote: e }) {');
 const breakdownStart=js.indexOf('n.jsxs("details", { className: "mb-6 text-12"',reviewStart);
 const breakdownEnd=js.indexOf('n.jsx(H, { onClick: m > 0',breakdownStart);
 if(reviewStart<0||breakdownStart<0||breakdownEnd<0)throw Error('Booking review anchors missing');
 js=js.slice(0,breakdownStart)+js.slice(breakdownEnd);
 replace('n.jsx(H, { variant: "text", className: "mt-2", onClick: f, children: "Изменить даты или гостей" })',
  'n.jsxs("button", { type: "button", className: "keys-change-back", onClick: f, children: [n.jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: n.jsx("path", { d: "M19 12H5m7-7-7 7 7 7" }) }), "Вернуться к изменениям"] })');
 js=adaptFind(adaptTripShare(styleCheckin(adaptCheckin(js))), await readFile(path.join(root,'src/sections/find-recents.js'),'utf8'), await readFile(path.join(root,'src/sections/find-results.js'),'utf8'));
 js=adaptFindCollections(js);
 js=adaptFindSearch(js,await readFile(path.join(root,'src/sections/find-search.js'),'utf8'));
 js=adaptSelectionStyle(js,await readFile(path.join(root,'src/sections/selection-welcome.js'),'utf8'));
 js=adaptHotelDetails(js,await readFile(path.join(root,'src/sections/hotel-details.js'),'utf8'));
 js=adaptHotelShare(js,await readFile(path.join(root,'src/sections/hotel-share.js'),'utf8'));
 js+='\n'+await readFile(path.join(root,'src/sections/runtime-adapter.js'),'utf8');
 await writeFile(path.join(stage,'assets/index-C4VobzN0.js'),js);
 let runtime=adapt2gisRuntime(await readFile(path.join(stage,'runtime.js'),'utf8'));
 runtime=runtime.replace("const key = 'pora-static-data-v1';","const key = new URLSearchParams(location.search).has('keysBookingChange') ? 'keys-arbana-booking-change-v1' : 'keys-arbana-sections-v1';");
 runtime=runtime.replace("if(p==='notifications')return {items:a.notifications,unread:a.notifications.filter(n=>!n.readAt).length,nextCursor:null};", "if(p==='notifications'){const items=keysEnsureStayFeedbackNotification(a,save,globalThis.PoraDemo.keysStayDay??'day-2');return {items,unread:items.filter(n=>!n.readAt).length,nextCursor:null};}");
 runtime=runtime.replace("a.notifications.forEach(n=>{if(id==='read'||n.id===id)", "keysEnsureStayFeedbackNotification(a,save,globalThis.PoraDemo.keysStayDay??'day-2').forEach(n=>{if(id==='read'||n.id===id)");
 runtime += '\n'+(await readFile(path.join(root,'src/sections/notification-seed.js'),'utf8')).replace('export function','function');
 runtime += `\nglobalThis.PoraDemo.keysStayDay=new URLSearchParams(location.search).get('stayDay')||'day-2';\n(() => { const api=globalThis.PoraDemo.api; const auth=api('/api/v1/auth/bootstrap'); if(!auth.user){const challenge=api('/api/v1/auth/demo/request-code','POST',{personaId:'anya'}); api('/api/v1/auth/demo/verify-code','POST',{challengeId:challenge.challengeId,code:'123456'});} api('/api/v1/auth/me','PATCH',{firstName:'Татьяна',lastName:'Глазырина',avatar:null}); })();\n`;
 // The demo identity is Tatyana; other personas remain available for shared collections.
 runtime=runtime.replace('"firstName":"Аня","lastName":"Соколова"','"firstName":"Татьяна","lastName":"Глазырина"');
 await writeFile(path.join(stage,'keys-runtime.js'),runtime);
 await writeFile(path.join(stage,'keys-entry.js'),'import \"./keys-runtime.js\";\nimport \"../src/local-map.js\";\nimport \"./assets/index-C4VobzN0.js\";');
 const dist=path.join(root,'dist/sections');await mkdir(dist,{recursive:true});
 await cp(path.join(vendor,'dist'),dist,{recursive:true});
 await build({entryPoints:[path.join(stage,'keys-entry.js')],outfile:path.join(dist,'assets/app.js'),bundle:true,format:'iife',target:'es2022',minify:true,legalComments:'eof'});
 let html=await readFile(path.join(dist,'index.html'),'utf8');
 html=html.replace('<html lang="ru">','<html lang="ru" data-theme="light">');
 html=html.replace('<head>','<head><meta name="color-scheme" content="light only">');
 html=html.replace('./assets/app.js','./assets/app.js?v=checkin-style-1');
 html=html.replace('<head>','<head><script src="../maps/config.js"></script><script src="../maps/2gis.js"></script>');
 html=html.replace("script-src 'self'","script-src 'self' https://mapgl.2gis.com").replace("connect-src 'none'","connect-src 'self' https://*.2gis.com https://*.2gis.ru").replace("img-src 'self' data: blob:","img-src 'self' data: blob: https://*.2gis.com https://*.2gis.ru");
 html=html.replace('</head>','<link rel="stylesheet" href="./frame.css?v=checkin-style-1"><link rel="stylesheet" href="../arbana/app-header.css?v=secondary-titles-1"><script src="../arbana/app-header.js?v=header-lines-1"></script><link rel="stylesheet" href="../arbana/app-nav.css?v=arbana-motion-2"><script src="../arbana/app-nav.js?v=arbana-motion-2"></script><link rel="stylesheet" href="../arbana/ui-standards.css"></head>');
 await writeFile(path.join(dist,'index.html'),html);
 await cp(path.join(root,'src/sections/collections'),path.join(dist,'collections'),{recursive:true});
 await cp(path.join(root,'src/sections/frame.css'),path.join(dist,'frame.css'));
 await cp(path.join(root,'src/sections/host.js'),path.join(dist,'host.js'));
 await cp(path.join(root,'src/sections/host.css'),path.join(dist,'host.css'));
 await cp(path.join(root,'src/sections/profile-avatar.jpg'),path.join(dist,'profile-avatar.jpg'));
 await writeFile(path.join(dist,'images/maidens.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#edf2ff"/><text x="200" y="155" text-anchor="middle" font-family="Georgia" font-size="80" fill="#2c5deb">M</text><text x="200" y="208" text-anchor="middle" font-family="Arial" font-size="22" fill="#2c5deb">MAIDENS HOTEL</text></svg>');
 // Test exports use the actual integrated source, with the mount removed.
 let engine=js.replace('GC.createRoot(document.getElementById("root")).render(n.jsx(TX, {initialState:keysInitialState(),platform:"mobile"}));','');
 engine+='\nexport {keysInitialState,keysMaidensAnswer,keysRouteToHost,Pt as reducer,Xg as initial,_n as hotels,Ie as hotel,VB as recordSearch,GB as recordHotel,Lx as recentHistory,qB as parseRecent,keysRepeatSearch};';
 await writeFile(path.join(stage,'assets/keys-engine.js'),engine);
 await mkdir(path.join(root,'tmp'),{recursive:true});
 await build({entryPoints:[path.join(stage,'assets/keys-engine.js')],outfile:path.join(root,'tmp/sections-engine.cjs'),bundle:true,platform:'node',format:'cjs',target:'node22',logLevel:'silent'});
}
