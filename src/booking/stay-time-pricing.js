/* Shared demo pricing for booking checkout and services added to an existing stay. */
(() => {
 function policy(hotelId,checkIn=hotelId==='maidens'?'14:00':'15:00',checkOut='12:00'){
 return {checkIn,checkOut,early:hotelId==='maidens'?{type:'fixed',amount:2500}:hotelId==='more'?{type:'hourly',amount:800}:{type:'percent',amount:50},late:hotelId==='maidens'?{type:'fixed',amount:3000}:{type:'percent',amount:50,fullAfter:'18:00'}};
 }
 function options(policy,kind,nightly=0,money=value=>value.toLocaleString('ru-RU')+' ₽',times){
 const early=kind==='early',standard=early?policy.checkIn:policy.checkOut,rule=policy[kind];
 const hours=value=>Number(value.slice(0,2))+Number(value.slice(3))/60;
 const values=times??(early?['06:00','09:00','12:00',standard]:[standard,'16:00','18:00','22:00']);
 return [...new Set(values)].filter(time=>early?time<=standard:time>=standard).sort().map(time=>{
  const included=time===standard,available=!(early&&time==='06:00');
  const units=Math.ceil(Math.abs(hours(standard)-hours(time))),percent=rule.fullAfter&&time>rule.fullAfter?100:rule.amount;
  const price=included||!available?0:Math.round(rule.type==='hourly'?units*rule.amount:rule.type==='fixed'?rule.amount:nightly*percent/100);
  const detail=!available?'Нет доступных номеров':included?'Стандартное время · включено':rule.type==='hourly'?units+' ч × '+money(rule.amount):rule.type==='fixed'?'Фиксированная доплата':percent+'% стоимости суток';
  return {time,price,available,included,detail};
 });
 }
 globalThis.KeysStayTimePricing={policy,options};
})();
