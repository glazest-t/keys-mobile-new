// The prototype reuses the reference's six atmosphere clips where a hotel has no own video.
function keysPhotoMedia(hotel, photos=hotel.photos) {
 const images=(photos||[]).filter(item=>item.type!=='video');
 const clips=sw.flatMap(item=>(item.media||[]).filter(media=>media.type==='video').map(media=>({...media,hotelId:item.hotelId})));
 const video=clips.find(item=>item.hotelId===hotel.id)||clips[0];
 return video ? [{...video,alt:'Атмосфера'},...images] : images;
}
function KeysPhotoTags({tags}) {
 const unique=tags.filter((tag,index)=>tags.findIndex(item=>item.name===tag.name)===index);
 const render=tag=>n.jsxs('span',{className:'keys-discovery-tag',children:[tag.icon&&n.jsx(D,{name:tag.icon,className:'size-3.5'}),tag.name]},tag.name);
 return n.jsxs('div',{className:'keys-discovery-features',children:[n.jsx('div',{className:'keys-discovery-tag-preview',children:unique.slice(0,3).map(render)}),unique.length>3&&n.jsxs('details',{className:'keys-discovery-tags',onPointerDown:event=>event.stopPropagation(),onClick:event=>event.stopPropagation(),children:[n.jsxs('summary',{children:[n.jsx('span',{className:'keys-discovery-more',children:'Ещё '+(unique.length-3)}),n.jsx('span',{className:'keys-discovery-less',children:'Скрыть'}),n.jsx(D,{name:'chevron',className:'size-4'})]}),n.jsx('div',{className:'keys-discovery-tag-list',children:unique.slice(3).map(render)})]})]});
}
function KeysPhotoVideo({media,active=true,full=false,onProgress}) {
 const progressCallback=E.useRef(onProgress);progressCallback.current=onProgress;
 const ref=E.useRef(null),[playing,setPlaying]=E.useState(false),[error,setError]=E.useState(false);
 E.useEffect(()=>{
 const video=ref.current;if(!video)return;
 let frame;
 const update=()=>{progressCallback.current?.(Number.isFinite(video.duration)&&video.duration>0?Math.min(1,Math.max(0,video.currentTime/video.duration)):0);};
 const tick=()=>{update();if(!video.paused&&!video.ended)frame=requestAnimationFrame(tick);};
 const start=()=>{cancelAnimationFrame(frame);tick();};
 const stop=()=>{cancelAnimationFrame(frame);update();};
 video.addEventListener('play',start);video.addEventListener('pause',stop);video.addEventListener('timeupdate',update);video.addEventListener('loadedmetadata',update);video.addEventListener('ended',stop);update();
 const sync=()=>{if(!active||document.hidden)video.pause();else if(!full&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>setPlaying(false));};
 sync();document.addEventListener('visibilitychange',sync);
 return()=>{cancelAnimationFrame(frame);video.pause();video.removeEventListener('play',start);video.removeEventListener('pause',stop);video.removeEventListener('timeupdate',update);video.removeEventListener('loadedmetadata',update);video.removeEventListener('ended',stop);document.removeEventListener('visibilitychange',sync);progressCallback.current?.(0);};
 },[active,full,media.src]);
 return n.jsxs('div',{className:'keys-discovery-video'+(full?' is-full':''),children:[n.jsx('video',{ref,src:active?media.src:undefined,poster:media.poster,preload:active?'metadata':'none',playsInline:true,muted:true,loop:!full,controls:full,'aria-label':media.alt,onPlay:()=>setPlaying(true),onPause:()=>setPlaying(false),onEnded:()=>setPlaying(false),onError:()=>setError(true)}),((!full&&!playing)||error)&&n.jsx('button',{type:'button',className:'keys-discovery-video-play',onPointerDown:event=>event.stopPropagation(),'aria-label':error?'Повторить видео':playing?'Приостановить видео':'Смотреть видео отеля',onClick:event=>{event.stopPropagation();const video=ref.current;if(!video)return;if(error){setError(false);video.load();}if(playing)video.pause();else video.play().catch(()=>setError(true));},children:n.jsx(D,{name:error?'repeat':playing?'pause':'play',className:'size-5'})})]});
}

