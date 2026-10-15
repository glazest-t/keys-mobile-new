function sF({showHistory=true,onSubmit,onEdit,onCityActive}={}) {
 const {state,dispatch,open}=J(),source=tt(),remote=source.source==='travelline';
 const [hotelId,setHotelId]=E.useState(null),search=state.search;
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('form',{className:'keys-search-hero','aria-label':'Поиск отеля',onSubmit:event=>{
   event.preventDefault();if(onSubmit){onSubmit(search,hotelId);return;}hotelId?(source.recordOpen(hotelId),open({type:'hotel',hotelId})):dispatch({type:'SEARCH_SUBMIT',city:search.city});
  },children:[
   n.jsxs('div',{className:'keys-search-fields',children:[
    n.jsx(f4,{onHotelChange:setHotelId,onActivate:onCityActive?()=>onCityActive(true):undefined,variant:'line',required:!remote,value:search.city,onChange:city=>{dispatch({type:'SEARCH_PATCH',patch:{city}});onCityActive?.(!city.trim());}}),
    n.jsxs('div',{className:'keys-search-parameters',children:[
     n.jsxs('button',{type:'button',onClick:()=>onEdit?onEdit('dates'):open({type:'dates'}),children:[n.jsx(D,{name:'calendar'}),n.jsxs('span',{children:[n.jsx('small',{children:'Даты поездки'}),n.jsx('strong',{children:it(search.arrival,search.departure)})]})]}),
     n.jsxs('button',{type:'button',onClick:()=>onEdit?onEdit('guests'):open({type:'guests'}),children:[n.jsx(D,{name:'users'}),n.jsxs('span',{children:[n.jsx('small',{children:'Гости'}),n.jsx('strong',{children:Rt(search.party)})]})]})
    ]})
   ]}),
   n.jsx(H,{type:'submit',icon:'search',className:'keys-search-submit',children:'Найти отель'})
  ]}),
  showHistory&&n.jsx(B4,{})
 ]});
}

