function sF({showHistory=true,onSubmit,onEdit}={}) {
 const {state,dispatch,open}=J(),source=tt(),remote=source.source==='travelline';
 const [hotelId,setHotelId]=E.useState(null),search=state.search;
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('form',{className:'keys-search-hero','aria-label':'Поиск отеля',onSubmit:event=>{
   event.preventDefault();if(onSubmit){onSubmit(search,hotelId);return;}hotelId?(source.recordOpen(hotelId),open({type:'hotel',hotelId})):dispatch({type:'SEARCH_SUBMIT',city:search.city});
  },children:[
   n.jsxs('div',{className:'keys-search-fields',children:[
    n.jsx(f4,{onHotelChange:setHotelId,variant:'line',required:!remote,value:search.city,onChange:city=>dispatch({type:'SEARCH_PATCH',patch:{city}})}),
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
  modal&&n.jsx(xh,{section:modal,roomStay:true,onClose:()=>setModal(null)})
 ]});
}
