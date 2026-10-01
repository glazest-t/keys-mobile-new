/* Arbana-style demo controls, outside the application.
   Search, pre-arrival, stay and completed-trip scenarios share the application shell.
   Keep the mounted prototype intact when moving between demo states. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 if(!app)return;
 const presets=[['search','Брони ещё нет'],['booked','Гость ещё не заехал'],['stay','Гость живёт в отеле'],['after','Поездка завершена']];
 const days=[['day-1','Проживание 1 день'],['day-2','Проживание 2 день'],['checkout','День выезда']];
 const arrivalDays=[['day-8','За 8 дней до заезда'],['day-3','За 3 дня до заезда'],['arrival','День заезда']];
 const valid=(items,id,fallback)=>items.some(([key])=>key===id)?id:fallback;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={sliders:'<path d="M4 7h7m4 0h5M4 17h2m4 0h10"/><circle cx="13" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h4"/>'};
 const toolbar=document.createElement('div');toolbar.id='keysScenarioControls';toolbar.setAttribute('aria-label','Сценарий прототипа');
 const empty=document.createElement('main');empty.id='keysScenarioEmpty';empty.hidden=true;
 app.before(toolbar);app.after(empty);
 let selected='stay',stayDay='day-2',arrivalDay='day-8';
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
  const result={close,configure(nextItems,nextGroup){
   if(items===nextItems&&group===nextGroup)return;
   close();items=nextItems;group=nextGroup;
   list.setAttribute('aria-label',group);
   list.innerHTML=`<div class="keys-scenario-group" aria-hidden="true">${group}</div>${items.map(([key,label])=>`<div role="option" id="${id}-${key}" data-value="${key}" tabindex="-1" aria-selected="false"><span>${label}</span>${svg('<path d="m5 12 4 4L19 6"/>')}</div>`).join('')}`;
   options=[...list.querySelectorAll('[role="option"]')];
  },set(key,disabled=false){
   value=key;toggle.disabled=disabled;
   const label=disabled?'День проживания':items.find(([item])=>item===key)[1];
   toggle.querySelector('span').textContent=label;toggle.setAttribute('aria-label',group+': '+label);
   toggle.title=disabled?'Выберите сценарий до заезда или проживания':label;
   options.forEach(option=>option.setAttribute('aria-selected',String(option.dataset.value===value)));
   if(disabled)close();
  }};
  controls.push(result);return result;
 }
 const scenarioControl=control('keys-scenario',presets,'Вводные условия','sliders',id=>{selected=id;render();});
 const dayControl=control('keys-stay-day',days,'День проживания','calendar',id=>{if(selected==='booked')arrivalDay=id;else stayDay=id;render();});
 function render(updateURL=true){
  const label=presets.find(([key])=>key===selected)[1],dayLabel=days.find(([key])=>key===stayDay)[1];
  scenarioControl.set(selected);
  dayControl.configure(selected==='booked'?arrivalDays:days,selected==='booked'?'До заезда':'День проживания');
  dayControl.set(selected==='booked'?arrivalDay:stayDay,!['stay','booked'].includes(selected));
  document.body.dataset.keysScenario=selected;document.body.dataset.keysStayDay=stayDay;document.body.dataset.keysArrivalDay=arrivalDay;
  const implemented=selected==='search'||selected==='stay'||selected==='after'||selected==='booked'&&['day-8','day-3','arrival'].includes(arrivalDay);
  document.body.dataset.keysImplemented=String(implemented);
  app.inert=!implemented;empty.hidden=implemented;
  empty.setAttribute('aria-label',(selected==='stay'?label+' · '+dayLabel:selected==='booked'?label+' · '+arrivalDays.find(([key])=>key===arrivalDay)[1]:label)+' — пустой сценарий');
  if(updateURL){const url=new URL(location.href);url.searchParams.set('scenario',selected);if(selected==='stay')url.searchParams.set('stayDay',stayDay);else url.searchParams.delete('stayDay');if(selected==='booked')url.searchParams.set('arrivalDay',arrivalDay);else url.searchParams.delete('arrivalDay');history.replaceState(history.state,'',url);}
  app.dispatchEvent(new CustomEvent('keys-scenario-change',{detail:{scenario:selected,stayDay:selected==='stay'?stayDay:null,arrivalDay:selected==='booked'?arrivalDay:null}}));
 }
 function fromURL(){const params=new URLSearchParams(location.search);selected=valid(presets,params.get('scenario'),'stay');stayDay=valid(days,params.get('stayDay'),'day-2');arrivalDay=valid(arrivalDays,params.get('arrivalDay'),'day-8');controls.forEach(item=>item.close());render(false);}
 document.addEventListener('pointerdown',event=>{if(!toolbar.contains(event.target))controls.forEach(item=>item.close());});
 window.addEventListener('popstate',fromURL);
 fromURL();
})();
