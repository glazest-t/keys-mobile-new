// Six real inputs, with one-time-code autofill and paste distributed across them.
export function distributeOtp(current,index,value){
 const result=Array.from({length:6},(_,i)=>current[i]||'');
 const digits=String(value).replace(/\D/g,'').slice(0,6);
 const start=digits.length===6?0:Math.max(0,Math.min(5,index));
 for(let i=start;i<6&&i-start<digits.length;i++)result[i]=digits[i-start];
 return {digits:result,next:Math.min(5,start+digits.length)};
}
export function bindOtpFields(group,onChange){
 const fields=[...group.querySelectorAll('input')];
 const focus=index=>{fields[index].focus({preventScroll:true});fields[index].select();};
 const write=(index,value)=>{
  const result=distributeOtp(fields.map(field=>field.value.slice(0,1)),index,value);
  fields.forEach((field,i)=>field.value=result.digits[i]);onChange();focus(result.next);
 };
 fields.forEach((field,index)=>{
  field.addEventListener('focus',()=>field.select());
  field.addEventListener('input',()=>{
   const digits=field.value.replace(/\D/g,'');
   if(!digits){field.value='';onChange();return;}
   write(index,digits);
  });
  field.addEventListener('paste',event=>{
   const value=event.clipboardData?.getData('text')||'';
   event.preventDefault();if(/\d/.test(value))write(index,value);
  });
  field.addEventListener('keydown',event=>{
   if(event.key==='Backspace'){
    event.preventDefault();if(field.value){field.value='';}else if(index>0){fields[index-1].value='';focus(index-1);}onChange();
   }else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();focus(Math.max(0,Math.min(5,index+(event.key==='ArrowLeft'?-1:1))));
   }
  });
 });
 return {value:()=>fields.map(field=>field.value).join(''),reset(){fields.forEach(field=>field.value='');focus(0);},focusMissing(){focus(Math.max(0,fields.findIndex(field=>!field.value)));}};
}
