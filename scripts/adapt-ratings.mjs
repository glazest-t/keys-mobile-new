// Convert the imported ten-point seeds once. All application state uses /5;
// hotel stars and the existing five-star review form are independent.
export function adaptRatings(source){
 let js=source;
 const replace=(from,to)=>{if(!js.includes(from))throw Error('Rating integration anchor missing: '+from);js=js.replace(from,to);};
 replace('_n = P6,','_n = P6.map(hotel=>({...hotel,rating:keysRatingText(keysFivePointRating(hotel.rating))})),');
 replace('const GI = zI,','const GI = zI.map(review=>({...review,score:keysFivePointRating(review.score)})),');
 replace('reviews: structuredClone(n_)','reviews: n_.map(review=>({...structuredClone(review),score:keysFivePointRating(review.score)}))');
 replace('score: t.rating * 2','score: t.rating');
 replace('W0 = (e) => e === 10 ? "10" : e.toFixed(1).replace(".", ",")','W0 = keysRatingText');
 replace('e.score.toFixed(1).replace(".", ",")','W0(e.score)');
 replace('return t >= 9 ? "Отлично" : t >= 8 ? "Очень хорошо" : "Хорошо";','return t >= 4.5 ? "Отлично" : t >= 4 ? "Очень хорошо" : "Хорошо";');
 return js+`
function keysFivePointRating(value){
 return Math.round(Number(String(value).replace(',','.'))*5)/10;
}
function keysRatingText(value){
 const rating=Number(String(value).replace(',','.'));
 return rating===5?'5':rating.toFixed(1).replace('.',',');
}
`;
}
