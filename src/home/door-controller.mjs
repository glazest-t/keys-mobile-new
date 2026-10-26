// One request at a time; late replies cannot reopen an abandoned stay.
export function createDoorController({request,onChange,setTimer=setTimeout,clearTimer=clearTimeout,timeout=10000,successDuration=6000}){
 let state='idle',version=0,abort=null,resetTimer=null;
 const change=value=>{state=value;onChange(value);};
 return {
  get state(){return state;},
  async open(){
   if(state==='opening'||state==='success')return;
   const current=++version;
   abort=new AbortController();const signal=abort.signal;
   change('opening');
   let deadline;
   try{
    const result=await Promise.race([
     Promise.resolve().then(()=>request({signal})),
     new Promise((_,reject)=>{deadline=setTimer(()=>reject(new Error('timeout')),timeout);})
    ]);
    if(current!==version)return;
    if(result?.opened!==true)throw new Error('not-opened');
    change('success');
    resetTimer=setTimer(()=>{if(current===version)change('idle');},successDuration);
   }catch{
    if(current===version)change('error');
   }finally{
    clearTimer(deadline);
    if(current===version){abort?.abort();abort=null;}
   }
  },
  reset(){version++;abort?.abort();abort=null;clearTimer(resetTimer);change('idle');}
 };
}
