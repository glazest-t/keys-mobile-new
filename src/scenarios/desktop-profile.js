/* Reuse the profile and the desktop masthead, without duplicating forms or state. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype');
 const phone=root.querySelector('.kf-phone[data-screen="profile"]'),home=root.querySelector('#keysHomeVariantThree');
 if(!phone)return;
 const account=phone.closest('.ku-section'),page=phone.closest('.kf-grid>section'),scroll=phone.querySelector(':scope>.kf-scroll');
 const header=home.querySelector('.keys-app-header');
 const children=[...scroll.children],identity=scroll.querySelector('.kf-profile'),loyalty=scroll.querySelector('.keys-profile-loyalty');
 const rail=document.createElement('aside');rail.className='kdp-personal';rail.setAttribute('aria-label','Ваш профиль и лояльность');
 const settings=document.createElement('div');settings.className='kdp-settings';
 const groups=children.filter(el=>el.matches('.kf-section')).map((title,i)=>{
  const card=title.nextElementSibling,group=document.createElement('section');group.className='kdp-group';
  const heading=title.querySelector('h2');heading.id='kdp-group-title-'+i;group.setAttribute('aria-labelledby',heading.id);
  return{title,card,group};
 });
 let active=false,sheetOpen=false,sheetOrigin=null;
 function sync(){
  const enabled=document.body.dataset.keysView==='desktop'&&!account.hidden&&!page.hidden;
  if(enabled!==active){
   active=enabled;document.body.dataset.keysDesktopProfile=String(enabled);
   if(enabled){
    rail.append(identity,loyalty);groups.forEach(({title,card,group})=>{group.append(title,card);settings.append(group);});
    scroll.append(rail,settings);
   }else{
    children.forEach(el=>scroll.append(el));rail.remove();settings.remove();header.inert=false;
    if(sheetOpen){const passportOpen=!phone.querySelector('.keys-passport-page').hidden;scroll.inert=passportOpen;phone.querySelector('.keys-profile-header').inert=passportOpen;sheetOpen=false;sheetOrigin=null;}
   }
  }
  if(active){
   const passportOpen=!phone.querySelector('.keys-passport-page').hidden,sheet=phone.querySelector('.kf-sheet-layer'),nextSheetOpen=!sheet.hidden;
   header.inert=passportOpen||nextSheetOpen;
   if(nextSheetOpen!==sheetOpen){
    sheetOpen=nextSheetOpen;
    if(sheetOpen){sheetOrigin=document.activeElement;scroll.inert=true;phone.querySelector('.keys-profile-header').inert=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.querySelector('h3').id='kdp-sheet-title';sheet.setAttribute('aria-labelledby','kdp-sheet-title');sheet.querySelector('input,button')?.focus({preventScroll:true});}
    else if(!passportOpen){scroll.inert=false;phone.querySelector('.keys-profile-header').inert=false;sheetOrigin?.focus({preventScroll:true});}
   }
  }
 }
 new MutationObserver(sync).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-keys-view']});
 // Keep desktop subflows centered and retain their original close/save handlers.
 phone.addEventListener('keydown',event=>{
  if(!active)return;
  const passport=phone.querySelector('.keys-passport-page'),sheet=phone.querySelector('.kf-sheet-layer');
  const modal=!passport.hidden?passport:!sheet.hidden?sheet:null;
  if(event.key==='Tab'&&modal){const controls=[...modal.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  if(event.key!=='Escape')return;
  if(!passport.hidden){event.preventDefault();passport.querySelector('[data-passport-back]').click();}
  else if(!sheet.hidden){event.preventDefault();sheet.querySelector('.kf-close')?.click();}
 });
 sync();
})();
