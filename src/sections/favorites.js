/* Lists belong to the prototype; hotel prices and heart actions use the shared engine. */
function keysFavoriteGroups(state){return state.keysFavoriteGroups||[];}
function keysFavoriteCollection(state,id){
 const groups=keysFavoriteGroups(state),saved=state.discovery.savedIds;
 const group=id==='__unassigned'?{id,name:'Без подборки',hotelIds:saved.filter(hotelId=>!groups.some(g=>g.hotelIds.includes(hotelId)))}:groups.find(g=>g.id===id);
 return group?{...group,hotelIds:[...new Set(group.hotelIds)].filter(hotelId=>saved.includes(hotelId))}:null;
}
function keysRestoreFavorites(state){
 try{
  const stored=JSON.parse(localStorage.getItem('keys-favorite-lists-v1')||'null');
  if(stored&&Array.isArray(stored.groups)){
   state.keysFavoriteGroups=stored.groups.filter(g=>typeof g.id==='string'&&typeof g.name==='string'&&Array.isArray(g.hotelIds)).map(g=>({...g,name:g.name.slice(0,48),hotelIds:g.hotelIds.filter(id=>typeof id==='string')}));
   if(Array.isArray(stored.ids))state.discovery={...state.discovery,savedIds:stored.ids.filter(id=>typeof id==='string')};
  }
  if(stored?.notes&&typeof stored.notes==='object'&&!Array.isArray(stored.notes))state.keysFavoriteNotes=Object.fromEntries(Object.entries(stored.notes).filter(([,text])=>typeof text==='string'&&text.trim()).map(([id,text])=>[id,text.slice(0,1000)]));
  const session=JSON.parse(sessionStorage.getItem('keys-favorite-session-v1')||'null');
  if(session?.asked)state.keysFavoriteSession={asked:true,active:session.active};
 }catch{}
 return state;
}
function keysFavoritesReduce(state,action,next){
 const groups=keysFavoriteGroups(state);
 if(action.type==='TOAST'){
  // The remote favorite adapter acknowledges the same save after updating IDs.
  if(action.message==='Отель сохранён'&&(state.keysFavoritePending?.length||state.keysFavoriteEditing?.length||state.keysFavoriteNotice))return state;
  return action.message?{...next,keysFavoriteNotice:null}:next;
 }
 if(action.type==='KEYS_FAVORITE_NOTICE_CLOSE')return action.token===state.keysFavoriteNotice?.token?{...state,keysFavoriteNotice:null}:state;
 if(action.type==='KEYS_FAVORITE_CHANGE'){
  const hotelIds=(action.hotelIds||[]).filter(id=>state.discovery.savedIds.includes(id));
  return hotelIds.length?{...state,keysFavoriteEditing:hotelIds,keysFavoriteNotice:null,ui:{...state.ui,toast:''}}:state;
 }
 if(action.type==='KEYS_FAVORITE_CANCEL')return {...state,keysFavoriteEditing:null,keysFavoritePending:null};
 if(action.type==='KEYS_FAVORITE_NOTE'){
  if(!state.discovery.savedIds.includes(action.hotelId))return state;
  const notes={...state.keysFavoriteNotes},text=String(action.text||'').trim().slice(0,1000);
  if(text)notes[action.hotelId]=text;else delete notes[action.hotelId];
  return {...state,keysFavoriteNotes:notes,keysFavoriteNotice:null,ui:{...state.ui,toast:text?'Заметка сохранена':'Заметка удалена'}};
 }
 if(action.type==='KEYS_FAVORITE_INTENT')return {...state,keysFavoriteIntents:[...new Set([...(state.keysFavoriteIntents||[]),action.id])]};
 if(action.type==='KEYS_FAVORITE_LIST'){
  const id=action.id||'list-'+action.now;
  const exists=groups.find(g=>g.id===id);
  if(action.id&&!exists)return state;
  const name=exists?.name||String(action.name||'').trim().slice(0,48)||'Моя поездка';
  const selectedIds=[...new Set([...(state.keysFavoritePending||[]),...(state.keysFavoriteEditing||[])])].filter(id=>state.discovery.savedIds.includes(id));
  const hotelIds=[...new Set([...(exists?.hotelIds||[]),...selectedIds])].filter(id=>state.discovery.savedIds.includes(id));
  const group={id,name,hotelIds};
  const updated=groups.map(g=>g.id===id?group:{...g,hotelIds:g.hotelIds.filter(hotelId=>!selectedIds.includes(hotelId))});
  return {...state,keysFavoriteGroups:exists?updated:[...updated,group],keysFavoritePending:null,keysFavoriteEditing:null,keysFavoriteSession:{asked:true,active:id},keysFavoriteNotice:selectedIds.length?{hotelIds:selectedIds,listId:id,token:action.now}:null,ui:{...state.ui,toast:selectedIds.length?'':'Подборка «'+name+'» сохранена'}};
 }
 if(action.type==='KEYS_FAVORITE_MOVE'){
  if(!groups.some(g=>g.id===action.listId)||!state.discovery.savedIds.includes(action.hotelId))return state;
  return {...state,keysFavoriteGroups:groups.map(g=>({...g,hotelIds:g.id===action.listId?[...new Set([...g.hotelIds,action.hotelId])]:g.hotelIds.filter(id=>id!==action.hotelId)})),keysFavoriteNotice:null,ui:{...state.ui,toast:'Отель перемещён'}};
 }
 const before=state.discovery.savedIds,after=next.discovery.savedIds;
 if(before===after)return next;
 const added=after.filter(id=>!before.includes(id));
 const explicit=action.type==='FAVORITE_TOGGLE'||action.type==='SWIPE'&&action.liked||action.type==='FAVORITES_REPLACE'&&added.some(id=>(state.keysFavoriteIntents||[]).includes(id));
 // Identity and catalogue hydration can briefly clear IDs. Prune membership
 // only for an explicit removal; visible counts always use current savedIds.
 const removing=['FAVORITE_TOGGLE','SWIPE_UNDO','DECK_SAVED_PATCH'].includes(action.type);
 let updated=groups.map(g=>({...g,hotelIds:g.hotelIds.filter(id=>!removing||after.includes(id))}));
 let pending=(state.keysFavoritePending||[]).filter(id=>after.includes(id));
 if(added.length&&explicit){
  updated=updated.map(g=>({...g,hotelIds:g.hotelIds.filter(id=>!added.includes(id))}));
  const active=updated.find(g=>g.id===state.keysFavoriteSession?.active);
  let destination=active;
  if(state.keysFavoriteSession?.asked&&active){updated=updated.map(g=>g.id===active.id?{...g,hotelIds:[...new Set([...g.hotelIds,...added])]}:g);}
  else if(state.keysFavoriteSession?.asked){
   const group=updated.find(g=>g.id==='session-default')||{id:'session-default',name:'Моя поездка',hotelIds:[]};
   updated=[...updated.filter(g=>g.id!==group.id),{...group,hotelIds:[...new Set([...group.hotelIds,...added])]}];
   next={...next,keysFavoriteSession:{asked:true,active:group.id}};
   destination=group;
  }else pending=[...new Set([...pending,...added])];
  next={...next,keysFavoriteNotice:state.keysFavoriteSession?.asked?{hotelIds:added,listId:destination.id,token:action.now}:null,ui:{...next.ui,toast:''}};
 }
 if(removing&&next.keysFavoriteNotice?.hotelIds.some(id=>!after.includes(id)))next={...next,keysFavoriteNotice:null};
 return {...next,keysFavoriteGroups:updated,keysFavoritePending:pending.length?pending:null,keysFavoriteIntents:(state.keysFavoriteIntents||[]).filter(id=>!added.includes(id))};
}
function Pt(state,action){return keysFavoritesReduce(state,action,action.type.startsWith('KEYS_FAVORITE_')?state:keysFavoritesBaseReducer(state,action));}
function KeysFavoriteListForm({onClose}){
 const {state,dispatch}=J(),groups=keysFavoriteGroups(state),[name,setName]=E.useState('');
 const pending=!!state.keysFavoritePending?.length;
 const editing=!!state.keysFavoriteEditing?.length,choosing=pending||editing;
 const [creating,setCreating]=E.useState(false);
 const [selected,setSelected]=E.useState(()=>editing?groups.find(g=>g.hotelIds.includes(state.keysFavoriteEditing[0]))?.id||'':'');
 const close=()=>{if(choosing)dispatch({type:'KEYS_FAVORITE_CANCEL'});onClose?.();};
 const save=(id)=>{dispatch({type:'KEYS_FAVORITE_LIST',...(id?{id}:{name})});onClose?.();};
 if(editing&&!creating)return n.jsx(ct,{title:'Изменить подборку',onClose:close,children:n.jsxs('div',{className:'keys-favorite-form',children:[
  n.jsx('div',{className:'keys-favorite-existing keys-favorite-existing-wrap',role:'group','aria-label':'Существующие подборки',children:groups.map(g=>n.jsx('button',{type:'button','aria-pressed':selected===g.id,onClick:()=>save(g.id),children:g.name},g.id))}),
  n.jsx(H,{onClick:()=>setCreating(true),children:'Создать подборку'})
 ]})});
 return n.jsx(ct,{title:editing?'Новая подборка':pending?'В какую подборку сохранить?':'Новая подборка',onClose:close,children:n.jsxs('form',{className:'keys-favorite-form',onSubmit:event=>{event.preventDefault();save(editing?'':selected);},children:[
  n.jsxs('label',{children:['Название новой подборки',n.jsx('input',{value:name,maxLength:48,placeholder:'Например, выходные у моря',onFocus:()=>setSelected(''),onChange:event=>{setName(event.target.value);setSelected('');}})]}),
  pending&&groups.length>0&&n.jsx('div',{className:'keys-favorite-existing',role:'group','aria-label':'Существующие подборки',children:groups.map(g=>n.jsx('button',{type:'button','aria-pressed':selected===g.id,onClick:()=>setSelected(g.id),children:g.name},g.id))}),
  n.jsx(H,{type:'submit',children:editing?'Создать подборку':'Сохранить'}),
  editing&&n.jsx(H,{variant:'text',onClick:()=>setCreating(false),children:'Вернуться к подборкам'})
 ]})});
}
function OH(props){
 const {state}=J();
 return state.keysFavoriteNotice?n.jsx(KeysFavoriteSavedNotice,{notice:state.keysFavoriteNotice},state.keysFavoriteNotice.token):n.jsx(KeysDefaultToast,props);
}
function KeysFavoriteSavedNotice({notice}){
 const {state,dispatch}=J(),[hovered,setHovered]=E.useState(false),[focused,setFocused]=E.useState(false);
 const group=keysFavoriteGroups(state).find(g=>g.id===notice.listId);
 const close=()=>dispatch({type:'KEYS_FAVORITE_NOTICE_CLOSE',token:notice.token});
 E.useEffect(()=>{if(hovered||focused)return;const timer=window.setTimeout(close,8000);return()=>window.clearTimeout(timer);},[notice.token,hovered,focused]);
 if(!group)return null;
 return n.jsxs('div',{className:'keys-favorite-saved-notice',onMouseEnter:()=>setHovered(true),onMouseLeave:()=>setHovered(false),onFocusCapture:()=>setFocused(true),onBlurCapture:event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);},children:[
  n.jsx('p',{role:'status','aria-live':'polite',children:(notice.hotelIds.length>1?'Отели сохранены в «':'Отель сохранён в «')+group.name+'»'}),
  n.jsx('button',{type:'button',className:'keys-favorite-change','aria-label':'Изменить подборку',onClick:()=>dispatch({type:'KEYS_FAVORITE_CHANGE',hotelIds:notice.hotelIds}),children:'Изменить'})
 ]});
}
function KeysFavoriteStorage(){
 const {state}=J();
 E.useEffect(()=>{try{localStorage.setItem('keys-favorite-lists-v1',JSON.stringify({groups:keysFavoriteGroups(state),ids:state.discovery.savedIds,notes:state.keysFavoriteNotes||{}}));}catch{}},[state.keysFavoriteGroups,state.discovery.savedIds,state.keysFavoriteNotes]);
 E.useEffect(()=>{if(state.keysFavoriteSession)try{sessionStorage.setItem('keys-favorite-session-v1',JSON.stringify(state.keysFavoriteSession));}catch{}},[state.keysFavoriteSession]);
 return state.keysFavoritePending?.length||state.keysFavoriteEditing?.length?n.jsx(KeysFavoriteListForm,{},state.keysFavoriteEditing?'edit':'save'):null;
}
function KeysFavoriteMap({collectionId,inline=false,onSelectionChange}){
 const {state,back}=J(),resource=Dn('favorites'),source=tt(),remote=source.source==='travelline';
 const collection=keysFavoriteCollection(state,collectionId);
 const hotels=E.useMemo(()=>{
  const ids=keysFavoriteCollection(state,collectionId)?.hotelIds||[];
  return ids.map(id=>remote?resource.value?.items.find(item=>item.hotelId===id)?.hotel??source.getSummary?.(id):_n.find(hotel=>hotel.id===id)).filter(Boolean);
 },[collectionId,state.keysFavoriteGroups,state.discovery.savedIds,remote,resource.value,source]);
 const [selected,setSelected]=E.useState([]),[index,setIndex]=E.useState(0),[previewHeight,setPreviewHeight]=E.useState(0),preview=E.useRef(null);
 const chosen=selected.map(id=>hotels.find(hotel=>hotel.id===id)).filter(Boolean),activeIndex=Math.min(index,Math.max(0,chosen.length-1)),hotel=chosen[activeIndex];
 const select=ids=>{setSelected(Array.isArray(ids)?ids:[ids]);setIndex(0);};
 const dismiss=()=>setSelected([]);
 const fitPadding=E.useMemo(()=>({topLeft:inline?[80,48]:[72,120],bottomRight:inline?[80,40]:[72,48],fitAll:true,maxZoom:14}),[inline]);
 E.useEffect(()=>{onSelectionChange?.(hotel?.id??null);},[hotel?.id,onSelectionChange]);
 E.useEffect(()=>{
  if(!preview.current){setPreviewHeight(0);return;}
  const measure=()=>setPreviewHeight(Math.ceil(preview.current?.getBoundingClientRect().height||0));
  const observer=new ResizeObserver(measure);observer.observe(preview.current);measure();return()=>observer.disconnect();
 },[hotel?.id]);
 E.useEffect(()=>{const escape=event=>{if(event.key==='Escape'){if(inline&&event.target.closest?.('dialog'))return;if(selected.length){event.stopPropagation();dismiss();}else if(!inline){event.stopPropagation();back();}}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[selected.length,back,inline]);
 return n.jsxs('section',{className:'keys-single-hotel-map keys-favorite-map'+(inline?' is-inline':''),'aria-label':'Карта подборки «'+(collection?.name||'Избранное')+'»',children:[
  n.jsx('div',{className:'keys-single-hotel-map-canvas',children:hotels.length?(remote?n.jsx(GV,{hotels,selectedId:hotel?.id,onSelect:select,className:'h-full w-full'}):n.jsx(E.Suspense,{fallback:n.jsx('p',{role:'status',children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels,selectedId:hotel?.id,previewHeight,onSelect:select,onDismiss:dismiss,dates:state.search,priceTick:state.discovery.priceTick,booked:false,fitPadding,minZoom:1})})):n.jsxs('div',{className:'keys-favorite-map-empty',children:[n.jsx('p',{children:collection?.hotelIds.length?'Расположение отелей пока недоступно':'В подборке пока нет отелей'}),!inline&&n.jsx(H,{variant:'secondary',onClick:back,children:'Вернуться к подборке'})]})}),
  !inline&&n.jsxs('header',{className:'keys-single-hotel-map-header',children:[n.jsx('button',{type:'button','aria-label':'Закрыть карту',onClick:back,children:n.jsx(D,{name:'back',className:'size-5'})}),n.jsxs('div',{children:[n.jsx('h1',{children:collection?.name||'Избранное'}),n.jsx('p',{children:as(hotels.length)})]})]}),
  hotel&&(!inline||chosen.length>1)&&n.jsxs('div',{ref:inline?undefined:preview,className:inline?'keys-favorite-map-selection':'keys-favorite-map-preview','aria-label':inline?'Отели в выбранной точке':'Выбранный отель на карте',children:[
   n.jsxs('div',{className:'keys-results-map-preview-toolbar',children:[
    chosen.length>1?n.jsxs('div',{className:'keys-results-map-pager',children:[n.jsx('button',{type:'button','aria-label':'Предыдущий отель на карте',disabled:activeIndex===0,onClick:()=>setIndex(activeIndex-1),children:n.jsx(D,{name:'chevron',className:'size-4 keys-results-map-prev'})}),n.jsx('span',{'aria-live':'polite',children:(activeIndex+1)+' из '+chosen.length}),n.jsx('button',{type:'button','aria-label':'Следующий отель на карте',disabled:activeIndex===chosen.length-1,onClick:()=>setIndex(activeIndex+1),children:n.jsx(D,{name:'chevron',className:'size-4'})})]}):n.jsx('span',{}),
    n.jsx('button',{type:'button','aria-label':inline?'Снять выделение отеля':'Скрыть карточку отеля',onClick:dismiss,children:n.jsx(D,{name:'close',className:'size-4'})})
   ]}),
   !inline&&n.jsx(jx,{hotelId:hotel.id,summary:remote?hotel:undefined},hotel.id)
  ]})
 ]});
}
function KeysFavoritesLayout({collectionId,controls,children}){
 const desktop=useKeysDesktopList(),[selected,setSelected]=E.useState(null),list=E.useRef(null);
 useKeysSelectedHotelScroll(list,selected,desktop);
 return n.jsx(keysResultsContext().Provider,{value:desktop?selected:null,children:n.jsxs('div',{className:'keys-favorites-workspace',children:[
  controls,
  n.jsx('div',{ref:list,className:'keys-favorites-results','aria-label':'Отели в подборке',children}),
  desktop&&n.jsx(KeysFavoriteMap,{collectionId,inline:true,onSelectionChange:setSelected})
 ]})});
}
function KeysFavorites(){
 const {state,dispatch}=J(),resource=Dn('favorites'),ids=state.discovery.savedIds;
 const desktop=useKeysDesktopList();
 const source=tt(),groups=keysFavoriteGroups(state),[create,setCreate]=E.useState(false),[move,setMove]=E.useState(null),[editing,setEditing]=E.useState(null);
 const selected=state.navigation.screen?.collectionId;
 const ungrouped=ids.filter(id=>!groups.some(g=>g.hotelIds.includes(id)));
 const active=selected==='__unassigned'?{id:selected,name:'Без подборки',hotelIds:ungrouped}:groups.find(g=>g.id===selected);
 const visible=active?ids.filter(id=>active.hotelIds.includes(id)):[];
 const collections=[...groups,...(ungrouped.length?[{id:'__unassigned',name:'Без подборки',hotelIds:ungrouped}]:[])];
 const cover=id=>{
  const local=_n.find(h=>h.id===id),summary=resource.value?.items.find(item=>item.hotelId===id)?.hotel??source.getSummary?.(id);
  return local?.photos?.[0]?.src||summary?.photos?.[0]?.url;
 };

 const hotels=visible.map(id=>({id,summary:resource.value?.items.find(item=>item.hotelId===id)?.hotel??source.getSummary?.(id)}));
 const createButton=n.jsx(H,{variant:'secondary',icon:'plus',className:'keys-favorite-create-list',onClick:()=>setCreate(true),children:'Создать подборку'});
 return n.jsxs('section',{className:'keys-favorites-page','aria-label':'Избранные отели',children:[
  n.jsx(Ae,{title:active?active.name:'Избранное',showBack:!!active,action:active?n.jsx('button',{type:'button',className:'keys-favorite-map-button','aria-label':'Показать отели подборки на карте',onClick:()=>dispatch({type:'OPEN',screen:{type:'hotel-map',collectionId:active.id}}),children:n.jsx(D,{name:'map',className:'size-5'})}):desktop?createButton:null}),
  !active&&n.jsxs(n.Fragment,{children:[
   n.jsx('div',{className:'keys-favorite-collections',children:collections.map(group=>{
    const saved=group.hotelIds.filter(id=>ids.includes(id)),photos=saved.map(cover).filter(Boolean).slice(0,3);
    return n.jsxs('button',{type:'button',className:'keys-favorite-collection','aria-label':'Открыть подборку «'+group.name+'»',onClick:()=>dispatch({type:'OPEN',screen:{type:'saved',collectionId:group.id}}),children:[
     n.jsx('span',{className:'keys-favorite-collection-cover','data-photos':photos.length,'aria-hidden':true,children:photos.length?photos.map((src,i)=>n.jsx('img',{src,alt:'',loading:'lazy'},i)):n.jsx(D,{name:'heart'})}),
     n.jsxs('span',{className:'keys-favorite-collection-copy',children:[n.jsxs('span',{children:[n.jsx('strong',{children:group.name}),n.jsx('small',{children:as(saved.length)})]}),n.jsx(D,{name:'chevron'})]})
    ]},group.id);
   })}),
   !collections.length&&n.jsxs('div',{className:'keys-favorites-empty',children:[n.jsx(D,{name:'heart'}),n.jsx('h2',{children:'Здесь будут ваши подборки'}),n.jsx('p',{children:'Сохраняйте понравившиеся отели и собирайте идеи для поездок.'}),n.jsx(H,{onClick:()=>{dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});},children:'Найти отель'})]}),
   !desktop&&createButton
  ]}),
  active&&n.jsxs(KeysFavoritesLayout,{collectionId:active.id,controls:n.jsx('div',{className:'keys-favorites-controls',children:n.jsxs('div',{className:'keys-favorite-trip',children:[
   n.jsxs('button',{type:'button',onClick:()=>setEditing('dates'),'aria-label':'Изменить даты проживания',children:[n.jsx(D,{name:'calendar'}),n.jsxs('span',{children:[n.jsx('small',{children:'Даты проживания'}),n.jsx('strong',{children:zt(state.search.arrival,state.search.departure)})]}),n.jsx(D,{name:'down'})]}),
   n.jsxs('button',{type:'button',onClick:()=>setEditing('guests'),'aria-label':'Изменить количество гостей',children:[n.jsx(D,{name:'users'}),n.jsxs('span',{children:[n.jsx('small',{children:'Гости'}),n.jsx('strong',{children:Bm(state.search.party)})]}),n.jsx(D,{name:'down'})]})
  ]})}),children:[
  resource.error&&n.jsxs('div',{role:'alert',children:[n.jsx('p',{children:'Не удалось обновить сохранённые отели.'}),n.jsx(H,{variant:'secondary',onClick:()=>resource.reload(),children:'Повторить'})]}),
  n.jsx('div',{className:'keys-favorites-list',children:hotels.map(hotel=>n.jsxs('div',{className:'keys-favorite-item',children:[n.jsx(jx,{hotelId:hotel.id,summary:hotel.summary??undefined}),n.jsxs('button',{type:'button',className:'keys-favorite-membership',title:groups.find(g=>g.hotelIds.includes(hotel.id))?.name||'Без подборки',onClick:()=>setMove(hotel.id),'aria-label':'Изменить подборку для '+(hotel.summary?.name||_n.find(h=>h.id===hotel.id)?.name||'отеля'),children:[n.jsx('span',{children:groups.find(g=>g.hotelIds.includes(hotel.id))?.name||'Без подборки'}),n.jsx(D,{name:'down'})]})]},hotel.id))}),
  !hotels.length&&n.jsxs('div',{className:'keys-favorites-empty',children:[n.jsx(D,{name:'heart'}),n.jsx('h2',{children:ids.length?'В подборке пока нет отелей':'Сохраняйте отели, которые нравятся'}),n.jsx('p',{children:'Нажмите на сердечко у отеля, чтобы сохранить его для будущей поездки.'}),n.jsx(H,{onClick:()=>{dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});},children:'Найти отель'})]}),
  ]},active.id),
  create&&n.jsx(KeysFavoriteListForm,{onClose:()=>setCreate(false)}),
  editing&&n.jsx(xh,{roomStay:true,section:editing,onClose:()=>setEditing(null)}),
  move&&n.jsx(ct,{title:'Переместить в подборку',onClose:()=>setMove(null),children:n.jsxs('div',{className:'keys-sort-options',children:[...groups.map(g=>n.jsxs('button',{type:'button','aria-pressed':g.hotelIds.includes(move),onClick:()=>{dispatch({type:'KEYS_FAVORITE_MOVE',hotelId:move,listId:g.id});setMove(null);},children:[n.jsx('span',{children:g.name}),g.hotelIds.includes(move)&&n.jsx(D,{name:'check'})]},g.id)),!groups.length&&n.jsx('p',{children:'Сначала создайте подборку с помощью кнопки «+ Подборка».'})]})})
 ]});
}
