/* Brand variants are presentation only. Booking/auth state is never reset. */
(() => {
 const html=document.documentElement;
 const baseURL=new URL('./',document.currentScript.src);
 const framed=window.parent!==window;
 const allowed=value=>['orbit','orbit-new'].includes(value)?value:'base';
 const isOrbit=value=>value==='orbit'||value==='orbit-new';
 const brandName=value=>value==='orbit-new'?'Орбита New':value==='orbit'?'Орбита':'Базовый';
 function read(){const value=new URL(location.href).searchParams.get('brand');if(value)return allowed(value);try{return allowed(localStorage.getItem('keys-brand-variant'));}catch{return 'base';}}
 function apply(value){html.dataset.keysBrand=allowed(value);}
 if(framed){
  try{apply(parent.document.documentElement.dataset.keysBrand);}catch{apply(read());}
  window.addEventListener('message',event=>{if(event.source===parent&&event.origin===location.origin&&event.data?.type==='keys-brand')apply(event.data.brand);});
  return;
 }
 let brand=read(),played=false,lastEntry='',cleanup=()=>{};
 apply(brand);
 const toolbar=document.getElementById('keysScenarioControls');
 const brandControl=document.createElement('div');brandControl.className='keys-brand-control keys-scenario-control';
 const uiIcon=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 const progress='<span class="keys-brand-progress">'+uiIcon('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')+'<span>В процессе</span></span>';
 const brandCopy=value=>'<span class="keys-brand-copy"><span>Вариант '+brandName(value)+'</span>'+(value==='orbit'?progress:'')+'</span>';
 brandControl.innerHTML='<button type="button" class="keys-scenario-toggle keys-brand-toggle" aria-haspopup="listbox" aria-expanded="false" aria-controls="keys-brand-list"></button><div id="keys-brand-list" class="keys-scenario-list" role="listbox" aria-label="Вариант оформления" hidden><div class="keys-scenario-group" aria-hidden="true">Вариант оформления</div>'+['base','orbit','orbit-new'].map(value=>'<div role="option" tabindex="-1" data-brand="'+value+'" aria-selected="false">'+brandCopy(value)+uiIcon('<path d="m5 12 4 4L19 6"/>')+'</div>').join('')+'</div>';
 toolbar?.prepend(brandControl);
 const toggle=brandControl.querySelector('button'),list=brandControl.querySelector('[role=listbox]'),options=[...list.querySelectorAll('[role=option]')];
 function closeBrand(focus=false){list.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
 function openBrand(){
  toolbar.querySelectorAll('.keys-scenario-toggle[aria-expanded="true"]').forEach(button=>{if(button!==toggle)button.click();});
  list.hidden=false;toggle.setAttribute('aria-expanded','true');options.find(option=>option.dataset.brand===brand)?.focus();
 }
 function paintBrand(){
  toggle.innerHTML=brandCopy(brand)+uiIcon('<path d="m6 9 6 6 6-6"/>');
  toggle.setAttribute('aria-label','Вариант оформления: '+brandName(brand));
  options.forEach(option=>option.setAttribute('aria-selected',String(option.dataset.brand===brand)));
 }
 toggle.addEventListener('click',()=>list.hidden?openBrand():closeBrand());
 toggle.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openBrand();}});
 list.addEventListener('click',event=>{const option=event.target.closest('[data-brand]');if(option){chooseBrand(option.dataset.brand);closeBrand(true);}});
 list.addEventListener('keydown',event=>{
  const current=options.indexOf(document.activeElement);
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?options.length-1:(current+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[index].focus();
  }else if(['Enter',' '].includes(event.key)&&current>=0){event.preventDefault();chooseBrand(options[current].dataset.brand);closeBrand(true);}
  else if(event.key==='Escape'){event.preventDefault();closeBrand(true);}
  else if(event.key==='Tab')closeBrand();
 });
 document.addEventListener('pointerdown',event=>{if(!brandControl.contains(event.target))closeBrand();});
 brandControl.addEventListener('focusout',event=>{if(!brandControl.contains(event.relatedTarget))closeBrand();});
 const originalIcons=[...document.querySelectorAll('link[rel~="icon"]')].map(el=>({el,href:el.href}));
 const icon=document.createElement('link');icon.rel='icon';icon.href=new URL('orbit/app-icon/keys-icon-rounded.svg',baseURL);icon.type='image/svg+xml';
 function sync(){
  apply(brand);window.dispatchEvent(new CustomEvent('keys-brand-change',{detail:{brand}}));paintBrand();window.KeysScenarios?.setBrand(brand);
  if(isOrbit(brand))document.head.append(icon);else icon.remove();
  originalIcons.forEach(({el,href})=>{el.href=isOrbit(brand)?icon.href:href;});
  document.querySelectorAll('iframe').forEach(frame=>frame.contentWindow?.postMessage({type:'keys-brand',brand},location.origin));
 }
 const splashSVG="<svg width=\"160\" height=\"160\" viewBox=\"0 0 160 160\">\n      <g class=\"k-stage\">\n        <g class=\"k-shaft\">\n          <rect class=\"k-fg\" x=\"126\" y=\"68.75\" width=\"104\" height=\"22.5\" rx=\"11.25\" fill=\"#fff\"/>\n          <rect class=\"k-fg\" x=\"196\" y=\"80\" width=\"18\" height=\"30\" rx=\"5\" fill=\"#fff\"/>\n        </g>\n        <circle class=\"k-ring\" cx=\"80\" cy=\"80\" r=\"48.75\" fill=\"none\" stroke=\"#fff\" stroke-width=\"22.5\"/>\n        <g class=\"k-orbit\" style=\"transform-box:view-box;transform-origin:80px 80px;transform:rotate(315deg)\">\n          <circle class=\"k-halo\" cx=\"128.75\" cy=\"80\" r=\"27.2\" fill=\"#3a66f0\"/>\n          <circle class=\"k-ball k-fg\" cx=\"128.75\" cy=\"80\" r=\"20\" fill=\"#fff\"/>\n        </g>\n      </g>\n    </svg>";
 function createSplash(){
  const splash=document.createElement('div');splash.className='keys-login-splash k-anim';splash.setAttribute('aria-hidden','true');
  splash.innerHTML='<div class="keys-login-flight k-anim">'+splashSVG+'<div class="keys-login-word k-fade">ключи</div></div><p class="k-fade">Ключи от любого отеля</p>';
  return splash;
 }
 function auth(guest){
  cleanup();cleanup=()=>{};
  const phone=guest?.querySelector('.kauth-phone'),main=guest?.querySelector('.kauth-main'),header=guest?.querySelector('.kauth-header');
  if(!phone||!main)return;
  delete guest.dataset.orbitAuth;
  const isPartner=guest.dataset.authStep==='partner';
  if(guest.dataset.partnerView?.startsWith('extranet'))return;
  if(!isOrbit(brand)||guest.hidden||(!isPartner&&!main.querySelector('#keys-auth-phone,.kauth-code-fields,#keys-auth-name')))return;
  const entry=document.body.dataset.keysScenario;
  if(lastEntry!==entry){played=false;lastEntry=entry;}
  guest.dataset.orbitAuth='true';
  const restore=[];
  const logo=document.createElement('div');logo.className='keys-login-logo';logo.setAttribute('aria-label','Ключи');
  logo.innerHTML='<img src="'+new URL('orbit/login/symbol.svg',baseURL)+'" alt=""><span>ключи</span>';header.append(logo);restore.push(()=>logo.remove());
  const isPhone=guest.dataset.authStep==='phone',isInvite=isPartner&&guest.dataset.partnerView==='invite';
  if(isPhone){
   const intro=main.querySelector('.kauth-intro'),oldIntro=intro.innerHTML;
   intro.innerHTML='<h1>Вход</h1><p id="keys-orbit-phone-hint">Номер телефона</p>';restore.push(()=>intro.innerHTML=oldIntro);
   const input=main.querySelector('#keys-auth-phone'),button=main.querySelector('.kauth-primary');
   const field=document.createElement('div');field.className='keys-login-field';field.innerHTML='<span aria-hidden="true">+7</span>';input.before(field);field.append(input);
   const description=input.getAttribute('aria-describedby');input.setAttribute('aria-describedby','keys-orbit-phone-hint keys-auth-error');restore.push(()=>{if(description===null)input.removeAttribute('aria-describedby');else input.setAttribute('aria-describedby',description);});
   const placeholder=input.placeholder;input.placeholder='000 000-00-00';
   const buttonText=button.textContent;button.textContent='Продолжить';restore.push(()=>button.textContent=buttonText);
   const terms=document.createElement('p');terms.className='keys-login-terms';terms.innerHTML='Продолжая, вы принимаете <button type="button">условия</button>';button.after(terms);
   const dialog=document.createElement('dialog');dialog.className='keys-login-terms-dialog';dialog.setAttribute('aria-labelledby','keys-login-terms-title');dialog.innerHTML='<h2 id="keys-login-terms-title">Условия использования</h2><p>В прототипе документ ещё не добавлен.</p><button type="button">Закрыть</button>';phone.append(dialog);
   terms.querySelector('button').onclick=()=>dialog.showModal();dialog.querySelector('button').onclick=()=>dialog.close();restore.push(()=>{terms.remove();dialog.remove();});
   const updatePhone=()=>{
    window.KeysPhoneMask?.refresh(input);
    const digits=input.value.replace(/\D/g,'');
    field.dataset.state=digits.length===10?'ready':digits.length?'typing':'empty';button.disabled=digits.length!==10;
   };
   updatePhone();input.addEventListener('input',updatePhone);
   restore.push(()=>{input.removeEventListener('input',updatePhone);input.placeholder=placeholder;button.disabled=false;field.before(input);field.remove();window.KeysPhoneMask?.refresh(input);});
  }
  if(guest.dataset.authStep==='code'&&guest.dataset.authAudience!=='partner'){
   const intro=main.querySelector('.kauth-intro'),oldNodes=[...intro.childNodes];
   const number=intro.querySelector('strong')?.textContent||'';
   const back=header.querySelector('[data-auth-back]'),next=back?.nextSibling;
   intro.replaceChildren();const heading=document.createElement('div');heading.className='keys-login-heading';
   if(back)heading.append(back);const title=document.createElement('h1');title.textContent='Код из SMS';heading.append(title);intro.append(heading);
   const sent=document.createElement('p');sent.textContent='Отправили на '+number;intro.append(sent);
   restore.push(()=>{if(intro.isConnected){if(back)header.insertBefore(back,next?.parentNode===header?next:null);intro.replaceChildren(...oldNodes);}});
  }
  if(guest.dataset.authStep==='name'){
   const button=main.querySelector('.kauth-primary'),text=button.textContent;button.textContent='Продолжить';restore.push(()=>button.textContent=text);
  }
  if(isPartner){
   const art=main.querySelector('.kpi-invite-art');
   if(art){const nodes=[...art.childNodes];art.replaceChildren();restore.push(()=>art.replaceChildren(...nodes));}
   const lead=main.querySelector('.kpi-lead');
   if(isInvite&&lead){const old=lead.innerHTML;lead.innerHTML='Отели коллег по тарифам <strong>Friendly Rate</strong>.';restore.push(()=>lead.innerHTML=old);}
   const email=main.querySelector('#keys-partner-email');
   if(email){const label=main.querySelector('label');label?.classList.add('keys-brand-sr');restore.push(()=>label?.classList.remove('keys-brand-sr'));}
  }
  let timer;
  const finish=()=>{clearTimeout(timer);phone.querySelector('.keys-login-splash')?.remove();phone.classList.remove('keys-login-entering');main.inert=false;header.inert=false;};
  cleanup=()=>{finish();restore.forEach(fn=>fn());delete guest.dataset.orbitAuth;};
  if((!isPhone&&!isInvite)||played||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  played=true;
  const splash=createSplash();
  phone.append(splash);main.inert=true;header.inert=true;main.querySelector('input')?.blur();phone.classList.add('keys-login-entering');
  timer=setTimeout(finish,3000);
 }
 async function verification(main,state){
  if(!isOrbit(brand))return;
  main.dataset.orbitVerification=state;
  const status=main.querySelector('[data-auth-code-status]');
  if(status){status.textContent=state==='checking'?'Проверяем код…':state==='success'?'Готово, входим':'';status.setAttribute('role','status');}
  const form=main.querySelector('form'),fields=main.querySelector('.kauth-code-fields');if(fields)fields.inert=state!=='error';form.setAttribute('aria-busy',String(state==='checking'));
  if(state!=='error')await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:state==='checking'?1200:700));
  if(fields)fields.inert=false;form.removeAttribute('aria-busy');
 }
 window.KeysBrand={auth,verification,createSplash};

 function chooseBrand(value){
  brand=allowed(value);played=false;try{localStorage.setItem('keys-brand-variant',brand);}catch{}
  const url=new URL(location.href);url.searchParams.set('brand',brand);history.replaceState(history.state,'',url);sync();auth(document.getElementById('keysGuestPrototype'));
  window.dispatchEvent(new Event('resize'));
 }
 window.addEventListener('popstate',()=>{brand=read();sync();auth(document.getElementById('keysGuestPrototype'));});
 sync();
 auth(document.getElementById('keysGuestPrototype'));
})();
