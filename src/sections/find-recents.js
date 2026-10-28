// Recent searches and viewed hotels are two separate destinations.
function keysRepeatSearch(dispatch, search) {
 dispatch({type:'SEARCH_PATCH', patch:{
  city:search.city, arrival:search.arrival, departure:search.departure,
  party:sn(search.party), filters:[...(search.filters ?? [])],
  sort:search.sort ?? 'recommended', recommendedHotelIds:[...(search.recommendedHotelIds ?? [])],
  intent:'known', results:false
 }});
 dispatch({type:'SEARCH_SUBMIT',city:search.city});
}
function KeysFindSaved() {
 const {state,open}=J(), remote=tt().source==='travelline';
 const count=state.discovery.savedIds.filter(id=>remote===yn(id)).length;
 return n.jsxs('button',{type:'button',className:'keys-find-saved',onClick:()=>open({type:'saved'}),children:[
  n.jsx('span',{className:'keys-find-saved-icon','aria-hidden':true,children:n.jsx(D,{name:'heart',className:'size-5'})}),
  n.jsxs('span',{className:'keys-find-saved-copy',children:[
   n.jsxs('span',{className:'keys-find-saved-title',children:[n.jsx('strong',{children:'Сохранённые'}),count>0&&n.jsx('span',{className:'keys-find-saved-count',children:count})]}),
   n.jsx('span',{className:'keys-find-saved-caption',children:'Отели для будущих поездок'})
  ]}),
  n.jsx(D,{name:'chevron',className:'keys-find-saved-arrow'})
 ]});
}
function B4() {
 const {dispatch}=J(), remote=tt().source==='travelline', history=QB();
 // Show two distinct cities; fresh prototypes also have useful repeat-search examples.
 const examples=[
  {city:'Сочи',arrival:'2026-10-01',departure:'2026-10-05',at:1},
  {city:'Москва',arrival:'2026-10-22',departure:'2026-10-25',at:2}
 ].map(search=>({...search,party:{adults:2,childrenAges:[],pet:false,business:false,car:false},filters:[],sort:'recommended',recommendedHotelIds:[]}));
 const cities=new Set();
 const searches=[...history.searches,...examples].filter(search=>{
  const city=search.city.trim().toLocaleLowerCase('ru');
  if(cities.has(city))return false;
  cities.add(city);return true;
 }).slice(0,2);
 const hotels=history.hotels.flatMap(hotel=>JB(hotel,remote,Sa())).slice(0,WB);
 return n.jsxs(n.Fragment,{children:[
  globalThis.keysGuestMode&&n.jsx(KeysDesktopPointsCard,{}),
  searches.length>0 && n.jsxs('section',{className:'keys-find-history','aria-label':'Предыдущие поиски',children:[
   n.jsx('p',{className:'keys-find-history-caption',children:'Вы недавно искали'}),
   n.jsx('div',{className:'keys-find-history-track',children:searches.map(search=>{
    const adults=search.party.adults;
    const adultLabel=`${adults} ${adults%10===1&&adults%100!==11?'гость':'взрослых'}`;
    return n.jsxs('button',{type:'button',className:'keys-find-history-card',onClick:()=>keysRepeatSearch(dispatch,search),
     'aria-label':`Повторить поиск: ${search.city}, ${DE(search.arrival,search.departure)}, ${adultLabel}`,
     children:[
      n.jsx(D,{name:'clock',className:'keys-find-history-clock'}),
      n.jsxs('span',{className:'keys-find-history-city',children:[n.jsx('strong',{children:search.city}),n.jsx(D,{name:'chevron',className:'size-4'})]}),
      n.jsx('span',{className:'keys-find-history-dates',children:DE(search.arrival,search.departure)}),
      n.jsx('span',{className:'keys-find-history-guests',children:[n.jsx('span',{className:'keys-history-mobile-guests',children:adultLabel}),n.jsx('span',{className:'keys-history-desktop-guests',children:adultLabel})]})
     ]},search.at);
   })})
  ]}),
  n.jsx(UB,{}),
  n.jsx(KeysFindDesktopSwipe,{}),
  n.jsx(KeysFindCollections,{}),
  hotels.length>0 && n.jsxs('section',{className:'keys-find-recent','aria-label':'Просмотренные',children:[
   n.jsx('h2',{children:'Просмотренные'}),
   n.jsx('div',{className:'keys-find-recent-track',children:hotels.map(hotel=>n.jsx(XN,{
    name:hotel.name,onClick:()=>dispatch({type:'HOTEL_OPEN',id:hotel.id}),
    children:n.jsxs('span',{className:'relative block',children:[
     n.jsx(Ol,{src:hotel.photo,alt:'',loading:'lazy',sizes:'140px',className:'block h-[104px] w-full rounded-14 object-cover'}),
     hotel.rating&&n.jsx('span',{className:GN+' right-2',children:hotel.rating})
    ]})
   },hotel.id))})
  ]}),
  n.jsx(KeysFindWish,{})
 ]});
}

