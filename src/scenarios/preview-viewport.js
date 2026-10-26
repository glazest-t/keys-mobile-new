/* Fit the mobile preview into the available window without scaling its controls. */
(() => {
 const toolbar=document.getElementById('keysScenarioControls');
 if(!toolbar)return;
 const compact=matchMedia('(max-width:600px), (max-width:950px) and (max-height:520px) and (pointer:coarse)');
 const disclosure=document.createElement('div');
 disclosure.id='keysPreviewSettings';
 disclosure.innerHTML='<button type="button" aria-expanded="false" aria-controls="keysScenarioControls"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M4 7h7m4 0h5M4 17h2m4 0h10"/><circle cx="13" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg><span>Настройки</span><svg class="keys-preview-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>';
 toolbar.before(disclosure);
 const toggle=disclosure.querySelector('button');
 const closeMenus=()=>toolbar.querySelectorAll('.keys-scenario-toggle[aria-expanded="true"]').forEach(button=>button.click());
 const setExpanded=(expanded,restoreFocus=false)=>{
  if(!expanded)closeMenus();
  toolbar.dataset.compactOpen=String(expanded);
  toggle.setAttribute('aria-expanded',String(expanded));
  if(restoreFocus&&compact.matches)toggle.focus({preventScroll:true});
 };
 setExpanded(false);
 toggle.addEventListener('click',()=>setExpanded(toggle.getAttribute('aria-expanded')!=='true'));
 toolbar.addEventListener('click',event=>{
  if(compact.matches&&event.target.closest('[role="option"],.kd-view-switch button'))setExpanded(false,true);
 });
 toolbar.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!event.defaultPrevented&&compact.matches){setExpanded(false,true);event.preventDefault();}
 });
 compact.addEventListener('change',()=>{
  const focusInside=toolbar.contains(document.activeElement);
  setExpanded(false,focusInside);
  if(!compact.matches&&document.activeElement===toggle)toolbar.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
 });
 let pending=0;
 const update=()=>{
  pending=0;
  if(document.body.dataset.keysView!=='mobile')return;
  const edgeToEdge=matchMedia('(max-width:520px)').matches;
  const viewport=window.visualViewport;
  const bottom=(viewport?.height??window.innerHeight)+(viewport?.offsetTop??0);
  const toolbarBottom=Math.max(toolbar.getBoundingClientRect().bottom,disclosure.getBoundingClientRect().bottom)+window.scrollY;
  const margin=parseFloat(getComputedStyle(toolbar).marginBottom)||0;
  // Wide previews reserve the wrapper’s 22px bottom padding and the body’s 12px.
  const available=bottom-toolbarBottom-margin-(edgeToEdge?0:6)-(edgeToEdge?0:34);
  document.documentElement.style.setProperty('--keys-preview-height',Math.max(0,Math.min(844,Math.floor(available)))+'px');
 };
 const schedule=()=>{if(!pending)pending=requestAnimationFrame(update);};
 new ResizeObserver(schedule).observe(toolbar);
 new ResizeObserver(schedule).observe(disclosure);
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-keys-view']});
 window.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('resize',schedule);
 update();
})();
