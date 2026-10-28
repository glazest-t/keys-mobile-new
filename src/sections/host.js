/* One persistent runtime shares search, favourites, booking drafts and chats across both tabs. */
(() => {
  const root=document.getElementById('keysUnifiedPrototype');
  root.keysConnectedHotelCards=[];
  let loyaltyMissing=document.body.dataset.keysHotelLoyaltyMissing==='true';
  root.addEventListener('keys-scenario-change',()=>{
    const missing=document.body.dataset.keysHotelLoyaltyMissing==='true';
    if(missing!==loyaltyMissing)root.keysConnectedHotelCards=[];
    loyaltyMissing=missing;
  });
  const section=document.createElement('section');
  section.className='ku-section';section.dataset.unifiedSection='arbana-sections';section.hidden=true;
  const frame=document.createElement('iframe');frame.id='keysSectionsFrame';frame.title='Найти и Чаты';
  section.append(frame);root.append(section);
  let ready=false,pending=null,notificationOrigin=null,notificationOpened=false,feedbackFromNotifications=false,feedbackTripOrigin=null,profileOrigin=null,benefitsOrigin=null;
  let chatOrigin=null,chatOpened=false,runtimeReturn=null,entryOrigin=null;
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
    const desktop=document.body.dataset.keysView==='desktop';
    const offset=desktop?'translateY(10px)':'translateX(40px)';
    const frames=exiting
      ?[{transform:'translate(0)',opacity:1},{transform:desktop?'translateY(6px)':'translateX(32px)',opacity:0}]
      :[{transform:offset,opacity:0},{transform:'translate(0)',opacity:1}];
    profileAnimations=parts.map(part=>part.animate(frames,{duration:exiting?160:280,easing:exiting?'cubic-bezier(.4,0,1,1)':'cubic-bezier(.22,1,.36,1)',fill:'both'}));
    Promise.allSettled(profileAnimations.map(animation=>animation.finished)).then(()=>{
      if(id!==profileMotionId)return;
      cancelProfileMotion();complete();
    });
  };
  const notificationDay=(scenario=document.body.dataset.keysScenario,day=document.body.dataset.keysStayDay)=>scenario==='after'?'after':scenario==='stay'?(day==='key-error'?'day-2':day??'day-2'):'day-1';
  const send=()=>{if(ready&&pending){frame.contentWindow.postMessage({source:'keys-host',...pending,swipeFirstRun:document.body.dataset.keysSwipeFirstRun||null,guestMode:document.body.dataset.keysGuestSearch==='true',guestAuthorized:document.body.dataset.keysGuestAuthorized==='true',hotelLoyaltyMissing:document.body.dataset.keysHotelLoyaltyMissing==='true',loyaltyTier:document.body.dataset.keysLoyalty,partnerApproved:document.body.dataset.keysPartnerApproved==='true',stayDay:notificationDay()},location.protocol==='file:'?'*':location.origin);pending=null;}};
  const show=(tab,hotelId,screen,discovery,bookingId)=>{
    cancelProfileMotion();
    runtimeReturn=null;
    if(tab==='chats'&&hotelId&&section.hidden){
      chatOrigin=[...root.querySelectorAll(':scope>.ku-section')].map(el=>[el,el.hidden]);chatOpened=false;
    }else if(tab!=='chats'){chatOrigin=null;chatOpened=false;}
    const entryReturn=section.hidden&&tab==='find'
      ? (['saved','created-booking','hotel-loyalty-connect','hotel'].includes(screen)?{kind:'screen',screen}
        : discovery?.mode==='advice'?{kind:'screen',screen:'describe'}
        : discovery?.searchRequest&&discovery.hotelId?{kind:'screen',screen:'hotel'}
        : discovery&&(discovery.searchRequest||discovery.collection||discovery.city)?{kind:'results'}:null)
      : null;
    entryOrigin=entryReturn?{sections:[...root.querySelectorAll(':scope>.ku-section')].map(el=>[el,el.hidden]),focus:document.activeElement}:null;
    section.dataset.runtimeScreen=screen??'';section.dataset.runtimeTab=tab;
    root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s!==section);
    pending={tab,hotelId,screen,discovery,bookingId,entryReturn};
    if(!frame.hasAttribute('src')) frame.src='./sections/index.html?v=trip-search-20261015&loyalty='+encodeURIComponent(document.body.dataset.keysLoyalty||'Silver')+'&stayDay='+encodeURIComponent(notificationDay())+'&guestSearch='+String(document.body.dataset.keysGuestSearch==='true');
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
  const go=(target,preserveOrigin=false)=>{
    cancelProfileMotion();
    if(target==='profile'&&!preserveOrigin)captureProfileOrigin();
    if(target==='benefits'&&!preserveOrigin&&document.body.dataset.keysView==='desktop'){
      const account=root.querySelector('[data-unified-section="account"]');
      const current=account.querySelector('.kf-phone[data-screen="benefits"]')?.closest('.kf-grid>section');
      if(account.hidden||current?.hidden)benefitsOrigin={sections:[...root.querySelectorAll(':scope>.ku-section')].map(el=>[el,el.hidden]),pages:[...account.querySelectorAll('.kf-grid>section')].map(el=>[el,el.hidden]),focus:document.activeElement};
    }
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
  const navigateBottom=tab=>{
    if(!['trips','find','chats','bonuses'].includes(tab))return;
    if(root.querySelector('.kh-overlay:not([hidden])'))window.KeysHomeViews?.close();
    if(tab==='find'||tab==='chats')show(tab);
    else go(tab==='bonuses'?'benefits':'trips');
  };
  root.addEventListener('keys-bottom-navigate',event=>navigateBottom(event.detail.tab));
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    const label=button.textContent.trim();
    if(button.matches('.keys-bottom-tab')){
      event.preventDefault();event.stopImmediatePropagation();navigateBottom(button.dataset.bottomTab);return;
    }
    if(button.closest('nav')&&['Найти','Чаты'].includes(label)){
      event.preventDefault();event.stopImmediatePropagation();show(label==='Найти'?'find':'chats');
    }
  },true);
  // Capture before the base prototype's document-level exit handler.
  window.addEventListener('click',event=>{
    if(runtimeReturn){
      const exit=event.target.closest('#keysStayDetails .ksd-back[data-exit]');
      const problemBack=runtimeReturn==='problem'&&event.target.closest('#keysStayDetails .ksd-detail-back');
      if(exit||problemBack){
        event.preventDefault();event.stopImmediatePropagation();runtimeReturn=null;
        const layer=root.querySelector('#keysStayDetails .ksd-detail-layer');if(layer)layer.hidden=true;
        root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s!==section);
        frame.focus({preventScroll:true});return;
      }
      if(event.target.closest('nav'))runtimeReturn=null;
    }
    if((!feedbackFromNotifications&&!feedbackTripOrigin)||!event.target.closest('#keysFeedbackFlow [data-kfb-exit]'))return;
    if(feedbackTripOrigin){event.preventDefault();event.stopImmediatePropagation();const trigger=feedbackTripOrigin;feedbackTripOrigin=null;go('trips');trigger.focus({preventScroll:true});return;}
    event.preventDefault();event.stopImmediatePropagation();feedbackFromNotifications=false;const done=root.querySelector('#keysFeedbackFlow [data-kfb="success"] [data-kfb-exit]');if(done)done.textContent='Вернуться на главную';
    // The runtime still has notifications open. Reveal it without resetting its tab/history.
    root.querySelectorAll(':scope>.ku-section').forEach(s=>s.hidden=s!==section);
  },true);
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow||event.data?.source!=='keys-arbana')return;
    if(event.origin!==location.origin&&location.protocol!=='file:')return;
    if(event.data.type==='profile-settings'){window.KeysProfile?.open('notifications');return;}
    if(event.data.type==='ideas-draft')root.dispatchEvent(new CustomEvent('keys-ideas-draft-change'));
    if(event.data.type==='hotel-loyalty'&&event.data.missing===(document.body.dataset.keysHotelLoyaltyMissing==='true')){
      root.keysConnectedHotelCards=Array.isArray(event.data.cards)?event.data.cards.filter(card=>typeof card.hotelId==='string'&&typeof card.name==='string'&&Number.isFinite(card.discount)&&card.discount>0&&card.discount<=100):[];
      root.dispatchEvent(new CustomEvent('keys-hotel-loyalty-change'));
    }
    if(event.data.type==='return-to-entry'){
      const origin=entryOrigin;entryOrigin=null;
      if(origin){origin.sections.forEach(([el,hidden])=>el.hidden=hidden);origin.focus?.focus({preventScroll:true});}
      else go('trips');
      return;
    }
    if(event.data.type==='nav')window.KeysAppNav.setUnread(event.data.unread);
    if(event.data.type==='header')root.querySelectorAll('.keys-app-header').forEach(h=>window.KeysAppHeader.setUnread(h,event.data.unread));
    if(event.data.type==='state'){section.dataset.runtimeResults=String(!!event.data.results);section.dataset.runtimeFavorites=event.data.favorites||'';section.dataset.runtimeScreen=event.data.screen??'';section.dataset.runtimeTab=event.data.tab??'find';}
    if(event.data.type==='state'&&chatOrigin){
      if(event.data.tab==='chats'&&event.data.screen==='chat')chatOpened=true;
      else if(chatOpened&&event.data.tab==='chats'&&!event.data.screen){
        const origin=chatOrigin;chatOrigin=null;chatOpened=false;
        origin.forEach(([el,hidden])=>el.hidden=hidden);
      }else if(event.data.tab&&event.data.tab!=='chats'){chatOrigin=null;chatOpened=false;}
    }
    if(event.data.type==='state'&&notificationOrigin){
      if(event.data.screen==='notifications')notificationOpened=true;
      else if(notificationOpened&&!event.data.screen){const origin=notificationOrigin;notificationOrigin=null;notificationOpened=false;if(!event.data.tab||event.data.tab==='find')go(origin,true);}
    }
    if(event.data.type==='cancel-booking'){
      const b=event.data;
      window.KeysBookingCancellation.open({...b,onComplete:result=>{
       frame.contentWindow.postMessage({source:'keys-host',cancelledBooking:{id:b.bookingId,result}},location.protocol==='file:'?'*':location.origin);
       const card=root.querySelector('#keysNewReservation');if(card?.dataset.bookingId===b.bookingId){card.querySelector('.keys-new-booking-status').textContent='Отменена';card.querySelector('.keys-new-booking-heading strong').textContent='Бронирование';}
      }});
    }
    if(event.data.type==='trip-bookings'&&Array.isArray(event.data.bookings)){
      window.KeysTripBookings=event.data.bookings.filter(b=>b&&typeof b.id==='string'&&typeof b.hotel==='string').map(b=>{
        let photo='';try{const url=new URL(b.photo||'',frame.src);if(b.photo&&['http:','https:'].includes(url.protocol))photo=url.href;}catch{}
        return {...b,photo};
      });
      root.dispatchEvent(new CustomEvent('keys-trip-bookings-change'));
    }
    if(event.data.type==='reservation'){
      const b=event.data.booking;if(!b||typeof b.hotel!=='string')return;
      let card=root.querySelector('#keysNewReservation');
      if(!card){card=document.createElement('button');card.type='button';card.id='keysNewReservation';card.className='keys-new-reservation';root.querySelector('#keysHomeVariantThree main').append(card);card.addEventListener('click',()=>show('find',null,'created-booking',null,card.dataset.bookingId));}
      card.dataset.bookingId=b.id;card.setAttribute('aria-label','Детали брони '+b.id+' · '+b.hotel);
      card.innerHTML='<span class="keys-new-booking-heading"><strong>Новая бронь</strong><span class="keys-new-booking-status"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>Подтверждена</span></span><span class="keys-new-booking-body"><img alt=""><span class="keys-new-booking-copy"><strong></strong><span class="keys-new-booking-dates"></span><span class="keys-new-booking-guests"></span></span></span><span class="keys-new-booking-action">Детали брони<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span>';
      const date=value=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','');
      card.querySelector('.keys-new-booking-copy strong').textContent=b.hotel;
      card.querySelector('.keys-new-booking-dates').textContent=date(b.arrival)+' — '+date(b.departure);
      card.querySelector('.keys-new-booking-guests').textContent=b.guests||'';
      const photo=card.querySelector('img');if(b.photo){const url=new URL(b.photo,frame.src);if(['http:','https:'].includes(url.protocol))photo.src=url.href;else photo.hidden=true;}else photo.hidden=true;

    }
    if(event.data.type==='checkout-profile'){const c=event.data.contact;if(c&&typeof c.firstName==='string'){root.querySelectorAll('.keys-profile-name>strong,[data-open="travelerProfile"] strong').forEach(el=>el.textContent=[c.firstName,c.lastName].filter(Boolean).join(' '));root.querySelectorAll('.keys-profile-contacts dd').forEach(el=>el.textContent=c.phone);}}
    if(event.data.type==='ready'){ready=true;send();sendNoticeLayout();frame.contentWindow.postMessage({source:'keys-host',swipeFirstRun:document.body.dataset.keysSwipeFirstRun||null,hotelLoyaltyMissing:document.body.dataset.keysHotelLoyaltyMissing==='true',loyaltyTier:document.body.dataset.keysLoyalty,partnerApproved:document.body.dataset.keysPartnerApproved==='true',stayDay:notificationDay()},location.protocol==='file:'?'*':location.origin);}
    if(event.data.type==='navigate'&&['trips','benefits','profile','stay-details','problem','feedback'].includes(event.data.target)){
      // Feedback is a temporary host screen; retain the notification entry point.
      if(event.data.target!=='feedback'){notificationOrigin=null;notificationOpened=false;}
      if(event.data.target==='feedback')feedbackTripOrigin=null;
      if(event.data.target==='feedback')root.querySelector('#keysFeedbackFlow')?.dispatchEvent(new CustomEvent('keys-feedback-context',{detail:{kind:event.data.feedbackKind??'first-night'}}));
      if(event.data.target==='trips'&&event.data.scenario==='booked'){
        window.KeysScenarios.select('booked',{preserveView:true});
        root.querySelector('#keysHomeVariantThree .k3-scroll').scrollTop=0;
      }
      go(event.data.target);
      runtimeReturn=['stay-details','problem'].includes(event.data.target)?event.data.target:null;
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
      <div class="keys-benefits-intro"><h1>Выгоды</h1></div>
      <section class="keys-benefits-wallet" aria-label="Баллы Ключей">
        <div class="keys-benefits-membership"><span>Баллы Ключей</span></div>
        <div class="keys-benefits-amount"><strong>2 400</strong><span>баллов доступно</span></div>
        <p class="keys-benefits-conversion">1 балл = 1 ₽ скидки</p>
      </section>
      <section class="keys-benefits-guide" aria-labelledby="keys-guide-title"><h2 id="keys-guide-title">Как работают баллы Ключей</h2>
        <details name="keys-reward-guide"><summary><span class="keys-benefits-guide-icon">${benefitIcon('<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-4 4h4v4h-4z"/>')}</span><span class="keys-benefits-guide-copy"><strong>Тратьте баллы</strong><span>До 20% проживания и услуг</span></span>${chevron}</summary><div class="keys-benefits-reveal"><p>Выберите оплату баллами при бронировании или в текущем счёте. Скидку увидите до оплаты.</p></div></details>
        <details name="keys-reward-guide"><summary><span class="keys-benefits-guide-icon">${benefitIcon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>')}</span><span class="keys-benefits-guide-copy"><strong>Копите с каждой поездкой</strong><span>Баллы Ключей за каждую поездку</span></span>${chevron}</summary><div class="keys-benefits-reveal"><p>Бронируйте в «Ключах». Баллы начислим после выезда и оплаты счёта.</p><div class="keys-benefits-example"><span>Поездка за 10 000 ₽</span><strong>+700 баллов</strong></div></div></details>
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
    const keysGroup=document.createElement('div');keysGroup.className='keys-benefits-keys-group';
    keysGroup.append(benefits.querySelector('.keys-benefits-wallet'));
    ['.keys-benefits-guide','.keys-benefits-history','.keys-benefits-terms'].forEach(selector=>keysGroup.append(benefits.querySelector(selector)));
    benefits.append(keysGroup);
    const hotels=document.createElement('section');hotels.className='keys-benefits-hotels';
    hotels.setAttribute('aria-labelledby','keys-hotel-programs-title');
    const searchIcon=benefitIcon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>');
    const buildingIcon=benefitIcon('<path d="M4 21V5l8-3v19M12 8h8v13M2 21h20M7 7v1m0 3v1m0 3v1m9-4h1m-1 4h1M7 21v-2h2v2"/>');
    // Demo memberships show how a larger portfolio of independent programmes behaves.
    const discountLevels=[
      {name:'Silver',qualification:'От 1 ночи за 12 месяцев',benefit:'Скидка 10% на проживание',benefits:[{title:'Скидка 10% на проживание',text:'Применяется к доступным тарифам при бронировании в приложении.'},{title:'Скидка 15% на завтрак'},{title:'Поздний выезд',text:'При наличии свободных номеров. Время выезда согласуйте с отелем.'}]},
      {name:'Gold',qualification:'От 25 ночей за 12 месяцев',benefit:'Скидка 15% и дополнительные привилегии',description:['Больше преимуществ для частых поездок. Уровень открывает специальные предложения и услуги отеля.'],benefits:[{title:'Скидка 15% на проживание'},{title:'Специальный тариф для уровня Gold',text:'Доступен при выборе номера, если отель предлагает его на ваши даты.'},{title:'Фитнес-зал бесплатно'},{title:'Бесплатная парковка',text:'При наличии мест на парковке отеля.'},{title:'Скидка 10% в ресторане'}],conditions:'Услуги предоставляются во время проживания. Уточните доступность и часы работы у отеля.'},
      {name:'Platinum',qualification:'От 50 ночей за 12 месяцев',benefit:'Все привилегии Gold и повышение категории',description:['Максимум преимуществ программы для постоянных гостей.','Скидки и услуги действуют на условиях выбранного тарифа. Отель подтвердит дополнительные возможности перед заездом.'],benefits:[{title:'Скидка 15% на проживание'},{title:'Специальные предложения для участников программы'},{title:'Бесплатный фитнес-зал'},{title:'Бесплатная парковка при наличии мест'},{title:'Скидка 10% в ресторане'},{title:'Повышение категории номера',text:'При наличии свободного номера следующей категории. Не гарантируется заранее и подтверждается отелем при заселении.'}],conditions:'Для расчёта уровня учитываются завершённые проживания за последние 12 месяцев. Отменённые бронирования и незаезды не учитываются.'}
    ];
    const pointsLevels=[
      {name:'Classic',qualification:'После подключения программы',benefit:'3% стоимости проживания баллами',benefits:[{title:'Возврат 3% баллами',text:'Баллы поступают на счёт после завершения проживания.'},{title:'Баллы на следующую поездку',text:'1 балл = 1 ₽. Баллы этой программы действуют только в этом отеле.'}]},
      {name:'Silver',qualification:'От 5 000 начисленных баллов за год',benefit:'5% стоимости проживания баллами',description:['Уровень зависит от всех начисленных за год баллов. Доступный остаток можно тратить: это не снижает уровень.'],benefits:[{title:'Возврат 5% баллами'},{title:'Оплата баллами до 30% проживания',text:'Доступная сумма списания отображается при оформлении брони.'}],conditions:'Баллы действуют 12 месяцев с даты начисления.'},
      {name:'Gold',qualification:'От 10 000 начисленных баллов за год',benefit:'7% баллами и поздний выезд',benefits:[{title:'Возврат 7% баллами',text:'Повышенное начисление за завершённые проживания.'},{title:'Оплата баллами до 30% проживания'},{title:'Поздний выезд',text:'При наличии свободных номеров. Запросите услугу у отеля.'}],conditions:'Уровень пересчитывается по начислениям за последние 12 месяцев. Списанные баллы продолжают учитываться при определении уровня.'}
    ];
    const programmes=[
      {id:'maidens',hotelId:'maidens',name:'Maidens Hotel',city:'Москва',type:'discount',value:'−10%',tier:'Silver',levels:discountLevels,photo:'./scenarios/maidens-hotel.jpg',perks:['Скидка 10% на проживание','Скидка 15% на завтрак','Поздний выезд при наличии номеров']},
      {id:'camellia',hotelId:'more',name:'Swissôtel Камелия',city:'Сочи',type:'points',value:'1 500',photo:'./sections/images/sochi/swissotel/92b13884e717.webp',perks:['Возвращаем 5% стоимости проживания баллами','1 балл = 1 ₽ · можно оплатить до 20% проживания','Баллы действуют 12 месяцев']},
      {id:'sea-galaxy',hotelId:'quiet-coast',name:'Sea Galaxy',city:'Сочи',type:'discount',value:'−7%',photo:'./sections/images/sochi/seagalaxy/73d929a6ee5c.webp',perks:['Скидка 7% на проживание','Скидка применяется автоматически при бронировании','Единые условия без уровней и накопления баллов']},
      {id:'pullman',hotelId:'pines',name:'Pullman Сочи Центр',city:'Сочи',type:'points',value:'3 200',tier:'Silver',photo:'./sections/images/sochi/pullman/1786b02bcdb8.webp',progress:{earned:6500,next:10000,nextTier:'Gold'},levels:pointsLevels,perks:['Возвращаем 5% стоимости проживания баллами','1 балл = 1 ₽ · можно оплатить до 30% проживания','Уровень зависит от начисленных за год баллов. Списание не снижает уровень']},
      {id:'grace-network',name:'Грейс',city:'Сочи',type:'network',value:'−10%',tier:'Gold',perks:['Скидка 10% на проживание во всех отелях сети','Единая карта лояльности для отелей сети'],members:[
        {id:'grace-gorizont',hotelId:'riviera',name:'Грейс Горизонт',city:'Сочи',photo:'./sections/images/sochi/gorizont/658686fcc1b2.webp'},
        {id:'grace-nairi',hotelId:'sunny',name:'Грейс Наири',city:'Сочи',photo:'./sections/images/sochi/nairi/0081f0b6f91d.webp'},
        {id:'grace-paraiso',hotelId:'sea-line',name:'Грейс Эль Параисо',city:'Сочи',photo:'./sections/images/sochi/elparaiso/be699219d7d9.webp'}]}
    ];
    const networkMembers=p=>p.members.map(h=>({...h,type:'discount',value:p.value,tier:p.tier,networkId:p.id,networkName:p.name,perks:p.perks}));
    hotels.innerHTML=`<div class="keys-benefits-hotels-heading"><h2 id="keys-hotel-programs-title">Лояльность отелей</h2><p>Ваши скидки, баллы и привилегии</p></div>
      <label class="keys-loyalty-search">${searchIcon}<input type="search" placeholder="Отель или город" aria-label="Найти программу по отелю или городу" autocomplete="off"></label>
      <div class="keys-loyalty-filters" role="group" aria-label="Тип программы">${[['all','Все'],['discount','Скидки'],['points','Баллы'],['network','Сети']].map(([id,label])=>`<button type="button" data-program-filter="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div>
      <div class="keys-loyalty-list" id="keys-loyalty-list"></div>
      <p class="keys-loyalty-empty" hidden>Ничего не найдено. Попробуйте другой отель или город.</p>
      <button type="button" class="keys-loyalty-more" aria-controls="keys-loyalty-list"></button>
      <span class="keys-loyalty-live" aria-live="polite" role="status"></span>`;
    let filter='all',query='',benefitsPage='overview',detailOrigin='overview',selectedProgram=null,selectedNetwork=null,networkOrigin='overview';
    const list=hotels.querySelector('.keys-loyalty-list'),more=hotels.querySelector('.keys-loyalty-more');
    more.hidden=true;
    const normalize=text=>text.toLocaleLowerCase('ru').replaceAll('ё','е').trim();
    const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const currentProgrammes=()=>{
      if(document.body.dataset.keysGuestSearch==='true'&&document.body.dataset.keysGuestAuthorized!=='true')return [];
      if(document.body.dataset.keysHotelLoyaltyMissing==='true')return (root.keysConnectedHotelCards||[]).map(card=>({id:card.hotelId,hotelId:card.hotelId,name:card.name,city:'',type:'discount',value:'−'+card.discount+'%',perks:['Скидка '+card.discount+'% на проживание','Применяется при бронировании в этом отеле']}));
      return programmes.map(p=>p.id==='maidens'&&document.body.dataset.keysLoyalty==='Gold'?{...p,tier:'Gold',value:'−15%',perks:['Скидка 15% на проживание','Специальный тариф только для гостей уровня Gold','Фитнес-зал бесплатно','Бесплатная парковка','Скидка 10% в ресторане']}:p);
    };
    const programDescription=p=>[p.type==='network'?p.members.length+' отеля':p.tier,p.city].filter(Boolean).join(' · ');
    const programRow=p=>`<button type="button" class="keys-program-row" data-hotel-program="${escape(p.id)}"><span class="keys-program-symbol">${buildingIcon}</span><span class="keys-program-copy"><strong>${escape(p.name)}</strong>${p.type==='network'?'<span class="keys-program-network-badge">Сеть отелей</span>':''}${programDescription(p)?`<span>${escape(programDescription(p))}</span>`:''}</span><span class="keys-program-benefit">${escape(p.value)}${p.type==='points'?'<small>баллов</small>':''}</span>${chevron}</button>`;
    const findProgram=id=>{const all=currentProgrammes();return all.find(p=>p.id===id)||all.filter(p=>p.type==='network').flatMap(networkMembers).find(p=>p.id===id);};
    const overview=document.createElement('div');overview.className='keys-benefits-overview';
    overview.innerHTML=`<button type="button" class="keys-benefits-entry keys-points-overview" data-benefits-page="points"><span class="keys-benefits-entry-top"><span class="keys-benefits-entry-label">${benefitIcon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/>')}<span>Баллы Ключей</span></span></span><strong>2 400 <span>баллов доступно</span></strong><span class="keys-benefits-entry-note">1 балл = 1 ₽ скидки</span><span class="keys-points-overview-link">Правила и история баллов ${chevron}</span></button><section class="keys-program-preview" aria-label="Ваша лояльность в отелях"><header><h2>Ваша лояльность в отелях</h2><button type="button" data-benefits-page="hotels">Все ${chevron}</button></header><p>Вы уже участвуете в этих программах. Здесь ваши уровни, скидки и накопленные баллы.</p><div class="keys-program-preview-list"></div><p class="keys-program-none" hidden>Карты лояльности пока не найдены. Подключите программу отеля при бронировании.</p></section>`;
    const connectOffer=document.createElement('section');connectOffer.className='keys-benefits-connect';connectOffer.hidden=true;
    connectOffer.setAttribute('aria-label','Подключить карту лояльности отеля');
    connectOffer.innerHTML=`<span class="keys-benefits-connect-badge" aria-hidden="true">−10%</span><div><span class="keys-benefits-connect-hotel">Maidens Hotel</span><h3>Возможно, у вас уже есть скидка 10%</h3></div><p>Войдите в личный кабинет отеля, чтобы подключить карту лояльности и бронировать со скидкой.</p><button type="button" data-benefits-connect>Подключить карту лояльности</button>`;
    overview.querySelector('.keys-program-preview').append(connectOffer);
    connectOffer.querySelector('button').addEventListener('click',()=>show('find','maidens','hotel-loyalty-connect'));
    const network=document.createElement('section');network.className='keys-program-network keys-benefits-subpage';network.hidden=true;
    const detail=document.createElement('section');detail.className='keys-program-detail keys-benefits-subpage';detail.hidden=true;
    function renderHotelProgrammes(){
      const programmes=currentProgrammes();
      const matches=programmes.filter(p=>(filter==='all'||p.type===filter)&&normalize(p.name+' '+p.city+' '+(p.members||[]).map(h=>h.name+' '+h.city).join(' ')).includes(normalize(query)));
      list.innerHTML=matches.map(programRow).join('');list.hidden=!matches.length;
      hotels.querySelector('.keys-loyalty-empty').hidden=!!matches.length;
      hotels.querySelector('.keys-loyalty-empty').textContent=programmes.length?'Ничего не найдено. Попробуйте другой отель или город.':'Карты лояльности пока не найдены. Подключите программу отеля при бронировании.';
      hotels.querySelector('.keys-loyalty-live').textContent=`Найдено программ: ${matches.length}`;
      hotels.querySelectorAll('[data-program-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.programFilter===filter)));
      overview.querySelector('.keys-program-preview-list').innerHTML=programmes.slice(0,5).map(programRow).join('');
      const offerVisible=document.body.dataset.keysHotelLoyaltyMissing==='true'&&!programmes.some(p=>p.id==='maidens');
      connectOffer.hidden=!offerVisible;
      overview.querySelector('.keys-program-none').hidden=!!programmes.length||offerVisible;
      overview.querySelector('.keys-program-preview>p').hidden=!programmes.length;
      overview.querySelector('[data-benefits-page="hotels"]').hidden=programmes.length<=3;
      if(selectedNetwork){const updated=programmes.find(p=>p.id===selectedNetwork.id);if(updated)renderNetwork(updated);else if(benefitsPage==='network')showBenefitsPage('overview',false);}
      if(selectedProgram){const updated=findProgram(selectedProgram.id);if(updated)renderProgramDetail(updated);else if(benefitsPage==='hotel')showBenefitsPage('overview',false);}
    }
    function renderNetwork(p){
      selectedNetwork=p;
      network.innerHTML=`<article class="keys-program-network-summary"><span class="keys-program-symbol">${buildingIcon}</span><div><h2>${escape(p.name)}</h2><p>Единая программа лояльности сети</p></div><strong>${escape(p.value)}</strong></article><p class="keys-program-network-intro">Выберите отель, чтобы посмотреть ваши привилегии и забронировать проживание.</p><div class="keys-loyalty-list">${networkMembers(p).map(programRow).join('')}</div>`;
    }
    function renderProgramLevel(level,tier){
      const current=level.name===tier;
      const paragraphs=Array.isArray(level.description)?level.description:level.description?[level.description]:level.note?[level.note]:[];
      const benefits=(level.benefits||[]).map(item=>typeof item==='string'?{title:item}:item);
      return `<details class="keys-program-level${current?' is-current':''}"${current?' open':''}><summary><span class="keys-program-level-letter" aria-hidden="true">${escape(Array.from(level.name)[0]||'')}</span><span class="keys-program-level-heading"><span class="keys-program-level-title"><strong>${escape(level.name)}</strong>${current?'<span class="keys-program-level-current">Ваш уровень</span>':''}</span>${level.qualification?`<span class="keys-program-level-qualification">${escape(level.qualification)}</span>`:''}${level.benefit?`<span class="keys-program-level-benefit">${escape(level.benefit)}</span>`:''}</span>${chevron}</summary><div class="keys-program-level-body">${paragraphs.map(text=>`<p>${escape(text)}</p>`).join('')}${benefits.length?`<ul>${benefits.map(item=>`<li>${benefitIcon('<path d="m5 12 4 4L19 6"/>')}<div>${item.title?`<strong>${escape(item.title)}</strong>`:''}${item.text?`<p>${escape(item.text)}</p>`:''}</div></li>`).join('')}</ul>`:''}${level.conditions?`<div class="keys-program-level-conditions"><strong>Условия</strong><p>${escape(level.conditions)}</p></div>`:''}</div></details>`;
    }
    function renderProgramDetail(p){
      selectedProgram=p;
      const isPoints=p.type==='points',hasLevels=!!p.levels?.length;
      const check=benefitIcon('<path d="m5 12 4 4L19 6"/>');
      detail.innerHTML=`<article class="keys-program-hero">${p.photo?`<img class="keys-program-photo" src="${escape(p.photo)}" alt="${escape(p.name)}">`:`<div class="keys-program-cover">${buildingIcon}</div>`}<div class="keys-program-identity"><div><h2>${escape(p.name)}</h2><p>${p.networkName?'Программа сети «'+escape(p.networkName)+'»':isPoints?'Бонусная программа отеля':'Скидочная программа отеля'}</p></div></div><div class="keys-program-stats"><div><span>${isPoints?'Доступно баллов':'Ваша скидка'}</span><strong>${escape(p.value)}</strong></div>${p.tier?`<div><span>Ваш уровень</span><strong>${escape(p.tier)}</strong></div>`:''}</div>${p.progress?`<div class="keys-program-progress"><progress value="${p.progress.earned}" max="${p.progress.next}" aria-label="Начисленные баллы до уровня ${escape(p.progress.nextTier)}"></progress><div><span>Ещё ${(p.progress.next-p.progress.earned).toLocaleString('ru-RU')} баллов до ${escape(p.progress.nextTier)}</span><span>${p.progress.earned.toLocaleString('ru-RU')} / ${p.progress.next.toLocaleString('ru-RU')}</span></div><p>Начислено за год · отдельно от доступного остатка</p></div>`:''}</article><p class="keys-program-notice">${benefitIcon('<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>')}<span>${isPoints?'Баллы отеля и баллы «Ключей» — разные балансы. Баллы этой программы можно использовать только в этом отеле.':p.networkName?'Карта действует во всех отелях сети «'+escape(p.networkName)+'». На этой странице — условия для выбранного отеля.':'Скидка отеля и баллы «Ключей» учитываются отдельно. Итоговую выгоду увидите перед подтверждением брони.'}</span></p><section class="keys-program-section"><h2>${isPoints?'Как работают баллы':'Ваши привилегии'}</h2><ul class="keys-program-perks">${p.perks.map(text=>`<li>${check}<span>${escape(text)}</span></li>`).join('')}</ul></section>${hasLevels?`<section class="keys-program-section"><h2>Уровни программы</h2><div class="keys-program-levels">${p.levels.map(level=>renderProgramLevel(level,p.tier)).join('')}</div></section>`:''}<details class="keys-program-rules"><summary><span>Условия программы</span>${chevron}</summary><p>${isPoints?'Начисление и списание регулируются программой отеля. Доступную сумму списания покажем при бронировании.':'Привилегии зависят от тарифа и наличия услуг.'} ${hasLevels?'Уровень рассчитывается за последние 12 месяцев. ':''}В прототипе показаны демонстрационные условия.</p></details><button type="button" class="kh-primary keys-program-book" data-program-book="${escape(p.hotelId||p.id)}">Забронировать ${chevron}</button>`;
    }
    hotels.querySelector('input').addEventListener('input',event=>{query=event.target.value;renderHotelProgrammes();});
    hotels.querySelector('.keys-loyalty-filters').addEventListener('click',event=>{const button=event.target.closest('[data-program-filter]');if(!button)return;filter=button.dataset.programFilter;renderHotelProgrammes();});
    benefits.append(hotels,network,detail);
    const subheader=document.createElement('header');subheader.className='keys-benefits-subheader';subheader.hidden=true;
    subheader.innerHTML=`<button type="button" aria-label="Назад к выгодам">${benefitIcon('<path d="M19 12H5m7-7-7 7 7 7"/>')}</button><h1 tabindex="-1"></h1>`;
    benefits.prepend(subheader);benefits.querySelector('.keys-benefits-intro').after(overview);
    keysGroup.classList.add('keys-benefits-subpage');hotels.classList.add('keys-benefits-subpage');
    hotels.querySelector('.keys-benefits-hotels-heading').hidden=true;
    function showBenefitsPage(page,focus=true){
      benefitsPage=page;benefits.dataset.page=page;document.body.dataset.keysBenefitsPage=page;
      const title=page==='points'?'Баллы Ключей':page==='hotels'?'Ваша лояльность в отелях':page==='hotel'?'Программа отеля':page==='network'?'Отели сети «'+selectedNetwork.name+'»':'Выгоды';
      overview.hidden=page!=='overview';keysGroup.hidden=page!=='points';hotels.hidden=page!=='hotels';detail.hidden=page!=='hotel';network.hidden=page!=='network';
      benefits.querySelector('.keys-benefits-intro').hidden=page!=='overview';subheader.hidden=page==='overview';
      subheader.querySelector('h1').textContent=title;subheader.querySelector('button').setAttribute('aria-label',page==='hotel'&&detailOrigin==='network'?'Назад к отелям сети':page==='hotel'&&detailOrigin==='hotels'?'Назад к программам отелей':'Назад к выгодам');
      const desktopTitle=benefitsScroll.querySelector('.kda-title h1');if(desktopTitle)desktopTitle.textContent=title;
      benefitsScroll.scrollTop=0;
      if(document.body.dataset.keysView==='desktop')window.scrollTo({top:0,behavior:'instant'});
      if(focus){const heading=document.body.dataset.keysView==='desktop'&&desktopTitle?desktopTitle:page==='overview'?benefits.querySelector('.keys-benefits-intro h1'):subheader.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    }
    benefits.addEventListener('click',event=>{
      const book=event.target.closest('[data-program-book]');if(book){show('find',book.dataset.programBook,'hotel');return;}
      const program=event.target.closest('[data-hotel-program]');
      if(program){const p=findProgram(program.dataset.hotelProgram);if(p?.type==='network'){networkOrigin=benefitsPage;renderNetwork(p);showBenefitsPage('network');}else if(p){detailOrigin=benefitsPage;renderProgramDetail(p);showBenefitsPage('hotel');}return;}
      const button=event.target.closest('[data-benefits-page]');if(button)showBenefitsPage(button.dataset.benefitsPage);
    });
    const backBenefits=()=>showBenefitsPage(benefitsPage==='hotel'?detailOrigin:benefitsPage==='network'?networkOrigin:'overview');
    subheader.querySelector('button').addEventListener('click',backBenefits);
    root.addEventListener('keys-close-benefits',event=>{if(benefitsPage!=='overview'){event.stopImmediatePropagation();backBenefits();}},true);
    root.addEventListener('keys-open-benefits',event=>showBenefitsPage(event.detail?.page==='points'?'points':'overview',false));
    root.addEventListener('keys-scenario-change',()=>{selectedProgram=null;selectedNetwork=null;renderHotelProgrammes();showBenefitsPage('overview',false);});
    root.addEventListener('keys-hotel-loyalty-change',renderHotelProgrammes);
    new MutationObserver(renderHotelProgrammes).observe(document.body,{attributes:true,attributeFilter:['data-keys-guest-authorized']});
    renderHotelProgrammes();showBenefitsPage('overview',false);
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
    loyalty.setAttribute('aria-label','Лояльность отеля: Silver, 2 400 баллов. Открыть баллы и привилегии');
    loyalty.innerHTML='<span class="keys-profile-loyalty-top"><span>Баллы Ключей</span><span class="keys-profile-tier">Maidens · Silver</span></span><span class="keys-profile-balance"><strong>2 400</strong><span>баллов Ключей</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span><span class="keys-profile-progress" role="progressbar" aria-label="Ночи до уровня Gold" aria-valuemin="0" aria-valuemax="25" aria-valuenow="18" aria-valuetext="18 из 25 ночей, ещё 7 до Gold"><i></i></span><span class="keys-profile-progress-copy"><span>18 из 25 ночей</span><span>Ещё 7 до Gold</span></span>';
    identity.after(loyalty);
    profilePhone.querySelector('[data-open="benefits"]')?.remove();
    profilePhone.querySelector('[data-open="preferences"]')?.remove();
    profilePhone.querySelectorAll('.kf-section h2').forEach(title=>{
      if(title.textContent.trim()==='Поездки и предпочтения')title.textContent='Поездки';
    });
    const paymentCard=profilePhone.querySelector('[data-open="payments"]')?.closest('.kf-card');
    if(paymentCard){
      const heading=paymentCard.previousElementSibling;
      if(heading?.matches('.kf-section'))heading.remove();
      paymentCard.remove();
    }

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
    if(action==='favorites'){
      if(!section.hidden){frame.contentWindow.postMessage({source:'keys-host',openFavorites:true},location.origin);return;}
      show('find',null,'saved');return;
    }
    if(action==='notifications'){
      if(!section.hidden){if(section.dataset.runtimeScreen!=='notifications')frame.contentWindow.postMessage({source:'keys-host',openNotification:true,systemNotifications:true},location.origin);return;}
      const current=button.closest('.kf-phone')?.dataset.screen??'trips';
      notificationOrigin=current;notificationOpened=false;show('find',null,'notifications');
    }
  },true);
  const sendNoticeLayout=()=>frame.contentWindow?.postMessage({source:'keys-host',noticeLayout:document.body.dataset.keysNoticeLayout||'header'},location.protocol==='file:'?'*':location.origin);
  frame.addEventListener('load',sendNoticeLayout);
  root.addEventListener('keys-notification-layout-change',sendNoticeLayout);
  root.addEventListener('keys-scenario-change',event=>{
    cancelProfileMotion();
    sendNoticeLayout();
    const day=notificationDay(event.detail.scenario,event.detail.stayDay);
    if(document.body.dataset.keysSelectedScenario==='search-swipe-first'&&event.detail.resetView)go('trips');
    if(!frame.hasAttribute('src'))frame.src='./sections/index.html?v=trip-search-20261015&loyalty='+encodeURIComponent(document.body.dataset.keysLoyalty||'Silver')+'&stayDay='+encodeURIComponent(day);
    else if(ready)frame.contentWindow.postMessage({source:'keys-host',swipeFirstRun:document.body.dataset.keysSwipeFirstRun||null,hotelLoyaltyMissing:document.body.dataset.keysHotelLoyaltyMissing==='true',loyaltyTier:document.body.dataset.keysLoyalty,partnerApproved:document.body.dataset.keysPartnerApproved==='true',stayDay:day},location.protocol==='file:'?'*':location.origin);
  });
  root.addEventListener('keys-open-trip-review',event=>{
    root.querySelector('#keysFeedbackFlow')?.dispatchEvent(new CustomEvent('keys-feedback-context',{detail:{kind:'stay'}}));
    go('feedback');feedbackFromNotifications=false;feedbackTripOrigin=event.detail.trigger;
    root.querySelector('#keysFeedbackFlow [data-kfb="success"] [data-kfb-exit]').textContent='К поездке';
  });
  root.addEventListener('keys-open-benefits',()=>go('benefits'));
  root.addEventListener('keys-open-profile',()=>go('profile'));
  root.addEventListener('keys-profile-action',event=>{
    const {action,hotelId,bookingId}=event.detail;
    if(action==='find')show('find',hotelId||null,hotelId?'hotel':undefined);
    if(action==='rebook'&&hotelId)show('find',hotelId,'hotel',{rebook:true,nights:event.detail.nights,party:event.detail.party});
    if(action==='hotel-chat')show('chats','maidens');
    if(action==='benefits')go('benefits');
    if(action==='trip')go('trips');
    if(action==='booking'){if(bookingId)show('find',null,'created-booking',null,bookingId);else if(document.body.dataset.keysScenario==='booked'){go('trips');root.querySelector('[data-before="details"]')?.click();}else go('stay-details');}
  });
  root.addEventListener('keys-close-benefits',()=>{
    const origin=benefitsOrigin;benefitsOrigin=null;
    if(!origin){go('trips');return;}
    origin.pages.forEach(([el,hidden])=>el.hidden=hidden);origin.sections.forEach(([el,hidden])=>el.hidden=hidden);origin.focus?.focus({preventScroll:true});
  });
  root.addEventListener('keys-open-hotel-chat',()=>show('chats','maidens'));
  root.addEventListener('keys-open-stay-details',()=>go('stay-details'));
  root.addEventListener('keys-open-hotel-search',event=>show('find',null,null,event.detail));
  // Catch internal legacy links into Find/Assistant as well as the bottom navigation.
  new MutationObserver(()=>{
    const search=root.querySelector('[data-unified-section="search"]');
    const account=root.querySelector('[data-unified-section="account"]');
    const assistant=account.querySelector('[data-screen="assistant"]')?.closest('.kf-grid>section');
    if(!search.hidden)show('find');
    else if(!account.hidden&&assistant&&!assistant.hidden)show('chats');
  }).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
})();

// Profiles without a booking show only Keys points; booked scenarios retain hotel membership.
(() => {
 const root=document.getElementById('keysUnifiedPrototype');
 const profile=root.querySelector('.keys-profile-loyalty');
 const originalProfile=profile?.innerHTML;
 const earnLabel=root.querySelectorAll('.keys-benefits-guide-copy>span')[1];
 const earnCopy=earnLabel?.textContent;
 function render(){
  const gold=document.body.dataset.keysLoyalty==='Gold';
  if(earnLabel)earnLabel.textContent=gold?'Баллы за каждую поездку':earnCopy;
  if(profile){
   profile.innerHTML=originalProfile;profile.dataset.tier=gold?'Gold':'Silver';
   profile.setAttribute('aria-label',`Баллы Ключей: 2 400. Maidens Hotel: ${gold?'Gold':'Silver'}. Открыть баллы и привилегии`);
   if(document.body.dataset.keysScenario==='search'){
    profile.dataset.tier='None';
    profile.querySelectorAll('.keys-profile-tier,.keys-profile-progress,.keys-profile-progress-copy').forEach(el=>el.remove());
    profile.setAttribute('aria-label','Баллы Ключей: 2 400. Открыть баллы и привилегии');
    return;
   }
   if(document.body.dataset.keysHotelLoyaltyMissing==='true'){
    const cards=root.keysConnectedHotelCards||[],card=cards.at(-1);
    profile.dataset.tier=card?'Connected':'None';
    profile.querySelector('.keys-profile-progress')?.remove();
    profile.querySelector('.keys-profile-progress-copy')?.remove();
    const tier=profile.querySelector('.keys-profile-tier');
    if(card){tier.textContent=cards.length>1?'Карты отелей · '+cards.length:card.name+' · −'+card.discount+'%';}
    else tier.remove();
    profile.setAttribute('aria-label','Баллы Ключей: 2 400. '+(card?cards.map(item=>item.name+': скидка '+item.discount+'%').join('. ')+'. ':'')+'Открыть баллы и привилегии');
    return;
   }
   if(gold){profile.querySelector('.keys-profile-tier').textContent='Maidens · Gold';profile.querySelector('.keys-profile-progress').remove();profile.querySelector('.keys-profile-progress-copy').innerHTML='<span>Специальные тарифы и привилегии отеля</span>';}
  }

 }
 render();root.addEventListener('keys-scenario-change',render);root.addEventListener('keys-hotel-loyalty-change',render);
})();
