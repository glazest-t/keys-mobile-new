import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../src/sections/find-results.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(code,context);
test('hotel location chooses sea for resorts and center for cities without inventing missing distances',()=>{
 const label=context.keysHotelLocation;
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:100,centerDistance:2500}),'Сочи · 100 м до моря');
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:1400}),'Сочи · 1,4 км до моря');
 assert.equal(label('Москва',{city:'Москва',seaDistance:null,centerDistance:2200}),'Москва · 2,2 км до центра');
 assert.equal(label('Москва',{centerDistance:0}),'Москва · 0 м до центра');
 assert.equal(label('Сочи',{city:'Сочи',seaDistance:null,centerDistance:2200}),'Сочи');
 assert.equal(label('Москва',{centerDistance:NaN}),'Москва');
});
test('quick filters toggle independently and four-star range replaces five-star constraint',()=>{
 const toggle=context.keysQuickFilters;
 assert.deepEqual(Array.from(toggle(['Со спа'],'С бассейном')),['Со спа','С бассейном']);
 assert.deepEqual(Array.from(toggle(['Со спа','С бассейном'],'Со спа')),['С бассейном']);
 assert.deepEqual(Array.from(toggle(['5 звёзд','С завтраком'],'От 4 звёзд')),['С завтраком','От 4 звёзд']);
});
test('map collapses on a deliberate upward swipe, not a tap or horizontal/downward movement',()=>{
 const swipe=context.keysIsMapCollapseSwipe,start={x:100,y:200};
 assert.equal(swipe(start,{x:105,y:140}),true);
 for(const end of [{x:100,y:195},{x:160,y:190},{x:100,y:260},{x:180,y:145}])assert.equal(swipe(start,end),false);
 assert.equal(swipe(null,{x:100,y:100}),false);
});
test('search sorting uses displayed total, supports both price directions and keeps unknown prices last',()=>{
 context.tx=(hotel,search,tick)=>({total:hotel.total+tick});
 const hotels=[{id:'a',total:300,stars:3},{id:'b',total:100,stars:5},{id:'c',total:200,stars:4},{id:'d',total:NaN}];
 const ids=sort=>Array.from(context.keysSortHotels(hotels,{sort},20),hotel=>hotel.id);
 assert.deepEqual(ids('price'),['b','c','a','d']);
 assert.deepEqual(ids('price-desc'),['a','c','b','d']);
 assert.deepEqual(ids('stars-desc'),['b','c','a','d']);
 assert.deepEqual(ids('recommended'),['a','b','c','d']);
 assert.deepEqual(hotels.map(hotel=>hotel.id),['a','b','c','d']);
});
test('district filter derives districts from the selected city, combines with filters and can be cleared',()=>{
 const hotels=[{city:'Сочи',area:'Центр',id:1},{city:'Сочи',district:'Бытха',area:'other',id:2},{city:'Сочи',area:'Центр',id:3},{city:'Москва',area:'Арбат',id:4}];
 assert.deepEqual(Array.from(context.keysDistrictOptions(hotels,'Сочи')),['Бытха','Центр']);
 assert.deepEqual(Array.from(context.keysDistrictOptions(hotels,'')),[]);
 const search={city:'Сочи',filters:['Со спа']};
 search.filters=context.keysSetDistrict(search,'Центр');
 assert.deepEqual(Array.from(search.filters),['Со спа','Район: Сочи · Центр']);
 assert.deepEqual(Array.from(context.keysFilterDistrict(hotels,search),hotel=>hotel.id),[1,3]);
 assert.equal(context.keysDistrictValue({...search,city:'Москва'}),'');
 assert.deepEqual(Array.from(context.keysSetDistrict(search,'')),['Со спа']);
 assert.deepEqual(Array.from(context.keysSetDistrict(search,'Бытха')),['Со спа','Район: Сочи · Бытха']);
});
test('nightly price bounds preserve other filters, round-trip, and replace presets',()=>{
 const f=context.keysSetNightlyPrice(['Со спа','До 6 000 ₽/ночь'],5000,8000);
 assert.equal(f.length,2);
 assert.equal(f[0],'Со спа');
 assert.equal(context.keysNightlyPriceRange(f).min,5000);
 assert.equal(context.keysNightlyPriceRange(f).max,8000);
 assert.deepEqual(Array.from(context.keysSetNightlyPrice(f,null,null)),['Со спа']);
 assert.equal(context.keysNightlyPriceRange(context.keysSetNightlyPrice(f,'',9000)).min,null);
 assert.equal(context.keysNightlyPriceRange(context.keysSetNightlyPrice(f,4000,'')).max,null);
});
test('nightly filtering includes boundary prices and handles one-sided, empty and reversed ranges',()=>{
 const set=(min,max)=>context.keysSetNightlyPrice([],min,max),match=context.keysNightlyPriceMatches;
 assert.equal(match(5000,set(5000,8000)),true);
 assert.equal(match(8000,set(5000,8000)),true);
 assert.equal(match(4999,set(5000,8000)),false);
 assert.equal(match(8001,set(5000,8000)),false);
 assert.equal(match(10000,set(5000,null)),true);
 assert.equal(match(1000,set(null,5000)),true);
 assert.equal(match(6000,set(8000,5000)),false);
 assert.equal(match(NaN,set(5000,8000)),false);
 assert.equal(match(100000,[]),true);
 assert.equal(match(1,set(null,0)),false);
});

