import {createAuthFlow,formatPhone,PROTOTYPE_CODE} from './auth-model.mjs';
import {createPartnerInvite} from './partner-invite.js';
import {bindOtpFields} from './otp-fields.mjs';
const root=document.getElementById('keysUnifiedPrototype');
const toolbar=document.getElementById('keysScenarioControls');
const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const backIcon=svg('<path d="M19 12H5m7-7-7 7 7 7"/>');
const guest=document.createElement('section');guest.id='keysGuestPrototype';guest.hidden=true;
guest.innerHTML='<div class="kauth-phone"><header class="kauth-header"></header><main class="kauth-main"></main></div>';
root.append(guest);
const note=document.createElement('p');note.className='kauth-prototype-note';note.hidden=true;note.textContent=`Код в прототипе: ${PROTOTYPE_CODE}`;toolbar.after(note);
const header=guest.querySelector('header'),main=guest.querySelector('main');
const partnerSessionKey='keys-partner-session-v1';
const savePartnerSession=approved=>{try{sessionStorage.setItem(partnerSessionKey,JSON.stringify({name:flow.state.name,phone:flow.state.phone,approved}));}catch{}};
const clearPartnerSession=()=>{try{sessionStorage.removeItem(partnerSessionKey);}catch{}};
let flow=createAuthFlow(),timer=null,background=[],completed=false,finishing=false,originals=[],invited=false,resuming=false,resumeOrigin=null,codeFields=null;
const partner=createPartnerInvite({guest,header,main,svg,onStartAuth:()=>render(),onReady:()=>finishLogin(true),onSkip:()=>finishLogin(false,true)});
const rememberText=(selector,value)=>root.querySelectorAll(selector).forEach(el=>{const children=[...el.childNodes];originals.push(()=>el.replaceChildren(...children));el.textContent=value;});
const rememberAttribute=(selector,key,value)=>root.querySelectorAll(selector).forEach(el=>{const before=el.getAttribute(key);originals.push(()=>before===null?el.removeAttribute(key):el.setAttribute(key,before));el.setAttribute(key,value);});
function restoreIdentity(){originals.forEach(restore=>restore());originals=[];delete document.body.dataset.keysNewGuest;root.querySelectorAll('[data-auth-initial]').forEach(el=>el.remove());completed=false;}
function applyIdentity(){
 const {name,phone}=flow.state;
 rememberText('.keys-profile-name>strong,[data-open="travelerProfile"] strong',name);
 rememberAttribute('.keys-app-profile','aria-label','Профиль');
 rememberAttribute('[data-profile-photo]','aria-label','Загрузить фото профиля');
 rememberText('.keys-profile-contacts dd',formatPhone(phone));
 rememberText('.keys-passport-card>p:first-of-type',name);
 rememberText('.kse-welcome',`Рады видеть вас, ${name}`);
 rememberText('.kd-profile-name',name);
 rememberText('[data-avatar-initials]',name.slice(0,1).toUpperCase());
 root.querySelectorAll('.keys-app-initial').forEach(el=>{const initial=document.createElement('span');initial.dataset.authInitial='';initial.textContent=name.slice(0,1).toUpperCase();el.append(initial);});
 document.body.dataset.keysNewGuest='true';completed=true;
}
function showPartnerStatus(approved){
 root.querySelectorAll('[data-partner-membership]').forEach(el=>el.remove());
 const banner=document.createElement(approved?'section':'button');banner.className='kpi-member-banner';banner.dataset.partnerMembership='';
 if(approved)banner.innerHTML=`<span>${svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>')}<strong>Отельер подтверждён</strong></span><p>Вам доступны тарифы Friendly Rate</p>`;
 else{banner.type='button';banner.dataset.partnerResume='';banner.classList.add('kpi-verify-banner');banner.innerHTML=`<span><strong>Откройте тарифы Friendly Rate</strong>${svg('<path d="m9 5 7 7-7 7"/>')}</span><p>Подтвердите, что вы работаете в отеле</p><span class="kpi-verify-action">Подтвердить статус</span>`;}
 root.querySelector('.kse-heading').after(banner);
 const badge=document.createElement(approved?'span':'button');badge.className='kpi-profile-badge';badge.dataset.partnerMembership='';badge.textContent=approved?'Отельер · подтверждён':'Подтвердить статус отельера';
 if(!approved){badge.type='button';badge.dataset.partnerResume='';}
 root.querySelector('.keys-profile-name').append(badge);
 originals.push(()=>{banner.remove();badge.remove();});
}
function finishLogin(hotelier=false,deferred=false){
 clearInterval(timer);
 if(!completed){
  if(flow.state.registered){rememberText('.keys-profile-contacts dd',formatPhone(flow.state.phone));completed=true;}
  else applyIdentity();
 }
 if(hotelier||deferred){showPartnerStatus(hotelier);savePartnerSession(hotelier);}
 if(resuming){
  resuming=false;delete document.body.dataset.keysPartnerVerification;
  guest.hidden=true;note.hidden=true;background.forEach(({el,inert})=>el.inert=inert);background=[];
  const target=root.querySelector(resumeOrigin==='profile'?'.keys-profile-name [data-partner-membership]':'.kse-home [data-partner-membership]');
  target?.setAttribute('tabindex','0');target?.focus({preventScroll:true});resumeOrigin=null;return;
 }
 finishing=true;window.KeysScenarios.select('search');finishing=false;
 const heading=root.querySelector('.kse-heading h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
}
function resumePartner(trigger){
 if(!completed||resuming)return;
 resumeOrigin=trigger.closest('.keys-profile-name')?'profile':'trips';resuming=true;document.body.dataset.keysPartnerVerification='true';
 background=[...root.children].filter(el=>el!==guest).map(el=>({el,inert:el.inert}));background.forEach(({el})=>el.inert=true);
 guest.hidden=false;partner.resume();
}
function error(message){
 main.querySelector('[data-auth-error]').textContent=message||'';
 main.querySelectorAll('input').forEach(field=>field.setAttribute('aria-invalid',String(Boolean(message))));
}
function tick(){const button=main.querySelector('[data-auth-resend]');if(!button)return;const seconds=flow.remaining();button.disabled=seconds>0;button.textContent=seconds?`Новый код через ${seconds} с`:'Получить новый код';}
function render(focus=true){
 clearInterval(timer);codeFields=null;const {step,phone}=flow.state;guest.dataset.authStep=step;
 note.hidden=step!=='code'||guest.hidden;
 header.innerHTML=step==='phone'?'<span class="kauth-brand">ключи</span>':`<button type="button" class="kauth-back" data-auth-back aria-label="Назад">${backIcon}</button><span class="kauth-header-title">Вход в «Ключи»</span>`;
 if(step==='phone')main.innerHTML=`<figure class="kauth-welcome-art" aria-label="Один ключ — от всех отелей"><img class="kauth-art-hotels" src="./scenarios/auth-art/hotels.png" width="960" height="640" alt="" aria-hidden="true"><img class="kauth-art-key" src="./scenarios/auth-art/key.png" width="512" height="512" alt="" aria-hidden="true"><button type="button" class="kauth-motion-toggle" data-auth-motion aria-label="Приостановить анимацию" aria-pressed="false">${svg('<path d="M9 5v14M15 5v14"/>')}</button></figure><div class="kauth-intro"><h1>Ваша следующая<br>поездка — здесь</h1></div><form novalidate><label for="keys-auth-phone">Номер телефона</label><input id="keys-auth-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 000-00-00" aria-describedby="keys-auth-hint keys-auth-error" required><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Получить код</button><p id="keys-auth-hint" class="kauth-hint kauth-center">Вход и регистрация по коду из СМС</p></form>`;
 if(step==='code')main.innerHTML=`<div class="kauth-intro"><h1>Введите код</h1><p>Отправили СМС на номер</p><div class="kauth-code-contact"><strong>${formatPhone(phone)}</strong><button type="button" class="kauth-link" data-auth-edit>Изменить номер</button></div></div><form novalidate><span id="keys-auth-code-label" class="kauth-code-label">Код из СМС</span><div class="kauth-code-fields" role="group" aria-labelledby="keys-auth-code-label">${Array.from({length:6},(_,i)=>`<input class="kauth-code-digit" name="code-${i+1}" type="text" inputmode="numeric" autocomplete="${i===0?'one-time-code':'off'}" maxlength="6" pattern="[0-9]" aria-label="Цифра ${i+1} из 6" aria-describedby="keys-auth-error" required>`).join('')}</div><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Подтвердить</button><button type="button" class="kauth-resend" data-auth-resend></button><p class="kauth-hint kauth-center" data-auth-code-status role="status"></p></form>`;
 if(step==='name')main.innerHTML=`<div class="kauth-intro"><h1>Как вас зовут?</h1><p>Достаточно вашего имени.</p></div><form novalidate><label for="keys-auth-name">Ваше имя</label><input id="keys-auth-name" name="given-name" type="text" autocomplete="given-name" autocapitalize="words" maxlength="40" placeholder="Например, Анна" aria-describedby="keys-auth-error" required><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Начать путешествовать</button></form>`;
 if(invited&&step==='phone'){
  header.innerHTML=`<button type="button" class="kauth-back" data-auth-invite aria-label="Назад">${backIcon}</button><span class="kauth-header-title">Вход в «Ключи»</span>`;
  main.querySelector('.kauth-welcome-art').remove();
  main.querySelector('.kauth-intro').innerHTML='<h1>Введите номер телефона</h1><p>Отправим код для входа в «Ключи».</p>';
 }
 if(invited){header.insertAdjacentHTML('beforeend','<span class="kpi-edition">Для отельеров</span>');if(step==='name')main.querySelector('.kauth-primary').textContent='Продолжить';}
 const input=main.querySelector('input');if(step==='phone')input.value=phone?formatPhone(phone):'';
 if(step==='name')input.value=flow.state.name;
 if(step==='code'){tick();timer=setInterval(tick,1000);codeFields=bindOtpFields(main.querySelector('.kauth-code-fields'),()=>error(''));}
 else input.addEventListener('input',()=>error(''));
 main.querySelector('form').addEventListener('submit',event=>{
  event.preventDefault();const message=step==='phone'?flow.send(input.value):step==='code'?(codeFields.value().length<6?'Введите все 6 цифр кода.':flow.verify(codeFields.value())):flow.complete(input.value);
  if(message){error(message);if(step==='code')codeFields.focusMissing();else input.focus();return;}
  if(flow.state.step==='done'){
   clearInterval(timer);note.hidden=true;
   if(invited)partner.start(flow.state.phone);else finishLogin();
  }else render();
 });
 guest.querySelector('.kauth-phone').scrollTop=0;
 if(focus)input.focus({preventScroll:true});
}
guest.addEventListener('click',event=>{
 if(event.target.closest('[data-auth-invite]')){partner.invite();return;}
 const motion=event.target.closest('[data-auth-motion]');
 if(motion){const art=motion.closest('.kauth-welcome-art'),paused=art.dataset.paused!=='true';art.dataset.paused=String(paused);motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Включить анимацию':'Приостановить анимацию');motion.innerHTML=svg(paused?'<path d="m9 5 10 7-10 7Z"/>':'<path d="M9 5v14M15 5v14"/>');return;}
 if(event.target.closest('[data-auth-back],[data-auth-edit]')){flow.back();render();}
 if(event.target.closest('[data-auth-resend]')&&flow.resend()){
  codeFields?.reset();error('');tick();main.querySelector('[data-auth-code-status]').textContent='Можно ввести новый код';main.querySelector('input').focus();
 }
});
function scenarioChanged(event){
 const scenario=document.body.dataset.keysScenario;
 const active=['guest','guest-returning','guest-invite'].includes(scenario);invited=scenario==='guest-invite';
 guest.dataset.authAudience=invited?'partner':'guest';
 if(!finishing){if(event)clearPartnerSession();partner.reset();resuming=false;resumeOrigin=null;delete document.body.dataset.keysPartnerVerification;}
 if(completed&&!finishing)restoreIdentity();
 if(active){
  flow=createAuthFlow(undefined,{registeredName:scenario==='guest-returning'?(root.querySelector('.keys-profile-name>strong')?.textContent.trim()||'Татьяна'):''});
  if(guest.hidden)background=[...root.children].filter(el=>el!==guest).map(el=>({el,inert:el.inert}));
  guest.hidden=false;background.forEach(({el})=>el.inert=true);
  if(invited){note.hidden=true;clearInterval(timer);partner.invite();}else render(false);
 }else{
  clearInterval(timer);guest.hidden=true;note.hidden=true;background.forEach(({el,inert})=>el.inert=inert);background=[];
 }
}
document.addEventListener('click',event=>{
 const resume=event.target.closest('[data-partner-resume]');
 if(resume){event.preventDefault();event.stopImmediatePropagation();resumePartner(resume);return;}
 if(completed&&event.target.closest('[data-open="logout"]')){event.preventDefault();event.stopImmediatePropagation();window.KeysScenarios.select(flow.state.registered?'guest-returning':'guest');}
},true);
root.addEventListener('keys-scenario-change',scenarioChanged);
scenarioChanged();

// Keep the deferred reminder across reloads in the same prototype tab.
if(document.body.dataset.keysScenario==='search'){
 try{
  const saved=JSON.parse(sessionStorage.getItem(partnerSessionKey)||'null');
  if(saved&&typeof saved.name==='string'&&saved.name.length<=40&&/^\+7\d{10}$/.test(saved.phone)&&typeof saved.approved==='boolean'){
   Object.assign(flow.state,{name:saved.name,phone:saved.phone,step:'done',verified:true});
   partner.restore(saved.phone);
   guest.hidden=true;applyIdentity();showPartnerStatus(saved.approved);
  }
 }catch{clearPartnerSession();}
}
