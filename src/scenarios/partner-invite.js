import {createPartnerVerification} from './partner-model.mjs';
import {formatPhone} from './auth-model.mjs';
export function createPartnerInvite({guest,header,main,svg,onStartAuth,onReady,onSkip}){
 const model=createPartnerVerification();
 const side=document.createElement('aside');side.className='kpi-extranet';side.hidden=true;side.setAttribute('aria-label','Имитация личного кабинета TravelLine');guest.append(side);
 const check=svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>');
 const clock=svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
 const shield=svg('<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>');
 const back=svg('<path d="M19 12H5m7-7-7 7 7 7"/>');
 function shell(title,canBack=true,view='verification'){
  guest.dataset.authStep='partner';guest.dataset.authAudience='partner';guest.dataset.partnerView=view;
  header.innerHTML=`${canBack?`<button type="button" class="kauth-back" data-partner-back aria-label="Назад">${back}</button>`:'<span class="kauth-brand">ключи</span>'}<span class="kpi-edition">Для отельеров</span>`;
  main.innerHTML=`<div class="kauth-intro"><h1 tabindex="-1">${title}</h1></div>`;
 }
 function focus(){main.querySelector('input,h1')?.focus({preventScroll:true});guest.querySelector('.kauth-phone').scrollTop=0;}
 function invite(){
  model.reset();side.hidden=true;guest.classList.remove('has-extranet');shell('Свои отели.<br>Особые условия.',false,'invite');
  main.querySelector('.kauth-intro').insertAdjacentHTML('beforebegin','<div class="kpi-invite-art" aria-hidden="true"><img src="./scenarios/auth-art/hotels.png" alt=""><img src="./scenarios/auth-art/key.png" alt=""></div>');
  main.insertAdjacentHTML('beforeend',`<p class="kpi-lead">Закрытая версия «Ключей» для отельеров с тарифами <strong>Friendly Rate</strong>.</p><section class="kpi-invitation" aria-label="Персональное приглашение"><span class="kpi-kicker">Персональное приглашение</span><div><span>Приглашение от</span><strong>TravelLine Partners Club</strong></div><p>Действительно ещё <strong>6 дней</strong></p></section><button type="button" class="kauth-primary" data-partner-start>Принять приглашение</button>`);
 }
 function introduction(){
  side.hidden=true;guest.classList.remove('has-extranet');shell('Вы работаете в отеле?',false);
  main.querySelector('.kauth-intro').insertAdjacentHTML('afterbegin',`<span class="kpi-eyebrow">${shield}<span>Статус отельера</span></span>`);
  main.insertAdjacentHTML('beforeend','<p class="kpi-lead">Подтвердите аккаунт в TravelLine, чтобы бронировать отели коллег по закрытым тарифам <strong>Friendly Rate</strong>.</p><button type="button" class="kauth-primary" data-partner-email>Подтвердить</button><button type="button" class="kauth-link kpi-skip" data-partner-skip>Пропустить</button>');focus();
 }
 function email(){
  model.edit();side.hidden=true;guest.classList.remove('has-extranet');shell('Введите рабочий email');
  main.insertAdjacentHTML('beforeend','<p class="kpi-lead">Укажите почту, под которой вы входите в личный кабинет (экстранет) <strong>TravelLine</strong>.</p><form novalidate><label for="keys-partner-email">Рабочий email</label><input id="keys-partner-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@hotel.ru" aria-describedby="keys-partner-error" required><p class="kauth-error" id="keys-partner-error" role="alert"></p><button type="submit" class="kauth-primary">Отправить запрос</button></form>');
  const input=main.querySelector('input');input.value=model.state.email;
  input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');main.querySelector('[role="alert"]').textContent='';});
  main.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const error=model.request(input.value);if(error){main.querySelector('[role="alert"]').textContent=error;input.setAttribute('aria-invalid','true');input.focus();return;}waiting();});focus();
 }
 function extranet(){
  const {status,email,phone,requestId}=model.state;side.hidden=false;guest.classList.add('has-extranet');
  side.innerHTML=`<p class="kpi-simulation">Вспомогательный экран · имитация ЛК</p><div class="kpi-web-shell"><header><strong>TravelLine</strong><span>Личный кабинет</span></header><div class="kpi-web-content"><span class="kpi-web-account"></span><h2>Уведомления</h2><article class="kpi-web-request"><span class="kpi-kicker">Ключи · Friendly Rate</span><h3>${status==='pending'?'Запрос на привязку аккаунта':status==='approved'?'Аккаунт связан':'Запрос отклонён'}</h3><p>Пользователь с номером телефона <strong>${formatPhone(phone)}</strong> запрашивает привязку к вашей учётной записи.</p>${status==='pending'?'<div class="kpi-web-actions"><button type="button" class="kauth-primary" data-partner-approve>Подтвердить связывание</button><button type="button" class="kpi-secondary" data-partner-reject>Отклонить</button></div>':`<p class="kpi-web-result" role="status">${status==='approved'?'Привязка подтверждена. Статус в приложении обновлён.':'Привязка отклонена. Закрытые тарифы недоступны.'}</p>`}</article></div></div>`;
  side.querySelector('.kpi-web-account').textContent=email;
  side.querySelector('[data-partner-approve]')?.addEventListener('click',()=>decide(requestId,true));
  side.querySelector('[data-partner-reject]')?.addEventListener('click',()=>decide(requestId,false));
 }
 function waiting(){
  shell('Подтвердите привязку в TravelLine',true,'pending');
  main.insertAdjacentHTML('beforeend',`<p class="kpi-lead">Откройте уведомление в личном кабинете TravelLine и подтвердите связывание.</p><section class="kpi-request-card" aria-label="Статус запроса"><span class="kpi-status" role="status">${clock}<span>Ожидаем подтверждение</span></span><div class="kpi-account"><span>Аккаунт TravelLine</span><strong data-partner-email-value></strong></div></section><p class="kauth-hint">Этот экран обновится автоматически.</p><button type="button" class="kauth-link" data-partner-email>Изменить email</button><button type="button" class="kpi-secondary kpi-open-extranet" data-partner-open>Открыть экран ЛК TravelLine</button>`);
  main.querySelector('[data-partner-email-value]').textContent=model.state.email;extranet();focus();
 }
 function decide(id,approved){
  if(!model.decide(id,approved))return;
  shell(approved?'Вы — в кругу своих':'Привязка отклонена',false,approved?'approved':'rejected');
  main.insertAdjacentHTML('beforeend',approved?`<div class="kpi-confirmed" role="status">${check}<span><strong>Отельер</strong><span>Статус подтверждён</span></span></div><p class="kpi-lead">Тарифы <strong>Friendly Rate</strong> разблокированы во всей сети партнёров TravelLine.</p><button type="button" class="kauth-primary" data-partner-finish>Перейти в приложение</button>`:'<p class="kpi-lead">Аккаунт TravelLine не подтвердил запрос. Проверьте почту или отправьте запрос повторно.</p><div class="kpi-account"><span>Аккаунт TravelLine</span><strong data-partner-email-value></strong></div><button type="button" class="kauth-primary" data-partner-retry>Отправить повторно</button><button type="button" class="kauth-link" data-partner-email>Изменить email</button>');
  if(!approved)main.querySelector('[data-partner-email-value]').textContent=model.state.email;
  extranet();focus();guest.querySelector('.kauth-phone').scrollIntoView({block:'nearest',behavior:'auto'});
 }
 guest.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-partner-start')){onStartAuth();}
  if(button.hasAttribute('data-partner-skip')&&model.defer()){side.hidden=true;guest.classList.remove('has-extranet');onSkip();}
  if(button.hasAttribute('data-partner-email'))email();
  if(button.hasAttribute('data-partner-back')){if(model.state.status==='email')introduction();else email();}
  if(button.hasAttribute('data-partner-retry')){model.request(model.state.email);waiting();}
  if(button.hasAttribute('data-partner-open')){side.scrollIntoView({block:'start',behavior:'smooth'});side.querySelector('[data-partner-approve]')?.focus({preventScroll:true});}
  if(button.hasAttribute('data-partner-finish')&&model.state.status==='approved'){side.hidden=true;guest.classList.remove('has-extranet');onReady();}
 });
 return {invite,restore(phone){model.start(phone);model.defer();},resume(){introduction();},start(phone){model.start(phone);introduction();},reset(){model.reset();side.hidden=true;guest.classList.remove('has-extranet');},get approved(){return model.state.status==='approved';}};
}