test('nightly slider prevents crossed bounds, supports unlimited maximum and preserves other filters',()=>{
 const read=context.keysNightlyPriceRange,move=context.keysMoveNightlySlider;
 let filters=move(['Со спа'],'max',8000,30000);
 assert.equal(read(filters).max,8000);
 filters=move(filters,'min',10000,30000);
 assert.equal(read(filters).min,8000);
 assert.equal(read(filters).max,8000);
 assert.ok(filters.includes('Со спа'));
 filters=move(filters,'max',30000,30000);
 assert.equal(read(filters).max,null);
 filters=move(filters,'min',0,30000);
 assert.deepEqual(Array.from(filters),['Со спа']);
 const bounds=context.keysNightlySliderBounds(context.keysSetNightlyPrice([],120000,250000));
 assert.equal(bounds.limit,250000);
 assert.equal(bounds.high,250000);
});


test('star sorting uses hotel classification, includes zero and keeps unknown values last',()=>{
 const hotels=[{id:'a',rating:'4,5',stars:5},{id:'b',rating:'5',stars:2},{id:'c',rating:0,stars:0},{id:'d',rating:5},{id:'e',rating:'4.5',stars:2},{id:'f',stars:null}];
 const ids=sort=>Array.from(context.keysSortHotels(hotels,{sort}),hotel=>hotel.id);
 assert.deepEqual(ids('stars-desc'),['a','b','e','c','d','f']);
 assert.deepEqual(ids('stars-asc'),['c','b','e','a','d','f']);
 assert.deepEqual(ids('rating-desc'),ids('stars-desc'));
 assert.deepEqual(ids('rating-asc'),ids('stars-asc'));
 assert.deepEqual(ids('recommended'),['a','b','c','d','e','f']);
 assert.deepEqual(hotels.map(hotel=>hotel.id),['a','b','c','d','e','f']);
});
test('best reviews prioritizes guest score then number of reviews for equal scores',()=>{
 context.Zc=hotel=>({reviews:Array(hotel.reviewCount||0).fill({})});
 const hotels=[{id:'a',rating:'4,5',reviewCount:100},{id:'b',rating:'4,9',reviewCount:3},{id:'c',rating:'4,9',reviewCount:20},{id:'d',rating:null,reviewCount:200}];
 assert.deepEqual(Array.from(context.keysSortHotels(hotels,{sort:'reviews-desc'}),hotel=>hotel.id),['c','b','a','d']);
});

test('new filter groups use OR within categories and AND across categories',()=>{
 const match=context.keysHotelFiltersMatch;
 const hotel={name:'Cosmos Сочи',stars:4,breakfast:true,pool:true,parking:true};
 assert.equal(match(hotel,['Звёздность объекта: 3 звезды','Звёздность объекта: 4 звезды','Сеть отеля: Cosmos Hotel Group']),true);
 assert.equal(match(hotel,['Звёздность объекта: 5 звёзд','Сеть отеля: Cosmos Hotel Group']),false);
 assert.equal(match(hotel,['Общие удобства: Бассейн','Общие удобства: Спа']),false);
 assert.equal(match(hotel,['Тип размещения: Квартира']),false);
 assert.equal(match({...hotel,stars:0},['Звёздность объекта: Без звёзд']),true);
 assert.equal(match({...hotel,filterFacets:{type:'Квартира',meals:['Собственная кухня']}},['Тип размещения: Квартира','Питание: Собственная кухня']),true);
});
test('room counters clamp, reset independently and filter by minimum inventory',()=>{
 let filters=context.keysSetHotelFilterCounter(['Общие удобства: Бассейн'],'Спальни',2);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo'},filters),false);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',pool:true,filterFacets:{bedrooms:3}},filters),true);
 filters=context.keysSetHotelFilterCounter(filters,'Кровати',99);
 assert.equal(context.keysHotelFilterCounter(filters,'Кровати'),10);
 filters=context.keysSetHotelFilterCounter(filters,'Спальни',-1);
 assert.equal(context.keysHotelFilterCounter(filters,'Спальни'),0);
 assert.ok(filters.includes('Общие удобства: Бассейн'));
});
test('legacy quick filters migrate without leaving invisible duplicate restrictions',()=>{
 const filters=context.keysNormalizeHotelFilters(['От 4 звёзд','С завтраком','Со спа']);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',stars:4,breakfast:true,spa:true},filters),true);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',stars:3,breakfast:true,spa:true},filters),false);
 assert.ok(filters.includes('Питание: Завтрак включён'));
 assert.equal(filters.length,4);
});

