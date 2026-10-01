/* Breakfast media follows the hotel gallery pattern: swipe, counter, and a larger viewer. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');if(!app)return;
 const breakfastPhotos=[
  {src:'./booking/gallery/breakfast-dishes.png',alt:'Пример завтрака: сырники, круассан, яйца и кофе',caption:'Блюда на завтрак'},
  {src:'./booking/gallery/breakfast-buffet.png',alt:'Шведский стол с выпечкой, фруктами и йогуртами',caption:'Шведский стол'},
  {src:'./booking/restaurant.webp',alt:'Светлый зал ресторана',caption:'Ресторан'}
 ];
 const roomPhotos=[
  {src:'./booking/gallery/room-food-syrniki.png',alt:'Золотистые сырники со сметаной и ягодами',caption:'Сырники со сметаной'},
  {src:'./booking/gallery/room-food-oatmeal.png',alt:'Овсяная каша с бананом и ягодами',caption:'Овсяная каша'},
  {src:'./booking/gallery/room-food-salmon.png',alt:'Запечённый лосось с овощами',caption:'Лосось с овощами'},
  {src:'./booking/gallery/room-food-medovik.png',alt:'Капучино и кусочек торта Медовик',caption:'Капучино и медовик'},
  {src:'./booking/restaurant.webp',alt:'Светлый зал ресторана LEA',caption:'Ресторан LEA'}
 ];
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const left=svg('<path d="m15 5-7 7 7 7"/>'),right=svg('<path d="m9 5 7 7-7 7"/>');
 let viewer=null;
 function gallery({large=false,start=0,openPhoto,photos=breakfastPhotos,title="Завтрак"}={}){
  let index=start;
  const wrap=document.createElement('section');wrap.className='kbg-gallery'+(large?' kbg-large':'');wrap.setAttribute('aria-label','Фотографии — '+title);
  wrap.innerHTML=`<div class="kbg-track" tabindex="0" aria-label="Галерея. Используйте стрелки для переключения">${photos.map((photo,i)=>large?`<div class="kbg-slide"><img src="${photo.src}" alt="${photo.alt}" draggable="false"></div>`:`<button type="button" class="kbg-slide" aria-label="Открыть фото ${i+1}: ${photo.caption}"><img src="${photo.src}" alt="${photo.alt}" width="720" height="480" loading="${i===0?'eager':'lazy'}" draggable="false"></button>`).join('')}</div><div class="kbg-bottom"><span class="kbg-caption"></span><button type="button" class="kbg-counter" aria-label="Открыть все фотографии: ${title}"></button></div><button type="button" class="kbg-prev" aria-label="Предыдущее фото">${left}</button><button type="button" class="kbg-next" aria-label="Следующее фото">${right}</button>`;
  const track=wrap.querySelector('.kbg-track'),slides=[...track.children],counter=wrap.querySelector('.kbg-counter');
  function update(){
   wrap.querySelector('.kbg-caption').textContent=photos[index].caption;
   counter.textContent=`${index+1} / ${photos.length}`;
   wrap.querySelector('.kbg-prev').disabled=index===0;wrap.querySelector('.kbg-next').disabled=index===photos.length-1;
   slides.forEach((slide,i)=>{if(!large)slide.tabIndex=i===index?0:-1;});
  }
  function move(next,smooth=true){index=Math.min(photos.length-1,Math.max(0,next));track.scrollTo({left:index*track.clientWidth,behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});update();}
  track.addEventListener('scroll',()=>{index=Math.min(photos.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth)));update();},{passive:true});
  wrap.querySelector('.kbg-prev').onclick=()=>move(index-1);wrap.querySelector('.kbg-next').onclick=()=>move(index+1);
  wrap.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();move(index+(event.key==='ArrowRight'?1:-1));}});
  if(!large){slides.forEach((slide,i)=>slide.onclick=()=>openPhoto(i,slide));counter.onclick=()=>openPhoto(index,counter);}
  else{counter.disabled=true;counter.removeAttribute('aria-label');}
  update();requestAnimationFrame(()=>move(start,false));
  const resize=new ResizeObserver(()=>move(index,false));resize.observe(track);
  return {element:wrap,dispose:()=>resize.disconnect()};
 }
 function openViewer(index,origin,photos=breakfastPhotos,title="Завтрак"){
  if(viewer)return;
  const phone=origin.closest('.k3-phone,.ksd-phone');if(!phone)return;
  const overlay=document.createElement('section');overlay.className='kbg-viewer';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Фото — '+title);
  overlay.innerHTML=`<header><h2>${title}</h2><button type="button" class="kbg-close" aria-label="Закрыть фотографии">${svg('<path d="m6 6 12 12M6 18 18 6"/>')}</button></header>`;
  const media=gallery({large:true,start:index,photos,title});overlay.append(media.element);
  const underlying=[...phone.children].map(el=>({el,inert:el.inert}));underlying.forEach(({el})=>el.inert=true);phone.append(overlay);
  function close(){media.dispose();overlay.remove();underlying.forEach(({el,inert})=>el.inert=inert);viewer=null;origin.isConnected&&origin.focus({preventScroll:true});}
  viewer={close};overlay.querySelector('.kbg-close').onclick=close;
  overlay.addEventListener('keydown',event=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
   if(event.key==='Tab'){const all=[...overlay.querySelectorAll('button:not(:disabled),[tabindex="0"]')],first=all[0],last=all.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
  overlay.querySelector('.kbg-close').focus({preventScroll:true});
 }
 const mounted=new Map();
 function sync(){
  for(const [content,media] of mounted){if(!media.element.isConnected){media.dispose();mounted.delete(content);}}
  app.querySelectorAll('.kh-overlay').forEach(overlay=>{
   if(overlay.querySelector('#kh-detail-title')?.textContent.trim()!=='Завтрак')return;
   const content=overlay.querySelector('.kh-detail-content');if(!content||content.querySelector('.kbg-gallery'))return;
   const media=gallery({openPhoto:openViewer});content.prepend(media.element);mounted.set(content,media);
  });
  app.querySelectorAll('#keysStayDetails .ksd-detail-layer').forEach(layer=>{
   if(layer.querySelector('h1')?.textContent.trim()!=='Еда в номер')return;
   const content=layer.querySelector('.ksd-detail-content');if(!content||content.querySelector('.kbg-gallery'))return;
   const media=gallery({photos:roomPhotos,title:'Еда в номер',openPhoto:(index,origin)=>openViewer(index,origin,roomPhotos,'Еда в номер')});
   media.element.classList.add('kbg-room-food');
   const restaurant=content.querySelector('.ksvc-restaurant');
   if(restaurant)restaurant.replaceWith(media.element);else content.prepend(media.element);
   mounted.set(content,media);
  });
 }
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()});}).observe(app,{childList:true,subtree:true});
 app.addEventListener('keys-scenario-change',()=>viewer?.close());sync();
})();
