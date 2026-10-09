export function adaptPhotoDiscovery(source,components){
 let js=source.replaceAll("Подбор по фото","Отели свайпом").replaceAll("Свайп вправо — нравится","Листайте отели, сохраняйте любимые.");
 const edit=(name,next,update)=>{const a=js.indexOf('function '+name+'('),b=js.indexOf('function '+next+'(',a);if(a<0||b<0)throw Error('Photo component missing: '+name);js=js.slice(0,a)+update(js.slice(a,b))+js.slice(b);};
 const swap=(s,a,b)=>{if(!s.includes(a))throw Error('Photo anchor missing: '+a.slice(0,80));return s.replace(a,b);};
 edit('MV','PV',s=>swap(s,', n.jsx("button", { onClick: () => a({ type: "shared-create" }), "aria-label": "Выбрать вместе с друзьями", className: "glass-round shrink-0 transition-colors hover:bg-on-photo/25", children: n.jsx(D, { name: "users", className: "size-5" }) })',''));
 edit('Ck','bE',s=>{
  s=swap(s,'n.jsx(CV, { hotel: e','n.jsx(KeysPhotoRooms, { hotel: e');
  s=swap(s,'className: "relative min-h-0 flex-1"','className: "keys-discovery-stack relative min-h-0 flex-1"');
  s=s.replace('A = Qw(e).length','A = keysPhotoMedia(e,Qw(e)).length').replace('photos: e.photos, title: e.name','photos: keysPhotoMedia(e), title: e.name, startIndex:f, keysHotelLayout:true');
  s=swap(s,'= wh(Y,','= useKeysPhotoGestures(Y,');
  s=swap(s,'}, !ae);','}, !ae, delta=>g(index=>(index+delta+A)%A));');
  s=swap(s,'return Sk(L), n.jsxs','return n.jsxs');
  const a=s.indexOf('"aria-label": e.name + '),b=s.indexOf('}, ...Ce,',a);
  if(a<0||b<0)throw Error('Photo keyboard controls missing');
  s=s.slice(0,a)+'"aria-label": e.name + ". Влево и вправо — фотографии, вверх — следующий отель", onKeyDown: (event) => {if(event.target!==event.currentTarget||ae||le)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();g(index=>(index+(event.key==="ArrowRight"?1:A-1))%A);}else if(event.key==="ArrowUp"){event.preventDefault();he(false);}' +s.slice(b);
  return swap(s,'cursor-grab touch-pan-y select-none will-change-transform active:cursor-grabbing','keys-photo-gesture-card cursor-grab select-none will-change-transform active:cursor-grabbing');
 });
 edit('bE','IV',s=>{
  s=swap(s,'name: v?.enabled ? "bell-check" : "bell"','name: "price"');
  s=swap(s,'className: "flex shrink-0 items-center gap-1.5 rounded-10 bg-photo-chip/95 px-2.5 py-1.5 text-13 leading-4 font-semibold text-success transition-colors hover:bg-photo-chip"','className: "keys-discovery-reviews"');
  s=swap(s,'className: Gx, children:','className: "keys-discovery-rooms", children:');
  s=s.replace('className: Pl, children:','className: "keys-discovery-tool", children:').replace('className: F(Pl, v?.enabled && "text-brand")','className: F("keys-discovery-tool", v?.enabled && "is-active")');
  s=swap(s,'photos: Qw(e)','photos: keysPhotoMedia(e,Qw(e)), mediaActive:a!==lc&&!r');
  const a=s.indexOf('n.jsxs("div", { className: "mt-2.5 flex flex-wrap'),b=s.indexOf('n.jsxs("div", { className: "mt-3 flex items-center',a);
  if(a<0||b<0)throw Error('Photo tags missing');
  s=s.slice(0,a)+'n.jsx(KeysPhotoTags,{tags:[...L,...q]}), '+s.slice(b);
  const p=s.indexOf('n.jsxs("div", { className: "min-w-0", children: [n.jsxs("div", { className: "flex items-baseline',a),end=s.indexOf('n.jsxs("button", { disabled: r, onClick: m',p);
  if(p<0||end<0)throw Error('Photo price missing');
  s=s.slice(0,p)+'n.jsxs("div",{className:"keys-discovery-price",children:[n.jsx("strong",{children:Te(C)}),n.jsx("span",{children:"за "+Xe(w)})]}), '+s.slice(end);
  const toolsStart=s.indexOf('n.jsxs("div", { className: "absolute top-[26px] right-3 flex gap-2"'),toolsEnd=s.indexOf('h, n.jsxs("div", { className: Xx',toolsStart);
  if(toolsStart<0||toolsEnd<0)throw Error('Photo card tools missing');
  s=s.slice(0,toolsStart)+s.slice(toolsEnd);
  return swap(s,'onClick: m, className: "keys-discovery-rooms", children: ["Выбрать номер"','onClick: () => x({ type: "HOTEL_OPEN", id: e.id }), className: "keys-discovery-rooms", children: ["К отелю"');
 });
 edit('Bx','Fx',s=>{
  s=swap(s,'numbered: c = false, children: u })','numbered: c = false, children: u, mediaActive = true })');
  s=swap(s,'const [m, h] = E.useState([])', 'const keysProgress=E.useRef(null);\n  const [m, h] = E.useState([])');
  s=swap(s,'e.map((w, T) => m.includes(w.src)', 'e.map((w, T) => w.type === "video" ? (T === x ? n.jsx(KeysPhotoVideo,{media:w,active:mediaActive,onProgress:value=>keysProgress.current?.style.setProperty("--keys-video-progress",String(value))},w.src) : null) : m.includes(w.src)');
  s=swap(s,'role: "tablist", "aria-label": "Кадры отеля"','ref:keysProgress, role: "tablist", "aria-label": "Кадры отеля"');
  s=swap(s,'children: n.jsx("span", { className: F("block h-[3px]', 'children: w.type === "video" ? n.jsx("span",{className:"keys-discovery-progress",children:n.jsx("span",{style:{transform:T===x?"scaleX(var(--keys-video-progress,0))":"scaleX(0)"}})}) : n.jsx("span", { className: F("block h-[3px]');
  return s;
 });
 edit('Si','zx',s=>{
  s=swap(s,'children: n.jsx("img", { src: A.src, onLoad:', 'children: A.type === "video" ? n.jsx(KeysPhotoVideo,{media:A,active:L===h,full:true}) : n.jsx("img", { src: A.src, onLoad:');
  s=swap(s,'n.jsx(Gl, { src: A.src, alt: "", variant: "thumbnail"','n.jsx(Gl, { src: A.poster || A.src, alt: "", variant: "thumbnail"');
  s=s.replace('"Фото " + (L + 1) + ": " + A.alt','(A.type === "video" ? "Видео " : "Фото ") + (L + 1) + ": " + A.alt');
  return s;
 });
 return components+'\n'+js;
}