test('result quick filters remove canonical choices from the full filter page',()=>{
 assert.deepEqual(Array.from(context.keysToggleResultsFilter(['Общие удобства: Спа','Тип размещения: Гостиница'],'Со спа')),['Тип размещения: Гостиница']);
 assert.deepEqual(Array.from(context.keysToggleResultsFilter(['С завтраком'],'С завтраком')),[]);
 assert.deepEqual(Array.from(context.keysToggleResultsFilter(['Звёздность объекта: 4 звезды','Звёздность объекта: 5 звёзд'],'От 4 звёзд')),[]);
});

test('stay price range round-trips, keeps other filters and migrates nightly limits using trip duration',()=>{
 const filters=context.keysSetStayPrice(['Со спа'],20000,40000);
 assert.equal(context.keysStayPriceRange(filters).min,20000);
 assert.equal(context.keysStayPriceRange(filters).max,40000);
 assert.equal(context.keysStayPriceMatches(40000,filters),true);
 assert.equal(context.keysStayPriceMatches(40001,filters),false);
 assert.equal(context.keysStayPriceMatches(8000,filters),false);
 context.Ge=()=>4;
 const migrated=context.keysNormalizeHotelFilters(['От 5 000 до 10 000 ₽/ночь'],{arrival:'2026-10-01',departure:'2026-10-05'});
 assert.equal(context.keysStayPriceRange(migrated).min,20000);
 assert.equal(context.keysStayPriceRange(migrated).max,40000);
 assert.ok(migrated.every(value=>!value.includes('/ночь')));
});

test('price period title uses trip nights and Russian day endings',()=>{
 for(const [nights,label] of [[1,'день'],[2,'дня'],[4,'дня'],[5,'дней'],[11,'дней'],[21,'день'],[22,'дня']])assert.equal(context.keysPricePeriodTitle(nights),'Цена за '+nights+' '+label);
 assert.equal(context.keysPricePeriodTitle(4,true),'Цена за ночь');
});
test('switching price units converts both bounds and preserves other choices',()=>{
 const stay=context.keysSetStayPrice(['Тип размещения: Гостиница'],20000,40000);
 const nightly=context.keysConvertPricePeriod(stay,true,4);
 assert.equal(context.keysNightlyPriceRange(nightly).min,5000);
 assert.equal(context.keysNightlyPriceRange(nightly).max,10000);
 assert.equal(context.keysStayPriceRange(nightly).max,null);
 assert.deepEqual(Array.from(context.keysConvertPricePeriod(nightly,false,4)),Array.from(stay));
 const oneSided=context.keysConvertPricePeriod(context.keysSetStayPrice([],null,40000),true,4);
 assert.equal(context.keysNightlyPriceRange(oneSided).min,null);
 assert.equal(context.keysNightlyPriceRange(oneSided).max,10000);
 assert.deepEqual(Array.from(context.keysConvertPricePeriod([],true,4)),[]);
 context.Ge=()=>4;
 assert.deepEqual(Array.from(context.keysNormalizeHotelFilters(nightly,{keysPricePerNight:true})),Array.from(nightly));
});

test('smoking suitability requires explicit permission and combines with other requirements',()=>{
 const filters=['Возможности бронирования: Можно курить'];
 assert.equal(context.keysHotelFiltersMatch({name:'Demo'},filters),false);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',smokingAllowed:false},filters),false);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',smokingAllowed:true},filters),true);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',smokingAllowed:true},[...filters,'Возможности бронирования: Можно с питомцем']),false);
 assert.equal(context.keysHotelFiltersMatch({name:'Demo',smokingAllowed:true,pets:true},[...filters,'Возможности бронирования: Можно с питомцем']),true);
});