// Reuse the swipe destination and project photography in the desktop composition.
function KeysFindDesktopSwipe(){
 const {open}=J();
 return n.jsxs('button',{type:'button',className:'keys-find-desktop-swipe',onClick:()=>open({type:'swipe'}),children:[
  n.jsxs('span',{className:'keys-find-swipe-copy',children:[
   n.jsx('strong',{children:'Отели свайпом'}),
   n.jsx('span',{children:'Листайте отели, сохраняйте любимые.'}),
   n.jsxs('span',{className:'keys-find-swipe-link',children:['Выбрать отель',n.jsx(D,{name:'chevron'})]})
  ]}),
  n.jsxs('span',{className:'keys-find-swipe-art','aria-hidden':true,children:[
   n.jsx('img',{src:'./images/sochi/swissotel/92b13884e717.webp',alt:'',className:'keys-find-swipe-photo-back'}),
   n.jsx('img',{src:'./images/sochi/seagalaxy/73d929a6ee5c.webp',alt:'',className:'keys-find-swipe-photo-front'}),
   n.jsx('span',{className:'keys-find-swipe-no',children:n.jsx(D,{name:'close'})}),
   n.jsx('span',{className:'keys-find-swipe-yes',children:n.jsx(D,{name:'heart'})})
  ]})
 ]});
}

const keysFindCollections=[
 {id:'deals',title:'Горячие скидки',image:'deals',description:'Отели со скидкой от 10%'}
];
function keysCollectionMatches(hotel,search,tick=0){
 if(search.keysCollection==='deals'){
  const price=tx(hotel,search,tick);
  return price.ownPrice&&price.usualTotal>0&&(price.usualTotal-price.total)/price.usualTotal>=0.1;
 }
 if(search.keysCollection==='weekend')return !!(hotel.pool||hotel.spa||hotel.quiet);
 return true;
}
function keysOpenCollection(dispatch,search,id){
 dispatch({type:'SEARCH_PATCH',patch:{keysCollection:id,city:id==='anywhere'?'':search.city,hotelId:null,
  arrival:search.arrival,departure:id==='weekend'?bn(search.arrival,2):search.departure,
  filters:[],recommendedHotelIds:[],sort:'recommended',intent:'known',results:true,keysMapExpanded:false}});
}
function KeysFindCollections(){
 const {state,dispatch}=J();
 return n.jsx('section',{className:'keys-find-collections','aria-label':'Горячие скидки',children:n.jsxs('button',{
  type:'button',className:'keys-find-deal','aria-label':'Горячие скидки — от 10%',onClick:()=>keysOpenCollection(dispatch,state.search,'deals'),children:[
   n.jsxs('span',{className:'keys-find-deal-copy',children:[
    n.jsx('span',{className:'keys-find-deal-eyebrow',children:'Горячие скидки'}),
    n.jsxs('strong',{children:['Больше отдыха.',n.jsx('br',{}),'Меньше затрат.']}),
    n.jsx('span',{className:'keys-find-deal-saving',children:'Отели со скидкой от 10%'})
   ]}),
   n.jsx('span',{className:'keys-find-deal-photos','aria-hidden':true,children:[
    '../scenarios/next-trip.jpg',
    '../home/nearby/nearby-cafe-generated.jpg'
   ].map(src=>n.jsx('span',{className:'keys-find-deal-postcard',children:n.jsx('img',{src,alt:'',loading:'lazy'})},src))}),
   n.jsx(D,{name:'chevron',className:'keys-find-deal-chevron'})
  ]
 })});
}
function KeysFindWish(){
 const {open}=J(),[text,setText]=E.useState('');
 return n.jsxs('section',{className:'ki-request-card keys-find-wish','aria-labelledby':'keys-find-wish-title',children:[
  n.jsx('h2',{id:'keys-find-wish-title',children:'Опишите свой отдых'}),
  n.jsxs('form',{className:'ki-wish-form',onSubmit:event=>{event.preventDefault();if(text.trim())open({type:'describe',keysWish:text.trim(),keysWishOrigin:'known'});},children:[n.jsx('textarea',{'aria-label':'Пожелания к отдыху',placeholder:'Например, тихий отель у моря со спа',rows:2,maxLength:500,value:text,onChange:event=>setText(event.target.value)}),n.jsx(H,{type:'submit',disabled:!text.trim(),'aria-label':'Отправить пожелания',children:'Отправить'})]})
 ]});
}

function KeysDesktopPointsCard(){
 const {state}=J(),signedIn=!!globalThis.keysGuestAuthorized;
 return n.jsxs('section',{className:'kd-points-card kd-points-runtime','aria-label':'Баллы Ключей',children:[
  n.jsxs('header',{children:[n.jsx('span',{className:'kd-points-icon',children:n.jsx(D,{name:'gift'})}),n.jsx('h2',{children:'Баллы Ключей'})]}),
  signedIn&&n.jsxs('div',{className:'kd-points-balance',children:[n.jsx('strong',{children:ln(state.loyalty.balance)}),n.jsx('span',{children:'баллов доступно'})]}),
  n.jsx('p',{className:'kd-points-copy',children:signedIn?'1 балл = 1 ₽ скидки':'Копите баллы за бронирования и оплачивайте ими следующие поездки.'}),
  n.jsxs('button',{type:'button',className:'kd-points-link',onClick:()=>keysPost('points-program',{}),children:[n.jsx('span',{children:'Как использовать'}),n.jsx(D,{name:'chevron'})]})
 ]});
}
