(() => {
 const token=new URLSearchParams(location.search).get('session'),key='keys-demo-payment-v1:'+token,$=id=>document.getElementById(id);
 const form=$('payment-form'),pay=$('pay-button'),result=$('payment-result'),error=$('payment-error');
 let payment=null,processing=false,finished=false,language='ru',ackTimer;
 const ru=Object.fromEntries([...document.querySelectorAll('[data-copy]')].map(el=>[el.dataset.copy,el.innerHTML]));
 const en={demo:'Test payment',service:'Service',quantity:'Quantity',price:'Price, RUB',sum:'Total, RUB',accommodation:'Accommodation payment',amount:'Total amount',currency:'Russian ruble (RUB)',dates:'Dates of stay',deadline:'Payment deadline',method:'Payment method',card:'Russian bank card or SBP',digital:'Digital rubles',email:'Email',pay:'Pay',return:'Return to Keys',disclaimer:'Demo payment. No money will be charged.<br>Your booking status will be updated in Keys.',rules:'TravelLine payment terms',demoSettings:'Demo payment settings',demoResult:'Payment outcome',success:'Success',declined:'Bank declined',rulesText:'This is a demonstration in the Keys prototype. No bank details are collected and no money is charged. Payment only updates the test booking in the original application tab.',close:'Close'};
 const text=(a,b)=>language==='ru'?a:b;
 const money=value=>new Intl.NumberFormat(language==='ru'?'ru-RU':'en-US').format(value);
 const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value.split('-').reverse().join('.'):'';
 function read(){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
 function showError(message){error.hidden=false;error.textContent=message;processing=false;pay.disabled=false;pay.removeAttribute('aria-busy');pay.textContent=text('Оплатить','Pay');}
 function unavailable(){form.hidden=true;result.hidden=false;$('payment-title').textContent=text('Сессия оплаты завершена','Payment session ended');$('result-title').textContent=text('Откройте оплату ещё раз','Open payment again');$('result-description').textContent=text("Вернитесь в «Ключи» и нажмите «Оплатить полностью» у нужной бронирования",'Return to Keys and select “Pay in full” on your booking.');}
 function render(){
  const data=read();if(!data||data.token!==token||!Number.isFinite(data.amount)||data.amount<=0){if(!payment)unavailable();return;}
  if(data.status!=='paid'&&Date.now()-data.createdAt>30*60*1000){unavailable();return;}
  const first=!payment;payment=data;
  document.title=text("Оплата бронирования — Ключи",'Booking payment — Keys');$('payment-title').textContent=text('Оплата заказа №','Order payment #')+data.bookingId;$('hotel-name').textContent=data.hotel;
  document.querySelectorAll('[data-amount]').forEach(el=>el.textContent=money(data.amount));
  $('stay-dates').textContent=date(data.arrival)+' — '+date(data.departure);$('payment-deadline').textContent=text('до ','by ')+date(data.arrival);
  if(first)$('payment-email').value='guest@example.test';
  if(data.status==='expired'){clearTimeout(ackTimer);unavailable();return;}
  if(data.status==='paid'){
   clearTimeout(ackTimer);form.hidden=true;result.hidden=false;$('result-title').textContent=text('Оплата прошла успешно','Payment successful');$('result-description').textContent=text('Оплачено ','Paid ')+money(data.amount)+' ₽. '+text('Проживание в '+data.hotel+" полностью оплачено",'Your booking at '+data.hotel+' is paid in full.');
   if(!finished){finished=true;try{window.opener?.top.focus();}catch{}}
   return;
  }
  result.hidden=true;form.hidden=false;
  if(data.status==='submitted'){processing=true;pay.disabled=true;pay.setAttribute('aria-busy','true');pay.textContent=text('Подтверждаем оплату…','Confirming payment…');}
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(processing||!form.reportValidity())return;
  const data=read();if(!data||data.status!=='ready'||Date.now()-data.createdAt>30*60*1000){render();return;}
  error.hidden=true;processing=true;pay.disabled=true;pay.setAttribute('aria-busy','true');pay.textContent=text('Обрабатываем оплату…','Processing payment…');
  setTimeout(()=>{
   if($('demo-result').value==='declined'){showError(text("Банк отклонил платёж. Деньги не списаны. Попробуйте ещё раз",'The bank declined the payment. Nothing was charged. Please try again.'));return;}
   const latest=read();if(!latest||latest.status!=='ready'){render();return;}
   try{localStorage.setItem(key,JSON.stringify({...latest,status:'submitted',method:form.elements.method.value}));}catch{showError(text("Не удалось передать результат оплаты. Попробуйте ещё раз",'Unable to send the payment result. Please try again.'));return;}
   render();ackTimer=setTimeout(()=>{const current=read();if(current?.status==='submitted'){try{localStorage.setItem(key,JSON.stringify({...current,status:'expired'}));}catch{}unavailable();}},10000);
  },1100);
 });
 window.addEventListener('storage',event=>{if(event.key===key)render();});
 window.addEventListener('pageshow',render);
 $('return-button').addEventListener('click',()=>{try{if(window.opener&&!window.opener.closed){window.opener.top.focus();window.close();return;}}catch{}location.href='../?scenario=booked-partial&view=mobile&brand=orbit';});
 $('currency').addEventListener('click',()=>{const info=$('currency-info');info.hidden=!info.hidden;$('currency').setAttribute('aria-expanded',String(!info.hidden));});
 $('open-rules').addEventListener('click',()=>$('rules-dialog').showModal());
 $('language').addEventListener('change',event=>{language=event.target.value;document.documentElement.lang=language;const dict=language==='en'?en:ru;document.querySelectorAll('[data-copy]').forEach(el=>el.innerHTML=dict[el.dataset.copy]);render();});
 render();
})();
