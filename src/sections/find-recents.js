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
  searches.length>0 && n.jsxs('section',{className:'keys-find-history','aria-label':'Предыдущие поиски',children:[
   n.jsx('div',{className:'keys-find-history-track',children:searches.map(search=>{
    const adults=search.party.adults;
    const adultLabel=`${adults} ${adults%10===1&&adults%100!==11?'взрослый':'взрослых'}`;
    return n.jsxs('button',{type:'button',className:'keys-find-history-card',onClick:()=>keysRepeatSearch(dispatch,search),
     'aria-label':`Повторить поиск: ${search.city}, ${DE(search.arrival,search.departure)}, ${adultLabel}`,
     children:[
      n.jsxs('span',{className:'keys-find-history-city',children:[n.jsx('strong',{children:search.city}),n.jsx(D,{name:'chevron',className:'size-4'})]}),
      n.jsx('span',{className:'keys-find-history-dates',children:DE(search.arrival,search.departure)}),
      n.jsx('span',{className:'keys-find-history-guests',children:`${adults} взр.`})
     ]},search.at);
   })})
  ]}),
  n.jsx(UB,{}),
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
  ]})
 ]});
}

const keysFindCollections=[
 {id:'deals',title:'Горячие скидки',image:'deals',description:'Отели со скидкой от 10%'},
 {id:'weekend',title:'На пару дней',image:'weekend',description:'Две ночи в отеле с бассейном, спа или тихой атмосферой'},
 {id:'anywhere',title:'Куда угодно',image:'anywhere',description:'Отели во всех доступных направлениях'}
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
 return n.jsx('section',{className:'keys-find-collections','aria-label':'Подборки отелей',children:keysFindCollections.map(item=>n.jsxs('button',{
  type:'button',className:'keys-find-collection',onClick:()=>keysOpenCollection(dispatch,state.search,item.id),
  children:[n.jsx('img',{src:'./collections/'+item.image+'.svg',alt:'',width:160,height:128}),n.jsx('span',{children:item.title})]
 },item.id))});
}
