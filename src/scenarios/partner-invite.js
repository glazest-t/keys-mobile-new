import {escapePartnerText} from './partner-sharing.mjs';
import {partnerInviter} from './partner-benefits.js';
import {createPartnerVerification} from './partner-model.mjs';
import {readPartnerRequest,writePartnerRequest,matchingPartnerDecision,partnerRequestKey} from './partner-bridge.mjs';
import {formatPhone} from './auth-model.mjs';
export function createPartnerInvite({guest,header,main,svg,onStartAuth,onReady,onSkip,onStateChange=()=>{}}){
 const model=createPartnerVerification();
 let externalWindow=null;
 const check=svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>');
 const clock=svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
 const shield=svg('<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>');
 const back=svg('<path d="M19 12H5m7-7-7 7 7 7"/>');
 function shell(title,canBack=true,view='verification'){
  guest.dataset.authStep='partner';guest.dataset.authAudience='partner';guest.dataset.partnerView=view;
  header.innerHTML=`${canBack?`<button type="button" class="kauth-back" data-partner-back aria-label="Назад">${back}</button>`:''}${view!=='invite'?`<button type="button" class="kauth-back kpi-close" data-partner-close aria-label="Закрыть и вернуться в приложение">${svg('<path d="m6 6 12 12M6 18 18 6"/>')}</button>`:''}`;
  decorateHeader();
  main.innerHTML=`<div class="kauth-intro"><h1 tabindex="-1">${title}</h1></div>`;
 }
 function decorateHeader(){
  header.querySelectorAll('.kauth-brand,.kauth-header-title,.kpi-edition,.kpi-brand-lockup').forEach(el=>el.remove());
  header.insertAdjacentHTML('afterbegin','<div class="kpi-brand-lockup"><span class="kpi-logo" aria-label="Ключи"><img src="./brand/orbit/login/symbol.svg" alt=""><span>ключи</span></span><span class="kpi-edition">Для отельеров</span></div>');
 }
 function account(){return '<div class="kpi-account"><div class="kpi-account-heading"><span>Аккаунт TravelLine</span><button type="button" class="kauth-link" data-partner-email>Изменить почту</button></div><strong data-partner-email-value></strong></div>';}
 function expireRequest(){const old=readPartnerRequest(localStorage,model.state.requestToken);if(old?.status==='pending')writePartnerRequest(localStorage,{...old,status:'expired'});}
 function syncExternal(){const request=readPartnerRequest(localStorage,model.state.requestToken);if(matchingPartnerDecision(model.state,request))decide(request.requestId,request.status==='approved');}
 window.addEventListener('storage',event=>{if(event.key===partnerRequestKey(model.state.requestToken))syncExternal();});
 window.addEventListener('focus',syncExternal);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncExternal();});
 function extranet(){
  syncExternal();if(model.state.status!=='pending')return;
  const {requestToken:token,requestId,email,phone}=model.state;
  const request=readPartnerRequest(localStorage,token);
  if(!request&&!writePartnerRequest(localStorage,{token,requestId,email,phone,status:'pending'})){main.querySelector('[data-partner-external-hint]').textContent='Не удалось открыть запрос. Разрешите локальное хранилище браузера и попробуйте снова.';return;}
  externalWindow=window.open(new URL('./partner-extranet.html#'+token,import.meta.url).href,'keys-travelline-'+token);
  main.querySelector('[data-partner-external-hint]').textContent=externalWindow?'Личный кабинет открыт в новой вкладке. После решения статус обновится здесь.':'Разрешите открытие новой вкладки и нажмите кнопку ещё раз.';
 }
 function focus(){window.KeysBrand?.auth(guest);main.querySelector('input,h1')?.focus({preventScroll:true});guest.querySelector('.kauth-phone').scrollTop=0;}
 function invite(){
  expireRequest();model.reset();shell('Свои отели.<br>Особые условия.',false,'invite');
  main.querySelector('.kauth-intro').insertAdjacentHTML('beforebegin','<div class="kpi-invite-art" aria-hidden="true"><img src="./scenarios/auth-art/hotels.png" alt=""><img src="./scenarios/auth-art/key.png" alt=""></div>');
  main.insertAdjacentHTML('beforeend',`<p class="kpi-lead">Закрытая версия «Ключей» для отельеров с тарифами <strong>Friendly Rate</strong>.</p><section class="kpi-invitation" aria-label="Персональное приглашение"><span class="kpi-kicker">Персональное приглашение</span><div><span>Приглашение от</span><strong>${escapePartnerText(partnerInviter.name)}</strong><span>${escapePartnerText(partnerInviter.hotel)} · TravelLine Partners Club</span></div></section><button type="button" class="kauth-primary" data-partner-start>Принять приглашение</button><button type="button" class="kauth-link kpi-skip" data-partner-invite-skip>Пропустить</button>`);
  window.KeysBrand?.auth(guest);
 }
 function introduction(){
  shell('Вы работаете в отеле?',false);
  main.querySelector('.kauth-intro').insertAdjacentHTML('afterbegin',`<span class="kpi-eyebrow">${shield}<span>Статус отельера</span></span>`);
  main.insertAdjacentHTML('beforeend','<p class="kpi-lead">Подтвердите аккаунт в TravelLine, чтобы бронировать отели коллег по закрытым тарифам <strong>Friendly Rate</strong>.</p><button type="button" class="kauth-primary" data-partner-email>Подтвердить</button><button type="button" class="kauth-link kpi-skip" data-partner-skip>Пропустить</button>');focus();
 }
 function email(){
  expireRequest();model.edit();onStateChange();shell('Введите рабочий email');
  main.insertAdjacentHTML('beforeend','<p class="kpi-lead">Укажите почту, под которой вы входите в личный кабинет (экстранет) <strong>TravelLine</strong>.</p><form novalidate><label for="keys-partner-email">Рабочий email</label><input id="keys-partner-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@hotel.ru" aria-describedby="keys-partner-error" required><p class="kauth-error" id="keys-partner-error" role="alert"></p><button type="submit" class="kauth-primary">Отправить запрос</button></form>');
  const input=main.querySelector('input');input.value=model.state.email;
  input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');main.querySelector('[role="alert"]').textContent='';});
  main.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const error=model.request(input.value);if(error){main.querySelector('[role="alert"]').textContent=error;input.setAttribute('aria-invalid','true');input.focus();return;}onStateChange();waiting();});focus();
 }
 function waiting(){
  shell('Подтвердите привязку в TravelLine',true,'pending');
  main.insertAdjacentHTML('beforeend',`<p class="kpi-lead">Откройте уведомление в личном кабинете TravelLine и подтвердите связывание.</p><section class="kpi-request-card" aria-label="Статус запроса"><span class="kpi-status" role="status">${clock}<span>Ожидаем подтверждение</span></span>${account()}</section><p class="kauth-hint" data-partner-external-hint>Личный кабинет откроется в новой вкладке.</p><button type="button" class="kauth-primary" data-partner-open>Перейти в личный кабинет</button><button type="button" class="kauth-link kpi-skip" data-partner-close>Вернуться в приложение</button>`);
  main.querySelector('[data-partner-email-value]').textContent=model.state.email;focus();
 }
 function decide(id,approved){
  if(!model.decide(id,approved))return;
  onStateChange();if(!guest.hidden)result();
 }
 function result(){
  const approved=model.state.status==='approved';
  shell(approved?'Привязка подтверждена':'Привязка отклонена',false,approved?'approved':'rejected');
  main.insertAdjacentHTML('beforeend',approved?`<div class="kpi-confirmed" role="status">${check}<span><strong>Отельер</strong><span>Статус подтверждён</span></span></div><p class="kpi-lead">Тарифы <strong>Friendly Rate</strong> разблокированы во всей сети партнёров TravelLine.</p><button type="button" class="kauth-primary" data-partner-finish>Перейти в приложение</button>`:`<p class="kpi-lead">Аккаунт TravelLine не подтвердил запрос. Проверьте почту или отправьте запрос повторно.</p>${account()}<button type="button" class="kauth-primary" data-partner-retry>Отправить повторно</button>`);
  if(!approved)main.querySelector('[data-partner-email-value]').textContent=model.state.email;
  focus();guest.querySelector('.kauth-phone').scrollIntoView({block:'nearest',behavior:'auto'});
 }
 function leave(){if(!['pending','approved','rejected'].includes(model.state.status))model.defer();if(model.state.status==='approved')onReady();else onSkip();}
 guest.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-partner-invite-skip')){window.KeysScenarios.select('guest');return;}
  if(button.hasAttribute('data-partner-start')){onStartAuth();}
  if(button.hasAttribute('data-partner-skip')&&model.defer()){onSkip();}
  if(button.hasAttribute('data-partner-email'))email();
  if(button.hasAttribute('data-partner-back')){if(model.state.status==='email')introduction();else leave();}
  if(button.hasAttribute('data-partner-retry')){model.request(model.state.email);onStateChange();waiting();}
  if(button.hasAttribute('data-partner-open'))extranet();
  if(button.hasAttribute('data-partner-close'))leave();
  if(button.hasAttribute('data-partner-finish')&&model.state.status==='approved'){onReady();}
 });
 return {invite,decorateHeader,restore(phone,saved){model.restore(phone,saved);syncExternal();},get snapshot(){return {...model.state};},resume(){if(model.state.status==='pending')waiting();else if(['approved','rejected'].includes(model.state.status))result();else introduction();},start(phone){model.start(phone);introduction();},reset(){expireRequest();model.reset();},get approved(){return model.state.status==='approved';}};
}
