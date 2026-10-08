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
function keysAdditionalGuestComplete(draft){
 const guest=draft?.additionalGuestDraft;
 return !keysHasAdditionalGuest(draft?.party)||!guest||(!guest.firstName.trim()&&!guest.lastName.trim())||!!(guest.firstName.trim()&&guest.lastName.trim());
}
function keysPatchAdditionalGuest(state,action){
 const draft=state.reservation;
 if(!draft||!['editing','failed'].includes(draft.status)||!keysHasAdditionalGuest(draft.party))return state;
 const guest={firstName:String(action.guest?.firstName||'').slice(0,80),lastName:String(action.guest?.lastName||'').slice(0,80)};
 const complete=guest.firstName.trim()&&guest.lastName.trim();
 return {...state,reservation:{...draft,error:'',additionalGuestDraft:guest,additionalGuests:complete?[{firstName:guest.firstName.trim(),lastName:guest.lastName.trim()}]:[]}};
}
function keysSetSaveContact(state,action){
 if(!state.reservation||!['editing','failed'].includes(state.reservation.status))return state;
 return {...state,reservation:{...state.reservation,saveContact:!!action.enabled}};
}
// Only an explicit save copies booking contacts into the reusable profile.
function keysSaveCheckoutProfile(state,action){
 const contact=action.contact;
 if(!contact||!um(contact))return state;
 const profile=Object.fromEntries(['firstName','lastName','phone','email'].map(key=>[key,String(contact[key]||'').trim()]));
 return {...state,profile,keysProfileSaved:(state.keysProfileSaved||0)+1};
}
function KeysGuestContactFields({value,onChange}){
 const [touched,setTouched]=E.useState({}),prefix=E.useId(),errors=IE(value);
 return n.jsx('div',{className:'keys-guest-contact-fields',children:[['firstName','Имя','text','given-name'],['lastName','Фамилия','text','family-name'],['phone','Телефон','tel','tel'],['email','Email','email','email']].map(([key,label,type,autoComplete])=>n.jsxs('label',{htmlFor:prefix+key,children:[n.jsx('span',{children:label}),n.jsx('input',{id:prefix+key,type,name:key,'aria-label':label,autoComplete,required:true,value:value[key]||'',placeholder:key==='email'?'name@example.ru':key==='lastName'?'Укажите фамилию':undefined,maxLength:key==='email'?254:60,onChange:event=>onChange({...value,[key]:event.target.value}),onBlur:()=>setTouched({...touched,[key]:true}),'aria-invalid':!!(touched[key]&&errors[key]),'aria-describedby':touched[key]&&errors[key]?prefix+key+'-error':undefined}),touched[key]&&errors[key]&&n.jsx('small',{id:prefix+key+'-error',children:errors[key]})]},key))});
}
function KeysPaymentGuestPanel({contact,onChange,edited,onReset}) {
 const {state,dispatch}=J(),draft=state.reservation,second=draft?.additionalGuests?.[0],secondDraft=draft?.additionalGuestDraft||second,desktop=useKeysDesktopBooking();
 const hasSecond=keysHasAdditionalGuest(draft?.party),[editing,setEditing]=E.useState(null),[form,setForm]=E.useState({});
 const prefix=E.useId();
 const open=kind=>{setForm(kind==='primary'?{...contact}:{firstName:secondDraft?.firstName||'',lastName:secondDraft?.lastName||''});setEditing(kind);};
 const close=()=>setEditing(null);
 const valid=editing==='primary'?um(form):!!form.firstName?.trim()&&!!form.lastName?.trim();
 const save=event=>{event.preventDefault();if(!valid)return;if(editing==='primary')onChange(form);else dispatch({type:'KEYS_RESERVATION_GUEST',guest:form});close();};
 const profileAction=()=>n.jsxs('label',{className:'keys-guest-profile-check',children:[n.jsx('input',{type:'checkbox',checked:!!draft?.saveContact,onChange:event=>dispatch({type:'KEYS_CHECKOUT_SAVE_CONTACT',enabled:event.target.checked})}),n.jsxs('span',{children:[n.jsx('strong',{children:'Сохранить данные в профиле'}),n.jsx('small',{children:'После бронирования — для следующих поездок'})]})]});
 const editor=n.jsxs('form',{className:'keys-guest-editor','aria-label':editing==='primary'?'Данные основного гостя':'Данные второго гостя',onSubmit:editing==='primary'?save:event=>event.preventDefault(),children:[
  editing==='primary'?n.jsxs(n.Fragment,{children:[n.jsx(KeysGuestContactFields,{value:form,onChange:setForm}),profileAction(form)]}):n.jsx('div',{className:'keys-guest-editor-fields',children:[['firstName','Имя'],['lastName','Фамилия']].map(([key,label])=>n.jsxs('label',{htmlFor:prefix+key,children:[n.jsx('span',{children:label}),n.jsx('input',{id:prefix+key,type:'text',name:key,autoComplete:'off',value:form[key]||'','aria-label':'Второй гость — '+label,maxLength:80,onChange:event=>{const next={...form,[key]:event.target.value};setForm(next);dispatch({type:'KEYS_RESERVATION_GUEST_PATCH',guest:next});}})]},key))}),
  editing==='primary'&&n.jsx('div',{className:'keys-guest-editor-actions',children:n.jsx(H,{type:'submit',disabled:!valid,children:'Готово'})})

 ]});
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('section',{'aria-label':'Контакты гостя',className:'keys-checkout-panel keys-guest-panel',children:[
   n.jsxs('div',{className:'keys-guest-panel-heading',children:[n.jsx('h2',{children:hasSecond?'Гости':'Гость'}),n.jsx('span',{children:Rt(draft?.party||{adults:1,childrenAges:[]})})]}),
   desktop?n.jsxs('div',{className:'keys-guest-inline',children:[n.jsx('p',{className:'keys-guest-completion-hint',children:'Заполните фамилию и email для подтверждения брони.'}),n.jsx(KeysGuestContactFields,{value:contact,onChange}),profileAction(contact)]}):n.jsxs('button',{type:'button',className:'keys-guest-row keys-guest-primary',onClick:()=>open('primary'),'aria-label':um(contact)?'Изменить данные основного гостя':'Дополнить данные гостя',children:[n.jsxs('span',{className:'keys-guest-row-copy',children:[n.jsx('strong',{children:Ac(contact)||'Укажите данные гостя'}),n.jsx('span',{children:contact.phone}),n.jsx('span',{children:um(contact)?contact.email:'Добавьте фамилию и email'})]}),n.jsx(D,{name:'chevron',className:'size-3.5'})]}),
   hasSecond&&n.jsxs('button',{type:'button',className:'keys-guest-row'+(second?'':' keys-guest-add'),onClick:()=>editing==='second'?close():open('second'),'aria-expanded':editing==='second','aria-label':second?'Изменить данные второго гостя':'Добавить второго гостя',children:[n.jsxs('span',{className:'keys-guest-row-copy',children:second?[n.jsx('span',{children:'Второй гость'}),n.jsx('strong',{children:second.firstName+' '+second.lastName})]:[n.jsx('strong',{children:'Добавить второго гостя'})]}),n.jsx(D,{name:'chevron',className:'size-4'+(editing==='second'?' is-open':'')})]}),
   editing==='second'&&editor
  ]}),
  editing==='primary'&&n.jsx(ct,{title:editing==='primary'?'Данные гостя':'Второй гость',onClose:close,children:editor})
 ]});
}
