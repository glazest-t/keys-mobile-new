function keysHasAdditionalGuest(party) {
 return (party?.adults||0)+(party?.childrenAges?.length||0)>1;
}
function keysSaveAdditionalGuest(state,action) {
 const draft=state.reservation;
 if(!draft||!['editing','failed'].includes(draft.status)||!keysHasAdditionalGuest(draft.party))return state;
 const guest=action.guest&&{firstName:String(action.guest.firstName||'').trim().slice(0,80),lastName:String(action.guest.lastName||'').trim().slice(0,80),citizenship:String(action.guest.citizenship||'').trim().slice(0,80)};
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
 const guest={firstName:String(action.guest?.firstName||'').slice(0,80),lastName:String(action.guest?.lastName||'').slice(0,80),citizenship:String(action.guest?.citizenship||'').slice(0,80)};
 const complete=guest.firstName.trim()&&guest.lastName.trim();
 return {...state,reservation:{...draft,error:'',additionalGuestDraft:guest,additionalGuests:complete?[{firstName:guest.firstName.trim(),lastName:guest.lastName.trim(),citizenship:guest.citizenship.trim()}]:[]}};
}
function keysSetSaveContact(state,action){
 if(!state.reservation||!['editing','failed'].includes(state.reservation.status))return state;
 return {...state,reservation:{...state.reservation,saveContact:!!action.enabled}};
}
// Only an explicit save copies booking contacts into the reusable profile.
function keysSaveCheckoutProfile(state,action){
 const contact=action.contact;
 if(!contact||!um(contact))return state;
 const profile=Object.fromEntries(['firstName','lastName','phone','email','citizenship'].map(key=>[key,String(contact[key]||'').trim()]));
 return {...state,profile,keysProfileSaved:(state.keysProfileSaved||0)+1};
}
// ISO 3166 country/territory names, localized with Russian CLDR names.
const keysCitizenshipCountries=["Австралия","Австрия","Азербайджан","Аландские о-ва","Албания","Алжир","Американское Самоа","Ангилья","Ангола","Андорра","Антарктида","Антигуа и Барбуда","Аргентина","Армения","Аруба","Афганистан","Багамы","Бангладеш","Барбадос","Бахрейн","Беларусь","Белиз","Бельгия","Бенин","Бермудские о-ва","Болгария","Боливия","Бонэйр, Синт-Эстатиус и Саба","Босния и Герцеговина","Ботсвана","Бразилия","Британская территория в Индийском океане","Бруней","Буркина-Фасо","Бурунди","Бутан","Вануату","Ватикан","Великобритания","Венгрия","Венесуэла","Виргинские о-ва (Великобритания)","Виргинские о-ва (США)","Внешние малые о-ва (США)","Восточный Тимор","Вьетнам","Габон","Гаити","Гайана","Гамбия","Гана","Гваделупа","Гватемала","Гвинея","Гвинея-Бисау","Германия","Гернси","Гибралтар","Гондурас","Гонконг (САР)","Гренада","Гренландия","Греция","Грузия","Гуам","Дания","Джерси","Джибути","Доминика","Доминиканская Республика","Египет","Замбия","Западная Сахара","Зимбабве","Израиль","Индия","Индонезия","Иордания","Ирак","Иран","Ирландия","Исландия","Испания","Италия","Йемен","Кабо-Верде","Казахстан","Камбоджа","Камерун","Канада","Катар","Кения","Кипр","Киргизия","Кирибати","Китай","КНДР","Кокосовые о-ва","Колумбия","Коморы","Конго - Браззавиль","Конго - Киншаса","Коста-Рика","Кот-д’Ивуар","Куба","Кувейт","Кюрасао","Лаос","Латвия","Лесото","Либерия","Ливан","Ливия","Литва","Лихтенштейн","Люксембург","Маврикий","Мавритания","Мадагаскар","Майотта","Макао (САР)","Малави","Малайзия","Мали","Мальдивы","Мальта","Марокко","Мартиника","Маршалловы о-ва","Мексика","Мозамбик","Молдова","Монако","Монголия","Монтсеррат","Мьянма (Бирма)","Намибия","Науру","Непал","Нигер","Нигерия","Нидерланды","Никарагуа","Ниуэ","Новая Зеландия","Новая Каледония","Норвегия","о-в Буве","о-в Мэн","о-в Норфолк","о-в Рождества","о-в Св. Елены","о-ва Кайман","о-ва Кука","о-ва Питкэрн","о-ва Херд и Макдональд","ОАЭ","Оман","Пакистан","Палау","Палестинские территории","Панама","Папуа — Новая Гвинея","Парагвай","Перу","Польша","Португалия","Пуэрто-Рико","Республика Корея","Реюньон","Россия","Руанда","Румыния","Сальвадор","Самоа","Сан-Марино","Сан-Томе и Принсипи","Саудовская Аравия","Северная Македония","Северные Марианские о-ва","Сейшельские о-ва","Сен-Бартелеми","Сен-Мартен","Сен-Пьер и Микелон","Сенегал","Сент-Винсент и Гренадины","Сент-Китс и Невис","Сент-Люсия","Сербия","Сингапур","Синт-Мартен","Сирия","Словакия","Словения","Соединенные Штаты","Соломоновы о-ва","Сомали","Судан","Суринам","Сьерра-Леоне","Таджикистан","Таиланд","Тайвань","Танзания","Тёркс и Кайкос","Того","Токелау","Тонга","Тринидад и Тобаго","Тувалу","Тунис","Туркменистан","Турция","Уганда","Узбекистан","Украина","Уоллис и Футуна","Уругвай","Фарерские о-ва","Федеративные Штаты Микронезии","Фиджи","Филиппины","Финляндия","Фолклендские о-ва","Франция","Французская Гвиана","Французская Полинезия","Французские Южные территории","Хорватия","Центрально-Африканская Республика","Чад","Черногория","Чехия","Чили","Швейцария","Швеция","Шпицберген и Ян-Майен","Шри-Ланка","Эквадор","Экваториальная Гвинея","Эритрея","Эсватини","Эстония","Эфиопия","Южная Георгия и Южные Сандвичевы о-ва","Южно-Африканская Республика","Южный Судан","Ямайка","Япония"];
function KeysCitizenshipSelect({id,value,onChange,label='Гражданство'}){
 return n.jsxs('span',{className:'keys-citizenship-control',children:[n.jsxs('select',{id,name:'citizenship','aria-label':label,autoComplete:'country-name',className:'keys-citizenship-select',value:value||'',onChange:event=>onChange(event.target.value),children:[n.jsx('option',{value:'',children:'Выберите страну'}),value&&!keysCitizenshipCountries.includes(value)&&n.jsx('option',{value,children:value}),...keysCitizenshipCountries.map(country=>n.jsx('option',{value:country,children:country},country))]}),n.jsx(D,{name:'chevron',className:'keys-citizenship-chevron','aria-hidden':true})]});
}
function KeysGuestContactFields({value,onChange}){
 const [touched,setTouched]=E.useState({}),prefix=E.useId(),errors=IE(value),showErrors=!!E.useContext(keysCheckoutValidationContext());
 const field=([key,label,type,autoComplete])=>n.jsxs('label',{htmlFor:prefix+key,className:key==='citizenship'?'keys-guest-citizenship':undefined,children:[n.jsx('span',{children:label}),key==='citizenship'?n.jsx(KeysCitizenshipSelect,{id:prefix+key,value:value[key],onChange:citizenship=>onChange({...value,citizenship})}):n.jsx('input',{id:prefix+key,type,name:key,'aria-label':label,autoComplete,required:key!=='citizenship',value:value[key]||'',placeholder:key==='email'?'name@example.ru':key==='lastName'?'Укажите фамилию':key==='citizenship'?'Укажите гражданство':undefined,maxLength:key==='email'?254:key==='citizenship'?80:60,onChange:event=>onChange({...value,[key]:event.target.value}),onBlur:()=>setTouched({...touched,[key]:true}),'aria-invalid':!!((touched[key]||showErrors)&&errors[key]),'aria-describedby':(touched[key]||showErrors)&&errors[key]?prefix+key+'-error':undefined}),(touched[key]||showErrors)&&errors[key]&&n.jsx('small',{id:prefix+key+'-error',children:errors[key]})]},key);
 return n.jsxs('div',{className:'keys-guest-field-groups',children:[
  n.jsxs('fieldset',{'aria-label':'Данные гостя',children:[n.jsx('div',{className:'keys-guest-contact-fields keys-guest-name-fields',children:[['firstName','Имя','text','given-name'],['lastName','Фамилия','text','family-name'],['citizenship','Гражданство','text','country-name']].map(field)})]}),
  n.jsxs('fieldset',{'aria-label':'Контакты для бронирования',children:[n.jsx('div',{className:'keys-guest-contact-fields',children:[['phone','Телефон','tel','tel'],['email','Email','email','email']].map(field)})]})
 ]});
}
function KeysPaymentGuestPanel({contact,onChange}) {
 const {state,dispatch}=J(),draft=state.reservation,second=draft?.additionalGuests?.[0],secondDraft=draft?.additionalGuestDraft||second||{firstName:'',lastName:''};
 const hasSecond=keysHasAdditionalGuest(draft?.party),complete=um(contact),attempted=E.useContext(keysCheckoutValidationContext());
 const [primaryOpen,setPrimaryOpen]=E.useState(()=>!um(contact)),[secondOpen,setSecondOpen]=E.useState(()=>!keysAdditionalGuestComplete(draft)),prefix=E.useId(),panel=E.useRef(null);
 E.useEffect(()=>{if(attempted){if(!complete)setPrimaryOpen(true);if(!keysAdditionalGuestComplete(draft))setSecondOpen(true);}},[attempted,complete,draft.additionalGuestDraft]);
 E.useEffect(()=>{if(!attempted)return;const frame=requestAnimationFrame(()=>{const field=panel.current?.querySelector('[aria-invalid=true]');if(field){field.focus();field.scrollIntoView({block:'center',behavior:'smooth'});}});return()=>cancelAnimationFrame(frame);},[attempted,primaryOpen,secondOpen]);
 const row=(kind,label,open,toggle,filled,subtitle)=>n.jsxs('button',{type:'button',className:'keys-guest-row',onClick:toggle,'aria-expanded':open,'aria-controls':prefix+kind,'aria-label':(open?'Свернуть данные ':filled?'Изменить данные ':'Заполнить данные ')+(kind==='primary'?'основного гостя':'второго гостя'),children:[n.jsx(D,{name:filled?'check':'users',className:'keys-guest-leading'+(filled?' is-complete':''),'aria-hidden':true}),n.jsxs('span',{className:'keys-guest-row-copy',children:[n.jsx('strong',{children:label}),subtitle&&n.jsx('span',{children:subtitle})]}),n.jsxs('span',{className:'keys-guest-row-action',children:[open?'Свернуть':filled?'Изменить':kind==='primary'?'Заполнить':'Добавить',n.jsx(D,{name:'chevron',className:'size-3.5'+(open?' is-open':''),'aria-hidden':true})]})]});
 const profile=n.jsxs('label',{className:'keys-guest-profile-check',children:[n.jsx('input',{type:'checkbox',checked:!!draft?.saveContact,onChange:event=>dispatch({type:'KEYS_CHECKOUT_SAVE_CONTACT',enabled:event.target.checked})}),n.jsx('span',{children:n.jsx('strong',{children:'Сохранить данные в профиле'})})]});
 return n.jsxs('section',{ref:panel,'aria-label':'Контакты гостя',className:'keys-checkout-panel keys-guest-panel keys-guest-accordion',children:[
  n.jsx('div',{className:'keys-guest-panel-heading',children:n.jsx('h2',{children:hasSecond?'Гости':'Гость'})}),
  n.jsxs('div',{className:'keys-guest-list',children:[
   n.jsxs('div',{className:'keys-guest-person',children:[row('primary',Ac(contact)||'Основной гость',primaryOpen,()=>setPrimaryOpen(!primaryOpen),complete,complete?null:'Основной гость · дополните данные'),primaryOpen&&n.jsxs('div',{id:prefix+'primary',className:'keys-guest-details',children:[n.jsx(KeysGuestContactFields,{value:contact,onChange}),profile]})]}),
   hasSecond&&n.jsxs('div',{className:'keys-guest-person',children:[row('second',second?second.firstName+' '+second.lastName:'Второй гость',secondOpen,()=>setSecondOpen(!secondOpen),!!second,null),secondOpen&&n.jsx('div',{id:prefix+'second',className:'keys-guest-details keys-guest-editor',children:n.jsx('div',{className:'keys-guest-editor-fields',children:[['firstName','Имя'],['lastName','Фамилия'],['citizenship','Гражданство']].map(([key,label])=>n.jsxs('label',{htmlFor:prefix+key,className:key==='citizenship'?'keys-guest-citizenship':undefined,children:[n.jsx('span',{children:label}),key==='citizenship'?n.jsx(KeysCitizenshipSelect,{id:prefix+key,value:secondDraft[key],label:'Второй гость — Гражданство',onChange:citizenship=>dispatch({type:'KEYS_RESERVATION_GUEST_PATCH',guest:{...secondDraft,citizenship}})}):n.jsx('input',{id:prefix+key,type:'text',name:key,autoComplete:'off',placeholder:key==='citizenship'?'Укажите гражданство':undefined,value:secondDraft[key]||'','aria-label':'Второй гость — '+label,maxLength:80,'aria-invalid':!!(key!=='citizenship'&&attempted&&!keysAdditionalGuestComplete(draft)&&!secondDraft[key]?.trim()),onChange:event=>dispatch({type:'KEYS_RESERVATION_GUEST_PATCH',guest:{...secondDraft,[key]:event.target.value}})})]},key))})})]})
  ]})
 ]});
}
