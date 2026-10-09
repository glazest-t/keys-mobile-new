/* Fit the mobile preview into the available window without scaling its controls. */
(() => {
 const toolbar=document.getElementById('keysScenarioControls');
 if(!toolbar)return;
 let pending=0;
 const update=()=>{
  pending=0;
  if(document.body.dataset.keysView!=='mobile')return;
  const edgeToEdge=matchMedia('(max-width:520px)').matches;
  const viewport=window.visualViewport;
  const bottom=(viewport?.height??window.innerHeight)+(viewport?.offsetTop??0);
  const toolbarBottom=toolbar.getBoundingClientRect().bottom+window.scrollY;
  const margin=parseFloat(getComputedStyle(toolbar).marginBottom)||0;
  // Wide previews reserve the wrapper’s 22px bottom padding and the body’s 12px.
  const available=bottom-toolbarBottom-margin-(edgeToEdge?0:6)-(edgeToEdge?0:34);
  document.documentElement.style.setProperty('--keys-preview-height',Math.max(0,Math.min(844,Math.floor(available)))+'px');
 };
 const schedule=()=>{if(!pending)pending=requestAnimationFrame(update);};
 new ResizeObserver(schedule).observe(toolbar);
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-keys-view']});
 window.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('resize',schedule);
 update();
})();
