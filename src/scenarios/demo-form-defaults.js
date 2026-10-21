/* Prototype convenience: seed empty surname/email fields once when they mount.
   Existing values and subsequent user edits (including clearing) are preserved. */
(() => {
 const defaults={lastName:'Глазырина',email:'test@example.com'};
 const handled=new WeakSet(),queued=new Set();let frame=0;
 const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
 function kind(input){
  if(!(input instanceof HTMLInputElement)||input.disabled||input.readOnly||['hidden','password'].includes(input.type))return null;
  // The optional second guest must stay empty until the user adds their details.
  if(input.closest('.keys-guest-editor')||input.closest('.kpf')||/^Второй гость(?:\s|$)/i.test(input.getAttribute('aria-label')||''))return null;
  const name=input.name.toLowerCase(),autocomplete=input.autocomplete.split(/\s+/);
  if(input.type==='email'||name==='email'||autocomplete.includes('email'))return 'email';
  if(['lastname','last_name','surname'].includes(name)||autocomplete.includes('family-name'))return 'lastName';
  const label=(input.getAttribute('aria-label')||'')+' '+Array.from(input.labels||[],el=>el.textContent).join(' ');
  return /фамилия/i.test(label)?'lastName':/^(?:\s*)(?:email|e-mail|электронная почта|рабочий email)\s*$/i.test(label)?'email':null;
 }
 function drain(){
  frame=0;const input=queued.values().next().value;if(!input)return;queued.delete(input);
  if(input.isConnected&&!handled.has(input)){
   handled.add(input);const key=kind(input);
   if(key&&!input.value.trim()){
    // A native setter + bubbling input updates controlled React fields as well.
    setter.call(input,defaults[key]);input.dispatchEvent(new Event('input',{bubbles:true}));
   }
  }
  // Allow a controlled form to commit each edit before seeding the next field.
  if(queued.size)frame=requestAnimationFrame(drain);
 }
 function enqueue(input){if(!handled.has(input)&&kind(input)){queued.add(input);if(!frame)frame=requestAnimationFrame(drain);}}
 function scan(root){if(root instanceof HTMLInputElement)enqueue(root);root.querySelectorAll?.('input').forEach(enqueue);}
 document.addEventListener('input',event=>{if(event.isTrusted&&event.target instanceof HTMLInputElement)handled.add(event.target);},true);
 scan(document);
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(scan))).observe(document.documentElement,{childList:true,subtree:true});
})();
