/* In-prototype phone simulation. No OS notification permission or real delivery. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype'),catalog=window.KeysPushCatalog;
 if(!app||!catalog)return;
 const toolbar=document.getElementById('keysScenarioControls');
 const controls=document.createElement('div');controls.id='keysPushControls';controls.hidden=true;
 controls.innerHTML='<span class="keys-push-context"></span><div><button type="button" data-push-replay>Показать ещё раз</button><button type="button" data-push-home hidden>Экран телефона</button></div>';
 toolbar.append(controls);
 const stage=document.createElement('section');stage.id='keysPushDemo';stage.hidden=true;stage.setAttribute('aria-label','Экран телефона — демонстрация уведомления');
 const glyph=name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;
 const tile=(label,icon,tone)=>`<span class="keys-phone-app"><span class="keys-phone-app-icon ${tone}">${glyph(icon)}</span><span>${label}</span></span>`;
 const logo='./brand/orbit/app-icon/png/keys-icon-180.png';
 stage.innerHTML=`<div class="keys-push-phone">
  <div class="keys-phone-status" aria-hidden="true"><span>9:41</span><span>${glyph('signal')}${glyph('wifi')}${glyph('battery-full')}</span></div>
  <div class="keys-phone-desktop">
   <div class="keys-phone-widget"><span>Среда, 28 октября</span><strong>Хорошего дня</strong><span>Время планировать новые поездки</span></div>
   <div class="keys-phone-apps">
    <button type="button" class="keys-phone-app" data-push-open-app aria-label="Открыть приложение Ключи"><img src="${logo}" alt="" class="keys-phone-app-icon"><span>Ключи</span><span class="keys-push-badge" hidden>1</span></button>
    ${tile('Календарь','calendar-days','is-light')}${tile('Фото','images','is-blue')}${tile('Камера','camera','is-light')}
    ${tile('Карты','map','is-green')}${tile('Погода','cloud-sun','is-blue')}${tile('Часы','clock','is-dark')}${tile('Настройки','settings','is-light')}
   </div>
   <div class="keys-phone-dock" aria-hidden="true">${tile('Телефон','phone','is-green')}${tile('Сообщения','message-circle','is-green')}${tile('Браузер','compass','is-blue')}${tile('Почта','mail','is-blue')}</div>
  </div>
  <div class="keys-push-banner" hidden>
   <button type="button" class="keys-push-open" data-push-open>
    <span class="keys-push-meta"><img src="${logo}" alt=""><span>Ключи</span><span>сейчас</span></span>
    <strong class="keys-push-title"></strong><span class="keys-push-body"></span>
   </button>
   <button type="button" class="keys-push-dismiss" aria-label="Скрыть уведомление">${glyph('x')}</button>
  </div>
  <div class="keys-phone-indicator" aria-hidden="true"></div>
 </div><p class="keys-push-hint">Нажмите на уведомление, чтобы открыть его в «Ключах»</p><span class="keys-push-announcement" role="status" aria-live="polite" aria-atomic="true"></span>`;
 app.after(stage);
 const phone=stage.querySelector('.keys-push-phone'),banner=stage.querySelector('.keys-push-banner'),badge=stage.querySelector('.keys-push-badge'),status=stage.querySelector('[role=status]');
 const replay=controls.querySelector('[data-push-replay]'),home=controls.querySelector('[data-push-home]');
 const delivery=catalog.createDelivery();
 const active=()=>document.body.dataset.keysSelectedScenario==='notifications';
 const selected=()=>catalog.get(document.body.dataset.keysPushType);
 let opened=false;
 const hideBanner=()=>{banner.hidden=true;banner.classList.remove('is-visible');};
 const resize=()=>{
  if(!active())return;
  const compact=matchMedia('(max-width:520px)').matches;
  const top=Math.max(toolbar.getBoundingClientRect().bottom,stage.getBoundingClientRect().top);
  const available=(window.visualViewport?.height||innerHeight)-Math.max(0,top)-(compact?42:72);
  const height=Math.max(480,Math.min(844,available));
  phone.style.height=height+'px';
  phone.classList.toggle('is-compact',height<620);
 };
 const showPhone=()=>{
  if(!active())return;
  opened=false;document.body.dataset.keysPushSurface='phone';stage.hidden=false;app.inert=true;home.hidden=true;
  status.textContent='';hideBanner();badge.hidden=true;resize();
  replay.textContent='Показать ещё раз';
  delivery.schedule(()=>{
   if(!active()||opened)return;
   const item=selected();window.KeysSystemInbox.receive(item.id);banner.hidden=false;banner.classList.add('is-visible');badge.hidden=false;
   status.textContent=`Уведомление от «Ключей». ${item.title}. ${item.body}`;
  });
 };
 const revealApp=()=>{
  delivery.cancel();hideBanner();badge.hidden=true;opened=true;document.body.dataset.keysPushSurface='app';stage.hidden=true;app.inert=false;home.hidden=false;
  app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'trip'}}));
 };
 const openNotification=id=>{
  const item=window.KeysNotificationModel.get(id);if(!item)return;
  window.KeysSystemInbox.markRead(id);
  if(document.body.dataset.keysScenario!==item.scenario)window.KeysScenarios.select(item.scenario,{preserveView:true});
  if(active())revealApp();
  window.KeysHomeViews.close();
  app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'trip'}}));
  const target=item.target;
  if(target==='hotel')app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'find',hotelId:item.hotelId}}));
  else if(target==='history-review')window.KeysProfile.open('review',item.tripId);
  else if(target==='review')app.dispatchEvent(new CustomEvent('keys-open-trip-review',{detail:{trigger:home}}));
  else if(target==='benefits')app.dispatchEvent(new CustomEvent('keys-open-benefits'));
  else if(target==='upgrade')app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'find',hotelId:'maidens'}}));
  else if(target==='search')app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'find',hotelId:'maidens'}}));
  else if(target==='cancelled')window.KeysProfile.open('trip','moscow-cancelled');
  else if(target==='favorites')app.querySelector('[data-header-action="favorites"]')?.click();
  else if(target==='instruction')app.querySelector('.kpa-home [data-before="instruction"]')?.click();
  else if(target==='services')app.querySelector('.kpa-services-all')?.click();
  else if(target==='details')app.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'booking'}}));
 };
 stage.querySelector('[data-push-open]').addEventListener('click',()=>openNotification(selected().id));
 window.addEventListener('message',event=>{
  if(event.source!==document.getElementById('keysSectionsFrame')?.contentWindow||event.origin!==location.origin||event.data?.source!=='keys-arbana')return;
  if(event.data.type==='system-notification-open')openNotification(event.data.id);
 });
 stage.querySelector('[data-push-open-app]').addEventListener('click',revealApp);
 stage.querySelector('.keys-push-dismiss').addEventListener('click',()=>{delivery.cancel();hideBanner();stage.querySelector('[data-push-open-app]').focus({preventScroll:true});});
 stage.addEventListener('keydown',event=>{if(event.key==='Escape'&&!banner.hidden){delivery.cancel();hideBanner();stage.querySelector('[data-push-open-app]').focus({preventScroll:true});}});
 replay.addEventListener('click',showPhone);home.addEventListener('click',showPhone);
 const sync=()=>{
  delivery.cancel();hideBanner();controls.hidden=!active();stage.hidden=!active();
  if(!active()){delete document.body.dataset.keysPushSurface;app.inert=document.body.dataset.keysImplemented==='false';return;}
  try{if(!localStorage.getItem('keys-notification-examples-v1')){for(const id of ['demo-more-price','demo-more-review','stay-points','transfer-services'])window.KeysSystemInbox.receive(id);localStorage.setItem('keys-notification-examples-v1','1');}}catch{}
  const item=selected();stage.querySelector('.keys-push-title').textContent=item.title;stage.querySelector('.keys-push-body').textContent=item.body;
  stage.querySelector('[data-push-open]').setAttribute('aria-label',`${item.title}. ${item.body} Открыть уведомление`);
  controls.querySelector('.keys-push-context').textContent=item.timing;
  showPhone();
 };
 app.addEventListener('keys-scenario-change',sync);
 window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);new ResizeObserver(resize).observe(toolbar);
 window.lucide?.createIcons({root:stage});sync();
})();
