/* Desktop account pages reuse the mobile data, navigation and notification runtime. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype'),home=root.querySelector('#keysHomeVariantThree');
 const header=home.querySelector('.keys-app-header'),anchor=document.createComment('Shared web masthead');header.before(anchor);
 const phone=root.querySelector('.kf-phone[data-screen="benefits"]'),account=phone.closest('.ku-section'),page=phone.closest('.kf-grid>section');
 const content=phone.querySelector('.keys-benefits'),scroll=phone.querySelector(':scope>.kf-scroll');
 const mobileHeader=scroll.querySelector('.keys-app-header');
 const title=document.createElement('div');title.className='kda-title';title.innerHTML='<button type="button" aria-label="Назад" data-benefits-back><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14"/></svg></button><h1>Бонусная программа</h1>';
 scroll.prepend(title);
 const frame=root.querySelector('#keysSectionsFrame'),runtime=frame.closest('.ku-section');
 const frameHeader=document.createElement('div');frameHeader.className='kda-runtime-header';runtime.prepend(frameHeader);
 let previous='',lastView='',resetFindScroll=false;
 function sync(){
  const desktop=document.body.dataset.keysView==='desktop';
  const benefits=desktop&&!account.hidden&&!page.hidden;
  const notices=desktop&&!runtime.hidden&&['notifications','notification-settings'].includes(runtime.dataset.runtimeScreen);
  const find=desktop&&!runtime.hidden&&runtime.dataset.runtimeTab==='find'&&!notices;
  const framed=notices||find;
  const kind=benefits?'benefits':notices?'notifications':find?'find':'';
  if(kind)document.body.dataset.keysDesktopSecondary=kind;else delete document.body.dataset.keysDesktopSecondary;
  if(title.hidden===benefits)title.hidden=!benefits;if(mobileHeader.hidden!==benefits)mobileHeader.hidden=benefits;
  const profile=desktop&&document.body.dataset.keysDesktopProfile==='true';
  const destination=profile?root.querySelector('.kf-phone[data-screen="profile"]'):benefits?phone:framed?frameHeader:null;
  if(destination){if(header.parentElement!==destination)destination.prepend(header);}
  else if(header.previousSibling!==anchor)anchor.after(header);
  if(frameHeader.hidden===framed)frameHeader.hidden=!framed;
  if(!framed)frame.style.removeProperty('height');
  if(lastView!==String(desktop)){lastView=String(desktop);sendView();}
  if(kind!==previous){previous=kind;if(kind&&!matchMedia('(prefers-reduced-motion:reduce)').matches)(benefits?content:frame).animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});}
 }
 function sendView(){frame.contentWindow?.postMessage({source:'keys-host',desktopAccount:document.body.dataset.keysView==='desktop',desktopHeight:Math.max(560,window.innerHeight-190)},location.origin);}
 frame.addEventListener('load',sendView);window.addEventListener('resize',sendView);
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.source!=='keys-arbana')return;
  if(event.data.type==='ready')sendView();
  if(event.data.type==='state'&&document.body.dataset.keysView==='desktop'&&event.data.tab==='find'){resetFindScroll=true;window.scrollTo({top:0,behavior:'instant'});}
  if(event.data.type==='account-height'&&['notifications','find'].includes(document.body.dataset.keysDesktopSecondary)&&Number.isFinite(event.data.height)){frame.style.height=Math.max(560,Math.min(12000,event.data.height))+'px';if(resetFindScroll){resetFindScroll=false;requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));}}
 });
 title.querySelector('button').addEventListener('click',()=>root.dispatchEvent(new CustomEvent('keys-close-benefits')));
 // Make the same loyalty card an entry point in every desktop trip scenario.
 const wallet=home.querySelector('.kd-wallet .keys-benefits-wallet');
 const open=document.createElement('button');open.type='button';open.className='kda-program-link kh-detail-link';open.innerHTML='<span>Бонусная программа</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';wallet.append(open);
 wallet.addEventListener('click',event=>{if(event.target.closest('summary,details,a'))return;root.dispatchEvent(new CustomEvent('keys-open-benefits'));});
 root.addEventListener('click',event=>{
  if(document.body.dataset.keysView!=='desktop'||!event.target.closest('[data-after="points"]'))return;
  event.preventDefault();event.stopImmediatePropagation();root.dispatchEvent(new CustomEvent('keys-open-benefits'));
 },true);
 new MutationObserver(sync).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden','data-runtime-screen','data-runtime-tab']});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-keys-view','data-keys-desktop-profile']});
 sync();
})();
