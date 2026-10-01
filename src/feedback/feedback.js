(() => {
 const root=document.getElementById('keysFeedbackFlow');
 if(!root)return;
 let selectedRating=0,tipAmount=0,tipSent=false,reviewKind='first-night',draft=null,uploading=false,session=0;
 const success=root.querySelector('[data-kfb="success"]');
 const tipCard=document.createElement('section');
 tipCard.className='kfb-tip-card';tipCard.hidden=true;
 tipCard.setAttribute('aria-label','Чаевые отелю');
 success.querySelector('.kfb-success').append(tipCard);
 const resetTips=()=>{
  tipAmount=0;tipSent=false;tipCard.hidden=true;
  tipCard.innerHTML=`<div class="kfb-tip-heading"><span class="kfb-tip-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></span><h2>Поблагодарить команду</h2></div><p>Оставьте чаевые за заботу и тёплый приём.</p><div class="kfb-tip-options"><div class="kfb-tip-amounts" role="group" aria-label="Сумма чаевых">${[300,500,1000].map(amount=>`<button type="button" data-tip="amount" data-amount="${amount}" aria-pressed="false">${amount.toLocaleString('ru-RU')} ₽</button>`).join('')}</div><button type="button" class="kfb-primary" data-tip="send" disabled>Выберите сумму</button></div>`;
 };
 const details=root.querySelector('[data-kfb="details"] .kfb-scroll');
 const attachments=document.createElement('div');attachments.className='kfb-attachments';
 attachments.innerHTML='<div class="kfb-photos"></div><input class="kfb-file" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden><p class="kfb-upload-status" role="status"></p>';
 details.append(attachments);
 const photoButton=root.querySelector('[data-photo]');
 photoButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5 9.5 3h5L16 5h4v15H4V5Z"/><circle cx="12" cy="12" r="4"/></svg><span><strong>Прикрепить фото</strong><small>До 5 фото · JPG, PNG, WebP · до 5 МБ</small></span>';
 const textarea=root.querySelector('.kfb-textarea');textarea.maxLength=1500;textarea.id='kfb-impressions';
 root.querySelector('[data-kfb="rating"] .kfb-card').hidden=true;
 root.querySelector('[data-kfb="details"] .kfb-card small').hidden=true;
 root.querySelector('[data-kfb="rating"] .kfb-title small').textContent='Шаг 1 из 2';
 const detailHelp=document.createElement('p');detailHelp.className='kfb-detail-help';detailHelp.hidden=true;textarea.before(detailHelp);
 const uploadStatus=message=>root.querySelector('.kfb-upload-status').textContent=message;
 function renderPhotos(){
  const list=root.querySelector('.kfb-photos');list.replaceChildren();
  (draft?.photos??[]).forEach((photo,index)=>{
   const item=document.createElement('div'),img=document.createElement('img'),remove=document.createElement('button');
   item.className='kfb-photo-preview';img.src=photo;img.alt='Фото поездки '+(index+1);remove.type='button';remove.dataset.removePhoto=index;remove.textContent='×';remove.setAttribute('aria-label','Удалить фото '+(index+1));item.append(img,remove);list.append(item);
  });
  photoButton.disabled=uploading||draft?.photos.length>=5;root.querySelector('[data-submit]').disabled=uploading||!selectedRating;
 }
 function showTipReceipt(amount,focus=false){
  tipSent=true;tipCard.hidden=false;
  tipCard.innerHTML=`<span class="kfb-tip-icon" aria-hidden="true">✓</span><h2 tabindex="-1">Спасибо за вашу щедрость!</h2><p role="status">Чаевые ${amount.toLocaleString('ru-RU')} ₽</p>`;
  if(focus)tipCard.querySelector('h2').focus();
 }
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-photo]')){event.preventDefault();event.stopImmediatePropagation();if(!photoButton.disabled)root.querySelector('.kfb-file').click();}
  if(event.target.closest('[data-submit]')&&(uploading||!selectedRating)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 root.addEventListener('change',async event=>{
  if(!event.target.matches('.kfb-file'))return;
  const input=event.target,files=[...input.files],current=draft,currentSession=session;let rejected=0;uploading=true;renderPhotos();uploadStatus('Добавляем фото…');
  for(const file of files){if(current.photos.length>=5||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){rejected++;continue;}try{current.photos.push(await window.KeysGuestReviews.readPhoto(file));}catch{rejected++;}}
  if(session!==currentSession)return;
  uploading=false;input.value='';renderPhotos();uploadStatus(rejected?'Можно добавить до 5 фото JPG, PNG или WebP, каждое до 5 МБ.':'Фото добавлены к отзыву.');
 });
 resetTips();
 root.querySelectorAll('[data-rating]').forEach(button=>{
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path stroke-linejoin="round" d="m12 3 2.8 5.7 6.3.9-4.55 4.45 1.07 6.28L12 17.36l-5.62 2.97 1.07-6.28L2.9 9.6l6.3-.9Z"/></svg>';
  button.setAttribute('aria-label','Оценка '+button.dataset.rating+' из 5');
  button.setAttribute('aria-pressed','false');
 });
 root.querySelector('.kfb-stars').setAttribute('role','group');
 root.querySelector('.kfb-stars').setAttribute('aria-label','Оцените первую ночь');
 root.querySelector('.kfb-label').setAttribute('aria-live','polite');
 root.querySelectorAll('.kfb-back').forEach(button=>button.setAttribute('aria-label','Назад'));
 root.querySelector('.kfb-textarea').setAttribute('aria-label','Ваши впечатления');
 root.addEventListener('keys-feedback-context',event=>{
  reviewKind=event.detail.kind==='stay'?'stay':'first-night';
  const stay=reviewKind==='stay';
  const completed=stay&&document.body.dataset.keysScenario==='after';
  root.querySelector('[data-kfb="details"] .kfb-question').textContent=completed?'Поделитесь впечатлениями':'Расскажите подробнее';
  detailHelp.hidden=!completed;
  detailHelp.textContent='Расскажите, чем вам запомнился отель. Ваш отзыв поможет другим гостям выбрать место для своей поездки.';
  textarea.placeholder=completed?'Что особенно понравилось? Что стоит знать будущим гостям?':'Что понравилось? Что можно улучшить?';
  root.querySelector('[data-kfb="rating"] h1').textContent=stay?'Ваше проживание':'Первая ночь';
  root.querySelector('[data-kfb="rating"] .kfb-question').textContent=stay?'Как прошло проживание?':'Как прошла первая ночь?';
  root.querySelector('.kfb-help').textContent=stay?'Поделитесь впечатлениями — ваш отзыв поможет отелю стать лучше.':'Ваш ответ поможет отелю улучшить сервис уже во время поездки.';
  root.querySelector('[data-kfb="rating"] .kfb-card small').textContent=stay?'12–19 сентября · 7 ночей':'Номер 412 · первая ночь';
  root.querySelector('[data-kfb="details"] .kfb-card small').textContent=stay?'Maidens Hotel · 12–19 сентября':'Maidens Hotel · первая ночь';
  root.querySelector('.kfb-stars').setAttribute('aria-label',stay?'Оцените проживание':'Оцените первую ночь');
  root.querySelector('.kfb-success p').textContent=stay?'Спасибо, что поделились впечатлениями с командой Maidens Hotel. Будем рады видеть вас снова.':'Мы передали впечатления команде Maidens Hotel. Отель сможет учесть их уже во время проживания.';
 });
 root.addEventListener('kfb-reset',()=>{
  session++;uploading=false;selectedRating=0;resetTips();
  draft=window.KeysGuestReviews.get(reviewKind);draft.photos??=[];
  root.querySelector('.kfb-file').value='';uploadStatus('');
  root.querySelectorAll('.kfb-scroll,.kfb-success').forEach(view=>view.scrollTop=0);
  root.querySelectorAll('[data-rating]').forEach(button=>{button.classList.remove('active');button.setAttribute('aria-pressed','false');});
  root.querySelector('.kfb-label').textContent='Выберите оценку';root.querySelector('[data-next]').disabled=true;
  root.querySelector('.kfb-textarea').value=draft.text??'';root.querySelector('.kfb-added').hidden=true;
  root.querySelector('[data-submit]').textContent=draft.submitted?'Сохранить изменения':'Отправить отзыв';
  if(draft.rating>=1&&draft.rating<=5)root.querySelector(`[data-rating="${draft.rating}"]`).click();
  renderPhotos();
 });
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-rating]');
  if(button){selectedRating=Number(button.dataset.rating);root.querySelector('[data-submit]').disabled=uploading||!selectedRating;root.querySelectorAll('[data-rating]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}
  if(event.target.closest('[data-submit]')){
   draft={...draft,rating:selectedRating,text:root.querySelector('.kfb-textarea').value,submitted:true};
   const saved=window.KeysGuestReviews.save(reviewKind,draft);
   root.querySelector('.kfb-success h1').textContent='Спасибо за отзыв';
   root.querySelector('.kfb-success p').textContent=saved?'Ваш отзыв сохранён. Спасибо, что поделились впечатлениями.':'Отзыв сохранён на время сеанса. Для сохранения фото после закрытия не хватило памяти устройства.';
   resetTips();tipCard.hidden=selectedRating!==5;if(draft.tip)showTipReceipt(draft.tip);
   root.querySelector('.kfb-success').scrollTop=0;
  }
  const remove=event.target.closest('[data-remove-photo]');
  if(remove){draft.photos.splice(Number(remove.dataset.removePhoto),1);renderPhotos();uploadStatus('Фото удалено.');photoButton.focus();}
  const tip=event.target.closest('[data-tip]');if(!tip)return;
  if(tip.dataset.tip==='amount'&&!tipSent){
   tipAmount=Number(tip.dataset.amount);
   tipCard.querySelectorAll('[data-tip="amount"]').forEach(item=>item.setAttribute('aria-pressed',String(item===tip)));
   const send=tipCard.querySelector('[data-tip="send"]');send.disabled=false;send.textContent=`Оставить ${tipAmount.toLocaleString('ru-RU')} ₽`;
  }
  if(tip.dataset.tip==='send'&&selectedRating===5&&tipAmount&&!tipSent){
   tipSent=true;
   draft.tip=tipAmount;window.KeysGuestReviews.save(reviewKind,draft);showTipReceipt(tipAmount,true);
  }
 });
})();
