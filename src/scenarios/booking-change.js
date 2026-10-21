/* The original Arbana booking-change flow runs in an isolated instance. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),phone=document.querySelector('#keysHomeVariantThree .k3-phone');
 let layer=null,frame=null,session=null,background=[];
 const ready=()=>{
  layer.querySelector('.kpa-change-loading')?.remove();layer.querySelector('.kpa-change-cancel')?.remove();
  layer.classList.remove('is-pending');frame.removeAttribute('aria-hidden');session.trigger?.removeAttribute('aria-busy');
  frame.focus({preventScroll:true});
 };
 const close=(result=null,focus=true)=>{
  if(!session)return;const current=session;session=null;
  current.trigger?.removeAttribute('aria-busy');layer.remove();layer=frame=null;
  background.forEach(({node,inert})=>node.inert=inert);background=[];
  if(result)current.onComplete(result);else if(focus)current.trigger?.focus({preventScroll:true});
 };
 window.KeysBookingChange={open(options){
  if(session)close(null,false);session=options;const title=options.flow==='share'?'Поделиться поездкой':options.flow==='checkin'?'Онлайн-регистрация':'Изменить бронь';
  layer=document.createElement('section');layer.className='kpa-change-layer'+(options.flow==='share'?' kpa-share-layer is-pending':'');layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label',title);
  if(options.flow!=='share')layer.innerHTML='<div class="kpa-change-loading" role="status">Открываем бронь…</div><button type="button" class="kpa-change-cancel">Назад</button>';
  if(layer.querySelector('button'))layer.querySelector('button').onclick=()=>close();
  frame=document.createElement('iframe');frame.title=title;frame.allow='clipboard-write; web-share';frame.src='./sections/index.html?v=arbana-checkin-1&keysBookingChange=1';
  background=[...phone.children].map(node=>({node,inert:node.inert}));background.forEach(({node})=>node.inert=true);
  if(options.flow==='share'){frame.setAttribute('aria-hidden','true');options.trigger?.setAttribute('aria-busy','true');}
  layer.append(frame);phone.append(layer);if(options.flow!=='share')frame.focus({preventScroll:true});
 }};
 window.addEventListener('message',event=>{
  if(!session||event.source!==frame?.contentWindow||event.data?.source!=='keys-arbana'||(event.origin!==location.origin&&location.protocol!=='file:'))return;
  if(event.data.type==='ready')frame.contentWindow.postMessage({source:'keys-host',bookingChange:{...session.booking,flow:session.flow,registration:session.registration,social:session.social}},location.protocol==='file:'?'*':location.origin);
  if(event.data.type==='change-ready'&&session.flow!=='share')ready();
  if(event.data.type==='share-ready'&&session.flow==='share')ready();
  if(event.data.type==='share-state')session.onSocial?.(event.data.social);
  if(event.data.type==='share-copied')session.onCopied?.();
  if(event.data.type==='checkin-complete')session.onRegistered?.(event.data.registration);
  if(event.data.type==='change-close')close();
  if(event.data.type==='change-complete')close(event.data.booking);
  if(event.data.type==='bottom-navigate'){
   const tab=event.data.tab;close(null,false);
   app.dispatchEvent(new CustomEvent('keys-bottom-navigate',{detail:{tab}}));
  }
  if(event.data.type==='navigate'){
   const target=event.data.target,onInstruction=session.onInstruction;close();
   if(target==='checkin-instruction')onInstruction?.();
   if(target==='change-chat')app.dispatchEvent(new CustomEvent('keys-open-hotel-chat'));
  }
 });
 app.addEventListener('keys-scenario-change',()=>close(null,false));
})();
