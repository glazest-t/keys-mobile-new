/* Additional presentation nodes only. Existing actionable nodes and application state survive theme changes. */
(() => {
 const root=document.getElementById('keysUnifiedPrototype');
 if(!root)return;
 const header=root.querySelector('#keysHomeVariantThree .keys-app-header');
 const nav=document.createElement('div');nav.className='on-desktop-nav';nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Разделы приложения');
 const items=[['trips','Поездки'],['find','Найти'],['chats','Чаты'],['bonuses','Выгоды']];
 nav.innerHTML=items.map(([id,label])=>`<button type="button" data-on-nav="${id}">${label}</button>`).join('');
 header?.querySelector('.keys-app-logo')?.after(nav);
 nav.addEventListener('click',event=>{
  const target=event.target.closest('[data-on-nav]');if(!target)return;
  root.querySelector('#keysHomeVariantThree .keys-bottom-nav [data-bottom-tab="'+target.dataset.onNav+'"]')?.click();
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
 });
 const syncNav=()=>{
  const frame=root.querySelector('[data-unified-section="arbana-sections"]');
  const account=root.querySelector('[data-unified-section="account"]');
  const active=frame&&!frame.hidden?frame.dataset.runtimeTab:account&&!account.hidden?'bonuses':'trips';
  nav.querySelectorAll('button').forEach(button=>{if(button.dataset.onNav===active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 };
 new MutationObserver(syncNav).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden','data-runtime-tab']});syncNav();
 const pass=root.querySelector('.kh-stay-card .kh-pass-room');
 if(!pass)return;
 const ring=document.createElement('div');ring.className='on-night';ring.setAttribute('role','img');
 ring.innerHTML='<span class="on-night-track"></span><span class="on-night-dot"></span><span class="on-night-copy"><small data-on-top>Ночь</small><strong data-on-number>2</strong><small data-on-bottom>из 7</small></span>';
 pass.append(ring);
 function update(){
  const checkout=document.body.dataset.keysStayDay==='checkout';
  ring.querySelector('[data-on-top]').textContent=checkout?'Сегодня':'Ночь';
  ring.querySelector('[data-on-number]').textContent=checkout?'Выезд':'2';
  ring.querySelector('[data-on-bottom]').textContent=checkout?'19 сен':'из 7';
  ring.setAttribute('aria-label',checkout?'Выезд сегодня, 19 сентября':'Вторая ночь из семи');
 }
 new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-keys-stay-day']});
 update();
})();
