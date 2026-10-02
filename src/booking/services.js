/* Restyle the existing catalog, retaining its buttons, routing attributes and scenario state. */
(() => {
 const root=document.getElementById('keysStayDetails');
 const layer=root?.querySelector('.ksd-detail-layer');
 if(!layer)return;
 const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
 function group(title,buttons,photos=false){
  const section=document.createElement('section');section.className='ksvc-group';
  const heading=document.createElement('h2');heading.textContent=title;section.append(heading);
  const list=document.createElement('div');list.className=photos?'ksvc-photos':'ksvc-list';
  buttons.filter(Boolean).forEach(button=>list.append(button));section.append(list);return section;
 }
 function format(button,{photo,description}={}){
  if(!button)return;
  const title=button.querySelector('strong'),detail=button.querySelector('small'),icon=button.querySelector('.ksd-flow-icon'),value=button.querySelector('.ksd-flow-value');
  if(!title)return button;
  if(title.textContent.trim()==='Завтрак «Шведский стол»'&&icon)icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2m4-2v2M3 22h17"/></svg>';
  if(title.textContent.trim()==='Поздний выезд'){button.removeAttribute('data-service-note');button.dataset.stayService='late';}
  if(title.textContent.trim()==='Завтрак «Шведский стол»'){button.removeAttribute('data-service-note');button.dataset.serviceBreakfast='';}
  if(button.hasAttribute('data-stay-service')||button.hasAttribute('data-service-breakfast')){
   button.type='button';button.className='kpa-service ksvc-stay-service';
   if(button.hasAttribute('data-service-breakfast'))title.textContent='Завтрак';
   const visual=document.createElement('span');visual.className='kpa-service-icon';visual.innerHTML=icon?.innerHTML||'';
   const copy=document.createElement('span');copy.className='kpa-service-copy';copy.append(title);
   const status=detail||document.createElement('small');status.className='kpa-service-status';copy.append(status);
   const action=document.createElement('span');action.className='kpa-service-action';
   button.replaceChildren(visual,copy,action);
   return button;
  }
  button.type='button';button.className=photo?'ksvc-photo':'ksvc-row';
  const copy=document.createElement('span');copy.className='ksvc-copy';copy.append(title);
  if(detail){if(description)detail.textContent=description;copy.append(detail);}
  button.replaceChildren();
  if(photo){const image=document.createElement('img');image.src=photo==='restaurant'?'./booking/restaurant.webp':'./sections/images/services/'+photo+'.jpg';image.alt='';image.width=320;image.height=210;image.loading='lazy';image.decoding='async';button.append(image);}
  else if(icon)button.append(icon);
  button.append(copy);
  const trailing=document.createElement('span');trailing.className='ksvc-trailing';
  if(value)trailing.append(value);
  trailing.insertAdjacentHTML('beforeend',arrow);button.append(trailing);
  return button;
 }
 function syncBreakfast(){
  const button=layer.querySelector('[data-service-breakfast]');if(!button)return;
  const added=window.KeysHomeViews.isBreakfastAdded();
  button.classList.toggle('is-added',added);
  const label=button.querySelector('.kpa-service-status'),text=added?'Добавлен за доплату':'Не включён в бронь';
  if(label.textContent!==text)label.textContent=text;
  const action=button.querySelector('.kpa-service-action'),actionText=added?'Изменить':'Добавить';
  if(action.dataset.serviceLabel!==actionText){
   action.innerHTML='<span class="kpa-service-link">'+actionText+'</span>'+(added?arrow:arrow.replace('<path d="m9 5 7 7-7 7"/>','<path d="M12 5v14M5 12h14"/>'));
   action.dataset.serviceLabel=actionText;
  }
 }
 document.getElementById('keysUnifiedPrototype').addEventListener('keys-breakfast-change',syncBreakfast);
 function formatBill(content){
  if(content.querySelector('.ksvc-bill-summary'))return;
  const hero=content.querySelector('.ksd-flow-hero'),card=content.querySelector('.ksd-flow-card');
  if(!hero||!card)return;
  hero.className='ksvc-bill-summary';
  hero.querySelector('small').textContent='Расходы на услуги';
  const heading=content.querySelector('h2');if(heading)heading.textContent='Детализация';
  card.className='ksvc-bill-items';card.setAttribute('role','list');
  card.querySelectorAll('.ksd-flow-row').forEach(button=>{
   const row=document.createElement('div');row.className='ksvc-bill-row';row.setAttribute('role','listitem');
   row.append(...button.childNodes);button.replaceWith(row);
   const copy=row.querySelector('.ksd-flow-icon+span');if(copy)copy.className='ksvc-bill-copy';
   const subtitle=copy?.querySelector('small');
   if(subtitle?.textContent.includes(' · оплачено')){
    subtitle.textContent=subtitle.textContent.replace(' · оплачено','');
    const status=document.createElement('span');status.className='ksvc-bill-paid';
    status.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>Оплачено';
    copy.querySelector('strong').after(status);
   }
  });
  const note=content.querySelector('.ksd-flow-note');if(note)note.className='ksvc-bill-note';
 }
 function sync(){
  syncBreakfast();window.KeysStayServices.sync();
  const title=layer.querySelector('h1')?.textContent.trim();
  const isCatalog=title==='Все услуги отеля';
  const existingEarly=layer.querySelector('[data-stay-service="early"]');
  if(existingEarly)existingEarly.hidden=document.body.dataset.keysScenario!=='booked';
  const secondary=['Еда в номер','Уборка номера','Всё для номера','Другой запрос','Текущий счёт'].includes(title);
  layer.classList.toggle('ksvc-secondary',secondary);
  layer.classList.toggle('ksvc-food-page',title==='Еда в номер');
  layer.classList.toggle('ksvc-bill-page',title==='Текущий счёт');
  layer.classList.toggle('ksvc-page',isCatalog);
  const content=layer.querySelector('.ksd-detail-content');
  if(secondary&&content){
   if(title==='Текущий счёт')formatBill(content);
   if(title==='Еда в номер'&&!content.querySelector('.ksvc-restaurant,.kbg-room-food')){
    const image=document.createElement('img');image.className='ksvc-restaurant';image.src='./booking/restaurant.webp';image.alt='Светлый зал ресторана';image.width=720;image.height=320;image.decoding='async';
    const note=content.querySelector('.ksd-flow-note');if(note)note.before(image);else content.prepend(image);
   }
   content.querySelectorAll('.ksd-flow-row small').forEach(label=>{
    const text=label.textContent.replace(/(\d) +(₽|г|мл|кг)(?=\s|$)/g,'$1\u00a0$2');
    if(label.textContent!==text)label.textContent=text;
   });
   content.querySelectorAll('[data-add-item]').forEach(button=>{
    if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label','Добавить: '+button.dataset.name);
   });
   content.querySelectorAll('[data-request-action]').forEach(button=>{
    const label=(button.dataset.requestAction==='minus'?'Уменьшить: ':'Увеличить: ')+button.dataset.requestName;
    if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);
   });
   const textarea=content.querySelector('.ksd-other-text');
   if(textarea&&!textarea.hasAttribute('aria-label'))textarea.setAttribute('aria-label','Что вам нужно');
  }
  if(!isCatalog||!content||content.querySelector('.ksvc-catalog'))return;
  const buttons=[...content.querySelectorAll('button')];
  const named=name=>buttons.find(button=>button.querySelector('strong')?.textContent.trim()===name);
  const food=buttons.find(button=>button.dataset.subpage==='food');
  const cleaning=buttons.find(button=>button.dataset.subpage==='cleaning');
  if(!food||!cleaning)return;
  const requests=window.KeysActiveServices?.render();
  const active=requests?[requests]:[];
  const free=[...content.querySelectorAll('.ksd-service-free button')];
  const catalog=document.createElement('div');catalog.className='ksvc-catalog';
  catalog.append(group('Заказать в номер',[
   format(food,{photo:'restaurant',description:'Меню ресторана LEA'}),
   format(cleaning,{photo:'cleaning',description:'Выберите вид и время'})
  ],true));
  const essentials=document.createElement('div');essentials.className='ksvc-list ksvc-essentials';
  [format(buttons.find(b=>b.dataset.subpage==='supplies'),{description:'Полотенца, бельё и наборы'}),format(buttons.find(b=>b.hasAttribute('data-other-service')),{description:'Расскажите, что вам нужно'})].filter(Boolean).forEach(b=>essentials.append(b));
  catalog.firstElementChild.append(essentials);
  const early=document.createElement('button');early.dataset.stayService='early';early.hidden=document.body.dataset.keysScenario!=='booked';
  early.innerHTML='<span class="ksd-flow-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><strong>Ранний заезд</strong><small>Не включён в бронь</small>';
  catalog.append(group('Питание и проживание',[
   format(early),
   format(named('Завтрак «Шведский стол»'),{description:'LEA · 07:00–12:00 · с Silver'}),format(named('Поздний выезд'))
  ]));
  catalog.append(group('Транспорт',[format(named('Трансфер от отеля'),{description:'Встреча с табличкой'}),format(named('Заказать такси'))]));
  catalog.append(group('Бесплатно для гостей',free.map(button=>format(button))));
  content.replaceChildren(...active,catalog);
 }
 layer.addEventListener('click',event=>{
  const button=event.target.closest('[data-service-breakfast]');
  if(!button||!window.KeysHomeViews?.openBreakfast)return;
  event.preventDefault();event.stopPropagation();
  const app=document.getElementById('keysUnifiedPrototype');
  const sections=[...app.querySelectorAll(':scope>.ku-section')].map(element=>({element,hidden:element.hidden}));
  sections.forEach(({element})=>element.hidden=element.dataset.unifiedSection!=='trips');
  window.KeysHomeViews.openBreakfast(button,()=>{
   sections.forEach(({element,hidden})=>element.hidden=hidden);
   button.focus({preventScroll:true});
  });
 });
 let pending=false;
 new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}).observe(layer,{childList:true,subtree:true});
 document.getElementById('keysUnifiedPrototype').addEventListener('keys-scenario-change',sync);
 sync();
})();
