import icons from './icons.mjs';
import {initialState,hydrate,fullName,validateTraveler,saveTraveler,removeTraveler,collectTrips,tripStatusLabels,filterTrips,articles} from './model.mjs';
const root=document.getElementById('keysUnifiedPrototype');
const phone=root?.querySelector('.kf-phone[data-screen="profile"]');
if(phone)setup();
function setup(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.doc}</svg>`;
 const money=n=>Number(n).toLocaleString('ru-RU')+' ₽';
 const date=value=>value?new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}):'Не указана';
 const dates=t=>`${new Date(t.arrival+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'})} — ${new Date(t.departure+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'})}`;
 const primaryButton=(label,attrs='')=>`<button type="button" class="kpf-primary" ${attrs}>${label}</button>`;
 const action=(label,attrs='',danger=false)=>`<button type="button" class="kpf-text${danger?' kpf-danger':''}" ${attrs}>${label}</button>`;
 const row=(name,title,sub,attrs='',extra='')=>`<button type="button" class="kpf-row" ${attrs}>${icon(name)}<span><strong>${title}</strong>${sub?`<small>${sub}</small>`:''}</span>${extra||icon('chevron')}</button>`;
 const card=(content,cls='')=>`<section class="kpf-card ${cls}">${content}</section>`;
 const section=(heading,content,sub='')=>`<section class="kpf-section"><h2>${heading}</h2>${sub?`<p class="kpf-muted">${sub}</p>`:''}${content}</section>`;
 const badge=(text,tone='')=>`<span class="kpf-badge ${tone}">${text}</span>`;
 const empty=(title,text)=>`<div class="kpf-empty">${icon('search')}<h2>${title}</h2><p>${text}</p></div>`;
 const field=(name,label,value='',type='text',extra='',hint='')=>`<div class="kpf-field"><label for="kpf-${name}">${label}</label><input id="kpf-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra} aria-describedby="kpf-${name}-error${hint?' kpf-'+name+'-hint':''}">${hint?`<small id="kpf-${name}-hint">${hint}</small>`:''}<small class="kpf-error" id="kpf-${name}-error"></small></div>`;
 const select=(name,label,values,value)=>`<div class="kpf-field"><label for="kpf-${name}">${label}</label><select id="kpf-${name}" name="${name}">${values.map(([v,t])=>`<option value="${v}"${v===value?' selected':''}>${t}</option>`).join('')}</select></div>`;
 const toggle=(group,key,title,sub)=>`<label class="kpf-switch-row"><span><strong>${title}</strong><small>${sub}</small></span><input type="checkbox" role="switch" data-setting="${group}.${key}" aria-label="${title}"${state[group][key]?' checked':''}><span class="kpf-switch" aria-hidden="true"></span></label>`;
 const info=(title,text,name='shield')=>`<div class="kpf-info">${icon(name)}<div><strong>${title}</strong><p>${text}</p></div></div>`;
 const allTrips=()=>collectTrips({scenario:document.body.dataset.keysScenario,host:window.KeysHostBookingModel?.(),created:window.KeysTripBookings||[],today:document.body.dataset.keysScenario==='after'?'2026-09-20':document.body.dataset.keysScenario==='booked'?'2026-09-12':'2026-09-13'});
 const tripById=id=>allTrips().find(t=>t.id===id);
 let state=initialState(),storageKey='',route=null,dirty=false,returnFocus=null,returnSection=null,toastTimer,lastScenario=scenarioStamp(),filter={query:'',status:'all'},helpQuery='',helpCategory='Все';
 const page=document.createElement('section');page.className='kpf';page.hidden=true;page.setAttribute('aria-label','Раздел профиля');phone.append(page);
 const dialog=document.createElement('dialog');dialog.className='kpf-dialog';phone.append(dialog);
 const toast=document.createElement('p');toast.className='kpf-toast';toast.setAttribute('role','status');toast.hidden=true;phone.append(toast);
 function notify(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,4200);}
 function readState(){
  const tel=phone.querySelector('.keys-profile-contacts dd')?.textContent.replace(/\D/g,'')||'demo';
  const key='keys-profile-settings-v1:'+tel;if(key===storageKey)return;storageKey=key;
  try{state=hydrate(JSON.parse(localStorage.getItem(key)||'null'));}catch{state=initialState();}
  if(!localStorageAvailableValue(key)){const name=phone.querySelector('.keys-profile-name>strong')?.textContent.trim().split(/\s+/)||[];if(name.length>=2){state.travelers[0].firstName=name[0];state.travelers[0].lastName=name.slice(1).join(' ');}}
  refreshRoot();
 }
 function localStorageAvailableValue(key){try{return localStorage.getItem(key);}catch{return null;}}
 function persist(next=state,message='Изменения сохранены'){
  state=next;let saved=true;try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{saved=false;}
  refreshRoot();if(message)notify(saved?message:'Изменения действуют до перезагрузки: хранилище браузера недоступно.');return saved;
 }
 function refreshRoot(){
  const primary=state.travelers.find(p=>p.primary);if(!primary)return;
  for(const [key,label] of Object.entries({notifications:'Брони, сообщения и услуги',security:'Вход и активные устройства',dataManagement:'Приватность и удаление аккаунта',language:state.language==='en'?'English':'Русский'})){const caption=phone.querySelector('[data-open="'+key+'"] small');if(caption)caption.textContent=label;}
  const cardEl=phone.querySelector('[data-open="travelerProfile"]')?.closest('.kf-card');
  if(cardEl){const original=cardEl.querySelector('[data-open="travelerProfile"]');original.querySelector('strong').textContent=fullName(primary);cardEl.querySelectorAll('[data-kpf-traveler]').forEach(el=>el.remove());
   const add=cardEl.querySelector('[data-open="addTraveler"]');state.travelers.filter(p=>!p.primary).slice(0,2).forEach(p=>{const b=document.createElement('button');b.type='button';b.className='kf-row';b.dataset.kpfTraveler=p.id;b.innerHTML=`<span class="kf-icon blue">${icon('user')}</span><span><strong>${esc(fullName(p))}</strong><small>${p.birthDate?date(p.birthDate):'Данные путешественника'}</small></span><b class="kf-chevron">${icon('chevron')}</b>`;add.before(b);});
  }
  const profileName=phone.querySelector('.keys-profile-name>strong');if(profileName)profileName.textContent=fullName(primary);
 }
 function ask(title,body,label,callback,danger=false){
  dialog.innerHTML=`<form method="dialog"><h2 id="kpf-confirm-title">${esc(title)}</h2><p>${body}</p><div class="kpf-dialog-actions"><button value="cancel" class="kpf-secondary">Отмена</button><button value="confirm" class="${danger?'kpf-danger-button':'kpf-primary'}">${label}</button></div></form>`;
  dialog.setAttribute('aria-labelledby','kpf-confirm-title');dialog.onclose=()=>{if(dialog.returnValue==='confirm')callback();};dialog.returnValue='';dialog.showModal();dialog.setAttribute('tabindex','-1');dialog.focus({preventScroll:true});
 }
 function scenarioStamp(){const q=new URLSearchParams(location.search);return [q.get('scenario'),q.get('stayDay'),q.get('loyalty')].join('|');}
 function guard(fn){if(dirty)ask('Уйти без сохранения?','Вы внесли изменения, но ещё не сохранили их. Можно вернуться к форме или уйти без сохранения.','Не сохранять',()=>{dirty=false;fn();});else fn();}
 const encodeRoute=r=>r?'#profile/'+r.name+(r.id?'/'+encodeURIComponent(r.id):''):'';
 function parseRoute(){const parts=location.hash.slice(1).split('/');return parts[0]==='profile'&&parts[1]?{name:parts[1],id:parts[2]?decodeURIComponent(parts[2]):null}:null;}
 function navigate(name,id=null,{replace=false,from=null}={}){
  guard(()=>{readState();if(!route){returnFocus=document.activeElement;returnSection=from;}route={name,id};const url=new URL(location.href);url.hash=encodeRoute(route);const depth=(history.state?.keysProfileDepth||0)+(replace?0:1);history[replace?'replaceState':'pushState']({...history.state,keysProfileDepth:depth,keysProfileReturn:returnSection},'',url);root.dispatchEvent(new CustomEvent('keys-open-profile'));render();});
 }
 function close(){route=null;dirty=false;phone.classList.remove('kpf-open');page.hidden=true;phone.querySelector(':scope>.kf-scroll').inert=false;phone.querySelector('.keys-profile-header').inert=false;returnFocus?.isConnected&&returnFocus.focus({preventScroll:true});}
 function returnToEntry(){
  root.dispatchEvent(new CustomEvent(returnSection==='trips'?'keys-profile-action':'keys-open-profile',{detail:{action:'trip'}}));
  returnFocus?.isConnected&&returnFocus.focus({preventScroll:true});returnSection=null;
 }
 function back(){guard(()=>{if(history.state?.keysProfileDepth>0)history.back();else{const parent={traveler:'travelers',edit:'travelers',trip:'history',review:'history',article:'help',contact:'help',ticket:'help',devices:'security',pin:'security',delete:'data'}[route.name];if(parent)navigate(parent,null,{replace:true});else{const url=new URL(location.href);url.hash='';history.replaceState(history.state,'',url);close();returnToEntry();}}});}
 function shell(title,body,{footer='',right='',wide=false}={}){
  page.classList.remove('kpf-booking-details');
  page.innerHTML=`<header class="kpf-header"><button type="button" class="kpf-back" data-action="back" aria-label="Назад">${icon('back')}</button><h1 tabindex="-1">${title}</h1>${right}</header><main class="kpf-content${wide?' kpf-wide':''}">${body}</main>${footer?`<footer class="kpf-footer">${footer}</footer>`:''}`;
  page.hidden=false;phone.classList.add('kpf-open');phone.querySelector(':scope>.kf-scroll').inert=true;phone.querySelector('.keys-profile-header').inert=true;page.querySelector('h1').focus({preventScroll:true});page.querySelector('.kpf-content').scrollTop=0;
  if(document.body.dataset.keysView==='desktop')window.scrollTo({top:0,behavior:'instant'});
 }
 function personDetail(p){return `<dl class="kpf-details">${[['Фамилия',p.lastName],['Имя',p.firstName],['Отчество',p.middleName||'Не указано'],['Дата рождения',date(p.birthDate)],['Гражданство',p.citizenship||'Не указано'],['Телефон',p.phone||'Не указан'],['Электронная почта',p.email||'Не указана']].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;}
 function travelerForm(p={}){
  return `<form id="kpf-traveler-form" data-form="traveler" novalidate><p class="kpf-lead">Укажите имя и фамилию как в документе. Остальное можно добавить позже.</p>${card(`<h2>Личные данные</h2><div class="kpf-fields">${field('lastName','Фамилия',p.lastName,'text','required autocomplete="family-name" maxlength="60"')}${field('firstName','Имя',p.firstName,'text','required autocomplete="given-name" maxlength="60"')}${field('middleName','Отчество · необязательно',p.middleName,'text','autocomplete="additional-name" maxlength="60"')}${field('birthDate','Дата рождения · необязательно',p.birthDate,'date','min="1900-01-01" max="'+new Date().toISOString().slice(0,10)+'" autocomplete="bday"')}${field('citizenship','Гражданство',p.citizenship||'Россия','text','autocomplete="country-name" maxlength="80"')}</div>`,'kpf-padded')}${card(`<h2>Контакты</h2><p class="kpf-muted">Необязательно. Для связи по поездке.</p><div class="kpf-fields">${field('phone','Телефон',p.phone,'tel','autocomplete="tel" placeholder="+7 900 000-00-00" maxlength="24"')}${field('email','Электронная почта',p.email,'email','autocomplete="email" placeholder="name@example.ru" maxlength="120"')}</div>`,'kpf-padded')}<p class="kpf-note">Данные сохранятся в вашем профиле. Уже оформленные брони не изменятся.</p></form>`;
 }
 function tripBookingModel(t){
  const model=t.model||{id:t.id,hotel:t.hotel,address:t.city,arrival:t.arrival,departure:t.departure,checkIn:t.checkIn||'14:00',checkOut:t.checkOut||'12:00',room:t.room,party:t.guests+' взр.',roomTotal:t.price,paid:t.price,tariff:t.tariff,cancellation:t.status==='cancelled'?{fee:0,refund:t.price,due:0,status:'refunded'}:null};
  return {...model,status:{upcoming:'Бронь подтверждена',active:'Проживание',completed:'Поездка завершена',cancelled:'Бронь отменена'}[t.status],pointsAwarded:t.points};
 }
 function tripCard(t){return `<button type="button" class="kpf-trip-card" data-trip="${esc(t.id)}"><img class="kpf-trip-thumbnail" src="${esc(t.photo||'./scenarios/maidens-premium-king.jpg')}" alt="" loading="lazy" decoding="async"><span class="kpf-trip-copy"><strong>${esc(t.hotel)}</strong><span class="kpf-trip-city">${esc(t.city)}</span><span class="kpf-muted">${dates(t)}</span><span class="kpf-trip-bottom">${badge(tripStatusLabels[t.status],t.status==='completed'?'kpf-success':['upcoming','active'].includes(t.status)?'kpf-upcoming':'')}<span>${money(t.price)}</span>${icon('chevron')}</span></span></button>`;}
 function tripTimeline(items){
  const months=new Map();
  for(const trip of items){const key=trip.arrival.slice(0,7);if(!months.has(key))months.set(key,[]);months.get(key).push(trip);}
  return `<ol class="kpf-trip-timeline">${[...months].map(([month,bookings])=>{
   const label=new Date(month+'-01T12:00:00').toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(/ г\.$/,'');
   return `<li class="kpf-trip-month"><h3><time datetime="${month}">${label[0].toLocaleUpperCase('ru-RU')+label.slice(1)}</time></h3><div class="kpf-trip-month-list">${bookings.map(tripCard).join('')}</div></li>`;
  }).join('')}</ol>`;
 }
 page.addEventListener('error',event=>{const img=event.target;if(img.matches?.('.kpf-trip-thumbnail')&&!img.dataset.fallback){img.dataset.fallback='true';img.src='./scenarios/maidens-premium-king.jpg';}},true);
 function historyResults(){
  const found=filterTrips(allTrips(),filter);
  if(!found.length)return empty('Таких поездок пока нет','Измените запрос или выберите другой статус поездки.');
  const groups=[['active','Сейчас в поездке'],['upcoming','Предстоящие поездки'],['past','Прошлые поездки']];
  return groups.map(([key,title])=>{const items=found.filter(t=>key==='past'?['completed','cancelled'].includes(t.status):t.status===key);return items.length?`<section class="kpf-history-group"><h2>${title}</h2>${tripTimeline(items)}</section>`:'';}).join('');
 }
 function updateHistory(){page.querySelector('[data-history-results]').innerHTML=historyResults();}
 function helpResults(){const q=helpQuery.toLocaleLowerCase('ru-RU').trim();const found=articles.filter(a=>(helpCategory==='Все'||a.category===helpCategory)&&(!q||(a.title+' '+a.text).toLocaleLowerCase('ru-RU').includes(q)));return found.length?card(found.map(a=>row('help',a.title,a.category,`data-article="${a.id}"`)).join('')):empty('Ответ пока не найден','Попробуйте другие слова или напишите в поддержку ниже.');}
 function render(){
  if(!route)return close();dirty=false;const {name,id}=route;
  if(name==='travelers')shell('Путешественники',`<p class="kpf-lead">Сохраните данные гостей, с которыми путешествуете, чтобы они всегда были под рукой.</p>${card(state.travelers.map(p=>row('user',esc(fullName(p)),p.primary?'Основной путешественник':p.birthDate?date(p.birthDate):'Данные путешественника',`data-person="${p.id}"`,p.primary?badge('Вы')+icon('chevron'):'')).join(''))}<p class="kpf-note">Данные доступны только вам. Путешественники не получают доступ к вашим поездкам автоматически.</p>`,{footer:primaryButton('Добавить путешественника','data-action="add-traveler"')});
  else if(name==='traveler'){
   const p=state.travelers.find(t=>t.id===id);if(!p)return navigate('travelers',null,{replace:true});
   shell('Путешественник',`<div class="kpf-person-summary"><span class="kpf-person-icon">${icon('user')}</span><h2>${esc(fullName(p))}</h2>${badge(p.primary?'Основной путешественник':'Попутчик')}</div>${card(personDetail(p),'kpf-padded')}<p class="kpf-note">Изменения сохранятся в профиле. Данные в оформленных бронях останутся прежними.</p>${!p.primary?action('Удалить путешественника','data-action="remove-traveler"',true):''}`,{footer:primaryButton('Редактировать данные',`data-edit="${p.id}"`)});
  }else if(name==='edit'){
   const p=state.travelers.find(t=>t.id===id);shell(p?'Редактировать данные':'Новый путешественник',travelerForm(p),{footer:'<button type="submit" form="kpf-traveler-form" class="kpf-primary">Сохранить</button>'});
  }else if(name==='history'){
   shell('История путешествий',`<div class="kpf-search">${icon('search')}<input type="search" data-history-search value="${esc(filter.query)}" placeholder="Город или отель" aria-label="Поиск по истории путешествий"></div><div class="kpf-tabs kpf-history-filters" role="group" aria-label="Статус поездки">${[['all','Все'],['upcoming','Предстоящие'],['active','Текущие'],['completed','Завершённые'],['cancelled','Отменённые']].map(([v,t])=>`<button type="button" data-trip-filter="${v}" aria-pressed="${filter.status===v}">${t}</button>`).join('')}</div><div class="kpf-history-results" data-history-results>${historyResults()}</div>`,{wide:true});
  }else if(name==='trip'){
   const t=tripById(id);if(!t)return navigate('history',null,{replace:true});
   const model=tripBookingModel(t);
   shell('Детали брони',`${window.KeysBookingDetails.render(model)}${card(row('bookingDocument','Документы поездки','Посмотреть и сохранить','data-action="trip-documents"')+(t.status==='completed'?row('star',state.reviews[t.id]?'Ваш отзыв':'Оценить проживание',state.reviews[t.id]?`${state.reviews[t.id].rating} из 5 · изменить отзыв`:'Поделитесь впечатлениями об отеле','data-action="review-trip"'):''))}`,{footer:primaryButton(['upcoming','active'].includes(t.status)?'Перейти к брони':'Забронировать ещё раз',['upcoming','active'].includes(t.status)?'data-action="manage-trip"':'data-action="rebook"')});
   page.classList.add('kpf-booking-details');
  }else if(name==='review'){
   const t=tripById(id),r=state.reviews[id]||{};if(!t)return navigate('history',null,{replace:true});shell('Отзыв о проживании',`<p class="kpf-lead">${esc(t.hotel)} · ${t.city}</p><form id="kpf-review-form" data-form="review"><fieldset class="kpf-rating"><legend>Как прошла поездка?</legend>${[1,2,3,4,5].map(v=>`<label><input type="radio" name="rating" value="${v}"${r.rating===v?' checked':''} required aria-label="${v} из 5"><span>${icon('star')}<b>${v}</b></span></label>`).join('')}</fieldset><div class="kpf-field"><label for="kpf-review-text">Ваши впечатления · необязательно</label><textarea id="kpf-review-text" name="text" maxlength="1500" rows="6" placeholder="Что понравилось? Что можно улучшить?">${esc(r.text||'')}</textarea></div><p class="kpf-note">Отзыв сохранится в прототипе и не будет опубликован на сайте отеля.</p></form>`,{footer:'<button type="submit" form="kpf-review-form" class="kpf-primary">Сохранить отзыв</button>'});
  }else if(name==='language'){
   shell('Язык приложения',card(`<div role="radiogroup" aria-label="Язык приложения">${[['ru','Русский'],['en','English']].map(([value,label])=>`<label class="kpf-language-option"><span lang="${value}">${label}</span><input type="radio" name="profile-language" value="${value}"${state.language===value?' checked':''}><span class="kpf-language-check" aria-hidden="true">${icon('check')}</span></label>`).join('')}</div>`));
  }else if(name==='notifications'){
   const n=state.notifications;shell('Уведомления',`${card(toggle('notifications','push','Push-уведомления','На устройстве с приложением «Ключи»')+toggle('notifications','email','Электронная почта','Подробности поездки и подборки')+toggle('notifications','sms','SMS','Короткие сообщения о поездке'))}${section('О чём сообщать',card(toggle('notifications','bookings','Поездки и бронирования','Напоминания о заезде и выезде')+toggle('notifications','messages','Сообщения от отелей','Ответы и важная информация от отеля')+toggle('notifications','services','Услуги во время проживания','Статусы заказов и запросов')+toggle('notifications','benefits','Баллы и привилегии','Начисления, списания и срок действия')+toggle('notifications','offers','Предложения и вдохновение','Подборки отелей и специальные цены')))}${section('Тихие часы',card(toggle('notifications','quiet','Не беспокоить ночью','Приостановить необязательные уведомления')+`<div class="kpf-time-fields"${n.quiet?'':' hidden'}>${field('quietFrom','С',n.quietFrom,'time','data-time="quietFrom"')}${field('quietTo','До',n.quietTo,'time','data-time="quietTo"')}</div>`))}${info('Важное всегда под рукой','Изменения и отмены брони, коды входа и сообщения о безопасности останутся доступны. Тихие часы на них не влияют.','bell')}`);
  }else if(name==='security'){
   shell('Безопасность и доступ',`${info('Вход по номеру телефона','Одноразовый код подтверждает вход в аккаунт. Никому не передавайте его.','shield')}${section('Защита приложения',card(toggle('security','biometric','Вход по биометрии','Face ID или отпечаток пальца')+row('lock','Код для входа',state.security.pin?'Код настроен · изменить':'Добавить дополнительную проверку','data-kpf-page="pin"')))}${section('Устройства',card(row('shield','Ваши устройства',`Активных сеансов: ${1+state.security.otherDevices.length}`,'data-kpf-page="devices"')))}${section('Если что-то не так',card(row('help','Не узнаю вход в аккаунт','Проверить устройства и обратиться за помощью','data-action="security-help"')))}<p class="kpf-note">В прототипе показаны сценарии защиты. Биометрия, код и сеансы не меняют реальную авторизацию.</p>`);
  }else if(name==='pin'){
   shell(state.security.pin?'Изменить код':'Код для входа',`<p class="kpf-lead">Четыре цифры для дополнительной проверки при входе.</p><form id="kpf-pin-form" data-form="pin" novalidate>${card(`<div class="kpf-fields">${field('pin','Новый код','','password','inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off"')}${field('pinRepeat','Повторите код','','password','inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off"')}</div>`,'kpf-padded')}<p class="kpf-note">Демонстрационная настройка. Введённый код не сохраняется и не используется для настоящего входа.</p></form>${state.security.pin?action('Отключить код','data-action="disable-pin"',true):''}`,{footer:'<button type="submit" form="kpf-pin-form" class="kpf-primary">Сохранить код</button>'});
  }else if(name==='devices'){
   shell('Ваши устройства',`<p class="kpf-lead">Завершите сеанс на устройстве, которым больше не пользуетесь.</p>${card(`<div class="kpf-device">${icon('shield')}<div><strong>Этот браузер</strong><p>Текущий сеанс</p>${badge('Сейчас в сети','kpf-success')}</div></div>`)}${state.security.otherDevices.length?section('Другие устройства',card(state.security.otherDevices.map(d=>`<div class="kpf-device">${icon('phone')}<div><strong>${esc(d.name)}</strong><p>${esc(d.location)} · ${esc(d.last)}</p>${action('Завершить сеанс',`data-end-device="${esc(d.id)}"`,true)}</div></div>`).join(''))):info('Других сеансов нет','Открыт только текущий браузер.','check')}<p class="kpf-note">Список устройств демонстрационный.</p>`,{footer:state.security.otherDevices.length?'<button type="button" class="kpf-secondary" data-action="end-devices">Завершить другие сеансы</button>':''});
  }else if(name==='help'){
   shell('Помощь и поддержка',`<div class="kpf-search">${icon('search')}<input type="search" data-help-search value="${esc(helpQuery)}" aria-label="Поиск по помощи" placeholder="Чем мы можем помочь?"></div>${card(row('chat','Связаться с отелем','Заезд, услуги и вопросы во время проживания','data-action="hotel-chat"')+row('help','Поддержка Ключей','Аккаунт, бронирования и работа приложения','data-kpf-page="contact"'))}<div class="kpf-tabs kpf-help-tabs" role="group" aria-label="Тема помощи">${['Все','Бронирование','Проживание','Аккаунт','Баллы'].map(t=>`<button type="button" data-help-category="${t}" aria-pressed="${helpCategory===t}">${t}</button>`).join('')}</div><div data-help-results>${helpResults()}</div>${state.tickets.length?section('Ваши обращения',card(state.tickets.map(t=>row('chat',esc(t.topic),`${esc(t.id)} · сохранено в прототипе`,`data-ticket="${esc(t.id)}"`)).join(''))):''}<p class="kpf-note">Не нашли ответ? Опишите вопрос, и он сохранится в вашем обращении.</p>`,{footer:primaryButton('Написать в поддержку','data-kpf-page="contact"')});
  }else if(name==='article'){
   const a=articles.find(a=>a.id===id);if(!a)return navigate('help',null,{replace:true});shell('Помощь',`<article class="kpf-article"><span class="kpf-muted">${a.category}</span><h2>${a.title}</h2><p>${a.text}</p></article>${card(row('arrow',({trip:'Открыть поездки',hotel:'Написать в отель',benefits:'Открыть привилегии',history:'Открыть историю поездок',travelers:'Открыть путешественников',notifications:'Настроить уведомления',data:'Управление данными',devices:'Проверить устройства'})[a.action]||'Открыть раздел','',`data-help-action="${a.action}"`))}<p class="kpf-note">Остались вопросы?</p>${action('Написать в поддержку','data-kpf-page="contact"')}`);
  }else if(name==='contact'){
   shell('Написать в поддержку',`<p class="kpf-lead">Расскажите, с чем нужна помощь. Подробности поездки можно приложить к обращению.</p><form id="kpf-contact-form" data-form="contact" novalidate>${select('topic','Тема обращения',[['Бронирование','Бронирование'],['Возврат оплаты','Возврат оплаты'],['Аккаунт и безопасность','Аккаунт и безопасность'],['Работа приложения','Работа приложения'],['Другой вопрос','Другой вопрос']],'Бронирование')}${select('trip','Поездка',[['none','Не связано с поездкой'],...allTrips().map(t=>[t.id,t.city+' · '+dates(t)])],tripById(id)?id:'none')}<div class="kpf-field"><label for="kpf-message">Ваш вопрос</label><textarea id="kpf-message" name="message" rows="6" minlength="10" maxlength="2000" aria-describedby="kpf-message-error" placeholder="Опишите, что произошло и какая помощь нужна"></textarea><small class="kpf-error" id="kpf-message-error"></small></div><p class="kpf-note">Это демонстрация: обращение сохранится в прототипе, без отправки в настоящую поддержку.</p></form>`,{footer:'<button type="submit" form="kpf-contact-form" class="kpf-primary">Создать обращение</button>'});
  }else if(name==='ticket'){
   const t=state.tickets.find(t=>t.id===id);if(!t)return navigate('help',null,{replace:true});shell('Ваше обращение',`${info('Обращение сохранено',esc(t.id)+' · демонстрационный режим','check')}${card(`<h2>${esc(t.topic)}</h2><p class="kpf-message-text">${esc(t.message)}</p>${t.trip!=='none'?`<p class="kpf-muted">${esc(tripById(t.trip)?.hotel||'Поездка')}</p>`:''}`,'kpf-padded')}<p class="kpf-note">Обращение доступно в разделе помощи. В настоящую службу поддержки оно не отправлялось.</p>`,{footer:primaryButton('Вернуться к помощи','data-kpf-page="help"')});
  }else if(name==='data'){
   shell('Управление данными',`${section('Настройки приватности',card(toggle('privacy','personalization','Персональные рекомендации','Учитывать историю поездок при подборе отелей')+toggle('privacy','analytics','Помогать улучшать приложение','Разрешить обезличенную аналитику использования')))}${section('Удаление аккаунта',state.deletionRequested?card(`<div class="kpf-padded"><h2>Запрос создан</h2><p>Демонстрационный запрос на удаление аккаунта. Реальный аккаунт не изменён.</p>${action('Отменить запрос','data-action="cancel-deletion"')}</div>`):card(row('shield','Удалить аккаунт','Посмотреть условия и следующие шаги','data-kpf-page="delete"')))}<p class="kpf-note">Настройки действуют в пределах прототипа. Реальные согласия в сервисах не изменяются.</p>`);
  }else if(name==='delete'){
   shell('Удаление аккаунта',`<p class="kpf-lead">Перед удалением сохраните нужные сведения о поездках.</p>${card(`<ul class="kpf-list"><li>Профиль и сохранённые путешественники будут недоступны.</li><li>Удаление аккаунта само по себе не отменяет оформленные брони.</li><li>Порядок удаления отдельных данных зависит от правил сервиса.</li></ul>`,'kpf-padded')}<form id="kpf-delete-form" data-form="delete"><label class="kpf-check"><input type="checkbox" name="confirm" required><span>Я ознакомилась с последствиями удаления</span></label></form><p class="kpf-note">В прототипе создаётся только демонстрационный запрос. Реальный аккаунт и брони не удаляются.</p>`,{footer:'<button type="submit" form="kpf-delete-form" class="kpf-danger-button">Создать запрос на удаление</button>'});
  }else navigate('travelers',null,{replace:true});
 }
 function download(filename,text,type='application/json'){
  const url=URL.createObjectURL(new Blob([text],{type}));
  dialog.innerHTML=`<form method="dialog"><h2 id="kpf-confirm-title">Файл готов</h2><p>${esc(filename)}</p><details class="kpf-export-preview"><summary>Посмотреть содержимое</summary><textarea readonly aria-label="Содержимое файла">${esc(text)}</textarea></details><div class="kpf-export-actions"><a class="kpf-primary" href="${url}" download="${esc(filename)}">Скачать файл</a><button type="button" class="kpf-secondary" data-copy-export>Скопировать содержимое</button><button value="cancel" class="kpf-text">Закрыть</button></div></form>`;
  dialog.setAttribute('aria-labelledby','kpf-confirm-title');dialog.returnValue='';dialog.onclose=()=>URL.revokeObjectURL(url);
  dialog.querySelector('[data-copy-export]').onclick=async()=>{try{await navigator.clipboard.writeText(text);dialog.querySelector('[data-copy-export]').textContent='Скопировано';}catch{dialog.querySelector('details').open=true;dialog.querySelector('textarea').select();dialog.querySelector('[data-copy-export]').textContent='Текст выделен — скопируйте его';}};
  dialog.showModal();dialog.focus({preventScroll:true});
 }
 function external(action,detail={}){guard(()=>{close();const url=new URL(location.href);url.hash='';history.replaceState({...history.state,keysProfileDepth:0},'',url);root.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action,...detail}}));});}
 function formErrors(form,errors){form.querySelectorAll('.kpf-error').forEach(el=>el.textContent='');form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));for(const [key,text] of Object.entries(errors)){const input=form.elements[key];if(input){input.setAttribute('aria-invalid','true');const error=form.querySelector('#kpf-'+key+'-error');if(error)error.textContent=text;}}form.elements[Object.keys(errors)[0]]?.focus();}
 window.addEventListener('click',event=>{
  const target=event.target.closest('button,a');if(!target)return;
  const entry=target.closest('.kf-phone[data-screen="profile"]')===phone&&!page.contains(target)&&!dialog.contains(target);
  const map={travelerProfile:'traveler',addTraveler:'edit',allTrips:'history',notifications:'notifications',security:'security',support:'help',dataManagement:'data',language:'language'};
  if(entry&&(map[target.dataset.open]||target.dataset.kpfPage||target.dataset.kpfTraveler)){
   event.preventDefault();event.stopImmediatePropagation();navigate(target.dataset.kpfTraveler?'traveler':target.dataset.kpfPage||map[target.dataset.open],target.dataset.kpfTraveler||(target.dataset.open==='travelerProfile'?'primary':null));return;
  }
  if(route&&target.closest('.keys-app-header,.keys-bottom-nav')){
   if(dirty){event.preventDefault();event.stopImmediatePropagation();guard(()=>target.click());return;}
   close();const url=new URL(location.href);url.hash='';history.replaceState({...history.state,keysProfileDepth:0},'',url);
  }
  if(!page.contains(target))return;
  if(target.type==='submit')return;
  event.preventDefault();event.stopImmediatePropagation();const d=target.dataset;
  if(d.kpfPage)return navigate(d.kpfPage);
  if(d.person)return navigate('traveler',d.person);
  if(d.edit)return navigate('edit',d.edit);
  if(d.trip)return navigate('trip',d.trip);
  if(d.article)return navigate('article',d.article);
  if(d.ticket)return navigate('ticket',d.ticket);
  if(d.tripFilter){filter.status=d.tripFilter;page.querySelectorAll('[data-trip-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));return updateHistory();}
  if(d.helpCategory){helpCategory=d.helpCategory;page.querySelectorAll('[data-help-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));page.querySelector('[data-help-results]').innerHTML=helpResults();return;}
  if(d.endDevice)return ask('Завершить сеанс?','Устройство исчезнет из демонстрационного списка. Текущий браузер останется активным.','Завершить',()=>{persist({...state,security:{...state.security,otherDevices:state.security.otherDevices.filter(x=>x.id!==d.endDevice)}},'Сеанс завершён в прототипе');render();},true);
  if(d.helpAction){const map={trip:'trip',hotel:'hotel-chat',benefits:'benefits'};return map[d.helpAction]?external(map[d.helpAction]):navigate(d.helpAction);}
  const t=tripById(route.id);
  switch(d.action){
   case 'back':return back();
   case 'add-traveler':return navigate('edit');
   case 'remove-traveler':{const p=state.travelers.find(x=>x.id===route.id);return ask('Удалить путешественника?',`${esc(fullName(p))} исчезнет из сохранённых гостей. Уже оформленные брони не изменятся.`,'Удалить',()=>{persist(removeTraveler(state,p.id),'Путешественник удалён');navigate('travelers',null,{replace:true});},true);}
   case 'review-trip':return navigate('review',route.id);
   case 'trip-documents':return window.KeysTripDocuments.open(target,tripBookingModel(t));
   case 'manage-trip':return external('booking',{bookingId:t.source==='created'?t.id:null});
   case 'rebook':return root.dispatchEvent(new CustomEvent('keys-profile-action',{detail:{action:'rebook',hotelId:t.hotelId,nights:t.nights||3,party:{adults:parseInt(t.guests,10)||1,childrenAges:[],pet:false,business:false}}}));
   case 'hotel-chat':return external('hotel-chat');
   case 'security-help':return navigate('article','key-security');
   case 'disable-pin':return ask('Отключить код?','Дополнительная проверка кодом будет отключена в демонстрационных настройках.','Отключить',()=>{dirty=false;persist({...state,security:{...state.security,pin:false}});navigate('security',null,{replace:true});},true);
   case 'end-devices':return ask('Завершить другие сеансы?','В демонстрационном списке останется только текущий браузер.','Завершить',()=>{persist({...state,security:{...state.security,otherDevices:[]}},'Другие сеансы завершены в прототипе');render();},true);
   case 'cancel-deletion':persist({...state,deletionRequested:false},'Запрос отменён');return render();
  }
 },true);
 page.addEventListener('input',event=>{
  const el=event.target;if(el.matches('[data-history-search]')){filter.query=el.value;updateHistory();}
  else if(el.matches('[data-help-search]')){helpQuery=el.value;page.querySelector('[data-help-results]').innerHTML=helpResults();}
  else if(el.closest('form'))dirty=true;
 });
 page.addEventListener('change',event=>{
  const el=event.target;
  if(el.name==='profile-language'&&['ru','en'].includes(el.value)){persist({...state,language:el.value},'Язык сохранён');
  }else if(el.dataset.setting){const [group,key]=el.dataset.setting.split('.'),value=el.checked;
   if(group==='notifications'&&key==='email'&&value&&!state.travelers.find(p=>p.primary)?.email){el.checked=false;return ask('Добавить электронную почту?','Укажите адрес в данных основного путешественника, затем включите уведомления по почте.','Добавить почту',()=>navigate('edit','primary'));}
   if(group==='security'&&key==='biometric'){el.checked=state.security.biometric;return ask(value?'Включить биометрию?':'Отключить биометрию?','В настоящем приложении это действие подтверждается устройством. Здесь изменится только демонстрационная настройка.',value?'Включить':'Отключить',()=>{persist({...state,security:{...state.security,biometric:value}});render();});}
   persist({...state,[group]:{...state[group],[key]:value}});if(key==='quiet')page.querySelector('.kpf-time-fields').hidden=!value;
  }else if(el.dataset.time){persist({...state,notifications:{...state.notifications,[el.dataset.time]:el.value}});}
 });
 page.addEventListener('submit',event=>{
  const form=event.target;if(!form.dataset.form)return;event.preventDefault();const values=Object.fromEntries(new FormData(form));
  if(form.dataset.form==='traveler'){const result=saveTraveler(state,values,route.id);if(Object.keys(result.errors).length)return formErrors(form,result.errors);dirty=false;persist(result.state,'Данные путешественника сохранены');navigate('traveler',result.traveler.id,{replace:true});}
  if(form.dataset.form==='pin'){const errors={};if(!/^\d{4}$/.test(values.pin))errors.pin='Введите четыре цифры';if(values.pinRepeat!==values.pin)errors.pinRepeat='Коды не совпадают';if(Object.keys(errors).length)return formErrors(form,errors);dirty=false;form.reset();persist({...state,security:{...state.security,pin:true}},'Код настроен в прототипе');navigate('security',null,{replace:true});}
  if(form.dataset.form==='review'){dirty=false;persist({...state,reviews:{...state.reviews,[route.id]:{rating:Number(values.rating),text:values.text.trim()}}},'Отзыв сохранён в прототипе');navigate('trip',route.id,{replace:true});}
  if(form.dataset.form==='contact'){if(values.message.trim().length<10)return formErrors(form,{message:'Опишите вопрос чуть подробнее — от 10 символов'});const t={id:'КЛ-'+Date.now().toString().slice(-6),topic:values.topic,trip:values.trip,message:values.message.trim(),createdAt:new Date().toISOString()};dirty=false;persist({...state,tickets:[t,...state.tickets]},'Обращение сохранено');navigate('ticket',t.id,{replace:true});}
  if(form.dataset.form==='delete'){dirty=false;ask('Создать запрос на удаление?','В прототипе появится статус запроса. Реальный аккаунт и поездки не изменятся.','Создать запрос',()=>{persist({...state,deletionRequested:true},'Демонстрационный запрос создан');navigate('data',null,{replace:true});},true);}
 });
 page.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open){e.preventDefault();back();}});
 window.addEventListener('popstate',()=>{const next=parseRoute();if(dirty){const previous=route;root.dispatchEvent(new CustomEvent('keys-open-profile'));ask('Уйти без сохранения?','Изменения в форме будут потеряны.','Не сохранять',()=>{dirty=false;route=next;route?render():close();});const onclose=dialog.onclose;dialog.onclose=()=>{if(dialog.returnValue!=='confirm'){const url=new URL(location.href);url.hash=encodeRoute(previous);history.pushState({...history.state,keysProfileDepth:1},'',url);}onclose();};return;}const wasOpen=!!route;route=next;if(route){returnSection=history.state?.keysProfileReturn||null;readState();root.dispatchEvent(new CustomEvent('keys-open-profile'));render();}else{close();if(wasOpen)returnToEntry();}});
 root.addEventListener('keys-scenario-change',()=>{if(scenarioStamp()===lastScenario)return;lastScenario=scenarioStamp();if(route){close();const url=new URL(location.href);url.hash='';history.replaceState({...history.state,keysProfileDepth:0},'',url);}});
 articles.push({id:'key-security',category:'Аккаунт',title:'Что делать, если вы не узнаёте вход?',text:'Откройте список устройств и завершите незнакомые сеансы. Не сообщайте коды из SMS другим людям. Если вы потеряли доступ к телефону или заметили действия, которых не совершали, обратитесь в поддержку Ключей.',action:'devices'});
 root.addEventListener('keys-trip-bookings-change',()=>{if(route?.name==='history')updateHistory();});
 readState();const initial=parseRoute();if(initial){route=initial;returnSection=history.state?.keysProfileReturn||null;root.dispatchEvent(new CustomEvent('keys-open-profile'));render();}
 window.KeysProfile={open:(name='travelers',id,options)=>navigate(name,id,options)};
}
