/* Arbana-style demo controls, outside the application.
   Search, pre-arrival, stay and completed-trip scenarios share the application shell.
   Keep the mounted prototype intact when moving between demo states. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 if(!app)return;
 const presets=[['onboarding','Онбординг'],['guest','Гость не авторизован'],['guest-returning','Гость не авторизован, но зарегистрирован'],['guest-invite','Отельер · по приглашению · Friendly Rate'],['search','Брони ещё нет'],['search-gold','Брони ещё нет (лояльность Gold)'],['search-no-loyalty','Брони ещё нет (лояльность не найдена)'],['search-guest','Брони ещё нет (гость не авторизован) · десктоп'],['booked','Гость ещё не заехал'],['stay','Гость живёт в отеле'],['after','Поездка завершена']];
 const basePresets=presets.filter(([key])=>key!=='onboarding');
 // The only available appearance is the current base design (Orbit).
 let orbitEnabled=true;
 const availablePresets=()=>orbitEnabled?presets:basePresets;
 const onboardingVariants=[['1','Вариант 1'],['2','Вариант 2']];
 const days=[['day-2','Проживает в отеле'],['checkout','День выезда']];
 const valid=(items,id,fallback)=>items.some(([key])=>key===id)?id:fallback;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={sliders:'<path d="M4 7h7m4 0h5M4 17h2m4 0h10"/><circle cx="13" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h4"/>'};
 const toolbar=document.createElement('div');toolbar.id='keysScenarioControls';toolbar.setAttribute('aria-label','Сценарий прототипа');
 const empty=document.createElement('main');empty.id='keysScenarioEmpty';empty.hidden=true;
 app.before(toolbar);app.after(empty);
 let selected='stay',stayDay='day-2',onboardingVariant='1',inviteEntered=false;
 function savedInviteEntered(){try{const saved=JSON.parse(sessionStorage.getItem('keys-partner-session-v1')||'null');return saved?.appEntered===true&&/^\+7\d{10}$/.test(saved.phone);}catch{return false;}}
 const controls=[];
 function control(id,items,group,icon,onSelect){
  const wrapper=document.createElement('div');wrapper.className='keys-scenario-control';
  wrapper.innerHTML=`<button id="${id}-toggle" class="keys-scenario-toggle" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-list">${svg(icons[icon])}<span class="keys-scenario-label"></span>${svg('<path d="m6 9 6 6 6-6"/>')}</button><div id="${id}-list" class="keys-scenario-list" role="listbox" aria-label="${group}" hidden><div class="keys-scenario-group" aria-hidden="true">${group}</div>${items.map(([key,label])=>`<div role="option" id="${id}-${key}" data-value="${key}" tabindex="-1" aria-selected="false"><span>${label}</span>${svg('<path d="m5 12 4 4L19 6"/>')}</div>`).join('')}</div>`;
  toolbar.append(wrapper);
  const toggle=wrapper.querySelector('button'),list=wrapper.querySelector('[role="listbox"]');
  let options=[...list.querySelectorAll('[role="option"]')];
  let value=items[0][0];
  const close=(focus=false)=>{list.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();};
  const open=()=>{if(toggle.disabled)return;controls.forEach(item=>item.close());list.hidden=false;toggle.setAttribute('aria-expanded','true');options.find(option=>option.dataset.value===value).focus();};
  const choose=key=>{onSelect(key);close(true);};
  toggle.addEventListener('click',()=>list.hidden?open():close());
  toggle.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open();}});
  list.addEventListener('click',event=>{const option=event.target.closest('[data-value]');if(option)choose(option.dataset.value);});
  list.addEventListener('keydown',event=>{
   const current=options.indexOf(document.activeElement);
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?options.length-1:(current+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();
   }else if(['Enter',' '].includes(event.key)&&current>=0){event.preventDefault();choose(options[current].dataset.value);}
   else if(event.key==='Escape'){event.preventDefault();close(true);}
   else if(event.key==='Tab')close();
  });
  wrapper.addEventListener('focusout',event=>{if(!wrapper.contains(event.relatedTarget))close();});
  const result={close,setVisible(visible){wrapper.hidden=!visible;if(!visible)close();},configure(nextItems,nextGroup){
   if(items===nextItems&&group===nextGroup)return;
   close();items=nextItems;group=nextGroup;
   list.setAttribute('aria-label',group);
   list.innerHTML=`<div class="keys-scenario-group" aria-hidden="true">${group}</div>${items.map(([key,label])=>`<div role="option" id="${id}-${key}" data-value="${key}" tabindex="-1" aria-selected="false"><span>${label}</span>${svg('<path d="m5 12 4 4L19 6"/>')}</div>`).join('')}`;
   options=[...list.querySelectorAll('[role="option"]')];
  },set(key,disabled=false){
   value=key;toggle.disabled=disabled;
   const label=disabled?'Состояние проживания':items.find(([item])=>item===key)[1];
   toggle.querySelector('span').textContent=label;toggle.setAttribute('aria-label',group+': '+label);
   toggle.title=disabled?'Выберите сценарий проживания':label;
   options.forEach(option=>option.setAttribute('aria-selected',String(option.dataset.value===value)));
   if(disabled)close();
  }};
  controls.push(result);return result;
 }
 const scenarioControl=control('keys-scenario',availablePresets(),'Вводные условия','sliders',id=>{selected=id;inviteEntered=false;render();});
 const dayControl=control('keys-stay-day',days,'Состояние проживания','calendar',id=>{stayDay=id;render();});
 const onboardingControl=control('keys-onboarding-variant',onboardingVariants,'Вариант онбординга','sliders',id=>{onboardingVariant=id;render(true,false);});
 function render(updateURL=true,resetView=updateURL){
  const label=presets.find(([key])=>key===selected)[1],dayLabel=days.find(([key])=>key===stayDay)[1];
  scenarioControl.configure(availablePresets(),'Вводные условия');
  scenarioControl.set(selected);
  dayControl.set(stayDay,selected!=='stay');
  onboardingControl.set(onboardingVariant);onboardingControl.setVisible(selected==='onboarding');
  document.body.dataset.keysOnboardingVariant=onboardingVariant;
  const scenario=['search-gold','search-guest','search-no-loyalty'].includes(selected)||(selected==='guest-invite'&&inviteEntered)?'search':selected;
  document.body.dataset.keysSelectedScenario=selected;
  document.body.dataset.keysHotelLoyaltyMissing=String(selected==='search-no-loyalty');
  document.body.dataset.keysGuestSearch=String(selected==='search-guest');
  document.body.dataset.keysLoyalty=selected==='search-gold'?'Gold':'Silver';
  document.body.dataset.keysScenario=scenario;document.body.dataset.keysStayDay=stayDay;
  const implemented=selected==='onboarding'||selected==='guest-returning'||selected==='guest-invite'||selected==='guest'||selected==='search'||selected==='search-no-loyalty'||selected==='search-gold'||selected==='search-guest'||selected==='stay'||selected==='after'||selected==='booked';
  document.body.dataset.keysImplemented=String(implemented);
  app.inert=!implemented;empty.hidden=implemented;
  empty.setAttribute('aria-label',(selected==='stay'?label+' · '+dayLabel:label)+' — пустой сценарий');
  if(updateURL){const url=new URL(location.href);url.searchParams.set('scenario',selected);if(resetView)url.searchParams.set('view',selected==='search-guest'?'desktop':'mobile');if(selected==='stay')url.searchParams.set('stayDay',stayDay);else url.searchParams.delete('stayDay');url.searchParams.delete('arrivalDay');if(selected==='onboarding')url.searchParams.set('onboardingVariant',onboardingVariant);else url.searchParams.delete('onboardingVariant');history.replaceState(history.state,'',url);}
  app.dispatchEvent(new CustomEvent('keys-scenario-change',{detail:{scenario,resetView,loyaltyTier:document.body.dataset.keysLoyalty,stayDay:selected==='stay'?stayDay:null}}));
 }
 function fromURL(){
  const params=new URLSearchParams(location.search);orbitEnabled=true;
  const requested=params.get('scenario');selected=valid(availablePresets(),requested,requested==='onboarding'?'guest':'stay');
  inviteEntered=selected==='guest-invite'&&savedInviteEntered();
  stayDay=valid(days,params.get('stayDay'),'day-2');
  onboardingVariant=valid(onboardingVariants,params.get('onboardingVariant'),'1');
  // The former first-day link opens the shared in-stay state without changing viewport.
  if(selected==='stay'&&params.get('stayDay')==='day-1'){const url=new URL(location.href);url.searchParams.set('stayDay','day-2');history.replaceState(history.state,'',url);}
  // Old pre-arrival links now resolve to the same page without resetting the chosen viewport.
  if(params.has('arrivalDay')){const url=new URL(location.href);url.searchParams.delete('arrivalDay');history.replaceState(history.state,'',url);}
  controls.forEach(item=>item.close());render(requested==='onboarding'&&!orbitEnabled);
 }
 document.addEventListener('pointerdown',event=>{if(!toolbar.contains(event.target))controls.forEach(item=>item.close());});
 window.addEventListener('popstate',fromURL);
 window.KeysScenarios={
  select(id,{preserveView=false}={}){selected=valid(availablePresets(),id,selected);inviteEntered=false;render(true,!preserveView);},
  completeInvite(){if(selected!=='guest-invite')return;inviteEntered=true;render(true,false);},
  setBrand(value){
   const next=value==='orbit';if(next===orbitEnabled)return;orbitEnabled=next;
   if(selected==='onboarding'&&!orbitEnabled){selected='guest';render();}
   else{scenarioControl.configure(availablePresets(),'Вводные условия');scenarioControl.set(selected);}
  }
 };
 fromURL();
})();
