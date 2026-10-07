import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/sections/hotel-details.js',import.meta.url),'utf8');
const helpers=vm.runInNewContext(source.slice(0,source.indexOf('function TY('))+';({keysReviewHighlights,keysHotelReasons,keysRoomAmenities,keysHotelRatingLabel})');
const plain=value=>JSON.parse(JSON.stringify(value));

test('review summary includes the three-month boundary and excludes future reviews',()=>{
 const result=plain(helpers.keysReviewHighlights([
  {date:'2026-06-12',praise:['Номер']},
  {date:'2026-06-13',praise:['Завтраки','Завтраки']},
  {date:'2026-09-13',praise:['Завтраки','Персонал']},
  {date:'2026-09-14',praise:['Спа']}
 ],'2026-09-13'));
 assert.equal(result.all.count,3);
 assert.equal(result.recent.count,2);
 assert.deepEqual(result.recent.topics,['Завтраки','Персонал']);
 assert.equal(result.all.topics.includes('Спа'),false);
});

test('review window clamps month end and supports no recent reviews',()=>{
 const reviews=[{date:'2026-02-28',praise:['Номер']}];
 assert.equal(helpers.keysReviewHighlights(reviews,'2026-05-31').recent.count,1);
 assert.deepEqual(plain(helpers.keysReviewHighlights(reviews,'2026-10-01').recent),{count:0,topics:[]});
});

test('recommendations prioritize selected preferences only when the hotel offers them',()=>{
 const hotel={quiet:true,spa:true,breakfast:true,pets:false,parking:true,beach:true,seaDistance:100};
 const reasons=plain(helpers.keysHotelReasons(hotel,{filters:['У моря','С питомцем'],party:{car:true}}));
 assert.deepEqual(reasons.map(reason=>reason.key),['beach','parking','quiet']);
 assert.equal(reasons[0].matched,true);
 assert.equal(reasons.some(reason=>reason.key==='pets'),false);
 assert.deepEqual(plain(helpers.keysHotelReasons({},{})),[]);
});

test('room amenities are deduplicated and room-specific descriptions remain available',()=>{
 const rooms=[{description:'Вид на море · Wi-Fi · кондиционер'},{description:'Окна во двор · Wi-Fi · кондиционер'}];
 assert.deepEqual(plain(helpers.keysRoomAmenities(rooms)),['Wi-Fi','Кондиционер','Вид на море','Окна во двор']);
 assert.deepEqual(plain(helpers.keysRoomAmenities([rooms[1]])),['Wi-Fi','Кондиционер','Окна во двор']);
});


test('rating wording handles the catalog comma notation and numeric ratings',()=>{
 assert.equal(helpers.keysHotelRatingLabel('9,4'),'Очень хорошо');
 assert.equal(helpers.keysHotelRatingLabel(9.4),'Очень хорошо');
 assert.equal(helpers.keysHotelRatingLabel('8,6'),'Хорошо');
 assert.equal(helpers.keysHotelRatingLabel('—'),'Отзывы гостей');
});

// Hotel preview and full reviews must select the same topics and matching reviews.
test('review topic filters match text and praise and omit empty topics',()=>{
 const start=source.indexOf('function keysHotelReviewTopics(');
 const end=source.indexOf('function KeysReviewTopicFilters(',start);
 const topicsFor=vm.runInNewContext(source.slice(start,end)+';keysHotelReviewTopics');
 const reviews=[{text:'Вкусный ужин',praise:['Завтраки']},{text:'Удобно приехать на такси',praise:[]},{text:'Тихо, удобная кровать',praise:['Номер']}];
 const topics=topicsFor(reviews);
 assert.deepEqual(plain(topics.map(t=>t.id)),['all','food','quiet','transport','rooms']);
 assert.deepEqual(plain(topics.find(t=>t.id==='food').match(reviews[0])),true);
 assert.equal(topics.find(t=>t.id==='food').match(reviews[1]),false);
 assert.deepEqual(plain(topicsFor([]).map(t=>t.id)),['all']);
});

test('rate facts keep meal, cancellation, payment and changes specific to the offer',()=>{
 const start=source.indexOf('function keysRoomTariffFacts('),end=source.indexOf('function KeysRoomOfferCard(',start);
 const factsFor=vm.runInNewContext(source.slice(start,end)+';keysRoomTariffFacts');
 const flexible=factsFor({includesBreakfast:true,freeCancellation:true,refundable:true,cancellationDeadline:'28 сентября',requiresPrepayment:false,changesAllowed:true});
 assert.deepEqual(plain(flexible.map(f=>f.title)),['Завтрак включён','Бесплатная отмена','Без предоплаты','Можно изменить бронь']);
 assert.equal(flexible[1].detail,'До 28 сентября');
 const restricted=factsFor({includesBreakfast:false,freeCancellation:false,refundable:false,requiresPrepayment:true,changesAllowed:false});
 assert.deepEqual(plain(restricted.map(f=>f.title)),['Без питания','Без возврата','Оплата при бронировании','Без изменений']);
 assert.equal(factsFor({refundable:true,freeCancellation:false})[1].title,'Отмена со штрафом');
});
