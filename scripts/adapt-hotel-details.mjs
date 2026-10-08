export function adaptHotelDetails(source,components){
 const start=source.indexOf('function TY('),end=source.indexOf('function kY(',start);
 if(start<0||end<0)throw Error('Hotel overview components missing');
 let js=source.slice(0,start)+components+'\n'+source.slice(end);
 // Five real demo rates for Swissôtel, shared by room selection, cart and checkout.
 const rateAnchor='hm = qc.tariffs,';
 if(!js.includes(rateAnchor))throw Error('Tariff catalogue missing');
 js=js.replace(rateAnchor,`hm = qc.tariffs.concat([
  {id:"room-only",name:"Без питания",multiplier:0.85,includesBreakfast:false,refundable:false,freeCancellationDays:0,penaltyNights:0,changesAllowed:false,requiresPrepayment:true,hotelId:"more",showDiscount:false},
  {id:"room-flexible",name:"Гибкий без питания",multiplier:0.95,includesBreakfast:false,refundable:true,freeCancellationDays:3,penaltyNights:1,changesAllowed:true,requiresPrepayment:false,hotelId:"more",showDiscount:false},
  {id:"breakfast-arrival",name:"Завтрак без предоплаты",multiplier:1.08,includesBreakfast:true,refundable:true,freeCancellationDays:1,penaltyNights:1,changesAllowed:true,requiresPrepayment:false,hotelId:"more"}
 ]),`);
 const available='_g = (e) => Ie(e).freeCancellation ? hm : hm.filter((t) => !t.refundable)';
 if(!js.includes(available))throw Error('Available tariffs missing');
 js=js.replace(available,'_g = (e) => hm.filter(t => (!t.hotelId || t.hotelId === e) && (Ie(e).freeCancellation || !t.refundable))');
 const breakfast='includesBreakfast: Ie(e).breakfast';
 if(!js.includes(breakfast))throw Error('Tariff meal lookup missing');
 js=js.replace(breakfast,'includesBreakfast: hm.find(a => a.id === t)?.includesBreakfast ?? Ie(e).breakfast');
 js=js.replace('discountLabel: l > 0 ?', 'discountLabel: r.showDiscount !== false && l > 0 ?');
 js=js.replace('return r > 0 && a.push("Скидка "', 'return e.showDiscount !== false && r > 0 && a.push("Скидка "');
 js=js.replace('a.push(yY), a;', 'a.push(e.requiresPrepayment === false ? "Без предоплаты, оплата при заселении" : yY), a;');

 // Keep the selected room, tariff and contact when editing a stay at payment.
 const syncGuard='if (!t || a?.type !== "hotel" || (a.hotelId ?? e.search.hotelId) !== t.hotelId || t.status === "processing" || t.status === "confirmed") return e;';
 if(!js.includes(syncGuard))throw Error('Reservation stay synchronization missing');
 js=js.replace(syncGuard,'if (!t || !["hotel","reservation-payment"].includes(a?.type) || a.type === "hotel" && (a.hotelId ?? e.search.hotelId) !== t.hotelId || t.status === "processing" || t.status === "confirmed" || !ca(e.search.arrival,e.search.departure) || e.search.arrival < e.tripContext.today) return e;');
 const syncPrice='party: c, baseTotal: JE(e, t.hotelId, { arrival: r, departure: l, party: c })';
 if(!js.includes(syncPrice))throw Error('Reservation price synchronization missing');
 js=js.replace(syncPrice,'party: c, extras: t.extras.map(extra => ({...extra,date: extra.date < r || extra.date >= l ? r : extra.date})), baseTotal: JE(e, t.hotelId, { arrival: r, departure: l, party: c })');
 // Reuse the date/guest editor without destination search on the room page.
 const stayStart=js.indexOf('function xh('),stayEnd=js.indexOf('\nfunction ',stayStart+15);
 if(stayStart<0||stayEnd<0)throw Error('Stay editor missing');
 let stayEditor=js.slice(stayStart,stayEnd);
 const changeStay=(from,to)=>{if(!stayEditor.includes(from))throw Error('Stay editor anchor missing: '+from);stayEditor=stayEditor.replace(from,to);};
 changeStay('section: t = "dates" })','section: t = "dates", roomStay = false })');
 changeStay('n.jsx(ph, { today: c, arrival: w, departure: T, months: 6,', 'n.jsx(ph, { startAtArrival: true, today: c, arrival: w, departure: T, months: 6,');
 changeStay('n.jsx(gh, { value: g, onChange: x })', 'n.jsx(gh, { value: g, onChange: x, showPreferences: !roomStay })');
 changeStay('title: "Параметры поиска"','title: roomStay ? "Даты и гости" : "Параметры поиска"');
 changeStay('party: g, results: true','party: g, ...(roomStay ? {} : {results: true})');
 changeStay('n.jsx(f4, { variant: "filled", value: u, onChange: m })','!roomStay && n.jsx(f4, { variant: "filled", value: u, onChange: m })');
 changeStay('disabled: !C || !l && A === 0, children: T ?', 'disabled: !C || !roomStay && !l && A === 0, children: roomStay ? "Применить" : T ?');
 js=js.slice(0,stayStart)+stayEditor+js.slice(stayEnd);
 // Open at the selected arrival month without scrolling the settings out of view.
 const calendarStart=js.indexOf('function ph('),calendarEnd=js.indexOf('const UU =',calendarStart);
 if(calendarStart<0||calendarEnd<0)throw Error('Date calendar missing');
 let calendar=js.slice(calendarStart,calendarEnd);
 const changeCalendar=(from,to)=>{if(!calendar.includes(from))throw Error('Calendar anchor missing: '+from);calendar=calendar.replace(from,to);};
 changeCalendar('weekdaysClassName: c })', 'weekdaysClassName: c, startAtArrival = false })');
 changeCalendar('const u = V6(e, l), m = E.useRef(null);', 'const [firstMonth] = E.useState(() => startAtArrival && t > e ? t : e), u = V6(firstMonth, l), m = E.useRef(null);');
 changeCalendar('let h = true;', 'if(startAtArrival)return; let h = true;');
 changeCalendar('n.jsxs("div", { children:', 'n.jsxs("div", { className: startAtArrival ? "keys-stay-calendar" : undefined, children:');
 js=js.slice(0,calendarStart)+calendar+js.slice(calendarEnd);
 // Both the dedicated page and swipe-card sheet use the shared reviews component.
 const reviewsStart=js.indexOf('function lk('),reviewsEnd=js.indexOf('function mY(',reviewsStart);
 if(reviewsStart<0||reviewsEnd<0)throw Error('Hotel reviews page missing');
 js=js.slice(0,reviewsStart)+'function lk({hotel}){return n.jsx(KeysHotelReviews,{hotel});}\n'+js.slice(reviewsEnd);
 for(const caption of [
  'n.jsxs("p", { className: "mb-5 text-13 text-muted", children: [r.name, " · ", r.city] }), ',
  'n.jsxs("p", { className: "mb-5 text-13 text-muted", children: [r?.name ?? be, " · ", r?.city ?? be] }), '
 ])js=js.replace(caption,'');
 const emptyStart=js.indexOf('function fY('),emptyEnd=js.indexOf('function pY(',emptyStart);
 if(emptyStart<0||emptyEnd<0)throw Error('Empty hotel reviews page missing');
 js=js.slice(0,emptyStart)+'function fY(){return n.jsx("p",{className:"keys-reviews-empty",children:"Отзывов пока нет"});}\n'+js.slice(emptyEnd);
 // Keep the original viewer's swipe, keyboard, close and active-photo behavior.
 const viewerStart=js.indexOf('function Si('),viewerEnd=js.indexOf('function zx(',viewerStart);
 if(viewerStart<0||viewerEnd<0)throw Error('Hotel photo viewer missing');
 let viewer=js.slice(viewerStart,viewerEnd);
 const replaceViewer=(from,to)=>{if(!viewer.includes(from))throw Error('Hotel photo viewer pattern missing: '+from.slice(0,60));viewer=viewer.replace(from,to);};
 replaceViewer('onPhotoView: l })','onPhotoView: l, keysHotelLayout = false, keysRoomGallery = false })');
 replaceViewer('className: "hotel-photo-dialog motion-gallery', 'className: (keysRoomGallery ? "keys-room-photo-dialog " : "") + (keysHotelLayout ? "keys-hotel-photo-expanded " : "") + "hotel-photo-dialog motion-gallery');
 replaceViewer('ref: u, className: "no-scrollbar', 'ref: u, className: (keysRoomGallery ? "keys-room-photo-stage " : "") + (keysHotelLayout ? "keys-photo-featured " : "") + "no-scrollbar');
 replaceViewer('className: "px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"', 'className: (keysRoomGallery ? "keys-room-photo-footer " : "") + (keysHotelLayout ? "keys-photo-details " : "") + "px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"');
 replaceViewer('className: "grid max-h-[132px] grid-cols-6 gap-1.5 overflow-y-auto"', 'className: (keysRoomGallery ? "keys-room-photo-thumbs " : "") + (keysHotelLayout ? "keys-photo-thumbnails " : "") + "grid max-h-[132px] grid-cols-6 gap-1.5 overflow-y-auto"');
 replaceViewer('children: n.jsx(Gl, { src: A.src, alt: "", variant: "thumbnail", sizes: "64px", loading: "lazy", className: "h-full w-full object-cover" })', 'children: n.jsxs(n.Fragment, {children:[n.jsx(Gl, { src: A.src, alt: "", variant: "thumbnail", sizes: keysHotelLayout ? "180px" : "64px", loading: "lazy", className: "h-full w-full object-cover" }),keysHotelLayout&&n.jsx("span",{className:"keys-photo-thumb-caption",children:A.alt})]})');
 viewer=viewer.replace('function Si(', 'function KeysHotelPhotoViewer(');
 viewer='function Si(props){return props.keysHotelLayout ? n.jsx(KeysHotelPhotoAlbum,props) : n.jsx(KeysHotelPhotoViewer,props); }\n'+viewer;
 js=js.slice(0,viewerStart)+viewer+js.slice(viewerEnd);

 const mapRoute='return n.jsx(JV, { hotelId: e.hotelId, booked: e.booked }, e.hotelId ?? "all");';
 if(!js.includes(mapRoute))throw Error('Hotel map route missing');
 js=js.replace(mapRoute,'return e.selectedOnly ? n.jsx(KeysHotelLocationMap, {hotelId:e.hotelId}, e.hotelId) : '+mapRoute.slice(7));
 const hotel=js.indexOf('function mV() {'),next=js.indexOf('const Nk =',hotel);
 if(hotel<0||next<0)throw Error('Hotel page component missing');
 return js.slice(0,hotel)+'function mV() { return n.jsx(KeysHotelPage, {}); }\n'+js.slice(next);
}
