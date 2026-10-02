/* One persistent runtime shares search, favourites, booking drafts and chats across both tabs. */
(() => {
  const root=document.getElementById('keysUnifiedPrototype');
  const section=document.createElement('section');
  section.className='ku-section';section.dataset.unifiedSection='arbana-sections';section.hidden=true;
  const frame=document.createElement('iframe');frame.id='keysSectionsFrame';frame.title='Найти и Чаты';
  section.append(frame);root.append(section);
  let ready=false,pending=null,notificationOrigin=null,notificationOpened=false,feedbackFromNotifications=false,feedbackTripOrigin=null,profileOrigin=null;
  let profileMotionId=0,profileAnimations=[];
  const cancelProfileMotion=()=>{
    profileMotionId++;
    profileAnimations.forEach(animation=>animation.cancel());profileAnimations=[];
    const phone=root.querySelector('.kf-phone[data-screen="profile"]');
    if(phone){delete phone.dataset.profileMotion;phone.querySelector('[data-profile-back]')?.removeAttribute('disabled');}
  };
  const animateProfile=(direction,complete=()=>{})=>{
    cancelProfileMotion();
    const phone=root.querySelector('.kf-phone[data-screen="profile"]');
    const parts=[phone?.querySelector('.keys-profile-header'),phone?.querySelector('.kf-scroll')].filter(Boolean);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!parts.every(part=>typeof part.animate==='function')){complete();return;}
    const exiting=direction==='exit',id=profileMotionId;
    phone.dataset.profileMotion=direction;
    if(exiting)phone.querySelector('[data-profile-back]').disabled=true;
    const frames=exiting
      ?[{transform:'translateX(0)',opacity:1},{transform:'translateX(32px)',opacity:0}]
      :[{transform:'translateX(40px)',opacity:0},{transform:'translateX(0)',opacity:1}];
    profileAnimations=parts.map(part=>part.animate(frames,{duration:exiting?160:280,easing:exiting?'cubic-bezier(.4,0,1,1)':'cubic-bezier(.22,1,.36,1)',fill:'both'}));
    Promise.allSettled(profileAnimations.map(animation=>animation.finished)).then(()=>{
      if(id!==profileMotionId)return;
      cancelProfileMotion();complete();
    });
  };
  const notificationDay=(scenario=document.body.dataset.keysScenario,day=document.body.dataset.keysStayDay)=>scenario==='after'?'after':scenario==='stay'?(day??'day-2'):'day-1';
  const send=()=>{if(ready&&pending){frame.contentWindow.postMessage({source:'keys-host',...pending,stayDay:notificationDay()},location.protocol==='file:'?'*':location.origin);pending=null;}};
  const show=(tab,hotelId,screen)=>{
    cancelProfileMotion();
    root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s!==section);
    pending={tab,hotelId,screen};
    if(!frame.hasAttribute('src')) frame.src='./sections/index.html?v=stay-scenarios-1&stayDay='+encodeURIComponent(notificationDay());
    send();
  };
  const captureProfileOrigin=()=>{
    const account=root.querySelector('[data-unified-section="account"]');
    const profile=account?.querySelector('.kf-phone[data-screen="profile"]')?.closest('.kf-grid>section');
    if(!account?.hidden&&!profile?.hidden)return;
    profileOrigin={sections:[...root.querySelectorAll(':scope>.ku-section')].map(el=>[el,el.hidden]),accountPages:[...account.querySelectorAll('.kf-grid>section')].map(el=>[el,el.hidden]),focus:document.activeElement};
  };
  const closeProfile=()=>{
    const origin=profileOrigin;profileOrigin=null;
    if(!origin){go('trips');return;}
    animateProfile('exit',()=>{
      origin.accountPages.forEach(([el,hidden])=>el.hidden=hidden);
      origin.sections.forEach(([el,hidden])=>el.hidden=hidden);
      origin.focus?.focus({preventScroll:true});
    });
  };
  const go=target=>{
    cancelProfileMotion();
    if(target==='profile')captureProfileOrigin();
    if(target==='feedback'){go('trips');root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s.dataset.unifiedSection!=='feedback');root.querySelector('#keysFeedbackFlow')?.dispatchEvent(new CustomEvent('kfb-reset'));const done=root.querySelector('#keysFeedbackFlow [data-kfb="success"] [data-kfb-exit]');if(done)done.textContent='К уведомлениям';feedbackFromNotifications=true;return;}
    if(target==='problem'){go('stay-details');root.querySelector('[data-problem-entry]')?.click();return;}
    if(target==='stay-details'){go('trips');root.querySelector('.k3-stay-head').click();return;}
    root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=true);
    if(['benefits','profile'].includes(target)){
      const account=root.querySelector('[data-unified-section="account"]');account.hidden=false;
      account.querySelectorAll('.kf-grid>section').forEach(s=>s.hidden=s.querySelector('.kf-phone')?.dataset.screen!==target);
      if(target==='profile'){account.querySelector('[data-screen="profile"]>.kf-scroll').scrollTop=0;account.querySelector('[data-profile-back]')?.focus({preventScroll:true});animateProfile('enter');}
    }else{
      const dest=root.querySelector(`[data-unified-section="${target}"]`);
      (dest??root.querySelector('[data-unified-section="trips"]')).hidden=false;
    }
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    const label=button.textContent.trim();
    if(button.closest('nav')&&['Найти','Чаты'].includes(label)){
      event.preventDefault();event.stopImmediatePropagation();show(label==='Найти'?'find':'chats');
    }
  },true);
  // Capture before the base prototype's document-level exit handler.
  window.addEventListener('click',event=>{
    if((!feedbackFromNotifications&&!feedbackTripOrigin)||!event.target.closest('#keysFeedbackFlow [data-kfb-exit]'))return;
    if(feedbackTripOrigin){event.preventDefault();event.stopImmediatePropagation();const trigger=feedbackTripOrigin;feedbackTripOrigin=null;go('trips');trigger.focus({preventScroll:true});return;}
    event.preventDefault();event.stopImmediatePropagation();feedbackFromNotifications=false;const done=root.querySelector('#keysFeedbackFlow [data-kfb="success"] [data-kfb-exit]');if(done)done.textContent='Вернуться на главную';
    // The runtime still has notifications open. Reveal it without resetting its tab/history.
    root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s!==section);
  },true);
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow||event.data?.source!=='keys-arbana')return;
    if(event.origin!==location.origin&&location.protocol!=='file:')return;
    if(event.data.type==='nav')window.KeysAppNav.setUnread(event.data.unread);
    if(event.data.type==='header')root.querySelectorAll('.keys-app-header').forEach(h=>window.KeysAppHeader.setUnread(h,event.data.unread));
    if(event.data.type==='state'&&notificationOrigin){
      if(event.data.screen==='notifications')notificationOpened=true;
      else if(notificationOpened&&!event.data.screen){const origin=notificationOrigin;notificationOrigin=null;notificationOpened=false;go(origin);}
    }
    if(event.data.type==='reservation'){
      const b=event.data.booking;if(!b||typeof b.hotel!=='string')return;
      let card=root.querySelector('#keysNewReservation');
      if(!card){card=document.createElement('button');card.id='keysNewReservation';card.className='keys-new-reservation';root.querySelector('#keysHomeVariantThree main').append(card);card.addEventListener('click',()=>show('find',null,'booking'));}
      card.replaceChildren();const title=document.createElement('strong'),detail=document.createElement('span');
      title.textContent='Новая бронь · '+b.hotel;detail.textContent=b.arrival+' — '+b.departure+' · Посмотреть';card.append(title,detail);
    }
    if(event.data.type==='ready'){ready=true;send();frame.contentWindow.postMessage({source:'keys-host',stayDay:notificationDay()},location.protocol==='file:'?'*':location.origin);}
    if(event.data.type==='navigate'&&['trips','benefits','profile','stay-details','problem','feedback'].includes(event.data.target)){
      // Feedback is a temporary host screen; retain the notification entry point.
      if(event.data.target!=='feedback'){notificationOrigin=null;notificationOpened=false;}
      if(event.data.target==='feedback')feedbackTripOrigin=null;
      if(event.data.target==='feedback')root.querySelector('#keysFeedbackFlow')?.dispatchEvent(new CustomEvent('keys-feedback-context',{detail:{kind:event.data.feedbackKind??'first-night'}}));
      go(event.data.target);
    }
  });
  root.querySelectorAll('.k3-scroll,.kf-phone[data-screen="benefits"]>.kf-scroll').forEach(scroll=>scroll.prepend(window.KeysAppHeader.create()));
  const benefitsScroll=root.querySelector('.kf-phone[data-screen="benefits"]>.kf-scroll');
  if(benefitsScroll){
    [...benefitsScroll.children].filter(child=>!child.classList.contains('keys-app-header')).forEach(child=>child.remove());
    const benefits=document.createElement('div');benefits.className='keys-benefits';
    const benefitIcon=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    const chevron=benefitIcon('<path d="m9 5 7 7-7 7"/>');
    benefits.innerHTML=`
      <div class="keys-benefits-intro"><h1>Выгоды</h1><p>В «Ключах» — лучшие цены напрямую от отелей. Без скрытых комиссий.</p></div>
      <section class="keys-benefits-wallet" aria-label="Ваши баллы и уровень Silver">
        <div class="keys-benefits-membership"><span>Лояльность «Ключей»</span><span class="keys-benefits-tier-badge">Уровень Silver</span></div>
        <div class="keys-benefits-amount"><strong>2 400</strong><span>баллов</span></div>
        <p class="keys-benefits-conversion">1 балл = 1 ₽ скидки</p>
        <div class="keys-benefits-progress-label"><strong>Ещё 7 ночей до Gold</strong><span>18 из 25 ночей</span></div>
        <div class="keys-benefits-progress" role="progressbar" aria-label="Ночи до уровня Gold" aria-valuemin="0" aria-valuemax="25" aria-valuenow="18"><i></i></div>
        <details class="keys-benefits-level-details"><summary><span>Привилегии Silver</span>${chevron}</summary><div class="keys-benefits-reveal"><ul class="keys-benefits-perks"><li><strong>−10% на проживание</strong><span>Цена вашего уровня уже учтена при поиске.</span></li><li><strong>−15% на завтрак</strong><span>При добавлении к брони или во время проживания.</span></li><li><strong>Приоритет на выезд до 14:00</strong><span>При наличии свободных номеров.</span></li></ul><p>В отелях программы. Для уровня учитываем ночи за последние 12 месяцев.</p></div></details>
      </section>
      <section class="keys-benefits-guide" aria-labelledby="keys-guide-title"><h2 id="keys-guide-title">Больше от каждой поездки</h2>
        <details name="keys-reward-guide"><summary><span class="keys-benefits-guide-icon">${benefitIcon('<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-4 4h4v4h-4z"/>')}</span><span class="keys-benefits-guide-copy"><strong>Тратьте баллы</strong><span>До 20% проживания и услуг</span></span>${chevron}</summary><div class="keys-benefits-reveal"><p>Выберите оплату баллами при бронировании или в текущем счёте. Скидку увидите до оплаты.</p></div></details>
        <details name="keys-reward-guide"><summary><span class="keys-benefits-guide-icon">${benefitIcon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>')}</span><span class="keys-benefits-guide-copy"><strong>Копите с каждой поездкой</strong><span>7% баллами на уровне Silver</span></span>${chevron}</summary><div class="keys-benefits-reveal"><p>Бронируйте в «Ключах». Баллы начислим после выезда и оплаты счёта.</p><div class="keys-benefits-example"><span>Поездка за 10 000 ₽</span><strong>+700 баллов</strong></div></div></details>
      </section>
      <details class="keys-benefits-terms"><summary><span>Что важно знать о баллах</span>${chevron}</summary><div class="keys-benefits-reveal"><ul><li>1 балл = 1 ₽. Можно оплатить до 20% проживания или услуг в отелях программы.</li><li>Баллы действуют 24 месяца.</li><li>Баллами нельзя оплатить налоги и некоторые специальные тарифы.</li></ul></div></details>`;
    const pointsHistory=document.createElement('section');
    pointsHistory.className='keys-benefits-history';pointsHistory.setAttribute('aria-labelledby','keys-points-history-title');
    const renderPointsHistory=scenario=>{
      pointsHistory.innerHTML=`<h2 id="keys-points-history-title">История начислений</h2>${scenario==='after'?`<details class="keys-points-entry"><summary><span class="keys-points-trip"><strong>Maidens Hotel</strong><span>Москва · 12–19 сентября</span></span><span class="keys-points-credit"><strong>+2 240</strong><span>баллов</span></span>${chevron}</summary><div class="keys-benefits-reveal"><dl class="keys-points-facts"><div><dt>Начислено</dt><dd>19 сентября 2026</dd></div><div><dt>За что</dt><dd>Завершённое проживание · 7 ночей</dd></div><div><dt>Статус</dt><dd>На вашем счёте</dd></div></dl></div></details>`:'<p class="keys-points-empty">Здесь появятся начисления за завершённые поездки.</p>'}`;
    };
    renderPointsHistory(document.body.dataset.keysScenario);
    root.addEventListener('keys-scenario-change',event=>renderPointsHistory(event.detail.scenario));
    benefits.querySelector('.keys-benefits-wallet').after(pointsHistory);
    benefitsScroll.append(benefits);
  }
  const profilePhone=root.querySelector('.kf-phone[data-screen="profile"]');
  if(profilePhone){
    profilePhone.querySelector('.kf-header')?.remove();
    const header=document.createElement('header');header.className='keys-profile-header';
    header.innerHTML='<button type="button" class="keys-profile-back" data-profile-back aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button><h1>Профиль</h1>';
    profilePhone.prepend(header);
    const identity=profilePhone.querySelector('.kf-profile');
    const camera='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5 6.5 8H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2.5L16 5Z"/><circle cx="12" cy="13" r="3.5"/></svg>';
    identity.innerHTML=`<div class="keys-profile-person"><button type="button" class="keys-profile-photo" aria-label="Загрузить фото профиля" data-profile-photo><span data-avatar-initials>ТГ</span><img data-profile-image hidden alt="Фото профиля"><span class="keys-profile-camera">${camera}</span></button><div class="keys-profile-name"><strong>Татьяна Глазырина</strong><dl class="keys-profile-contacts"><div><dt>Телефон</dt><dd>+7 (900) 123-45-67</dd></div></dl></div></div><input type="file" accept="image/jpeg,image/png,image/webp" data-profile-upload hidden><p class="keys-profile-photo-status" data-photo-status role="status" hidden></p>`;
    const loyalty=document.createElement('button');
    loyalty.type='button';loyalty.className='keys-profile-loyalty';loyalty.dataset.profileLoyalty='';
    loyalty.setAttribute('aria-label','Лояльность Ключей: Silver, 2 400 баллов. Открыть баллы и привилегии');
    loyalty.innerHTML='<span class="keys-profile-loyalty-top"><span>Лояльность «Ключей»</span><span class="keys-profile-tier">Silver</span></span><span class="keys-profile-balance"><strong>2 400</strong><span>баллов на поездки</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span><span class="keys-profile-progress" role="progressbar" aria-label="Ночи до уровня Gold" aria-valuemin="0" aria-valuemax="25" aria-valuenow="18" aria-valuetext="18 из 25 ночей, ещё 7 до Gold"><i></i></span><span class="keys-profile-progress-copy"><span>18 из 25 ночей</span><span>Ещё 7 до Gold</span></span>';
    identity.after(loyalty);
    profilePhone.querySelector('[data-open="benefits"]')?.remove();
    profilePhone.querySelectorAll('.kf-section h2').forEach(title=>{if(title.textContent==='Оплата и выгоды')title.textContent='Документы и оплата';});
    const documents=document.createElement('button');
    documents.type='button';documents.className='kf-row';documents.dataset.profileDocuments='';
    documents.innerHTML='<span class="kf-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/></svg></span><span><strong>Документы</strong><small>Паспорт для бронирования и заселения</small></span><b class="kf-chevron" aria-hidden="true">›</b>';
    profilePhone.querySelector('[data-open="payments"]').before(documents);
    const passportPage=document.createElement('section');
    passportPage.className='kh-overlay keys-passport-page';passportPage.hidden=true;
    passportPage.setAttribute('role','dialog');passportPage.setAttribute('aria-modal','true');passportPage.setAttribute('aria-labelledby','keys-passport-title');
    passportPage.innerHTML=`<header class="kh-detail-header"><button type="button" class="kh-back" data-passport-back aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button><h2 id="keys-passport-title">Документы</h2></header><p class="keys-passport-intro">Добавьте паспорт, чтобы быстрее бронировать отели и проходить онлайн-регистрацию.</p><section class="keys-passport-card"><div class="keys-passport-heading"><h3>Паспорт</h3><span data-passport-state hidden>Добавлен</span></div><p>Татьяна Глазырина</p><div class="keys-passport-preview" hidden><img alt="Загруженный разворот паспорта" hidden><span data-passport-filename></span></div><p class="keys-passport-hint">Разворот с фотографией. Все данные должны быть видны, без бликов и обрезанных краёв.</p><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" data-passport-input hidden><button type="button" class="kh-primary" data-passport-upload>Загрузить паспорт</button><p class="keys-passport-formats">JPG, PNG, WebP или PDF · до 10 МБ</p><button type="button" class="keys-passport-remove" data-passport-remove hidden>Удалить документ</button></section><p class="keys-passport-message" role="status" hidden></p>`;
    profilePhone.append(passportPage);
    const passportInput=passportPage.querySelector('[data-passport-input]'),passportButton=passportPage.querySelector('[data-passport-upload]'),passportPreview=passportPage.querySelector('.keys-passport-preview'),passportImage=passportPreview.querySelector('img'),passportMessage=passportPage.querySelector('[role="status"]');
    let passportURL=null,passportVersion=0;
    const closePassport=()=>{passportPage.hidden=true;header.inert=false;header.removeAttribute('aria-hidden');profilePhone.querySelector('.kf-scroll').inert=false;profilePhone.querySelector('.kf-scroll').removeAttribute('aria-hidden');documents.focus({preventScroll:true});};
    documents.addEventListener('click',()=>{passportPage.hidden=false;header.inert=true;header.setAttribute('aria-hidden','true');profilePhone.querySelector('.kf-scroll').inert=true;profilePhone.querySelector('.kf-scroll').setAttribute('aria-hidden','true');passportPage.querySelector('[data-passport-back]').focus({preventScroll:true});});
    passportPage.querySelector('[data-passport-back]').addEventListener('click',closePassport);
    passportButton.addEventListener('click',()=>passportInput.click());
    const clearPassport=()=>{
      passportVersion++;if(passportURL)URL.revokeObjectURL(passportURL);passportURL=null;
      passportImage.removeAttribute('src');passportImage.hidden=true;passportPreview.hidden=true;
      passportPage.querySelector('[data-passport-filename]').textContent='';
      passportPage.querySelector('[data-passport-state]').hidden=true;passportPage.querySelector('[data-passport-remove]').hidden=true;
      passportButton.textContent='Загрузить паспорт';documents.querySelector('small').textContent='Паспорт для бронирования и заселения';
      passportMessage.hidden=true;passportInput.value='';passportButton.focus({preventScroll:true});
    };
    passportPage.querySelector('[data-passport-remove]').addEventListener('click',clearPassport);
    passportInput.addEventListener('change',async()=>{
      const file=passportInput.files?.[0];if(!file)return;
      const version=++passportVersion;
      passportMessage.hidden=true;
      const error=text=>{passportMessage.textContent=text;passportMessage.hidden=false;};
      if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)){error('Выберите фотографию JPG, PNG, WebP или документ PDF.');passportInput.value='';return;}
      if(file.size>10*1024*1024){error('Размер файла должен быть не больше 10 МБ.');passportInput.value='';return;}
      const url=URL.createObjectURL(file);
      try{
        const isPhoto=file.type.startsWith('image/');
        if(isPhoto){const image=new Image();image.src=url;await image.decode();}
        if(version!==passportVersion){URL.revokeObjectURL(url);return;}
        if(passportURL)URL.revokeObjectURL(passportURL);passportURL=url;
        passportImage.hidden=!isPhoto;if(isPhoto)passportImage.src=url;else passportImage.removeAttribute('src');
        passportPreview.hidden=false;passportPage.querySelector('[data-passport-filename]').textContent=file.name;
        passportPage.querySelector('[data-passport-state]').hidden=false;passportPage.querySelector('[data-passport-remove]').hidden=false;
        passportButton.textContent='Заменить паспорт';documents.querySelector('small').textContent='Паспорт добавлен';
      }catch{URL.revokeObjectURL(url);if(version===passportVersion)error('Не удалось открыть файл. Выберите другую фотографию.');}
      finally{passportInput.value='';}
    });
    passportPage.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closePassport();}
      if(event.key==='Tab'){
        const buttons=[...passportPage.querySelectorAll('button')].filter(button=>!button.hidden),first=buttons[0],last=buttons.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });

    const upload=identity.querySelector('[data-profile-upload]'),avatarButton=identity.querySelector('[data-profile-photo]'),avatar=identity.querySelector('[data-profile-image]'),initials=identity.querySelector('[data-avatar-initials]'),status=identity.querySelector('[data-photo-status]');
    const avatarKey='keys-profile-avatar-v1';
    const showAvatar=src=>{window.KeysAppHeader.setAvatar(src);avatar.src=src;avatar.hidden=false;initials.hidden=true;avatarButton.setAttribute('aria-label','Изменить фото профиля');};
    showAvatar('./sections/profile-avatar.jpg');
    try{const saved=localStorage.getItem(avatarKey);if(saved?.startsWith('data:image/jpeg;base64,'))showAvatar(saved);}catch{}
    avatarButton.addEventListener('click',()=>upload.click());
    upload.addEventListener('change',async()=>{
      const file=upload.files?.[0];if(!file)return;
      status.hidden=true;status.textContent='';
      const fail=message=>{status.textContent=message;status.hidden=false;};
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)){fail('Выберите фото в формате JPG, PNG или WebP.');upload.value='';return;}
      if(file.size>10*1024*1024){fail('Фото слишком большое. Выберите файл до 10 МБ.');upload.value='';return;}
      avatarButton.disabled=true;avatarButton.setAttribute('aria-busy','true');
      const url=URL.createObjectURL(file);
      try{
        const image=new Image();image.src=url;await image.decode();
        const canvas=document.createElement('canvas');canvas.width=canvas.height=384;
        const context=canvas.getContext('2d'),size=Math.min(image.naturalWidth,image.naturalHeight);
        context.fillStyle='#fff';context.fillRect(0,0,384,384);
        context.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,384,384);
        const photo=canvas.toDataURL('image/jpeg',.88);
        showAvatar(photo);
        try{localStorage.setItem(avatarKey,photo);}catch{fail('Фото обновлено, но не сохранится после перезагрузки. Освободите место в браузере.');}
      }catch{fail('Не удалось открыть фото. Попробуйте другой файл.');}
      finally{URL.revokeObjectURL(url);upload.value='';avatarButton.disabled=false;avatarButton.removeAttribute('aria-busy');avatarButton.focus({preventScroll:true});}
    });

  }
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-profile-loyalty]')){event.preventDefault();event.stopImmediatePropagation();go('benefits');return;}
    if(event.target.closest('[data-profile-back]')){event.preventDefault();event.stopImmediatePropagation();closeProfile();return;}
    const button=event.target.closest('[data-header-action]');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    const action=button.dataset.headerAction;
    if(action==='home')go('trips');
    if(action==='profile')go('profile');
    if(action==='notifications'){
      const current=button.closest('.kf-phone')?.dataset.screen??'trips';
      notificationOrigin=current;notificationOpened=false;show('find',null,'notifications');
    }
  },true);
  root.addEventListener('keys-scenario-change',event=>{
    cancelProfileMotion();
    const day=notificationDay(event.detail.scenario,event.detail.stayDay);
    if(!frame.hasAttribute('src'))frame.src='./sections/index.html?v=stay-scenarios-1&stayDay='+encodeURIComponent(day);
    else if(ready)frame.contentWindow.postMessage({source:'keys-host',stayDay:day},location.protocol==='file:'?'*':location.origin);
  });
  root.addEventListener('keys-open-trip-review',event=>{
    root.querySelector('#keysFeedbackFlow')?.dispatchEvent(new CustomEvent('keys-feedback-context',{detail:{kind:'stay'}}));
    go('feedback');feedbackFromNotifications=false;feedbackTripOrigin=event.detail.trigger;
    root.querySelector('#keysFeedbackFlow [data-kfb="success"] [data-kfb-exit]').textContent='К поездке';
  });
  root.addEventListener('keys-open-hotel-chat',()=>show('chats','maidens'));
  root.addEventListener('keys-open-stay-details',()=>go('stay-details'));
  root.addEventListener('keys-open-hotel-search',()=>show('find'));
  // Catch internal legacy links into Find/Assistant as well as the bottom navigation.
  new MutationObserver(()=>{
    const search=root.querySelector('[data-unified-section="search"]');
    const account=root.querySelector('[data-unified-section="account"]');
    const assistant=account.querySelector('[data-screen="assistant"]')?.closest('.kf-grid>section');
    if(!search.hidden)show('find');
    else if(!account.hidden&&assistant&&!assistant.hidden)show('chats');
  }).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
})();
