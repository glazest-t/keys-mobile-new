/* Shared phone entry for the host and embedded booking pages, in both brands. */
(() => {
 const digits = value => {
  const raw=String(value||''), numbers=raw.replace(/\D/g,'');
  const prefix=/^\s*\+7/.test(raw)||(numbers.length>10&&/^[78]/.test(numbers));
  return (prefix?numbers.slice(1):numbers).slice(0,10);
 };
 function format(value,local=false){
  const d=digits(value);
  if(!d)return '';
  let result='('+d.slice(0,3);
  if(d.length>=3)result+=') ';
  if(d.length>3)result+=d.slice(3,6);
  if(d.length>6)result+='-'+d.slice(6,8);
  if(d.length>8)result+='-'+d.slice(8,10);
  return (local?'':'+7 ')+result;
 }
 const count=value=>(value.match(/\d/g)||[]).length;
 function caret(value,number,local){
  if(number<=0)return local?1:4;
  let seen=0;
  for(let i=local?0:3;i<value.length;i++)if(/\d/.test(value[i])&&++seen===number){
   let end=i+1;while(end<value.length&&!/\d/.test(value[end]))end++;
   return end;
  }
  return value.length;
 }
 function erase(value,start,end,backward,local=false){
  const skip=local?0:1, d=digits(value);
  let from=Math.max(0,count(value.slice(0,start))-skip),to=Math.max(0,count(value.slice(0,end))-skip);
  if(from===to){if(backward)from=Math.max(0,from-1);else to=Math.min(d.length,to+1);}
  const next=format(d.slice(0,from)+d.slice(to),local);
  return {value:next,caret:Math.min(next.length,caret(next,from,local))};
 }
 const api=globalThis.KeysPhoneMask={digits,format,erase};
 if(typeof document==='undefined')return;
 const selector='input[type="tel"],input[autocomplete="tel"],input[name="phone"],input[data-phone-mask]';
 const isPhone=el=>el instanceof HTMLInputElement&&el.matches(selector)&&!el.readOnly&&!el.disabled;
 const local=el=>!!el.closest('.keys-login-field');
 const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
 function write(el,value,position,notify=false){
  // Native setter leaves React's value tracker intact so its onChange receives the edit.
  setter.call(el,value);
  if(position!==undefined)el.setSelectionRange(position,position);
  if(notify)el.dispatchEvent(new Event('input',{bubbles:true}));
 }
 function prepare(el){
  if(!isPhone(el))return;
  el.inputMode='tel';
  if(!el.autocomplete)el.autocomplete='tel';
  el.placeholder=local(el)?'000 000-00-00':'+7 (999) 000-00-00';
  // A maxlength of 11 on legacy fields would truncate a formatted phone number.
  if(el.maxLength>=0&&el.maxLength<18)el.removeAttribute('maxlength');
 }
 function normalize(el){
  prepare(el);
  const raw=el.value,isLocal=local(el),position=el.selectionStart??raw.length;
  const prefix=/^\s*\+7/.test(raw)||(count(raw)>10&&/^[78]/.test(raw.replace(/\D/g,'')));
  const number=Math.max(0,count(raw.slice(0,position))-(prefix?1:0));
  const next=format(raw,isLocal);
  if(next!==raw)write(el,next,Math.min(next.length,caret(next,number,isLocal)));
 }
 document.addEventListener('input',event=>{if(isPhone(event.target)&&!event.isComposing)normalize(event.target);},true);
 document.addEventListener('focusin',event=>{if(isPhone(event.target))normalize(event.target);},true);
 document.addEventListener('beforeinput',event=>{
  const el=event.target;
  if(!isPhone(el)||!['deleteContentBackward','deleteContentForward'].includes(event.inputType)||!el.value)return;
  event.preventDefault();
  const next=erase(el.value,el.selectionStart,el.selectionEnd,event.inputType==='deleteContentBackward',local(el));
  write(el,next.value,next.caret,true);
 },true);
 document.addEventListener('paste',event=>{
  const el=event.target;if(!isPhone(el))return;
  const text=event.clipboardData?.getData('text')||'';
  if(count(text)<10)return;
  event.preventDefault();const value=format(text,local(el));write(el,value,value.length,true);
 },true);
 const scan=root=>{if(root instanceof HTMLInputElement)prepare(root);root.querySelectorAll?.(selector).forEach(prepare);};
 scan(document);
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan))).observe(document.documentElement,{childList:true,subtree:true});
 api.refresh=el=>{if(isPhone(el))normalize(el);};
})();
