import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import '../src/scenarios/ideas-session.js';
globalThis.document={createElement:()=>({relList:{supports:()=>true}})};
globalThis.PoraDemo={};
const e=createRequire(import.meta.url)('../tmp/sections-engine.cjs');
const session=globalThis.KeysIdeasSession;
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};
const fresh=()=>e.KeysIdeas.initial('solo',10);
const model=stage=>({ideas:{...fresh(),likes:['pool'],destination:'Москва'},stage,entry:'questionnaire',entryId:123,cityDraft:'Москва',topic:'rest',sort:'cheap',text:'Тихий номер'});

test('Find always leaves advice for regular search without discarding search parameters',()=>{
 for(const screen of [{type:'describe'},{type:'hotel',hotelId:'more'},{type:'chat',hotelId:'more'},null]){
  let state=e.keysInitialState();
  state={...state,search:{...state.search,intent:'discover',results:true,city:'Казань',filters:['spa']},navigation:{...state.navigation,screen,history:[{tab:'find',screen:{type:'describe'}}]}};
  const result=e.reducer(state,{type:'NAV_TAB',tab:'find'});
  assert.equal(result.navigation.tab,'find');assert.equal(result.navigation.screen,null);assert.deepEqual(result.navigation.history,[]);
  assert.equal(result.search.intent,'known');assert.equal(result.search.results,false);
  assert.equal(result.search.city,'Казань');assert.deepEqual(result.search.filters,['spa']);assert.deepEqual(result.search.party,state.search.party);
 }
});
test('ordinary search results still survive switching tabs',()=>{
 let state=e.keysInitialState();state={...state,search:{...state.search,intent:'known',results:true}};
 state=e.reducer(state,{type:'NAV_TAB',tab:'chats'});state=e.reducer(state,{type:'NAV_TAB',tab:'find'});
 assert.equal(state.search.results,true);assert.equal(state.search.intent,'known');
});
test('resume restores every questionnaire stage, including typed city and selected topic',()=>{
 for(const stage of ['destination','city','company','choose','where','results']){
  const store=storage(),draft=model(stage);session.save(draft,store);
  const resumed=session.initial({screen:{keysIdeasResume:true,keysIdeasEntry:456},fresh:fresh(),saved:session.read(session.currentKey,store),draft:session.questionnaire(store)});
  assert.deepEqual(resumed,{...draft,entryId:456});
 }
});
test('hotel → Back restores results from the same entry instead of restarting direction questions',()=>{
 const saved=model('results');
 assert.deepEqual(session.initial({screen:{keysStartMode:'feed',keysIdeasEntry:123},fresh:fresh(),saved,draft:saved}),saved);
 const next=session.initial({screen:{keysStartMode:'topics',keysIdeasEntry:456},fresh:fresh(),saved,draft:saved});
 assert.equal(next.stage,'destination');assert.equal(next.pendingAction.mode,'topics');assert.deepEqual(next.ideas.likes,['pool']);
});
test('text requests and ordinary search do not overwrite a paused questionnaire',()=>{
 const store=storage(),draft=model('choose');session.save(draft,store);
 const request={ideas:fresh(),entry:'request',stage:'results',wish:'Нужен спа'};session.save(request,store);
 assert.deepEqual(session.read(session.currentKey,store),request);assert.deepEqual(session.questionnaire(store),draft);
});
test('old questionnaire drafts migrate; text requests, malformed and unavailable storage do not become Continue',()=>{
 const store=storage(),draft=model('company');store.setItem(session.currentKey,JSON.stringify(draft));assert.deepEqual(session.questionnaire(store),draft);
 store.setItem(session.currentKey,JSON.stringify({...draft,entry:'request'}));assert.equal(session.questionnaire(store),null);
 store.setItem(session.currentKey,'broken JSON');assert.equal(session.questionnaire(store),null);
 const unavailable={getItem(){throw Error('disabled')},setItem(){throw Error('disabled')}};
 assert.equal(session.questionnaire(unavailable),null);assert.doesNotThrow(()=>session.save(draft,unavailable));
 const first=session.initial({screen:{keysIdeasResume:true},fresh:fresh(),saved:null,draft:null});assert.equal(first.stage,'destination');
 const stale=session.initial({screen:{keysIdeasResume:true},fresh:fresh(),saved:{...draft,entry:'request'},draft:null});assert.equal(stale.entry,'questionnaire');assert.equal(stale.stage,'destination');
});
test('bottom navigation clears the old host return path before opening a new page',()=>{
 globalThis.window={parent:{postMessage(){}},location:{origin:'http://127.0.0.1:8765'}};
 for(const tab of ['find','chats','trips','bonuses']){
  globalThis.keysHostEntry={kind:'screen',screen:'describe'};
  e.keysRouteToHost({type:'NAV_TAB',tab});assert.equal(globalThis.keysHostEntry,null);
 }
});
