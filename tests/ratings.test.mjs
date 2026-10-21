import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');

test('catalogue and all seeded reviews use five points; hotel stars stay independent',()=>{
 const state=e.keysInitialState();
 assert.equal(e.hotel('more').rating,'4,7');
 assert.equal(e.hotel('more').stars,5);
 assert.equal(e.hotel('quiet-coast').stars,4);
 for(const hotel of e.hotels){
  assert.ok(Number(hotel.rating.replace(',','.'))<=5,hotel.id);
  const {reviews,months}=e.hotelReviews(hotel);
  assert.ok(reviews.length>0);
  for(const {score} of [...reviews,...months])assert.ok(score>0&&score<=5,hotel.id+' '+score);
 }
 assert.ok(state.social.reviews.length>0);
 assert.ok(state.social.reviews.every(review=>review.score>0&&review.score<=5));
 assert.equal(e.keysFivePointRating(10),5);
 assert.equal(e.keysFivePointRating('9,4'),4.7);
 assert.equal(e.keysFivePointRating('9,3'),4.7);
 assert.equal(e.keysRatingText(5),'5');
 assert.equal(e.keysRatingText(4.7),'4,7');
 assert.equal(e.ratingLabel('4,7'),'Отлично');
 assert.equal(e.ratingLabel('4,3'),'Очень хорошо');
});

test('review sorting uses converted numeric scores in both directions',()=>{
 const reviews=e.hotelReviews(e.hotel('more')).reviews;
 for(const sort of ['high','low']){
  const sorted=e.sortReviews(reviews,'all',sort);
  assert.equal(sorted.length,reviews.length);
  assert.ok(sorted.every((review,index)=>!index||(sort==='high'?sorted[index-1].score>=review.score:sorted[index-1].score<=review.score)));
 }
});

test('saving a new five-star review keeps the same score in shared recommendations',()=>{
 const base=e.keysInitialState();
 for(const rating of [1,3,5]){
  let state={...base,booking:{...base.booking,checkedOut:true},ui:{...base.ui,reviewTrigger:'after'}};
  state=e.reducer(state,{type:'REVIEW_SAVE',review:{rating,text:'Отзыв',privateNote:'',photos:[],recommendToFriends:true},now:Date.parse('2026-09-20')});
  assert.equal(state.booking.reviews.after.rating,rating);
  assert.equal(state.social.reviews.find(review=>review.id==='my-review-'+state.booking.id).score,rating);
 }
});
