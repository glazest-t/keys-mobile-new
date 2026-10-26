/* First-use preferences are independent of search filters and booking data. */
const keysSwipePreferenceOptions=[
 {id:'family',icon:'users',label:'Семейный отдых'},
 {id:'discovery',icon:'compass',label:'Открытия и опыт'},
 {id:'romantic',icon:'heart',label:'Романтический'},
 {id:'culture',icon:'building-bank',label:'Культура и история'},
 {id:'solo',icon:'user',label:'Соло-поездка'},
 {id:'active',icon:'mountain',label:'Активный отдых'},
 {id:'nature',icon:'leaf',label:'Природа и эко'},
 {id:'long',icon:'home',label:'Долгое проживание'},
 {id:'wellness',icon:'flower',label:'СПА и здоровье'},
 {id:'food',icon:'tools-kitchen-2',label:'Гастрономия'}
];
const keysSwipePreferencesKey='keys-swipe-preferences-v1';
function keysCleanSwipePreferences(value){
 return {completed:value?.completed===true,selected:keysSwipePreferenceOptions.filter(option=>Array.isArray(value?.selected)&&value.selected.includes(option.id)).map(option=>option.id)};
}
function keysRestoreSwipePreferences(state){
 try{state.keysSwipePreferences=keysCleanSwipePreferences(JSON.parse(localStorage.getItem(keysSwipePreferencesKey)||'null'));}catch{state.keysSwipePreferences=keysCleanSwipePreferences(null);}
 return state;
}
function keysSwipePreferences(state){return state.keysSwipeDemo||state.keysSwipePreferences||keysCleanSwipePreferences(null);}
function keysSwipeNeedsPreferences(state){return !!state.keysSwipeDemo&&!state.keysSwipeDemo.completed;}
function keysSwipePreferencesReduce(state,action){
 if(action.type==='KEYS_SWIPE_SCENARIO'){
  const key=typeof action.firstRun==='string'?action.firstRun:null;
  if((state.keysSwipeDemo?.key||null)===key)return state;
  return {...state,keysSwipeDemo:key?{key,...keysCleanSwipePreferences(null)}:null};
 }
 const field=state.keysSwipeDemo?'keysSwipeDemo':'keysSwipePreferences',current=keysSwipePreferences(state);
 if(action.type==='KEYS_SWIPE_PREFERENCE'){
  if(!keysSwipePreferenceOptions.some(option=>option.id===action.id))return state;
  return {...state,[field]:{...current,selected:current.selected.includes(action.id)?current.selected.filter(id=>id!==action.id):[...current.selected,action.id]}};
 }
 if(action.type==='KEYS_SWIPE_PREFERENCES_DONE')return {...state,[field]:{...current,completed:true}};
 return state;
}
function keysRankSwipeHotels(hotels,preferences){
 if(!preferences?.selected?.length)return hotels;
 const score=hotel=>{
  const text=[hotel.description,hotel.location,hotel.room].join(' ').toLowerCase();
  const matches={family:hotel.family,discovery:/дизайн|архитектур|историческ|бутик|необычн/.test(text),romantic:hotel.spa||hotel.quiet,culture:/центр|музе|истори|театр/.test(text),solo:hotel.quiet||hotel.work,active:/горн|горы|трасс|троп|спорт|прокат/.test(text),nature:/парк|зелён|зелен|лес|пальм|сад/.test(text),long:hotel.work,wellness:hotel.spa,food:hotel.breakfast||/ресторан|гастро|ужин/.test(text)};
  return preferences.selected.filter(id=>matches[id]).length;
 };
 return hotels.map((hotel,index)=>({hotel,index,score:score(hotel)})).sort((a,b)=>b.score-a.score||a.index-b.index).map(item=>item.hotel);
}
function KeysSwipePreferencesStorage(){
 const {state}=J();
 E.useEffect(()=>{if(!state.keysSwipePreferences)return;try{localStorage.setItem(keysSwipePreferencesKey,JSON.stringify(state.keysSwipePreferences));}catch{}},[state.keysSwipePreferences]);
 return null;
}
function KeysSwipePreferences(){
 const {state,dispatch}=J(),preferences=keysSwipePreferences(state);
 const screenRef=E.useRef(null),exitRef=E.useRef(false),mountedRef=E.useRef(true),exitAnimations=E.useRef([]);
 const [leaving,setLeaving]=E.useState(false);
 E.useEffect(()=>{
  mountedRef.current=true;
  return ()=>{mountedRef.current=false;exitAnimations.current.forEach(animation=>animation.cancel());};
 },[]);
 const continueToHotels=async()=>{
  if(exitRef.current)return;
  exitRef.current=true;
  const screen=screenRef.current;
  if(!screen||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   dispatch({type:'KEYS_SWIPE_PREFERENCES_DONE'});
   return;
  }
  const body=screen.querySelector('.keys-swipe-preferences-body').getBoundingClientRect();
  const center={x:body.left+body.width/2,y:body.top+body.height*.46};
  setLeaving(true);
  try{
   exitAnimations.current=[...screen.querySelectorAll('.keys-swipe-bubble')].map((bubble,index)=>{
    const rect=bubble.getBoundingClientRect(),style=getComputedStyle(bubble);
    const startTransform=style.transform,startOpacity=style.opacity;
    const angle=index*Math.PI*2/10;
    const dx=center.x-rect.left-rect.width/2+Math.cos(angle)*20;
    const dy=center.y-rect.top-rect.height/2+Math.sin(angle)*20;
    bubble.getAnimations().forEach(animation=>animation.cancel());
    return bubble.animate([
     {transform:startTransform,opacity:startOpacity,offset:0,easing:'cubic-bezier(.4,0,.2,1)'},
     {transform:`translate(${dx}px,${dy}px) scale(.32)`,opacity:1,offset:.57,easing:'ease-in-out'},
     {transform:`translate(${dx}px,${dy-6}px) scale(.3)`,opacity:1,offset:.65,easing:'cubic-bezier(.55,0,.8,.4)'},
     {transform:`translate(${dx+body.width}px,${dy-body.height*.45}px) scale(.08)`,opacity:0,offset:1}
    ],{duration:1150,delay:index*12,fill:'forwards'});
   });
   await Promise.allSettled(exitAnimations.current.map(animation=>animation.finished));
  }finally{
   // Back navigation or a scenario change must never trigger a delayed redirect.
   if(mountedRef.current)dispatch({type:'KEYS_SWIPE_PREFERENCES_DONE'});
  }
 };
 const choose=(event,id)=>{
  if(exitRef.current)return;
  dispatch({type:'KEYS_SWIPE_PREFERENCE',id});
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const button=event.currentTarget,currentTransform=getComputedStyle(event.currentTarget).transform;
  button.getAnimations().filter(animation=>animation.id==='keys-swipe-choice').forEach(animation=>animation.cancel());
  const animation=button.animate([
   {transform:currentTransform},
   {transform:'scale(.985)',offset:.22},
   {transform:'scale(1)'}
  ],{duration:760,easing:'cubic-bezier(.22,1,.36,1)'});
  // Reuse idle rings, so a second click leaves the preceding ripples intact.
  const rings=[...button.parentElement.querySelectorAll('.keys-swipe-wave')].filter(ring=>!ring.getAnimations().length).slice(0,3);
  rings.forEach((ring,index)=>ring.animate([
   {transform:'scale(.99)',opacity:0,offset:0},
   {transform:'scale(1.07)',opacity:.28,offset:.16},
   {transform:'scale(1.48)',opacity:.09,offset:.65},
   {transform:'scale(1.7)',opacity:0,offset:1}
  ],{duration:1800,delay:index*180,easing:'cubic-bezier(.2,.55,.35,1)'}));
  animation.id='keys-swipe-choice';
 };
 return n.jsxs('section',{ref:screenRef,className:'keys-swipe-preferences'+(leaving?' is-leaving':''),'aria-busy':leaving,'aria-label':'Предпочтения для отелей свайпом',children:[
  n.jsx(Ae,{title:'Отели свайпом'}),
  n.jsxs('div',{className:'keys-swipe-preferences-body',children:[
   n.jsxs('h2',{id:'keys-swipe-preferences-title',children:['Какой ',n.jsx('span',{children:'отдых'}),n.jsx('br',{}),'вы ищете?']}),
   n.jsx('div',{className:'keys-swipe-preference-tags',role:'group','aria-labelledby':'keys-swipe-preferences-title',children:keysSwipePreferenceOptions.map((option,index)=>n.jsxs('div',{className:'keys-swipe-bubble',style:{'--bubble-index':index},children:[n.jsx('span',{className:'keys-swipe-waves','aria-hidden':true,children:Array.from({length:9},(_,wave)=>n.jsx('span',{className:'keys-swipe-wave'},wave))}),n.jsxs('button',{type:'button',disabled:leaving,'aria-pressed':preferences.selected.includes(option.id),onClick:event=>choose(event,option.id),children:[n.jsx('img',{className:'keys-swipe-choice-icon',src:'./swipe-art/'+option.icon+'.svg',alt:'',draggable:false}),n.jsx('span',{className:'keys-swipe-choice-label',children:option.label}),n.jsx('span',{className:'keys-swipe-choice-check','aria-hidden':true,children:n.jsx('img',{src:'./swipe-art/check.svg',alt:''})})]})]},option.id))})
  ]}),
  n.jsx('footer',{className:'keys-swipe-preferences-footer',children:n.jsx(H,{onClick:continueToHotels,disabled:leaving,children:'Перейти к отелям'})})
 ]});
}
