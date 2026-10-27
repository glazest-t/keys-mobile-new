/* One bounded history entry, shared across every signed-in Trips scenario. */
(() => {
 const app=document.getElementById('keysUnifiedPrototype');
 const scroll=app?.querySelector('#keysHomeVariantThree .k3-scroll');
 if(!scroll)return;
 const section=document.createElement('section');
 section.className='keys-trip-history';section.setAttribute('aria-label','История поездок');
 section.innerHTML=`<button type="button" class="keys-trip-history-card" aria-label="Ваши прошлые поездки — открыть историю">
  <span class="keys-trip-history-copy"><strong>Ваши прошлые<br>поездки</strong><span class="keys-trip-history-link">Открыть историю <i data-lucide="chevron-right" aria-hidden="true"></i></span></span>
  <img class="keys-trip-history-art" src="./scenarios/assets/trip-history-album.png" width="165" height="120" alt="" decoding="async">
 </button>`;
 scroll.append(section);
 window.lucide?.createIcons({nodes:[section.querySelector('[data-lucide]')]});
 section.querySelector('button').addEventListener('click',()=>window.KeysProfile?.open('history',null,{from:'trips'}));
 const sync=()=>{
  const scenario=document.body.dataset.keysScenario;
  section.hidden=!['search','booked','stay','after'].includes(scenario)||document.body.dataset.keysGuestSearch==='true'&&document.body.dataset.keysGuestAuthorized!=='true';
  // A newly confirmed booking is appended by the host; history stays below it.
  if(scroll.lastElementChild!==section)scroll.append(section);
 };
 new MutationObserver(sync).observe(scroll,{childList:true});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-keys-scenario','data-keys-guest-search','data-keys-guest-authorized']});
 app.addEventListener('keys-scenario-change',sync);sync();
})();
