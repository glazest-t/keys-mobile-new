/* Lists belong to the prototype; hotel prices and heart actions use the shared engine. */
function keysFavoriteGroups(state){return state.keysFavoriteGroups||[];}
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
 if(action.type==='KEYS_FAVORITE_NOTE'){
  if(!state.discovery.savedIds.includes(action.hotelId))return state;
  const notes={...state.keysFavoriteNotes},text=String(action.text||'').trim().slice(0,1000);
  if(text)notes[action.hotelId]=text;else delete notes[action.hotelId];
  return {...state,keysFavoriteNotes:notes,ui:{...state.ui,toast:text?'Заметка сохранена':'Заметка удалена'}};
 }
 if(action.type==='KEYS_FAVORITE_INTENT')return {...state,keysFavoriteIntents:[...new Set([...(state.keysFavoriteIntents||[]),action.id])]};
 if(action.type==='KEYS_FAVORITE_LIST'){
  const name=String(action.name||'').trim().slice(0,48)||'Моя поездка';
  const id=action.id||'list-'+action.now;
  const exists=groups.find(g=>g.id===id);
  const hotelIds=[...new Set([...(exists?.hotelIds||[]),...(state.keysFavoritePending||[])])].filter(id=>state.discovery.savedIds.includes(id));
  const group={id,name,hotelIds};
  return {...state,keysFavoriteGroups:exists?groups.map(g=>g.id===id?group:g):[...groups,group],keysFavoritePending:null,keysFavoriteSession:{asked:true,active:id},ui:{...state.ui,toast:'Подборка «'+name+'» сохранена'}};
 }
 if(action.type==='KEYS_FAVORITE_MOVE'){
  if(!groups.some(g=>g.id===action.listId)||!state.discovery.savedIds.includes(action.hotelId))return state;
  return {...state,keysFavoriteGroups:groups.map(g=>({...g,hotelIds:g.id===action.listId?[...new Set([...g.hotelIds,action.hotelId])]:g.hotelIds.filter(id=>id!==action.hotelId)})),ui:{...state.ui,toast:'Отель перемещён'}};
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
  if(state.keysFavoriteSession?.asked&&active){updated=updated.map(g=>g.id===active.id?{...g,hotelIds:[...new Set([...g.hotelIds,...added])]}:g);}
  else if(state.keysFavoriteSession?.asked){
   const group=updated.find(g=>g.id==='session-default')||{id:'session-default',name:'Моя поездка',hotelIds:[]};
   updated=[...updated.filter(g=>g.id!==group.id),{...group,hotelIds:[...new Set([...group.hotelIds,...added])]}];
   next={...next,keysFavoriteSession:{asked:true,active:group.id}};
  }else pending=[...new Set([...pending,...added])];
 }
 return {...next,keysFavoriteGroups:updated,keysFavoritePending:pending.length?pending:null,keysFavoriteIntents:(state.keysFavoriteIntents||[]).filter(id=>!added.includes(id))};
}
function Pt(state,action){return keysFavoritesReduce(state,action,action.type.startsWith('KEYS_FAVORITE_')?state:keysFavoritesBaseReducer(state,action));}
function KeysFavoriteListForm({onClose}){
 const {state,dispatch}=J(),[name,setName]=E.useState('');
 const pending=!!state.keysFavoritePending?.length;
 const save=(value)=>{dispatch({type:'KEYS_FAVORITE_LIST',name:value});onClose?.();};
 return n.jsx(ct,{title:pending?'В какую подборку сохранить?':'Новая подборка',onClose:()=>pending?save('Моя поездка'):onClose?.(),children:n.jsxs('form',{className:'keys-favorite-form',onSubmit:event=>{event.preventDefault();save(name);},children:[
  n.jsx('p',{children:'Следующие отели будем сохранять сюда. Подборку можно изменить в избранном.'}),
  n.jsxs('label',{children:['Название подборки',n.jsx('input',{value:name,maxLength:48,placeholder:'Например, выходные у моря',onChange:event=>setName(event.target.value)})]}),
  n.jsx(H,{type:'submit',children:'Сохранить в подборку'}),
  pending&&keysFavoriteGroups(state).length>0&&n.jsxs('div',{className:'keys-favorite-existing',children:[n.jsx('span',{children:'Или в существующую'}),...keysFavoriteGroups(state).map(g=>n.jsx('button',{type:'button',onClick:()=>dispatch({type:'KEYS_FAVORITE_LIST',id:g.id,name:g.name}),children:g.name},g.id))]})
 ]})});
}
function KeysFavoriteStorage(){
 const {state}=J();
 E.useEffect(()=>{try{localStorage.setItem('keys-favorite-lists-v1',JSON.stringify({groups:keysFavoriteGroups(state),ids:state.discovery.savedIds,notes:state.keysFavoriteNotes||{}}));}catch{}},[state.keysFavoriteGroups,state.discovery.savedIds,state.keysFavoriteNotes]);
 E.useEffect(()=>{if(state.keysFavoriteSession)try{sessionStorage.setItem('keys-favorite-session-v1',JSON.stringify(state.keysFavoriteSession));}catch{}},[state.keysFavoriteSession]);
 return state.keysFavoritePending?.length?n.jsx(KeysFavoriteListForm,{}):null;
}
function KeysFavoriteNote({hotelId,name}){
 const {state,dispatch}=J(),note=state.keysFavoriteNotes?.[hotelId]||'';
 const [open,setOpen]=E.useState(false),[draft,setDraft]=E.useState('');
 const edit=()=>{setDraft(note);setOpen(true);};
 const save=text=>{dispatch({type:'KEYS_FAVORITE_NOTE',hotelId,text});setOpen(false);};
 return n.jsxs(n.Fragment,{children:[
  note?n.jsxs('button',{type:'button',className:'keys-favorite-note has-note','aria-label':'Изменить заметку к отелю '+name,onClick:edit,children:[n.jsx(D,{name:'doc'}),n.jsx('span',{children:note}),n.jsx(D,{name:'chevron'})]}):n.jsx(H,{variant:'secondary',icon:'doc',className:'keys-favorite-note keys-favorite-note-add','aria-label':'Добавить заметку к отелю '+name,onClick:edit,children:'Добавить заметку'}),
  open&&n.jsx(ct,{title:'Заметка к отелю',onClose:()=>setOpen(false),children:n.jsxs('form',{className:'keys-favorite-form keys-favorite-note-form',onSubmit:event=>{event.preventDefault();save(draft);},children:[
   n.jsx('p',{className:'keys-favorite-note-hotel',children:name}),
   n.jsx('textarea',{'aria-label':'Текст заметки',value:draft,onChange:event=>setDraft(event.target.value),maxLength:1000,rows:5,placeholder:'Что важно запомнить об этом отеле?'}),
   n.jsx('small',{className:'keys-favorite-note-counter',children:draft.length+' / 1000'}),
   n.jsx(H,{type:'submit',disabled:!draft.trim()&&!note,children:'Сохранить'}),
   note&&n.jsx(H,{variant:'text',onClick:()=>save(''),children:'Удалить заметку'})
  ]})})
 ]});
}
function KeysFavorites(){
 const {state,dispatch}=J(),resource=Dn('favorites'),ids=state.discovery.savedIds;
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
 return n.jsxs('section',{className:'keys-favorites-page','aria-label':'Избранные отели',children:[
  n.jsx(Ae,{title:active?active.name:'Избранное'}),
  !active&&n.jsxs(n.Fragment,{children:[
   n.jsx('div',{className:'keys-favorite-collections',children:collections.map(group=>{
    const saved=group.hotelIds.filter(id=>ids.includes(id)),photos=saved.map(cover).filter(Boolean).slice(0,3);
    return n.jsxs('button',{type:'button',className:'keys-favorite-collection','aria-label':'Открыть подборку «'+group.name+'»',onClick:()=>dispatch({type:'OPEN',screen:{type:'saved',collectionId:group.id}}),children:[
     n.jsx('span',{className:'keys-favorite-collection-cover','data-photos':photos.length,'aria-hidden':true,children:photos.length?photos.map((src,i)=>n.jsx('img',{src,alt:'',loading:'lazy'},i)):n.jsx(D,{name:'heart'})}),
     n.jsxs('span',{className:'keys-favorite-collection-copy',children:[n.jsxs('span',{children:[n.jsx('strong',{children:group.name}),n.jsx('small',{children:as(saved.length)})]}),n.jsx(D,{name:'chevron'})]})
    ]},group.id);
   })}),
   !collections.length&&n.jsxs('div',{className:'keys-favorites-empty',children:[n.jsx(D,{name:'heart'}),n.jsx('h2',{children:'Здесь будут ваши подборки'}),n.jsx('p',{children:'Сохраняйте понравившиеся отели и собирайте идеи для поездок.'}),n.jsx(H,{onClick:()=>{dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});},children:'Найти отель'})]}),
   n.jsx(H,{variant:'secondary',className:'keys-favorite-create-list',onClick:()=>setCreate(true),children:'Создать подборку'})
  ]}),
  active&&n.jsxs(n.Fragment,{children:[
  n.jsxs('div',{className:'keys-favorite-trip',children:[
   n.jsxs('button',{type:'button',onClick:()=>setEditing('dates'),'aria-label':'Изменить даты проживания',children:[n.jsx(D,{name:'calendar'}),n.jsxs('span',{children:[n.jsx('small',{children:'Даты проживания'}),n.jsx('strong',{children:zt(state.search.arrival,state.search.departure)})]}),n.jsx(D,{name:'down'})]}),
   n.jsxs('button',{type:'button',onClick:()=>setEditing('guests'),'aria-label':'Изменить количество гостей',children:[n.jsx(D,{name:'users'}),n.jsxs('span',{children:[n.jsx('small',{children:'Гости'}),n.jsx('strong',{children:Bm(state.search.party)})]}),n.jsx(D,{name:'down'})]})
  ]}),
  resource.error&&n.jsxs('div',{role:'alert',children:[n.jsx('p',{children:'Не удалось обновить сохранённые отели.'}),n.jsx(H,{variant:'secondary',onClick:()=>resource.reload(),children:'Повторить'})]}),
  n.jsx('div',{className:'keys-favorites-list',children:hotels.map(hotel=>n.jsxs('div',{className:'keys-favorite-item',children:[n.jsx(jx,{hotelId:hotel.id,summary:hotel.summary??undefined}),n.jsxs('button',{type:'button',className:'keys-favorite-membership',title:groups.find(g=>g.hotelIds.includes(hotel.id))?.name||'Без подборки',onClick:()=>setMove(hotel.id),'aria-label':'Изменить подборку для '+(hotel.summary?.name||_n.find(h=>h.id===hotel.id)?.name||'отеля'),children:[n.jsx('span',{children:groups.find(g=>g.hotelIds.includes(hotel.id))?.name||'Без подборки'}),n.jsx(D,{name:'down'})]}),n.jsx('div',{className:'keys-favorite-note-footer',children:n.jsx(KeysFavoriteNote,{hotelId:hotel.id,name:hotel.summary?.name||_n.find(h=>h.id===hotel.id)?.name||'Отель'})})]},hotel.id))}),
  !hotels.length&&n.jsxs('div',{className:'keys-favorites-empty',children:[n.jsx(D,{name:'heart'}),n.jsx('h2',{children:ids.length?'В подборке пока нет отелей':'Сохраняйте отели, которые нравятся'}),n.jsx('p',{children:'Нажмите на сердечко у отеля, чтобы сохранить его для будущей поездки.'}),n.jsx(H,{onClick:()=>{dispatch({type:'NAV_TAB',tab:'find'});dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});},children:'Найти отель'})]}),
  ]}),
  create&&n.jsx(KeysFavoriteListForm,{onClose:()=>setCreate(false)}),
  editing&&n.jsx(xh,{roomStay:true,section:editing,onClose:()=>setEditing(null)}),
  move&&n.jsx(ct,{title:'Переместить в подборку',onClose:()=>setMove(null),children:n.jsxs('div',{className:'keys-sort-options',children:[...groups.map(g=>n.jsxs('button',{type:'button','aria-pressed':g.hotelIds.includes(move),onClick:()=>{dispatch({type:'KEYS_FAVORITE_MOVE',hotelId:move,listId:g.id});setMove(null);},children:[n.jsx('span',{children:g.name}),g.hotelIds.includes(move)&&n.jsx(D,{name:'check'})]},g.id)),!groups.length&&n.jsx('p',{children:'Сначала создайте подборку с помощью кнопки «+ Подборка».'})]})})
 ]});
}
