import {icon} from './icons.js?v=bfad0c4fd30a';
const assets='./scenarios/onboarding/assets/';
const orbit=`<img class="kon-art-orbit" src="${assets}keys-orbit-symbol-blue.svg" alt="">`;
// Illustrative previews reuse the app's hotel photography, icons and component language.
export const screens=[
 {
  theme:'trip', eyebrow:'Всё для поездки',
  title:"Ключ в телефоне<br>для поездки",
  body:"Бронирование, ключ и услуги — в одном приложении",
  visual:`<div class="kon-scene kon-trip-scene">${orbit}
   <div class="kon-search-preview kon-appear">${icon('search')}<span>Куда поедем?</span><span class="kon-small-orbit"><img src="${assets}keys-orbit-symbol-blue.svg" alt=""></span></div>
   <div class="kon-booking-preview kon-appear"><img class="kon-hotel-photo" src="${assets}maidens-premium-king.jpg" alt=""><div class="kon-booking-info"><span class="kon-status">${icon('check')} Бронирование подтверждено</span><strong>ваше бронирование</strong><span>Москва • 12–19 сентября</span><div class="kon-booking-actions"><span>Детали брони</span><span>Изменить</span></div></div></div>
   <div class="kon-wifi-preview kon-appear"><span class="kon-mini-icon">${icon('wifi')}</span><div><strong>Wi-Fi</strong><span>Подключение готово</span></div></div>
   <div class="kon-service-preview kon-appear"><span class="kon-mini-icon">${icon('service')}</span><div><strong>Завтрак в номер</strong><span>${icon('check')} Уже готовим</span></div></div>
  </div>`
 },
 {
  theme:'benefits', eyebrow:'Больше выгоды',
  title:"Скидка по программе<br>+ баллы «Ключей»",
  body:"Используйте баллы «Ключей» вместе со скидкой по программе лояльности",
  visual:`<div class="kon-scene kon-benefits-scene">${orbit}
   <div class="kon-direct-label">${icon('shield')} Прямые цены на проживание</div>
   <div class="kon-hotel-member kon-appear"><div><span>ваши привилегии</span><strong>Скидка по программе</strong><span class="kon-gold-label">ваш уровень Gold</span></div><b>−15<span>%</span></b></div>
   <div class="kon-combine" aria-hidden="true">+</div>
   <div class="kon-app-points kon-appear"><div><span>Баллы «Ключей»</span><strong>2 400 <small>баллов</small></strong><span>На любой объект • 1 балл = 1 ₽</span></div><img src="${assets}keys-orbit-symbol-blue.svg" alt=""></div>
   <div class="kon-total-preview kon-appear"><div><span>Пример вашей цены</span><div><s>10 000 ₽</s><strong>6 100 ₽</strong></div></div><span class="kon-saving">Выгода<br><b>3 900 ₽</b></span></div>
  </div>`
 },
 {
  theme:'match', eyebrow:'Персональный подбор',
  title:"Варианты, которые<br>подходят вам",
  body:"Подбираем жильё по предпочтениям, избранному и просмотрам",
  visual:`<div class="kon-scene kon-match-scene">${orbit}
   <div class="kon-interest kon-interest-one kon-appear">${icon('heart')} ваши лайки</div>
   <div class="kon-interest kon-interest-two kon-appear">${icon('sliders')} Предпочтения</div>
   <div class="kon-match-card kon-appear"><div class="kon-match-photo"><img src="${assets}next-trip.jpg" alt=""><span class="kon-match-heart">${icon('heart')}</span></div><div class="kon-match-info"><span class="kon-personal-label">Под ваши предпочтения</span><strong>Отдых у моря</strong><div class="kon-match-tags"><span>${icon('check')} Тишина</span><span>${icon('check')} У моря</span><span>${icon('coffee')} Завтраки</span></div></div></div>
   <div class="kon-match-note kon-appear">${icon('check')} Похож на сохранённые варианты</div>
  </div>`
 }
];