function useKeysPhotoGestures(refs,onVote,onTap,enabled,onFrame){
 const [leaving,setLeaving]=E.useState(false),[hint,setHint]=E.useState(0);
 const gesture=E.useRef(null),busy=E.useRef(false),timer=E.useRef(null);
 const callbacks=E.useRef({onVote,onTap,onFrame});callbacks.current={onVote,onTap,onFrame};
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const restore=()=>{const card=refs.card.current;if(card){card.style.transition=reduced()?'none':'transform .2s ease, opacity .2s ease';card.style.transform='';card.style.opacity='';}if(refs.next.current)refs.next.current.style.transform='translateY(12px) scale(.95)';};
 E.useEffect(()=>{const card=refs.card.current;if(card&&!reduced())card.animate([{opacity:.5,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});return()=>clearTimeout(timer.current);},[]);
 const cancel=()=>{gesture.current=null;if(!busy.current){setHint(0);restore();}};
 E.useEffect(()=>{window.addEventListener('blur',cancel);return()=>window.removeEventListener('blur',cancel);},[]);
 const decide=liked=>{
  if(!enabled||busy.current)return;
  busy.current=true;gesture.current=null;setLeaving(true);setHint(liked?1:-1);
  const card=refs.card.current,duration=reduced()?0:240;
  if(card){card.style.transition=`transform ${duration}ms ease, opacity ${duration}ms ease`;card.style.transform=`translateY(-${card.offsetHeight+40}px)`;card.style.opacity='0';}
  if(refs.next.current){refs.next.current.style.transition=`transform ${duration}ms ease`;refs.next.current.style.transform='translateY(0) scale(1)';}
  timer.current=setTimeout(()=>callbacks.current.onVote(liked),duration);
 };
 return {hint,leaving,decide,handlers:{
  onPointerDown:event=>{
   if(!enabled||busy.current||!event.isPrimary||event.button!==0||event.target.closest('button,a,input,select,textarea,summary,[role="button"],.keys-discovery-features'))return;
   gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,target:event.target,media:!!event.target.closest('[data-testid="swipe-photos"]')};
   event.currentTarget.setPointerCapture(event.pointerId);
  },
  onPointerMove:event=>{
   const start=gesture.current;if(!start||start.id!==event.pointerId)return;
   if(event.pointerType==='mouse'&&!(event.buttons&1)){cancel();return;}
   const dx=event.clientX-start.x,dy=event.clientY-start.y;
   if(dy<0&&Math.abs(dy)>Math.abs(dx)*1.2){
    const card=refs.card.current;if(card){card.style.transition='none';card.style.transform=`translateY(${dy*.6}px)`;}
   }else restore();
  },
  onPointerUp:event=>{
   const start=gesture.current;if(!start||start.id!==event.pointerId)return;
   gesture.current=null;
   const action=keysPhotoGesture(event.clientX-start.x,event.clientY-start.y);
   if(action==='next-hotel'){decide(false);return;}
   restore();
   if(!start.media)return;
   if(action==='next-frame'||action==='previous-frame')callbacks.current.onFrame(action==='next-frame'?1:-1);
   else if(action==='tap')callbacks.current.onTap(event,start.target);
  },
  onPointerCancel:cancel,onLostPointerCapture:cancel
 }};
}

function KeysPhotoRooms({hotel,onClose}){
 const {state,dispatch}=J(),search=state.search;
 return n.jsx(ct,{title:'Выберите номер',onClose,children:n.jsxs('div',{className:'keys-photo-rooms',children:[
  n.jsxs('div',{className:'keys-photo-rooms-context',children:[
   n.jsx('p',{children:hotel.name+' · '+hotel.city}),
   n.jsx('p',{children:it(search.arrival,search.departure)+' · '+Rt(search.party)})
  ]}),
  n.jsx('p',{className:'keys-photo-rooms-period',children:'Стоимость за '+Xe(Ge(search.arrival,search.departure))}),
  n.jsx(Fx,{spacious:true,hotelId:hotel.id,priceFor:room=>Zm(hotel,room,search,state.discovery.priceTick),onSelect:room=>{dispatch({type:'RESERVATION_START',hotelId:hotel.id,roomId:room.id});onClose();}})
 ]})});
}
