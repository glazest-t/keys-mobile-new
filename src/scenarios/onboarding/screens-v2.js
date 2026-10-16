// Variant 2: one travel hub, a savings equation, and a personal hotel shortlist.
import {icon} from './icons.js';
const assets='./scenarios/onboarding/assets/';
const brand=`<img src="${assets}keys-orbit-symbol-blue.svg" alt="">`;
export const screens=[
 {
  theme:'trip',eyebrow:'Всё для поездки',
  title:'Ваш ключ<br>к любому отелю.',
  body:'Поиск отелей, управление бронью, Wi-Fi и услуги в номер — в одном приложении.',
  visual:`<div class="kon-scene kon2-trip">
   <div class="kon2-orbits"><i></i><i></i><i></i></div>
   <div class="kon2-destination kon2-city kon-appear"><img src="${assets}maidens-premium-king.jpg" alt=""><span>${icon('pin')} В городе</span></div>
   <div class="kon2-destination kon2-sea kon-appear"><img src="${assets}next-trip.jpg" alt=""><span>${icon('pin')} У моря</span></div>
   <div class="kon2-hub kon-appear">${brand}</div>
   <div class="kon2-hub-caption kon-appear">Всё под рукой</div>
   <div class="kon2-dock kon-appear">${[['search','Поиск'],['calendar','Бронь'],['wifi','Wi-Fi'],['coffee','Завтрак']].map(([name,label])=>`<div><span>${icon(name)}</span><strong>${label}</strong></div>`).join('')}</div>
  </div>`
 },
 {
  theme:'benefits',eyebrow:'Больше выгоды',
  title:'Скидка отеля<br>+ баллы «Ключей».',
  body:'Добавляйте баллы «Ключей» к вашей скидке по лояльности отеля. Баллы можно тратить на любые отели.',
  visual:`<div class="kon-scene kon2-benefits">
   <div class="kon2-direct">${icon('shield')} Цены напрямую от отелей</div>
   <div class="kon2-saving-card kon2-hotel-saving kon-appear"><span class="kon2-card-symbol">${icon('gift')}</span><span>Скидка отеля</span><strong>−15<small>%</small></strong><span class="kon2-tier">Ваш уровень Gold</span></div>
   <div class="kon2-saving-card kon2-keys-saving kon-appear"><span class="kon2-card-symbol">${brand}</span><span>Баллы «Ключей»</span><strong>2 400</strong><span class="kon2-tier">На любой отель</span></div>
   <span class="kon2-plus kon-appear">+</span>
   <div class="kon2-receipt kon-appear"><div class="kon2-price"><span>Ваша цена</span><s>10 000 ₽</s><strong>6 100 <small>₽</small></strong></div><div class="kon2-saved">${icon('check')}<span>Ваша выгода</span><strong>3 900 ₽</strong></div></div>
  </div>`
 },
 {
  theme:'match',eyebrow:'Персональный подбор',
  title:'Отели, которые<br>подходят вам.',
  body:'Подбираем отели по вашим пожеланиям, лайкам и просмотрам.',
  visual:`<div class="kon-scene kon2-match">
   <svg class="kon2-connections" viewBox="0 0 320 360" aria-hidden="true"><path d="M160 87v24M101 136h31m56 0h31M160 160v20"/></svg>
   <div class="kon2-request kon-appear"><span>${icon('sliders')}</span><div><small>Ваши пожелания</small><strong>К морю, в тишину<br>и с завтраками</strong></div></div>
   <span class="kon2-signal kon2-signal-likes kon-appear">${icon('heart')} Лайки</span>
   <span class="kon2-signal kon2-signal-views kon-appear">${icon('eye')} Просмотры</span>
   <div class="kon2-personal-core kon-appear">${brand}</div>
   <div class="kon2-shortlist-label">Подобрано для вас</div>
   <div class="kon2-shortlist kon-appear">
    <div class="kon2-shortlist-item"><img src="${assets}next-trip.jpg" alt=""><div><strong>Отдых у моря</strong><span>${icon('check')} Тишина и завтраки</span></div><span class="kon2-shortlist-heart">${icon('heart')}</span></div>
    <div class="kon2-shortlist-item"><img src="${assets}maidens-premium-king.jpg" alt=""><div><strong>Тихий отель</strong><span>${icon('check')} Под ваши пожелания</span></div><span class="kon2-shortlist-heart">${icon('heart')}</span></div>
   </div>
  </div>`
 }
];
