/* Types from TL Keys_Notifications, sheet Уведомления, column Пуш = Да.
   See design/push-notifications-source.json. Texts below are prototype examples. */
(() => {
 const types=[
  {id:'checkin-guide',row:14,label:'Инструкция по заселению',scenario:'booked',target:'instruction',title:'Всё готово к вашему приезду',body:'Maidens Hotel ждёт вас завтра. Посмотрите, как добраться и заселиться.',timing:'За день до заезда, в 10:00'},
  {id:'room-key',row:16,label:'Доступ в номер по электронному ключу',scenario:'stay',target:'trip',title:'Ваш номер готов',body:'Номер 412 в Maidens Hotel ждёт вас. Электронный ключ уже в «Ключах».',timing:'Когда электронный ключ готов'},
  {id:'room-welcome',row:17,label:'Welcome: что есть в номере',note:'надо убрать/объединить с ключом',scenario:'stay',target:'trip',title:'Осваивайтесь в Maidens Hotel',body:'Wi-Fi, удобства номера и услуги отеля — всё для вашего отдыха под рукой.',timing:'После заселения — по условиям отеля'},
  {id:'trip-feedback',row:21,label:'Обратная связь после поездки',scenario:'after',target:'review',title:'Как вам отдых в Maidens Hotel?',body:'Поделитесь впечатлениями о проживании. Это займёт пару минут.',timing:'На следующий день после выезда, в 19:30'},
  {id:'stay-points',row:23,label:'Начислены баллы за проживание',scenario:'after',target:'benefits',title:'+2 240 баллов за поездку',body:'Баллы «Ключей» уже на вашем счёте. Используйте их для следующего бронирования.',timing:'После начисления, в ближайшие 19:30'},
  {id:'unfinished-booking',row:5,label:'Незавершённое бронирование',scenario:'search',target:'search',title:'Планы на отдых ещё в силе?',body:'Вы не завершили бронирование. Вернитесь к поиску и выберите отель для поездки.',timing:'Ближайший слот: 10:00 или 19:30'},
  {id:'collection-price',row:6,label:'Снижение цены отеля в подборке',scenario:'search',target:'favorites',title:'Отель из избранного стал дешевле',body:'В вашей подборке появилась более выгодная цена. Посмотрите обновлённое предложение.',timing:'Сразу после снижения цены'},
  {id:'available-dates',row:7,label:'Появились нужные даты и категория',scenario:'search',target:'search',title:'Номер на ваши даты появился',body:'В отеле из вашей подписки освободилась нужная категория. Проверьте доступность.',timing:'При появлении дат и категории по подписке'},
  {id:'booking-cancelled',row:9,label:'Бронь отменена',scenario:'search',target:'cancelled',title:'Бронирование отменено',body:'Ваша бронь в Maidens Hotel отменена. Вы можете выбрать другой отель для поездки.',timing:'Сразу после подтверждённой отмены'},
  {id:'payment-reminder',row:10,disabled:true,label:'Напоминание об оплате',scenario:'booked',target:'details',title:'Проверьте оплату перед поездкой',body:'До заезда в Maidens Hotel два дня. По вашей брони требуется оплата.',timing:'За два дня до заезда, в 19:30'},
  {id:'room-upgrade',row:11,disabled:true,label:'Апгрейд номера до заезда',scenario:'booked',target:'upgrade',title:'Больше комфорта в вашей поездке',body:'В Maidens Hotel доступна улучшенная категория. Посмотрите предложение отеля.',timing:'За день до заезда, если категория доступна'},
  {id:'trip-welcome',row:12,label:'Welcome: напоминание о поездке',scenario:'booked',target:'trip',title:'Завтра — в Maidens Hotel',body:'Ждём вас с 14:00. Адрес отеля и детали бронирования уже в приложении.',timing:'За 24 часа до планового заезда'},
  {id:'transfer-services',row:13,label:'Трансфер и дополнительные услуги',scenario:'booked',target:'services',title:'Начните отдых с комфорта',body:'Добавьте трансфер или другие услуги к поездке в Maidens Hotel.',timing:'До заезда или во время проживания: 09:00 или 19:30'}
 ];
 const byId=id=>types.find(item=>item.id===id)||types[0];
 // A superseded or closed demo must never deliver a stale push.
 const createDelivery=({setTimer=setTimeout,clearTimer=clearTimeout}={})=>{
  let timer=null,version=0;
  const cancel=()=>{version++;if(timer!==null)clearTimer(timer);timer=null;};
  return {cancel,schedule(deliver,delay=900){cancel();const current=version;timer=setTimer(()=>{if(version!==current)return;timer=null;deliver();},delay);}};
 };
 globalThis.KeysPushCatalog=Object.freeze({types:Object.freeze(types.map(Object.freeze)),get:byId,createDelivery});
})();
