export const STORE_VERSION=1;
export const fullName=p=>[p.firstName,p.lastName].filter(Boolean).join(' ');
export const initialState=()=>({version:STORE_VERSION,language:'ru',travelers:[{id:'primary',primary:true,firstName:'Татьяна',lastName:'Глазырина',middleName:'Викторовна',birthDate:'',citizenship:'Россия',email:'',phone:'+7 (900) 123-45-67'}],notifications:{push:true,email:false,sms:false,bookings:true,messages:true,services:true,benefits:true,offers:false,quiet:false,quietFrom:'22:00',quietTo:'08:00'},security:{biometric:false,pin:false,otherDevices:[{id:'phone',name:'Safari · iPhone',location:'Москва',last:'12 сентября, 09:10'}]},privacy:{personalization:true,analytics:false},reviews:{},tickets:[],deletionRequested:false});
export function hydrate(raw){
 const base=initialState();
 if(!raw||raw.version!==STORE_VERSION)return base;
 if(['ru','en'].includes(raw.language))base.language=raw.language;
 const travelers=Array.isArray(raw.travelers)?raw.travelers.filter(p=>p&&typeof p.id==='string'&&typeof p.firstName==='string'&&typeof p.lastName==='string'):[];
 if(travelers.some(p=>p.id==='primary'))base.travelers=travelers.map(p=>({...base.travelers[0],...p,primary:p.id==='primary'}));
 for(const group of ['notifications','privacy'])for(const key of Object.keys(base[group]))if(typeof raw[group]?.[key]===typeof base[group][key])base[group][key]=raw[group][key];
 for(const key of ['biometric','pin'])if(typeof raw.security?.[key]==='boolean')base.security[key]=raw.security[key];
 if(Array.isArray(raw.security?.otherDevices))base.security.otherDevices=raw.security.otherDevices.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string');
 if(raw.reviews&&typeof raw.reviews==='object')base.reviews=raw.reviews;
 if(Array.isArray(raw.tickets))base.tickets=raw.tickets.filter(t=>t&&typeof t.id==='string'&&typeof t.message==='string');
 base.deletionRequested=raw.deletionRequested===true;return base;
}
export function validateTraveler(p,today=new Date().toISOString().slice(0,10)){
 const errors={};
 for(const [key,label] of [['firstName','имя'],['lastName','фамилию']])if(!String(p[key]||'').trim())errors[key]='Укажите '+label;else if(!/^[\p{L}\p{M} '\-]{1,60}$/u.test(p[key].trim()))errors[key]='Используйте буквы, пробел или дефис';
 if(p.birthDate){const d=new Date(p.birthDate+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==p.birthDate||p.birthDate>today||p.birthDate<'1900-01-01')errors.birthDate='Укажите корректную дату рождения';}
 if(p.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()))errors.email='Проверьте адрес электронной почты';
 if(p.phone){const n=p.phone.replace(/\D/g,'');if(n.length<10||n.length>15)errors.phone='Укажите телефон с кодом страны';}
 return errors;
}
export function saveTraveler(state,values,id){
 const errors=validateTraveler(values);if(Object.keys(errors).length)return {state,errors};
 const previous=state.travelers.find(p=>p.id===id),p={id:id||'traveler-'+crypto.randomUUID(),primary:id==='primary'};
 for(const key of ['firstName','lastName','middleName','birthDate','citizenship','email','phone'])p[key]=String(values[key]||'').trim();
 return {state:{...state,travelers:previous?state.travelers.map(t=>t.id===id?p:t):[...state.travelers,p]},traveler:p,errors:{}};
}
export function removeTraveler(state,id){return id==='primary'?state:{...state,travelers:state.travelers.filter(p=>p.id!==id)};}
export const trips=[
 {id:'spb-2026',hotelId:'severny-spb',city:'Санкт-Петербург',hotel:'Отель «Северный»',photo:'./scenarios/maidens-premium-king.jpg',arrival:'2026-07-10',departure:'2026-07-13',nights:3,guests:2,room:'Стандарт с большой кроватью',price:27000,status:'completed',points:1080},
 {id:'sochi-2026',city:'Сочи',hotel:'Swissôtel Камелия',hotelId:'more',photo:'./sections/images/sochi/swissotel/92b13884e717.webp',arrival:'2026-06-01',departure:'2026-06-08',nights:7,guests:2,room:'Стандарт с видом на сад',price:98000,status:'completed',points:3920},
 {id:'moscow-cancelled',city:'Москва',hotel:'Maidens Hotel',hotelId:'maidens',photo:'./scenarios/maidens-hotel.jpg',arrival:'2026-05-15',departure:'2026-05-17',nights:2,guests:1,room:'Премиум Кинг',price:16000,status:'cancelled',points:0},
 {id:'kazan-2025',hotelId:'kazan-riviera',city:'Казань',hotel:'Отель «Казанская Ривьера»',photo:'./sections/images/sochi/gorizont/d0588de3919a.webp',arrival:'2025-11-03',departure:'2025-11-06',nights:3,guests:1,room:'Комфорт',price:21000,status:'completed',points:840}
];
export const completedMaidens={id:'maidens-2026',city:'Москва',hotel:'Maidens Hotel',hotelId:'maidens',photo:'./scenarios/maidens-hotel.jpg',arrival:'2026-09-12',departure:'2026-09-19',nights:7,guests:1,room:'Премиум Кинг с видом во двор',price:56000,status:'completed',points:2240};
export const tripStatusLabels={upcoming:'Предстоящая',active:'Сейчас в поездке',completed:'Завершена',cancelled:'Отменена'};
export function collectTrips({scenario,host,created=[],today='2026-09-13'}={}){
 const items=[...trips];
 if(host&&!host.runtimeId&&['booked','stay','after'].includes(scenario))items.push({...completedMaidens,id:'maidens-current',arrival:host.arrival,departure:host.departure,nights:host.nights,guests:host.adults,room:host.room,price:host.total,points:scenario==='after'&&!host.cancellation?2240:0,model:host,source:'host',status:host.cancellation?'cancelled':scenario==='after'?'completed':scenario==='stay'?'active':'upcoming'});
 for(const trip of created){
  if(!trip?.id||!trip.arrival||!trip.departure)continue;
  items.push({...trip,source:'created',status:trip.model?.cancellation?'cancelled':trip.departure<=today?'completed':trip.arrival<=today?'active':'upcoming'});
 }
 // Booking IDs, not hotel IDs, identify reservations: one hotel may have several stays.
 return [...new Map(items.map(trip=>[trip.id,trip])).values()];
}
export function filterTrips(items,{query='',status='all',year='all'}={}){
 const q=query.toLocaleLowerCase('ru-RU').trim(),order={active:0,upcoming:1,completed:2,cancelled:2};
 return items.filter(t=>(status==='all'||t.status===status)&&(year==='all'||t.arrival.startsWith(year))&&(!q||(t.city+' '+t.hotel).toLocaleLowerCase('ru-RU').includes(q))).sort((a,b)=>order[a.status]-order[b.status]||(a.status==='upcoming'?a.arrival.localeCompare(b.arrival):b.arrival.localeCompare(a.arrival))||a.id.localeCompare(b.id));
}
export const articles=[
 {id:'change',category:'Бронирование',title:"Как изменить или отменить бронирование?",text:"Откройте «Управление бронированием» в поездке. Условия и сумму возврата увидите до подтверждения",action:'trip'},
 {id:'key',category:'Проживание',title:'Что делать, если дверь не открывается?',text:"Включите Bluetooth и поднесите телефон ближе к замку. Если дверь не откроется, используйте ключ-карту или обратитесь на стойку регистрации",action:'hotel'},
 {id:'points',category:'Баллы',title:"Чем отличаются программы лояльности?",text:"Баллы «Ключей» и баллы других программ учитываются отдельно. Условия списания — в разделе «Выгоды»",action:'benefits'},
 {id:'refund',category:'Бронирование',title:'Где посмотреть информацию о возврате?',text:"Откройте отменённое бронирование в истории поездок — там сумма и статус возврата. Срок зачисления зависит от банка",action:'history'},
 {id:'guest',category:'Аккаунт',title:'Как добавить другого путешественника?',text:"В разделе «Путешественники» нажмите «Добавить» и укажите имя и фамилию. Данные в оформленных бронированиях не изменятся",action:'travelers'},
 {id:'notices',category:'Аккаунт',title:'Почему не приходят уведомления?',text:"Проверьте уведомления в настройках приложения и телефона. Изменения бронирования и сообщения о безопасности доступны в приложении",action:'notifications'},
 {id:'checkin',category:'Проживание',title:'Как узнать время заезда и выезда?',text:"Время указано в деталях бронирования. Измените его в разделе «Услуги» — доступны только свободные варианты",action:'trip'},
];
