/* Presentation metadata and explicit demo examples for comparing the two inbox layouts. */
(() => {
 const categories=[['all','Все'],['booking','Брони'],['stay','Проживание'],['services','Услуги'],['payment','Оплата'],['points','Баллы'],['price','Цены'],['review','Отзывы'],['account','Аккаунт']];
 const byType={'checkin-guide':'stay','room-key':'stay','room-welcome':'stay','trip-feedback':'review','stay-points':'points','unfinished-booking':'booking','collection-price':'price','available-dates':'booking','booking-cancelled':'booking','payment-reminder':'payment','room-upgrade':'services','trip-welcome':'booking','transfer-services':'services'};
 const examples=[
  {id:'demo-more-price',hotelId:'more',hotel:'Swissôtel Камелия',category:'price',scenario:'search',target:'hotel',title:'Цена на отель снизилась',body:'В Swissôtel Камелия появилось более выгодное предложение на ваши даты.'},
  {id:'demo-more-review',hotelId:'more',hotel:'Swissôtel Камелия',category:'review',scenario:'after',target:'history-review',tripId:'sochi-2026',title:'Как прошёл отдых в Swissôtel Камелия?',body:'Поделитесь впечатлениями о проживании.'}
 ];
 const types=()=>[...globalThis.KeysPushCatalog.types.map(item=>({...item,hotelId:'maidens',hotel:'Maidens Hotel',category:byType[item.id]})),...examples];
 const get=id=>types().find(item=>item.id===id);
 const legacy=item=>({...item,title:globalThis.KeysGuestCopy?.text(item.title)??item.title,body:globalThis.KeysGuestCopy?.text(item.body)??item.body,hotelId:item.hotelId||(item.category==='account'?null:'maidens'),hotel:item.hotel||(item.category==='account'?'Ключи':'Maidens Hotel'),category:['stay-feedback','checkout-feedback'].includes(item.target)?'review':item.category==='account'?'account':item.category==='trip'?'stay':item.category});
 const select=(items,{category='all',hotelId=null}={})=>items.filter(item=>(category==='all'||item.category===category)&&(!hotelId||item.hotelId===hotelId)).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 const group=items=>{const groups=new Map();for(const item of items){const key=item.hotelId||'keys';if(!groups.has(key))groups.set(key,{id:key,hotel:item.hotel||'Ключи',items:[]});groups.get(key).items.push(item);}return [...groups.values()];};
 const groupByDate=(items,now=new Date())=>{
  const key=value=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const today=key(now),yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);
  const groups=new Map();for(const item of select(items)){const id=key(item.createdAt),d=new Date(item.createdAt);
   if(!groups.has(id))groups.set(id,{id,label:id===today?'Сегодня':id===key(yesterday)?'Вчера':d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'}),date:d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}),items:[]});
   groups.get(id).items.push(item);
  }return [...groups.values()];
 };
 globalThis.KeysNotificationModel={categories,get,legacy,select,group,groupByDate,examples};
})();
