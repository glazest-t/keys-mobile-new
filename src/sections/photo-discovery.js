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
 return n.jsxs('div',{className:'keys-discovery-video'+(full?' is-full':''),children:[n.jsx('video',{ref,src:active?media.src:undefined,poster:media.poster,preload:active?'metadata':'none',playsInline:true,muted:true,loop:!full,controls:full,'aria-label':media.alt,onPlay:()=>setPlaying(true),onPause:()=>setPlaying(false),onEnded:()=>setPlaying(false),onError:()=>setError(true)}),(!full||error)&&n.jsx('button',{type:'button',className:'keys-discovery-video-play',onPointerDown:event=>event.stopPropagation(),'aria-label':error?'Повторить видео':playing?'Приостановить видео':'Смотреть видео отеля',onClick:event=>{event.stopPropagation();const video=ref.current;if(!video)return;if(error){setError(false);video.load();}if(playing)video.pause();else video.play().catch(()=>setError(true));},children:n.jsx(D,{name:error?'repeat':playing?'pause':'play',className:'size-5'})})]});
}
