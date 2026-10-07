import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const {KeysIdeas:k,keysInitialState}=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
function initial(){const s=keysInitialState();return {...s,ideas:k.initial('couple',10),navigation:{...s.navigation,screen:{type:'ideas'}}};}
test('advice engine advances cards and asks budget after three answers',()=>{let s=initial();for(let i=0;i<3;i++){const id=s.ideas.current.id;s=k.reduce(s,{type:'IDEAS_ANSWER',id,liked:true});assert.ok(s.ideas.likes.includes(id));}assert.equal(s.ideas.current.type,'ask');assert.equal(s.ideas.current.id,'budget');s=k.reduce(s,{type:'IDEAS_ASK',id:'budget',value:'6000'});assert.equal(s.ideas.answers.budget,'6000');assert.notEqual(s.ideas.current.id,'budget');});
test('changing company removes incompatible adult-only wishes',()=>{let s=initial();s=k.reduce(s,{type:'IDEAS_TOGGLE',id:'adults'});s=k.reduce(s,{type:'IDEAS_COMPANY',company:'kids'});assert.ok(!s.ideas.likes.includes('adults'));assert.ok(s.ideas.note.text.includes('Убрали'));});
test('ranking honors required amenities and separates compromises',()=>{let s=initial();s=k.reduce(s,{type:'IDEAS_WISH',likes:['hammam','pool'],answers:{}});const result=k.rank(s.ideas,s.search,0);assert.ok(result.fitting.length>0);assert.ok(result.others.length>0);assert.ok(result.fitting.every(h=>h.spa&&h.pool));assert.ok(k.reasons(result.fitting[0],s.ideas,s.search).length>=2);s=k.reduce(s,{type:'IDEAS_DROP',id:'hammam'});assert.ok(k.rank(s.ideas,s.search).fitting.length>=result.fitting.length);});
test('seasons, free-text wishes and no-match fallback remain available',()=>{assert.ok(k.locked(k.get('ski'),10));assert.equal(k.locked(k.get('ski'),1),null);assert.deepEqual(k.parse('Хочу спа, бассейн и парковку').likes,['hammam','pool','car']);let s=initial();s=k.reduce(s,{type:'IDEAS_WISH',likes:['adults','kidsclub'],answers:{budget:'6000'}});const result=k.rank(s.ideas,s.search);assert.ok(result.fitting.length+result.others.length>0);});
test('match badge counts all preferences and excludes uncertain features and budget',()=>{const s=initial();const hotel={...k.rank(s.ideas,s.search).fitting[0],spa:true,pool:true,beach:true,quiet:true,parking:true,seaDistance:50};const ideas={...s.ideas,likes:['hammam','pool','beach','sleep','car','breakfast','yoga'],answers:{budget:'8000'}};assert.deepEqual(k.matches(hotel,ideas),{matched:5,total:7});assert.deepEqual(k.matches(hotel,{...ideas,likes:[]}),{matched:0,total:0});});
test('advice keeps the chosen city for matches and compromise hotels',()=>{
 let s=initial();s=k.reduce(s,{type:'IDEAS_DESTINATION',city:'Москва'});
 const result=k.rank(s.ideas,s.search);
 assert.ok(result.fitting.length+result.others.length>0);
 assert.ok([...result.fitting,...result.others].every(h=>h.city==='Москва'));
 s=k.reduce(s,{type:'IDEAS_WISH',likes:['pool','hammam'],answers:{}});
 const strict=k.rank(s.ideas,s.search);
 assert.equal(strict.fitting.length,0);
 assert.ok(strict.others.every(h=>h.city==='Москва'));
});
test('any-city advice searches across the catalogue without Sochi location promises',()=>{
 let s=initial();s=k.reduce(s,{type:'IDEAS_WISH',likes:['cable','hammam'],answers:{}});
 s=k.reduce(s,{type:'IDEAS_DESTINATION',city:'*'});
 assert.ok(!s.ideas.likes.includes('cable'));assert.ok(s.ideas.likes.includes('hammam'));
 const result=k.rank(s.ideas,s.search),cities=new Set([...result.fitting,...result.others].map(h=>h.city));
 assert.ok(cities.has('Сочи'));assert.ok(cities.has('Москва'));assert.equal(s.ideas.district,null);
 for(let i=0;i<15&&s.ideas.current.type!=='end';i++){
  const step=s.ideas.current;
  assert.notEqual(step.type,'where');
  if(step.type==='ask')s=k.reduce(s,{type:'IDEAS_ASK',id:step.id,value:step.id==='budget'?'any':'no'});
  else{assert.notEqual(k.get(step.id).kind,'out');s=k.reduce(s,{type:'IDEAS_ANSWER',id:step.id,liked:true});}
 }
});
test('unknown cities stay empty and destination switching preserves common wishes',()=>{
 let s=initial();s=k.reduce(s,{type:'IDEAS_WISH',likes:['hammam','cable'],answers:{}});
 s=k.reduce(s,{type:'IDEAS_DISTRICT',district:'polyana'});
 s=k.reduce(s,{type:'IDEAS_DESTINATION',city:'Неизвестный город'});
 assert.deepEqual(k.rank(s.ideas,s.search),{fitting:[],others:[]});assert.equal(s.ideas.district,null);
 assert.deepEqual(s.ideas.likes,['hammam']);
 s=k.reduce(s,{type:'IDEAS_DESTINATION',city:'Сочи'});assert.ok(k.rank(s.ideas,s.search).fitting.length>0);
});

test('destination confirmation preserves entry mode and excludes seaside questions in Moscow',()=>{
 for(const mode of ['feed','topics']){
  let s=initial();s=k.reduce(s,{type:'IDEAS_DESTINATION',city:'Москва'});
  s=k.reduce(s,{type:'IDEAS_START',mode});
  assert.equal(s.ideas.mode,mode);assert.equal(s.ideas.destination,'Москва');
  assert.ok(!k.destinationAllowed(k.get('breakfast'),s.ideas));
  assert.ok(!k.destinationAllowed(k.get('beach'),s.ideas));
  assert.ok(k.destinationAllowed(k.get(s.ideas.current.id),s.ideas));
 }
});
