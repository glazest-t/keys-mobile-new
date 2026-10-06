export function adaptHotelDetails(source,components){
 const start=source.indexOf('function TY('),end=source.indexOf('function kY(',start);
 if(start<0||end<0)throw Error('Hotel overview components missing');
 let js=source.slice(0,start)+components+'\n'+source.slice(end);
 // Reviews keep their rating, sorting and list; the summary is shared with the hotel card.
 const reviewsStart=js.indexOf('function lk('),reviewsEnd=js.indexOf('function gY(',reviewsStart);
 if(reviewsStart<0||reviewsEnd<0)throw Error('Hotel reviews page missing');
 let reviews=js.slice(reviewsStart,reviewsEnd);
 const replaceReview=(from,to)=>{if(!reviews.includes(from))throw Error('Hotel reviews pattern missing: '+from.slice(0,80));reviews=reviews.replace(from,to);};
 replaceReview('n.jsx(sO, { hotelId: e.id }), ','');
 const summaryStart=reviews.indexOf('n.jsxs("section", { className: "grid gap-4 rounded-card bg-surface p-4", "aria-label": "Оценка гостей"');
 const summaryEnd=reviews.indexOf('n.jsxs("div", { className: "mt-[18px] mb-3',summaryStart);
 if(summaryStart<0||summaryEnd<0)throw Error('Hotel reviews summary missing');
 reviews=reviews.slice(0,summaryStart)+'n.jsx(TY, {hotel:e,showAll:false}), '+reviews.slice(summaryEnd);
 replaceReview('n.jsxs("p", { className: "mb-5 text-13 text-muted", children: [r.name, " · ", r.city] }), ','');
 replaceReview('n.jsxs("p", { className: "mb-5 text-13 text-muted", children: [r?.name ?? be, " · ", r?.city ?? be] }), ','');
 const friendsStart=reviews.indexOf('n.jsxs("section", { "aria-label": "Отзывы друзей"');
 const friendsEnd=reviews.indexOf('n.jsxs("section", { className: "grid gap-4',friendsStart);
 if(friendsStart<0||friendsEnd<0)throw Error('Reviews friends block missing');
 reviews=reviews.slice(0,friendsStart)+reviews.slice(friendsEnd);
 js=js.slice(0,reviewsStart)+reviews+js.slice(reviewsEnd);
 // Keep the original viewer's swipe, keyboard, close and active-photo behavior.
 const viewerStart=js.indexOf('function Si('),viewerEnd=js.indexOf('function zx(',viewerStart);
 if(viewerStart<0||viewerEnd<0)throw Error('Hotel photo viewer missing');
 let viewer=js.slice(viewerStart,viewerEnd);
 const replaceViewer=(from,to)=>{if(!viewer.includes(from))throw Error('Hotel photo viewer pattern missing: '+from.slice(0,60));viewer=viewer.replace(from,to);};
 replaceViewer('onPhotoView: l })','onPhotoView: l, keysHotelLayout = false })');
 replaceViewer('className: "hotel-photo-dialog motion-gallery', 'className: (keysHotelLayout ? "keys-hotel-photo-expanded " : "") + "hotel-photo-dialog motion-gallery');
 replaceViewer('ref: u, className: "no-scrollbar', 'ref: u, className: (keysHotelLayout ? "keys-photo-featured " : "") + "no-scrollbar');
 replaceViewer('className: "px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"', 'className: (keysHotelLayout ? "keys-photo-details " : "") + "px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"');
 replaceViewer('className: "grid max-h-[132px] grid-cols-6 gap-1.5 overflow-y-auto"', 'className: (keysHotelLayout ? "keys-photo-thumbnails " : "") + "grid max-h-[132px] grid-cols-6 gap-1.5 overflow-y-auto"');
 replaceViewer('children: n.jsx(Gl, { src: A.src, alt: "", variant: "thumbnail", sizes: "64px", loading: "lazy", className: "h-full w-full object-cover" })', 'children: n.jsxs(n.Fragment, {children:[n.jsx(Gl, { src: A.src, alt: "", variant: "thumbnail", sizes: keysHotelLayout ? "180px" : "64px", loading: "lazy", className: "h-full w-full object-cover" }),keysHotelLayout&&n.jsx("span",{className:"keys-photo-thumb-caption",children:A.alt})]})');
 js=js.slice(0,viewerStart)+viewer+js.slice(viewerEnd);

 const mapRoute='return n.jsx(JV, { hotelId: e.hotelId, booked: e.booked }, e.hotelId ?? "all");';
 if(!js.includes(mapRoute))throw Error('Hotel map route missing');
 js=js.replace(mapRoute,'return e.selectedOnly ? n.jsx(KeysHotelLocationMap, {hotelId:e.hotelId}, e.hotelId) : '+mapRoute.slice(7));
 const hotel=js.indexOf('function mV() {'),next=js.indexOf('const Nk =',hotel);
 if(hotel<0||next<0)throw Error('Hotel page component missing');
 return js.slice(0,hotel)+'function mV() { return n.jsx(KeysHotelPage, {}); }\n'+js.slice(next);
}
