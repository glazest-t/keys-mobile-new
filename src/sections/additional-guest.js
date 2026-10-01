function keysHasAdditionalGuest(party) {
 return (party?.adults||0)+(party?.childrenAges?.length||0)>1;
}
function keysSaveAdditionalGuest(state,action) {
 const draft=state.reservation;
 if(!draft||!['editing','failed'].includes(draft.status)||!keysHasAdditionalGuest(draft.party))return state;
 const guest=action.guest&&{firstName:String(action.guest.firstName||'').trim().slice(0,80),lastName:String(action.guest.lastName||'').trim().slice(0,80)};
 if(guest&&(!guest.firstName||!guest.lastName))return state;
 return {...state,reservation:{...draft,additionalGuests:guest?[guest]:[]}};
}
// Guest summaries are rows; editing is isolated in the shared bottom sheet.
function KeysPaymentGuestPanel({contact,onChange,edited,onReset}) {
 const {state,dispatch}=J(),draft=state.reservation,second=draft?.additionalGuests?.[0];
 const hasSecond=keysHasAdditionalGuest(draft?.party),[editing,setEditing]=E.useState(null),[form,setForm]=E.useState({});
 const prefix=E.useId();
 const open=kind=>{setForm(kind==='primary'?{...contact}:{firstName:second?.firstName||'',lastName:second?.lastName||''});setEditing(kind);};
 const close=()=>setEditing(null);
 const valid=editing==='primary'?um(form):!!form.firstName?.trim()&&!!form.lastName?.trim();
 const save=event=>{event.preventDefault();if(!valid)return;if(editing==='primary')onChange(form);else dispatch({type:'KEYS_RESERVATION_GUEST',guest:form});close();};
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('section',{'aria-label':'Контакты гостя',className:'keys-guest-panel',children:[
   n.jsxs('div',{className:'keys-guest-panel-heading',children:[n.jsx(D,{name:'users',className:'keys-payment-summary-icon'}),n.jsx('h2',{children:hasSecond?'Гости':'Гость'}),n.jsx('span',{children:Rt(draft?.party||{adults:1,childrenAges:[]})})]}),
   n.jsxs('button',{type:'button',className:'keys-guest-row keys-guest-primary',onClick:()=>open('primary'),'aria-label':'Изменить данные основного гостя',children:[
    n.jsxs('span',{className:'keys-guest-row-copy',children:[n.jsx('strong',{children:Ac(contact)||'Укажите данные гостя'}),n.jsx('span',{children:contact.phone}),n.jsx('span',{children:contact.email})]}),n.jsx(D,{name:'chevron',className:'size-3.5'})
   ]}),
   hasSecond&&n.jsxs('button',{type:'button',className:'keys-guest-row'+(second?'':' keys-guest-add'),onClick:()=>open('second'),'aria-label':second?'Изменить данные второго гостя':'Добавить второго гостя',children:[
    n.jsxs('span',{className:'keys-guest-row-copy',children:second?[n.jsx('span',{children:'Второй гость'}),n.jsx('strong',{children:second.firstName+' '+second.lastName})]:[n.jsx('strong',{children:'Добавить второго гостя'})]}),n.jsx(D,{name:second?'chevron':'plus',className:'size-3.5'})
   ]})
  ]}),
  editing&&n.jsx(ct,{title:editing==='primary'?'Данные гостя':'Второй гость',onClose:close,children:n.jsxs('form',{className:'keys-guest-editor','aria-label':editing==='primary'?'Данные основного гостя':'Данные второго гостя',onSubmit:save,children:[
   editing==='primary'?n.jsx(kG,{value:form,onChange:setForm}):n.jsx('div',{className:'keys-guest-editor-fields',children:[['firstName','Имя'],['lastName','Фамилия']].map(([key,label])=>n.jsxs('label',{htmlFor:prefix+key,children:[n.jsx('span',{children:label}),n.jsx('input',{id:prefix+key,type:'text',name:key,autoComplete:'off',value:form[key]||'',required:true,maxLength:80,onChange:event=>setForm({...form,[key]:event.target.value})})]},key))}),
   n.jsx(H,{type:'submit',disabled:!valid,children:'Сохранить'}),
   editing==='second'&&second&&n.jsx('button',{type:'button',className:'keys-guest-editor-secondary',onClick:()=>{dispatch({type:'KEYS_RESERVATION_GUEST',guest:null});close();},children:'Удалить данные гостя'}),
   editing==='primary'&&edited&&onReset&&n.jsx('button',{type:'button',className:'keys-guest-editor-secondary',onClick:()=>{onReset();close();},children:'Использовать данные профиля'})
  ]})})
 ]});
}
