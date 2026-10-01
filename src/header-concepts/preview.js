/* Comparison-only presentation. The live shared header and main application are not modified. */
(() => {
 const frame=document.querySelector('iframe'),choices=[...document.querySelectorAll('[data-variant]')];
 let variant='wordmark',doc=null,header=null,original=null,observer=null;
 const names={wordmark:'Компактное название',symbol:'Только знак',greeting:'Короткое приветствие',current:'Прежняя шапка'};
 const explanations={wordmark:'Для запуска: бренд остаётся узнаваемым, а карточка проживания поднимается выше. Высота шапки — 58 px вместо 71 px.',symbol:'Знак — эскиз, а не утверждённый логотип. Его важно отличать от кнопки электронного ключа: здесь используется сплошной силуэт в фирменной форме.',greeting:'Личное обращение уместнее на главной перед поездкой или при первом входе. Во время проживания полезная информация важнее повторяющегося приветствия.',current:'Крупная надпись занимает визуальный приоритет, хотя гости уже знают, какое приложение открыли.'};
 const mark='<span class="concept-key" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M14 5a7 7 0 1 0 3.9 12.82L22 22v4h4v-4h3v-4h-5l-3.1-3.1A7 7 0 0 0 14 5Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg></span>';
 const css=`
 #keysUnifiedPrototype .keys-app-header[data-concept="current"]{gap:20px;padding:22px 16px 9px;min-height:71px}
 #keysUnifiedPrototype .keys-app-header[data-concept="current"] .keys-app-logo{height:40px;font-size:36px;letter-spacing:-1.7px}
 #keysUnifiedPrototype .keys-app-header[data-concept]:not([data-concept="current"]){min-height:58px;padding-top:8px;padding-bottom:6px;gap:12px}
 #keysUnifiedPrototype .keys-app-header[data-concept]:not([data-concept="current"]) .keys-app-logo{height:44px;min-width:44px;font-size:24px;letter-spacing:-1px;font-weight:600}
 #keysUnifiedPrototype .keys-app-header[data-concept="symbol"] .keys-app-logo{justify-content:flex-start}
 #keysUnifiedPrototype .concept-key{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:var(--color-brand);color:var(--color-on-brand);transform:none}
 #keysUnifiedPrototype .concept-key svg{width:25px;height:25px}
 #keysUnifiedPrototype .concept-greeting{display:flex;flex-direction:column;gap:1px;min-width:0}
 #keysUnifiedPrototype .concept-greeting small{font:400 11px/1.5 var(--font-sans)!important;color:var(--color-muted)!important}
 #keysUnifiedPrototype .concept-greeting strong{font:500 17px/1.25 var(--font-sans)!important;color:var(--color-ink)!important}
 `;
 function apply(){
  document.querySelector('#rationale').textContent=explanations[variant];
  document.querySelector('#preview-name').textContent=names[variant];
  document.querySelector('#dimensions').textContent=(variant==='current'?'71':'58')+' px · шапка';
  choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.variant===variant)));
  if(!header)return;
  header.innerHTML=original;header.dataset.concept=variant;
  const logo=header.querySelector('.keys-app-logo');
  if(variant==='symbol')logo.innerHTML=mark;
  if(variant==='greeting'){const greeting=doc.createElement('div');greeting.className='concept-greeting';greeting.innerHTML='<small>Здравствуйте,</small><strong>Татьяна</strong>';logo.replaceWith(greeting);}
 }
 function ready(){
  doc=frame.contentDocument;header=doc.querySelector('#keysHomeVariantThree .keys-app-header');
  if(!header)return false;
  original=header.innerHTML;
  const style=doc.createElement('style');style.textContent=css;doc.head.append(style);apply();
  return true;
 }
 frame.addEventListener('load',()=>{observer?.disconnect();if(!ready()){observer=new MutationObserver(()=>{if(ready())observer.disconnect()});observer.observe(frame.contentDocument.body,{childList:true,subtree:true})}});
 choices.forEach(b=>b.addEventListener('click',()=>{variant=b.dataset.variant;apply()}));
 document.querySelector('#width').addEventListener('change',e=>document.querySelector('.device').style.width=e.target.value+'px');
 document.querySelector('#reset').addEventListener('click',()=>{header=null;frame.src='./?v=header-concept-preview-1'});
 apply();
})();
