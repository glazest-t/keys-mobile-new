/* Shared by the host and chat runtime; delivered system pushes persist locally. */
(() => {
 const key='keys-system-notifications-v1';
 function createInbox({storage,now=()=>new Date().toISOString(),notify=()=>{}}={}){
  let memory=[];
  const read=()=>{try{const saved=JSON.parse(storage?.getItem(key)||'null');if(Array.isArray(saved))memory=saved.filter(x=>x&&typeof x.id==='string'&&Number.isFinite(Date.parse(x.receivedAt)));}catch{}return memory.map(x=>({...x}));};
  const write=items=>{memory=items;try{storage?.setItem(key,JSON.stringify(items));}catch{}notify();};
  return {list:()=>read().sort((a,b)=>Date.parse(b.receivedAt)-Date.parse(a.receivedAt)),receive(id){const entry={id,receivedAt:now(),readAt:null};write([entry,...read().filter(x=>x.id!==id)]);},markRead(id){write(read().map(x=>x.id===id?{...x,readAt:x.readAt||now()}:x));},markAllRead(){write(read().map(x=>({...x,readAt:x.readAt||now()})));}};
 }
 let storage;try{storage=globalThis.localStorage;}catch{}
 globalThis.KeysSystemInbox={...createInbox({storage,notify:()=>globalThis.dispatchEvent?.(new Event('keys-system-notifications-change'))}),key,createInbox};
})();
