import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/booking/details-view.js';
import '../src/booking/documents-model.js';
const documents=globalThis.KeysBookingDocuments;
const host={id:'MD-120926',hotel:'Maidens Hotel',guest:'Татьяна Глазырина',arrival:'2026-09-12',departure:'2026-09-19',room:'Премиум Кинг',party:'1 взр.',status:'Поездка завершена',roomTotal:56000,paid:56480,services:[{title:'Сырники со сметаной',price:480},{title:'Трансфер',price:2500,state:'pending'}]};
test('completed documents use the same confirmed services as the booking account',()=>{
 const docs=documents.list(host),service=docs.find(d=>d.id==='services');
 assert.equal(service.title,'Чек за услуги');
 assert.ok(service.rows.some(([key])=>key==='Сырники со сметаной'));
 assert.ok(!service.rows.some(([key])=>key==='Трансфер'));
 assert.equal(service.copy,globalThis.KeysBookingDetails.account(host).servicesTotal.toLocaleString('ru-RU')+' ₽');
});
test('history documents remain scoped to the selected hotel, dates and amount',()=>{
 const other={...host,id:'sochi-2026',hotel:'Swissôtel Камелия',arrival:'2026-06-01',departure:'2026-06-08',roomTotal:98000,paid:98000,services:[]};
 const docs=documents.list(other),html=documents.html(other,docs[0]);
 assert.equal(docs.length,2);assert.match(html,/Swissôtel Камелия/);assert.match(html,/sochi-2026/);assert.doesNotMatch(html,/Maidens|Сырники|сент/);
 assert.match(html,/98\s000/);
});
test('outstanding service charges remain an invoice regardless of scenario',()=>{
 const doc=documents.list({...host,paid:56000}).find(d=>d.id==='services');
 assert.equal(doc.title,'Счёт за услуги');assert.equal(doc.rows.at(-1)[1],'Есть неоплаченные услуги');
 assert.ok(!documents.list({...host,paid:0,services:[]}).some(d=>d.id==='room'));
});
test('downloaded documents escape booking data and identify prototype samples',()=>{
 const b={...host,hotel:'<script>bad()</script>',guest:'<img src=x>',services:[]};
 const html=documents.html(b,documents.list(b)[0]);
 assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|<img/);assert.match(html,/Образец документа прототипа/);
});
