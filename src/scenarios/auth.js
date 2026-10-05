import {createAuthFlow,formatPhone,PROTOTYPE_CODE} from './auth-model.mjs';
const root=document.getElementById('keysUnifiedPrototype');
const toolbar=document.getElementById('keysScenarioControls');
const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const backIcon=svg('<path d="M19 12H5m7-7-7 7 7 7"/>');
const guest=document.createElement('section');guest.id='keysGuestPrototype';guest.hidden=true;
guest.innerHTML='<div class="kauth-phone"><header class="kauth-header"></header><main class="kauth-main"></main></div>';
root.append(guest);
const note=document.createElement('p');note.className='kauth-prototype-note';note.hidden=true;note.textContent=`Код в прототипе: ${PROTOTYPE_CODE}`;toolbar.after(note);
const header=guest.querySelector('header'),main=guest.querySelector('main');
let flow=createAuthFlow(),timer=null,background=[],completed=false,finishing=false,originals=[];
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
function error(message){
 main.querySelector('[data-auth-error]').textContent=message||'';
 main.querySelector('input').setAttribute('aria-invalid',String(Boolean(message)));
}
function tick(){const button=main.querySelector('[data-auth-resend]');if(!button)return;const seconds=flow.remaining();button.disabled=seconds>0;button.textContent=seconds?`Новый код через ${seconds} с`:'Получить новый код';}
function render(focus=true){
 clearInterval(timer);const {step,phone}=flow.state;guest.dataset.authStep=step;
 note.hidden=step!=='code'||guest.hidden;
 header.innerHTML=step==='phone'?'<span class="kauth-brand">ключи</span>':`<button type="button" class="kauth-back" aria-label="Назад">${backIcon}</button><span class="kauth-header-title">Вход в «Ключи»</span>`;
 if(step==='phone')main.innerHTML=`<figure class="kauth-welcome-art" aria-label="Один ключ — от всех отелей"><img class="kauth-art-hotels" src="./scenarios/auth-art/hotels.png" width="960" height="640" alt="" aria-hidden="true"><img class="kauth-art-key" src="./scenarios/auth-art/key.png" width="512" height="512" alt="" aria-hidden="true"><button type="button" class="kauth-motion-toggle" data-auth-motion aria-label="Приостановить анимацию" aria-pressed="false">${svg('<path d="M9 5v14M15 5v14"/>')}</button></figure><div class="kauth-intro"><h1>Ваша следующая<br>поездка — здесь</h1></div><form novalidate><label for="keys-auth-phone">Номер телефона</label><input id="keys-auth-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 000-00-00" aria-describedby="keys-auth-hint keys-auth-error" required><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Получить код</button><p id="keys-auth-hint" class="kauth-hint kauth-center">Вход и регистрация по коду из СМС</p></form>`;
 if(step==='code')main.innerHTML=`<div class="kauth-intro"><h1>Введите код</h1><p>Из СМС на номер<br><strong>${formatPhone(phone)}</strong></p><button type="button" class="kauth-link" data-auth-edit>Изменить номер</button></div><form novalidate><label for="keys-auth-code">Код из СМС</label><input id="keys-auth-code" class="kauth-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="······" aria-describedby="keys-auth-error" required><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Подтвердить</button><button type="button" class="kauth-resend" data-auth-resend></button><p class="kauth-hint kauth-center" data-auth-code-status role="status"></p></form>`;
 if(step==='name')main.innerHTML=`<div class="kauth-intro"><h1>Как вас зовут?</h1><p>Достаточно вашего имени.</p></div><form novalidate><label for="keys-auth-name">Ваше имя</label><input id="keys-auth-name" name="given-name" type="text" autocomplete="given-name" autocapitalize="words" maxlength="40" placeholder="Например, Анна" aria-describedby="keys-auth-error" required><p id="keys-auth-error" class="kauth-error" data-auth-error role="alert"></p><button type="submit" class="kauth-primary">Начать путешествовать</button></form>`;
 const input=main.querySelector('input');if(step==='phone')input.value=phone?formatPhone(phone):'';
 if(step==='name')input.value=flow.state.name;
 if(step==='code'){tick();timer=setInterval(tick,1000);input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,6);error('');});}
 else input.addEventListener('input',()=>error(''));
 main.querySelector('form').addEventListener('submit',event=>{
  event.preventDefault();const message=step==='phone'?flow.send(input.value):step==='code'?flow.verify(input.value):flow.complete(input.value);
  if(message){error(message);input.focus();return;}
  if(flow.state.step==='done'){
   clearInterval(timer);applyIdentity();finishing=true;window.KeysScenarios.select('search');finishing=false;
   document.querySelector('#keysHomeVariantThree .kse-heading h1')?.setAttribute('tabindex','-1');document.querySelector('#keysHomeVariantThree .kse-heading h1')?.focus({preventScroll:true});
  }else render();
 });
 if(focus)input.focus({preventScroll:true});
}
guest.addEventListener('click',event=>{
 const motion=event.target.closest('[data-auth-motion]');
 if(motion){const art=motion.closest('.kauth-welcome-art'),paused=art.dataset.paused!=='true';art.dataset.paused=String(paused);motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Включить анимацию':'Приостановить анимацию');motion.innerHTML=svg(paused?'<path d="m9 5 10 7-10 7Z"/>':'<path d="M9 5v14M15 5v14"/>');return;}
 if(event.target.closest('.kauth-back,[data-auth-edit]')){flow.back();render();}
 if(event.target.closest('[data-auth-resend]')&&flow.resend()){
  main.querySelector('input').value='';error('');tick();main.querySelector('[data-auth-code-status]').textContent='Можно ввести новый код';main.querySelector('input').focus();
 }
});
function scenarioChanged(){
 const active=document.body.dataset.keysScenario==='guest';
 if(completed&&!finishing)restoreIdentity();
 if(active){
  flow=createAuthFlow();
  if(guest.hidden)background=[...root.children].filter(el=>el!==guest).map(el=>({el,inert:el.inert}));
  guest.hidden=false;background.forEach(({el})=>el.inert=true);
  render(false);
 }else{
  clearInterval(timer);guest.hidden=true;note.hidden=true;background.forEach(({el,inert})=>el.inert=inert);background=[];
 }
}
document.addEventListener('click',event=>{
 if(completed&&event.target.closest('[data-open="logout"]')){event.preventDefault();event.stopImmediatePropagation();window.KeysScenarios.select('guest');}
},true);
root.addEventListener('keys-scenario-change',scenarioChanged);
scenarioChanged();
