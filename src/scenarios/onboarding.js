import {screens} from './onboarding/screens.js?v=three-stories-2';
import {icon} from './onboarding/icons.js';
const app=document.getElementById('keysUnifiedPrototype');
const root=document.createElement('section');root.id='keysOnboardingPrototype';root.hidden=true;root.setAttribute('aria-label','Онбординг');
root.innerHTML=`<div class="kon-phone"><header class="kon-header"><button type="button" class="kon-back" data-onboard-back aria-label="Предыдущий шаг" hidden>${icon('back')}</button><div class="kon-brand" aria-label="Ключи"><span class="kon-orbit" aria-hidden="true"><i></i></span><img class="kon-wordmark" src="./brand/orbit/logo/keys-wordmark.svg" alt=""></div><button type="button" data-onboard-skip>Пропустить</button></header><main class="kon-stage" aria-label="Знакомство с приложением">${screens.map((s,i)=>`<section class="kon-slide" data-slide="${i}" data-theme="${s.theme}" aria-labelledby="kon-title-${i}"><div class="kon-visual" aria-hidden="true">${s.visual}</div><div class="kon-copy"><span class="kon-eyebrow">${s.eyebrow}</span><h1 id="kon-title-${i}" tabindex="-1">${s.title}</h1><p>${s.body}</p></div></section>`).join('')}</main><footer class="kon-footer"><button type="button" class="kon-primary" data-onboard-next><span data-onboard-label>Дальше</span><span class="kon-progress" data-onboard-progress>1 из ${screens.length}</span></button><button type="button" class="kon-secondary" data-onboard-booking hidden>У меня уже есть бронь</button></footer></div>`;
app.append(root);
const slides=[...root.querySelectorAll('.kon-slide')],phone=root.querySelector('.kon-phone'),skip=root.querySelector('[data-onboard-skip]'),next=root.querySelector('[data-onboard-next]'),booking=root.querySelector('[data-onboard-booking]');
const back=root.querySelector('[data-onboard-back]');
const last=screens.length-1;
let current=0,start=null,ignoreClick=false,splashTimer=0,loading=false;
function show(index,focus=false){
 current=Math.max(0,Math.min(screens.length-1,index));
 root.style.setProperty('--kon-step',current);phone.dataset.last=String(current===last);
 slides.forEach((slide,i)=>{slide.style.setProperty('--kon-offset',i-current);slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current));slide.classList.toggle('is-current',i===current);});
 root.querySelector('[data-onboard-progress]').textContent=`${current+1} из ${screens.length}`;
 skip.hidden=current===last;booking.hidden=current!==last;next.querySelector('[data-onboard-label]').textContent=current===last?'Найти мой отель':'Дальше';
 back.hidden=current===0;
 if(focus)slides[current].querySelector('h1').focus({preventScroll:true});
}
function leave(hasBooking){
 window.KeysScenarios.select(hasBooking?'guest-returning':'search');
 if(!hasBooking)app.dispatchEvent(new CustomEvent('keys-open-hotel-search',{detail:{mode:'advice'}}));
}
back.onclick=()=>show(current-1,true);
skip.onclick=()=>show(last,true);
next.onclick=()=>current<last?show(current+1,true):leave(false);
booking.onclick=()=>leave(true);
phone.addEventListener('keydown',event=>{
 if(!loading&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1),true);}
});
phone.addEventListener('pointerdown',event=>{if(!loading&&event.isPrimary&&event.button===0){start={x:event.clientX,y:event.clientY};ignoreClick=false;}});
phone.addEventListener('pointerup',event=>{
 if(!start)return;
 const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
 if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3){ignoreClick=true;show(current+(dx<0?1:-1),true);}
});
phone.addEventListener('pointercancel',()=>{start=null;});
phone.addEventListener('click',event=>{if(ignoreClick){event.preventDefault();event.stopImmediatePropagation();ignoreClick=false;}},true);
function finishSplash(){
 clearTimeout(splashTimer);loading=false;
 phone.querySelector('.kon-splash')?.remove();phone.classList.remove('kon-loading');
 phone.removeAttribute('aria-busy');
 phone.querySelectorAll(':scope>header,:scope>main,:scope>footer').forEach(el=>el.inert=false);
}
function startSplash(){
 finishSplash();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const splash=window.KeysBrand?.createSplash();if(!splash)return;
 splash.classList.add('kon-splash');phone.append(splash);loading=true;
 phone.classList.add('kon-loading');phone.setAttribute('aria-busy','true');
 phone.querySelectorAll(':scope>header,:scope>main,:scope>footer').forEach(el=>el.inert=true);
 splashTimer=setTimeout(finishSplash,2600);
}
const resizeVisuals=new ResizeObserver(entries=>{for(const {target,contentRect} of entries){target.style.setProperty('--kon-art-scale',Math.min(contentRect.width/320,contentRect.height/360));}});
root.querySelectorAll('.kon-visual').forEach(el=>resizeVisuals.observe(el));
function sync(){
 finishSplash();root.hidden=document.body.dataset.keysScenario!=='onboarding';
 if(!root.hidden){show(0);startSplash();}
}
app.addEventListener('keys-scenario-change',sync);sync();