function KeysFindHeading(){
 const {dispatch}=J();
 return n.jsxs('div',{className:'keys-find-heading',children:[
  n.jsx('button',{type:'button',className:'keys-find-home-back','aria-label':'Назад на главную',title:'На главную',onClick:()=>dispatch({type:'HOME'}),children:n.jsx('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.65,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,children:n.jsx('path',{d:'m12 5-7 7 7 7M5 12h14'})})}),
  n.jsx('h1',{children:'Куда поедем?'})
 ]});
}

// Home uses the original city autocomplete, search state, calendar and guest editor.
function KeysHomeSearchWidget(){
 const {state,dispatch}=J(),[modal,setModal]=E.useState(null),ref=E.useRef(null);
 const post=(type,value={})=>window.parent.postMessage({source:'keys-home-search',type,...value},location.origin);
 E.useLayoutEffect(()=>{
  document.documentElement.dataset.homeSearch='true';
  document.documentElement.dataset.desktopAccount='true';
  document.documentElement.dataset.homeSearchModal=String(!!modal);
  const report=()=>{
   const options=document.querySelector('[role="listbox"]');
   post('size',{modal:!!modal,height:Math.ceil(Math.max(ref.current?.getBoundingClientRect().bottom||112,options?.getBoundingClientRect().bottom||0)+8)});
  };
  const resize=new ResizeObserver(report),mutation=new MutationObserver(report);
  resize.observe(ref.current);mutation.observe(ref.current,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded']});report();
  return()=>{resize.disconnect();mutation.disconnect();};
 },[modal]);
 E.useEffect(()=>{
  const receive=event=>{
   if(event.source!==window.parent||event.origin!==location.origin||event.data?.source!=='keys-home-search-host'||!event.data.search)return;
   dispatch({type:'SEARCH_PATCH',patch:{...event.data.search,results:false,intent:'known'}});
  };
  window.addEventListener('message',receive);post('ready');return()=>window.removeEventListener('message',receive);
 },[dispatch]);
 return n.jsxs('div',{ref,className:'keys-home-search-widget','data-find-layout':'landing',children:[
  n.jsx(sF,{showHistory:false,onEdit:setModal,onSubmit:(search,hotelId)=>post('submit',{search,hotelId})}),
  modal&&(modal==='guests'?n.jsx(KeysSearchGuestsPopup,{onClose:()=>setModal(null)}):n.jsx(xh,{section:modal,roomStay:true,onClose:()=>setModal(null)}))
 ]});
}

// Anchored desktop search reuses the shared search fields and saved search history.
function KeysHeaderSearchPopup(){
 const {dispatch}=J(),[editing,setEditing]=E.useState(null),[reset,setReset]=E.useState(0),[mode,setMode]=E.useState('known'),[cityActive,setCityActive]=E.useState(false),[wish,setWish]=E.useState('');
 const seen=new Set(),history=QB().searches.filter(item=>{const key=[item.city,item.arrival,item.departure,Rt(item.party)].join('|');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,5);
 const post=(type,value={})=>window.parent.postMessage({source:'keys-header-search',type,...value},location.origin);
 E.useLayoutEffect(()=>{document.documentElement.dataset.homeSearch='true';document.documentElement.dataset.headerSearch='true';document.documentElement.dataset.desktopAccount='true';},[]);
 E.useEffect(()=>{
  const receive=event=>{
   if(event.source!==window.parent||event.origin!==location.origin||event.data?.source!=='keys-home-search-host')return;
   if(event.data.anchor){
    const {left,bottom}=event.data.anchor,width=Math.min(960,innerWidth-32),top=Math.min(bottom+12,innerHeight-220);
    document.documentElement.style.setProperty('--header-search-left',Math.max(16,Math.min(left,innerWidth-width-16))+'px');
    document.documentElement.style.setProperty('--header-search-top',Math.max(16,top)+'px');
    document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>post('painted'))));
   }
   if(event.data.search)dispatch({type:'SEARCH_PATCH',patch:{...event.data.search,results:false,intent:'known',keysCollection:null}});
  };
  window.addEventListener('message',receive);post('ready');return()=>window.removeEventListener('message',receive);
 },[dispatch]);
 const sendWish=()=>{if(wish.trim())post('advice',{wish:wish.trim()});};
 return n.jsxs(n.Fragment,{children:[
  n.jsx(ct,{title:'Новая поездка',swipeToClose:false,onClose:()=>post('close'),children:n.jsxs('div',{className:'keys-header-search-body','data-find-layout':'landing',children:[
   n.jsx('div',{className:'keys-header-search-modes',role:'group','aria-label':'Способ поиска',children:[['known','Знаю, что ищу'],['advice','Нужен совет']].map(([value,label])=>n.jsx('button',{type:'button','aria-pressed':mode===value,onClick:()=>setMode(value),children:label},value))}),
   mode==='known'?n.jsxs(n.Fragment,{children:[
    n.jsx(sF,{showHistory:false,onCityActive:setCityActive,onEdit:section=>{setCityActive(false);setEditing(section);},onSubmit:(query,hotelId)=>post('submit',{search:query,hotelId})},reset),
    cityActive&&n.jsxs('section',{className:'keys-header-search-suggestions','aria-label':'Популярные города',children:[n.jsx('h3',{children:'Популярные города'}),n.jsx('div',{className:'keys-header-popular-cities',children:['Москва','Санкт-Петербург','Сочи','Казань','Калининград','Екатеринбург'].map(city=>n.jsxs('button',{type:'button',onClick:()=>{dispatch({type:'SEARCH_PATCH',patch:{city,hotelId:null}});setCityActive(false);setReset(value=>value+1);},children:[n.jsx(D,{name:'pin',className:'size-4'}),city]},city))})]}),
    !cityActive&&history.length>0&&n.jsxs('section',{className:'keys-header-search-suggestions','aria-label':'История поиска',children:[n.jsx('h3',{children:'Вы недавно искали'}),n.jsx('div',{className:'keys-header-search-track',children:history.map((item,index)=>n.jsxs('button',{type:'button',onClick:()=>{dispatch({type:'SEARCH_PATCH',patch:{...item,results:false,intent:'known',keysCollection:null}});setReset(value=>value+1);},children:[n.jsx('strong',{children:item.city||'Любой город'}),n.jsx('small',{children:zt(item.arrival,item.departure)+' · '+Rt(item.party)})]},index))})]}),
   ]}):n.jsxs(n.Fragment,{children:[
    n.jsxs('form',{className:'keys-header-wish',onSubmit:event=>{event.preventDefault();sendWish();},children:[n.jsxs('label',{children:[n.jsx('span',{children:'Чего хочется от поездки'}),n.jsx('textarea',{value:wish,onChange:event=>setWish(event.target.value),placeholder:'Хочу бассейн, вкусно поесть и тишину…',rows:2,maxLength:500,onKeyDown:event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();sendWish();}}})]}),n.jsx(H,{type:'submit',disabled:!wish.trim(),children:'Подобрать'})]}),
    n.jsx('div',{className:'keys-header-wish-examples',children:['С детьми у моря','Тишина, спа и бассейн','По работе в Москву','Отдых с собакой'].map(text=>n.jsx('button',{type:'button',onClick:()=>setWish(text),children:text},text))})
   ]})
  ]})}),
  editing&&(editing==='guests'?n.jsx(KeysSearchGuestsPopup,{onClose:()=>setEditing(null)}):n.jsx(xh,{section:editing,roomStay:true,onClose:()=>setEditing(null)}))
 ]});
}

// Search guests are edited independently from dates and booking checkout fields.
function KeysSearchGuestsPopup({onClose}){
 const {state,dispatch}=J(),[party,setParty]=E.useState(()=>sn(state.search.party));
 const valid=Bt(party);
 return n.jsx(ct,{title:'Гости',onClose,children:n.jsxs('form',{onSubmit:event=>{event.preventDefault();if(!valid)return;dispatch({type:'SEARCH_PATCH',patch:{party}});onClose();},children:[
  n.jsx(gh,{value:party,onChange:setParty,showPreferences:true}),
  !valid&&n.jsx('p',{className:'mt-3 text-12 text-muted',role:'status',children:'Укажите возраст каждого ребёнка'}),
  n.jsx(H,{type:'submit',className:'mt-5',disabled:!valid,children:'Применить'})
 ]})});
}
