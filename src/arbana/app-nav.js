/* Shared presentation for the legacy screens and the embedded React sections. */
(() => {
  const items = [
    {id:'trips',label:'Поездки',icon:'trips',path:'<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M9 11v6m6-6v6"/>'},
    {id:'find',label:'Найти',icon:'search',path:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>'},
    {id:'chats',label:'Чаты',icon:'chat',path:'<path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2 1.5-5A8 8 0 1 1 20 11.5Z"/><path d="M7 10h9m-9 4h5"/>'},
    {id:'bonuses',label:'Выгоды',icon:'gift',path:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M12 7v14M3 7h18v4H3z"/><path d="M12 7C7 7 5 6 5 4a2 2 0 0 1 4-1l3 4Zm0 0c5 0 7-1 7-3a2 2 0 0 0-4-1l-3 4Z"/>'}
  ];
  const content = (item,unread=false) => `<span class="keys-bottom-icon"><svg data-arbana-icon="${item.icon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.path}</svg>${item.id==='chats'?`<span class="keys-bottom-unread" aria-hidden="true"${unread?'':' hidden'}></span>`:''}</span><span class="keys-bottom-label">${item.label}</span>`;
  let unread=false;
  const getItems=()=>items;
  const setUnread = value => {
    unread=!!value;
    document.querySelectorAll('.keys-bottom-unread').forEach(dot=>dot.hidden=!unread);
  };
  function enhance(root) {
    root.querySelectorAll('.k3-nav,.kp-nav,.kf-nav,.ktd-nav,.ksd-nav').forEach(nav=>{
      if(!nav.classList.contains('keys-bottom-nav'))nav.classList.add('keys-bottom-nav');
      nav.setAttribute('aria-label','Разделы приложения');
      nav.querySelector('[data-bottom-tab="favorites"]')?.remove();
      nav.querySelectorAll('button').forEach(button=>{
        const item=items.find(item=>item.label===button.textContent.trim());
        if(!item)return;
        if(!button.classList.contains('keys-bottom-tab'))button.classList.add('keys-bottom-tab');
        if(button.dataset.bottomTab===item.id&&button.querySelector('.keys-bottom-icon'))return;
        button.dataset.bottomTab=item.id;
        button.innerHTML=content(item,unread);
      });
    });
  }
  // One decoration state shared with the same-origin embedded Find/Chats app.
  // Routing and aria-current continue to belong to the original screens.
  let shared;
  try { shared=window.parent!==window && window.parent.KeysAppNav?.motion; } catch {}
  shared ||= {index:0,from:0,revision:0,at:0};
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const records=new WeakMap();
  let pending=false;
  function sync(){
    pending=false;
    const root=document.getElementById('keysUnifiedPrototype');
    if(root)enhance(root);
    document.querySelectorAll('.keys-bottom-nav').forEach(nav=>{
      const buttons=[...nav.querySelectorAll('.keys-bottom-tab')];
      nav.style.setProperty('--keys-nav-count',buttons.length);
      const index=buttons.findIndex(b=>b.getAttribute('aria-current')==='page'||b.classList.contains('active'));
      const visible=!!nav.getClientRects().length && (!window.frameElement || !!window.frameElement.getClientRects().length);
      const previous=records.get(nav);
      nav.style.setProperty('--keys-nav-text','12px');
      if(!visible){if(previous)previous.visible=false;return;}
      if(previous?.visible&&previous.index===index&&previous.count===buttons.length&&previous.revision===shared.revision)return;
      const recent=Date.now()-shared.at<1000 && shared.index===index;
      const from=recent?shared.from:(previous?.visible?previous.index:index);
      const record={visible:true,index,count:buttons.length,revision:shared.revision};records.set(nav,record);
      nav.style.setProperty('--keys-nav-visible',index<0?'0':'1');
      const move=index>=0&&from>=0&&from!==index&&!reduced();
      nav.style.setProperty('--keys-nav-duration','0s');
      nav.style.setProperty('--keys-nav-index',Math.max(move?from:index,0));
      // Commit the old cap position after a previously hidden screen is shown.
      nav.getBoundingClientRect();
      requestAnimationFrame(()=>{
        if(records.get(nav)!==record)return;
        nav.style.setProperty('--keys-nav-duration','.38s');
        nav.style.setProperty('--keys-nav-index',Math.max(index,0));
      });
      if(move){
        const icon=buttons[index].querySelector('.keys-bottom-icon');
        icon?.getAnimations().forEach(animation=>animation.cancel());
        icon?.animate([
          {transform:'translateY(0) scale(1)'},
          {transform:'translateY(-2px) scale(1.14)',offset:.3},
          {transform:'translateY(0) scale(1)'}
        ],{duration:420,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'both'});
      }
      if(index>=0&&!recent){shared.index=index;shared.from=index;}
    });
    // Revealing an iframe does not mutate its inner DOM: notify its controller.
    const frame=document.getElementById('keysSectionsFrame');
    if(frame?.getClientRects().length){
      try {frame.contentWindow.KeysAppNav?.refresh();} catch {}
    }
  }
  function refresh(){if(!pending){pending=true;requestAnimationFrame(sync);}}
  window.KeysAppNav={items,getItems,content,setUnread,enhance,motion:shared,refresh};
  document.addEventListener('click',event=>{
    const button=event.target.closest('.keys-bottom-tab');
    if(!button)return;
    const index=[...button.closest('.keys-bottom-nav').querySelectorAll('.keys-bottom-tab')].indexOf(button);
    if(index<0||index===shared.index)return;
    shared.from=shared.index;shared.index=index;shared.at=Date.now();shared.revision++;
    refresh();
  },true);
  new MutationObserver(refresh).observe(document.documentElement,{
    childList:true,subtree:true,attributes:true,attributeFilter:['hidden','aria-current','class']
  });
  window.addEventListener('resize',refresh);
  refresh();
})();
