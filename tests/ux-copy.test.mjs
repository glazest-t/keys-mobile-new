import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'acorn';
import {copyLiteral,guestText} from '../src/copy/tone-of-voice.mjs';
import {rewriteJS,rewriteHTML,rewriteCSS,walk} from '../scripts/ux-copy-source.mjs';

test('guest terminology preserves grammatical case and payment truth',()=>{
 for(const [a,b] of [['Детали брони','Детали брони'],['Детали бронирования','Детали брони'],['Бронь подтверждена','Бронирование подтверждено'],['Бронь отменена','Бронирование отменено'],['Оплата в отеле','Оплата на месте'],['Ранний заезд','Заехать раньше'],['Поздний выезд','Остаться дольше'],['Добавлен за доплату','Оплата отдельно'],['Услуги отеля','Услуги'],['Найти отель','Найти жильё']])assert.equal(guestText(a),b);
 assert.equal(guestText('Оплата при заселении'),'Оплата при заселении');
 assert.equal(guestText('Оплата при выезде'),'Оплата при выезде');
 assert.equal(guestText('Всё оплачено'),'Всё оплачено');
 assert.equal(guestText('Открыть детали бронирования'),'Открыть детали брони');
 assert.equal(guestText('Открыть детали брони'),'Открыть детали брони');
 assert.equal(guestText('1 взр.'),'1 гость');
 assert.equal(guestText('2 взр.'),'2 взрослых');
});
test('names, links and typed guest content are not editorially rewritten',()=>{
 assert.equal(guestText('Сочи Парк Отель'),'Сочи Парк Отель');
 assert.equal(guestText('https://example.org/Отель'),'https://example.org/Отель');
 const source='const a={sender:"user",text:"Отлично! Люблю этот отель"};const b={author:"Анна",score:5,text:"Я была в отеле!"};const c={id:"Ранний заезд",text:"Ранний заезд"};';
 const result=rewriteJS(source,copyLiteral);
 assert.match(result,/text:"Отлично! Люблю этот отель"/);
 assert.match(result,/text:"Я была в отеле!"/);
 assert.match(result,/id:"Ранний заезд"/);
 assert.match(result,/text:"Заехать раньше"/);
});
test('HTML and literal selectors stay in sync without changing functions or numbers',()=>{
 const source='<button data-open="Поздний выезд" aria-label="Детали брони">Поздний выезд</button><script>if(!ready){open("Поздний выезд")}const price=1500;</script>';
 const result=rewriteHTML(source,copyLiteral);
 assert.match(result,/data-open="Остаться дольше"/);
 assert.match(result,/aria-label="Детали брони"/);
 assert.match(result,/>Остаться дольше<\/button>/);
 assert.match(result,/if\(!ready\)\{open\("Остаться дольше"\)\}const price=1500/);
});
test('interpolated HTML, Cyrillic names and punctuation survive JavaScript parsing',()=>{
 const source='const label=`<b>Детали брони</b><span>${n} ночей · ${price} ₽</span>`;';
 const result=rewriteJS(source,copyLiteral);
 assert.match(result,/Детали брони/);assert.match(result,/\$\{price\}/);
 assert.doesNotThrow(()=>parse(result,{ecmaVersion:'latest'}));
 assert.equal(guestText('Ваш счет готов!'),'ваш счёт готов');
 assert.equal(guestText('Спасибо! Продолжайте.'),'Спасибо. Продолжайте');
 assert.equal(guestText('По брони требуется оплата.'),'По бронированию требуется оплата');
 assert.equal(guestText('Добавьте услуги к поездке в Maidens Hotel.'),'Добавьте услуги к поездке в Maidens Hotel');
 assert.equal(copyLiteral('·'),'•');
 assert.equal(copyLiteral(' · '),' • ');
 assert.equal(guestText('Лучшие цены напрямую от отелей'),'Лучшие цены напрямую от отелей');
 for(const range of ['от 5 до 0','от 0 до 5']){
  const title=`Звёздность отеля (${range})`;
  assert.equal(guestText(`Звездность отеля (${range})`),title);
  assert.equal(guestText(title),title);
 }
});
test('shared source and its revised strings are idempotent',async()=>{
 for(const file of ['../src/scenarios/auth.js','../src/profile/profile.js','../src/booking/services.js','../src/sections/notification-center.js']){
  const source=await readFile(new URL(file,import.meta.url),'utf8');
  const result=rewriteJS(source,copyLiteral);
  assert.equal(rewriteJS(result,copyLiteral),result,file);
 }
});
test('CSS text selectors follow renamed UI labels without altering declarations',()=>{
 const css='[data-screen-type="chat"] [aria-label^="Переписка с отелем"]{flex:1;min-height:0}';
 const result=rewriteCSS(css,copyLiteral);
 assert.equal(result,`[data-screen-type="chat"] [aria-label^="${guestText('Переписка с отелем')}"]{flex:1;min-height:0}`);
 assert.equal(rewriteHTML(`<style>${css}</style>`,copyLiteral),`<style>${result}</style>`);
});
test('copy rewrite changes only string values in the application AST',async()=>{
 const source=await readFile(new URL('../src/scenarios/late-checkout.js',import.meta.url),'utf8');
 const shape=s=>{
  const tree=parse(s,{ecmaVersion:'latest',sourceType:'module'});
  walk(tree,node=>{
   delete node.start;delete node.end;
   if(node.type==='Literal'&&typeof node.value==='string'){node.value='COPY';delete node.raw;}
   if(node.type==='TemplateElement')node.value={raw:'COPY',cooked:'COPY'};
  });return tree;
 };
 assert.deepEqual(shape(rewriteJS(source,copyLiteral)),shape(source));
});
