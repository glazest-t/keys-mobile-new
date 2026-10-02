/* Local catalogue and shared list/map state for the current hotel. */
(() => {
 const hotel={name:'Maidens Hotel',lat:55.737954,lng:37.585621,address:'Зубовская площадь, 3, стр. 1'};
 const themes={culture:'Культура',walk:'Прогулки',food:'Кофе и еда'};
 // Travel times are illustrative estimates, not live routing results.
 const places=[
  {id:'museum',summary:'История города и выставки в Провиантских складах.',name:'Музей Москвы',theme:'culture',tag:'Музей · история города',lat:55.7367,lng:37.5933,address:'Зубовский бульвар, 2',walk:10,transit:12,car:5,mode:'walk',visit:'1–2 часа',description:'История Москвы, выставки и двор Провиантских складов. Идея для неспешного знакомства с городом совсем недалеко от отеля.',why:'Вам интересны культура и городские истории',site:'https://mosmuseum.ru/',credit:'Фото: Музей Москвы'},
  {id:'park',summary:'Прогулка у воды, зелёные аллеи и Нескучный сад.',name:'Парк Горького',theme:'walk',tag:'Парк · набережная',lat:55.7314,lng:37.6035,address:'Крымский Вал, 9',walk:22,transit:20,car:12,mode:'walk',visit:'1–2 часа',description:'Прогулка у воды, зелёные аллеи и Нескучный сад. Можно выбрать короткий маршрут или остаться на целый свободный день.',why:'Вы выбираете прогулки и отдых на свежем воздухе',site:'https://parkgorkogo.ru/',credit:'Фото: Парк Горького, Нескучный сад'},
  {id:'market',summary:'Кофе и кухни разных стран под одной крышей.',name:'Усачёвский рынок',theme:'food',tag:'Гастромаркет · кафе',lat:55.7270,lng:37.5725,address:'Улица Усачёва, 26',walk:24,transit:18,car:10,mode:'walk',visit:'45–90 минут',description:'Кофе, продукты и кухни разных стран в одном месте. Подойдёт для обеда без долгого планирования и новых гастрономических впечатлений.',why:'Вы отметили кафе и гастрономию',site:'https://usch.ru/',credit:'Фото: Усачёвский рынок'},
  {id:'theatre',summary:'Опера и балет в историческом здании театра.',name:'Большой театр',theme:'culture',tag:'Театр · архитектура',lat:55.7602,lng:37.6187,address:'Театральная площадь, 1',walk:55,transit:25,car:20,mode:'transit',visit:'2–3 часа на спектакль',description:'Опера и балет в историческом театре. Для посещения спектакля выберите постановку и заранее проверьте билеты на официальном сайте.',why:'Вам интересны театр и культурные события',site:'https://bolshoi.ru/',credit:'Фото: Wikimedia Commons',photoSource:'https://commons.wikimedia.org/wiki/File:Moscow-Bolshoi-Theare-1.jpg'},
  {id:'zaryadye',summary:'Городские пейзажи и виды с Парящего моста.',name:'Парк «Зарядье»',theme:'walk',tag:'Парк · виды на город',lat:55.7510,lng:37.6287,address:'Улица Варварка, 6',walk:48,transit:30,car:20,mode:'transit',visit:'1–2 часа',description:'Городские пейзажи, ландшафтные зоны и прогулка к Парящему мосту. Хороший повод посмотреть на центр Москвы с другого ракурса.',why:'Вы выбираете прогулки и городские виды',site:'https://www.zaryadyepark.ru/',credit:'Фото: Wikimedia Commons',photoSource:'https://commons.wikimedia.org/wiki/File:Zaryadye25.jpg'}
 ];
 const modes={walk:'Пешком',transit:'Транспорт',car:'На машине'};
 const route=(p,mode=p.mode)=>window.KeysMaps.routeURL({from:[hotel.lng,hotel.lat],to:[p.lng,p.lat],mode});
 const select=(state)=>places.filter(p=>(state.filter==='all'||(state.filter==='for-you'?state.interests.includes(p.theme):p.theme===state.filter))&&(!state.shortWalk||p.walk<=20)).sort((a,b)=>a.walk-b.walk);
 function create({open,overlay,dashboard,icon}){
  let saved;try{saved=JSON.parse(localStorage.getItem('keys-nearby-interests-v1'));}catch{}
  const state={view:'list',filter:'for-you',shortWalk:false,interests:Array.isArray(saved)?saved.filter(t=>themes[t]):Object.keys(themes),selected:null,scroll:0};
  let map=null,mapView=null,draft=[],markers=new Map(),placeOrigin='list',focusId=null,mapRevision=0;
  const content=overlay.querySelector('.kh-detail-content');
  const photo=p=>`<img src="./home/nearby/${p.id}.${p.id==='museum'?'png':'jpg'}" alt="${p.name}" loading="lazy" width="640" height="360">`;
  const travel=p=>`≈ ${p[p.mode]} мин · ${modes[p.mode].toLowerCase()}`;
  function dispose(){mapRevision++;if(map){mapView={center:map.getCenter(),zoom:map.getZoom()};map.remove();map=null;markers.clear();}}
  function remember(){if(state.view==='list'&&content.querySelector('.kn-cards'))state.scroll=overlay.scrollTop;}
  function updateHome(){
   const list=select({...state,filter:'for-you',shortWalk:false});
   const count=`${list.length} ${list.length===1?'место':list.length<5&&list.length>0?'места':'мест'}`;
   dashboard.querySelector('.kh-nearby-heading p').textContent=state.interests.length?'По вашим интересам':'Выберите интересы для подборки';
   const summary=dashboard.querySelector('[data-nearby-count]');
   if(summary)summary.textContent=list.length?`${count} · от отеля`:'Настройте подборку под себя';
   else {
    // The saved calendar variant retains its original home markup.
    dashboard.querySelector('.kh-discover-copy>strong').innerHTML='Куда сходить<br>рядом с отелем';
    dashboard.querySelector('.kh-discover-copy>span').textContent=list.length?`${count} · пешком и на транспорте`:'Настройте подборку под себя';
   }
  }
  function actions(p){return `<div class="kn-card-actions"><button data-kn-map="${p.id}">На карте ${icon('pin')}</button><a href="${route(p)}" target="_blank" rel="noopener">Маршрут ↗</a></div>`;}
  const factIcon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{walk:'<circle cx="13" cy="4" r="2"/><path d="m7 21 3-6-2-3 3-5 3 4 4 2M6 11l3-3m1 7 5 2 1 4"/>',transit:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 21l2-3m6 3-2-3M9 14h.01M15 14h.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'}[name]}</svg>`;
  function card(p){return `<article class="kn-card"><button class="kn-card-open" data-kn-place="${p.id}" aria-label="Подробнее: ${p.name}"><span class="kn-card-media">${photo(p)}<span class="kn-card-theme">${themes[p.theme]}</span></span><span class="kn-card-body"><strong>${p.name}</strong><span class="kn-description">${p.summary}</span><span class="kn-card-facts"><span class="kn-card-fact">${factIcon(p.mode==='walk'?'walk':'transit')}<span><strong>≈ ${p[p.mode]} мин</strong><small>${p.mode==='walk'?'пешком':p.mode==='car'?'на машине':'транспортом'} от отеля</small></span></span><span class="kn-card-fact">${factIcon('clock')}<span><strong>${p.visit.replace(' на спектакль','').replace('часа','ч').replace('минут','мин')}</strong><small>${p.id==='theatre'?'на спектакль':'на посещение'}</small></span></span></span></span></button>${actions(p)}</article>`;}
  function selectedCard(p){return `<article class="kn-selected"><button class="kn-selected-open" data-kn-place="${p.id}">${photo(p)}<span><small>${themes[p.theme]}</small><strong>${p.name}</strong><span>${travel(p)}</span><small>На посещение: ${p.visit}</small></span></button>${actions(p)}</article>`;}
  function updateSelected(p){state.selected=p.id;content.querySelector('[data-kn-selection]').innerHTML=selectedCard(p);markers.forEach((m,id)=>{const el=m.getElement();if(el){el.classList.toggle('kn-pin-selected',id===p.id);el.setAttribute('aria-pressed',String(id===p.id));}});}
  async function mount2gis(list){
   const revision=++mapRevision,target=content.querySelector('.kn-map'),status=content.querySelector('.kn-map-status');
   if(!target)return;
   try{
    const api=await window.KeysMaps.load();
    if(revision!==mapRevision||!target.isConnected)return;
    const native=window.KeysMaps.create(target,{center:[hotel.lng,hotel.lat],zoom:13,scrollZoom:false});
    const owned=[];let timer;
    map={getCenter:()=>{const [lng,lat]=native.getCenter();return {lat,lng};},getZoom:()=>native.getZoom(),
     setView:(point,zoom)=>{native.setCenter(Array.isArray(point)?[point[1],point[0]]:[point.lng,point.lat]);native.setZoom(zoom);},
     fitBounds:(points,options)=>window.KeysMaps.fit(native,points.map(p=>[p[1],p[0]]),{maxZoom:options?.maxZoom??15,topLeft:[34,34],bottomRight:[34,80]}),
     invalidateSize:()=>native.invalidateSize(),remove:()=>{clearTimeout(timer);owned.forEach(marker=>marker.destroy());native.destroy();}};
    const fail=()=>{if(revision!==mapRevision)return;status.hidden=false;status.textContent='Карта не загрузилась. Места и маршруты доступны в списке.';};
    timer=setTimeout(fail,15000);
    native.on('idle',()=>{clearTimeout(timer);if(revision===mapRevision)status.hidden=true;});native.on('styleloaderror',()=>{clearTimeout(timer);fail();});
    const pin=(coordinates,className,label,text,onClick)=>{
     const button=document.createElement('button');button.type='button';button.className=className;button.setAttribute('aria-label',label);button.title=label;button.innerHTML='<span></span>';button.firstChild.textContent=text;button.style.cssText='width:36px;height:36px;padding:0';
     if(onClick)button.addEventListener('click',onClick);
     const marker=new api.HtmlMarker(native,{coordinates,html:button,anchor:[18,18],interactive:true,preventMapInteractions:true});owned.push(marker);
     return {getElement:()=>button};
    };
    pin([hotel.lng,hotel.lat],'kn-hotel-pin','Maidens Hotel — ваш отель','H');
    list.forEach((p,i)=>markers.set(p.id,pin([p.lng,p.lat],'kn-place-pin',p.name,String(i+1),()=>updateSelected(p))));
    if(focusId){const p=places.find(p=>p.id===focusId);if(p){map.setView([p.lat,p.lng],14);state.selected=p.id;}focusId=null;}
    else if(mapView)map.setView(mapView.center,mapView.zoom);
    else map.fitBounds([[hotel.lat,hotel.lng],...list.map(p=>[p.lat,p.lng])],{maxZoom:15});
    if(list.length)updateSelected(list.find(p=>p.id===state.selected)||list[0]);
   }catch(error){if(revision!==mapRevision)return;status.hidden=false;status.textContent='Карта не загрузилась. Места и маршруты доступны в списке.';}
  }
  function mountMap(list){
   if(window.KeysMaps?.enabled())return mount2gis(list);
   const target=content.querySelector('.kn-map');if(!target)return;
   if(!window.L){target.innerHTML='<div class="kn-empty">Карта недоступна. Места и маршруты доступны в списке.</div>';return;}
   map=L.map(target,{zoomControl:false,scrollWheelZoom:false}).setView([hotel.lat,hotel.lng],13);
   L.control.zoom({position:'topright',zoomInTitle:'Приблизить',zoomOutTitle:'Отдалить'}).addTo(map);
   const status=content.querySelector('.kn-map-status');let failed=0,loaded=0;
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).on('tileload',()=>{loaded++;status.hidden=true;}).on('tileerror',()=>{if(++failed>2&&!loaded){status.hidden=false;status.textContent='Подложка карты не загрузилась. Проверьте интернет или откройте маршрут.';}}).addTo(map);
   L.marker([hotel.lat,hotel.lng],{icon:L.divIcon({className:'kn-hotel-pin',html:'<span>H</span>',iconSize:[36,36],iconAnchor:[18,18]}),title:'Maidens Hotel — ваш отель',alt:'Maidens Hotel — ваш отель'}).addTo(map).bindPopup('Maidens Hotel<br>Ваш отель · точка отправления');
   list.forEach((p,i)=>{const m=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'kn-place-pin',html:`<span>${i+1}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),title:p.name,alt:p.name,keyboard:true}).addTo(map).on('click',()=>updateSelected(p));markers.set(p.id,m);m.getElement()?.setAttribute('aria-label',p.name);});
   if(focusId){const p=places.find(p=>p.id===focusId);if(p){map.setView([p.lat,p.lng],14);state.selected=p.id;}focusId=null;}
   else if(mapView)map.setView(mapView.center,mapView.zoom);
   else map.fitBounds([[hotel.lat,hotel.lng],...list.map(p=>[p.lat,p.lng])],{padding:[34,34],maxZoom:15});
   if(list.length)updateSelected(list.find(p=>p.id===state.selected)||list[0]);
   requestAnimationFrame(()=>map?.invalidateSize());
  }
  function show(trigger,entryView){
   dispose();
   if(entryView==='list'||entryView==='map'){state.view=entryView;state.filter='for-you';state.shortWalk=false;state.scroll=0;mapView=null;}
   const list=select(state);
   const empty=`<div class="kn-empty"><strong>Пока нет подходящих мест</strong><p>${!state.interests.length&&state.filter==='for-you'?'Выберите интересы, чтобы собрать свою подборку.':'Попробуйте другую тему или уберите ограничение по времени.'}</p><button data-kn-reset>Показать все места</button><button data-kn-interests>Выбрать интересы</button></div>`;
   open('Места рядом',`<div class="kn-nearby"><button type="button" class="kn-interests" data-kn-interests aria-label="Изменить ваши интересы"><span class="kn-interests-copy"><strong>Ваши интересы</strong><small>${state.interests.map(t=>themes[t]).join(' · ')||'Ещё не выбраны'}</small></span><span class="kh-detail-link">Изменить <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h7m4 0h5M4 17h2m4 0h10"/><circle cx="13" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg></span></button><div class="kn-switch" role="group" aria-label="Вид мест"><button data-kn-view="list" aria-pressed="${state.view==='list'}">Список</button><button data-kn-view="map" aria-pressed="${state.view==='map'}">Карта</button></div><div class="kn-filters" role="group" aria-label="Тематика мест">${Object.entries({'for-you':'Для вас',all:'Все',...themes}).map(([key,label])=>`<button data-kn-filter="${key}" aria-pressed="${state.filter===key}">${label}</button>`).join('')}</div>${state.view==='list'?`<div class="kn-cards">${list.length?list.map(card).join(''):empty}</div>`:`<div class="kn-map-wrap"><div class="kn-map" aria-label="Карта мест рядом с Maidens Hotel"></div><button class="kn-map-reset" data-kn-fit aria-label="Показать отель и все места">${icon('pin')} Все точки</button></div><p class="kn-map-status" role="status">Загружаем карту…</p><p class="kn-map-legend">H — ваш отель · нажмите на номер места</p><div data-kn-selection aria-live="polite">${list.length?'':empty}</div>`}<p class="kn-disclaimer">Время в пути и на посещение — ориентировочное. Точный маршрут, расписание и билеты проверяйте перед выходом.</p></div>`,'nearby',trigger);
   if(state.view==='map')mountMap(list);else overlay.scrollTop=state.scroll;
  }
  function interests(){remember();draft=[...state.interests];dispose();open('Ваши интересы',`<div class="kn-nearby"><p class="kn-location">Что вам нравится делать в поездках?</p><p class="kn-help">Эти темы определяют подборку «Для вас» в списке и на карте.</p><div class="kn-interest-options">${Object.entries(themes).map(([key,label])=>`<label><input type="checkbox" value="${key}" ${draft.includes(key)?'checked':''}><span><strong>${label}</strong><small>${{culture:'Музеи, театры и архитектура',walk:'Парки, набережные и виды на город',food:'Кафе, рестораны и гастромаркеты'}[key]}</small></span></label>`).join('')}</div><button class="kn-primary" data-kn-save>Сохранить интересы</button></div>`,'nearby-interests');}
  function showPlace(id){const p=places.find(p=>p.id===id);if(!p)return;remember();placeOrigin=state.view;dispose();state.selected=id;
   open(p.name,`<div class="kn-nearby kn-detail">${photo(p)}<span class="kn-tag">${p.tag}</span><p class="kn-help">${p.description}</p>${state.interests.includes(p.theme)?`<div class="kn-reason">${p.why}</div>`:''}<div class="kn-facts"><span>Адрес<strong>${p.address}</strong></span><span>На посещение<strong>${p.visit}</strong></span></div><h3>Как добраться от отеля</h3><p class="kn-help">${p.mode==='walk'?'Рекомендуем пройтись пешком.':'Удобнее на общественном транспорте.'} Время ориентировочное.</p><div class="kn-routes">${Object.entries(modes).map(([mode,label])=>`<a href="${route(p,mode)}" target="_blank" rel="noopener"><span>${label}${mode===p.mode?'<small>Рекомендуем</small>':''}</span><strong>≈ ${p[mode]} мин ↗</strong></a>`).join('')}</div><button class="kn-primary" data-kn-map="${p.id}">Показать на общей карте</button><a class="kn-site" href="${p.site}" target="_blank" rel="noopener">Сайт места · часы работы и билеты ↗</a><a class="kn-credit" href="${p.photoSource||p.site}" target="_blank" rel="noopener">${p.credit}</a></div>`,'nearby-place');
  }
  function handle(button,event){
   const d=button.dataset;if(!Object.keys(d).some(k=>k.startsWith('kn')))return false;
   event.preventDefault();event.stopPropagation();
   if('knView'in d){remember();state.view=d.knView;show();}
   else if('knFilter'in d){state.filter=d.knFilter;state.scroll=0;dispose();mapView=null;show();}
   else if('knWalk'in d){state.shortWalk=!state.shortWalk;state.scroll=0;dispose();mapView=null;show();}
   else if('knReset'in d){state.filter='all';state.shortWalk=false;state.scroll=0;dispose();mapView=null;show();}
   else if('knInterests'in d)interests();
   else if('knSave'in d){state.interests=[...content.querySelectorAll('input:checked')].map(e=>e.value);try{localStorage.setItem('keys-nearby-interests-v1',JSON.stringify(state.interests));}catch{}state.filter='for-you';state.scroll=0;dispose();mapView=null;updateHome();show();}
   else if('knPlace'in d)showPlace(d.knPlace);
   else if('knMap'in d){remember();state.view='map';focusId=d.knMap;show();}
   else if('knFit'in d){const list=select(state);map?.fitBounds([[hotel.lat,hotel.lng],...list.map(p=>[p.lat,p.lng])],{padding:[34,34],maxZoom:15});}
   return true;
  }
  function back(detail){if(detail==='nearby-place'){state.view=placeOrigin;show();return true;}if(detail==='nearby-interests'){show();return true;}if(detail==='nearby'){remember();dispose();}return false;}
  updateHome();return {show,handle,back,dispose};
 }
 window.KeysNearby={create,places,select,route};
})();
