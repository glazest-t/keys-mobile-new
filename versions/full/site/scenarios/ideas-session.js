/* A paused questionnaire is independent of ordinary search and text requests. */
(() => {
 const currentKey='keys-ideas-v1',draftKey='keys-ideas-questionnaire-v1';
 const stages=['destination','city','company','choose','where','results'];
 const valid=model=>!!model&&stages.includes(model.stage)&&Array.isArray(model.ideas?.likes)&&!!model.ideas?.current;
 const read=(key=currentKey,storage=globalThis.sessionStorage)=>{
  try{const model=JSON.parse(storage.getItem(key));return valid(model)?model:null;}catch{return null;}
 };
 const questionnaire=(storage=globalThis.sessionStorage)=>{
  const draft=read(draftKey,storage),previous=read(currentKey,storage);
  return draft||(previous?.entry!=='request'?previous:null);
 };
 const save=(model,storage=globalThis.sessionStorage)=>{
  if(!valid(model))return;
  try{storage.setItem(currentKey,JSON.stringify(model));if(model.entry!=='request')storage.setItem(draftKey,JSON.stringify(model));}catch{}
 };
 const initial=({screen={},fresh,embedded=false,saved=read(),draft=questionnaire()})=>{
  if(screen.keysIdeasResume){
   if(draft)return {...draft,entryId:screen.keysIdeasEntry};
   return initial({screen:{keysStartMode:'feed',keysIdeasEntry:screen.keysIdeasEntry},fresh,saved:null,draft:null});
  }
  if(screen.keysStartMode||embedded){
   if(screen.keysIdeasEntry&&saved?.entryId===screen.keysIdeasEntry)return saved;
   return {ideas:draft?.ideas||fresh,entry:'questionnaire',entryId:screen.keysIdeasEntry,stage:'destination',destinationReturn:'choose',pendingAction:{type:'IDEAS_START',mode:screen.keysStartMode||'feed',like:screen.keysStartLike}};
  }
  return saved||{ideas:fresh,entry:'questionnaire',stage:'destination',pendingAction:{type:'IDEAS_START',mode:'feed'}};
 };
 globalThis.KeysIdeasSession={currentKey,draftKey,valid,read,questionnaire,save,initial};
})();
