import {readPartnerRequest,writePartnerRequest,partnerRequestKey} from './partner-bridge.mjs';
import {formatPhone} from './auth-model.mjs';
const token=location.hash.slice(1),main=document.getElementById('extranet');
let signedIn=false;
const request=()=>readPartnerRequest(localStorage,token);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function back(){if(window.opener&&!window.opener.closed){window.opener.focus();window.close();}else{main.querySelector('[data-return]').textContent='Вернитесь во вкладку «Ключи»';}}
function render(){
 const data=request();
 if(!data||data.status==='expired'){main.innerHTML='<h1>Запрос недоступен</h1><p>Он был изменён или отменён. Вернитесь в «Ключи» и откройте актуальный запрос.</p><button data-return>Вернуться в «Ключи»</button>';}
 else if(data.status!=='pending'){
  const approved=data.status==='approved';main.innerHTML=`<span class="status ${data.status}">${approved?'Подтверждено':'Отклонено'}</span><h1>${approved?'Аккаунты связаны':'Привязка отклонена'}</h1><p>Статус в приложении «Ключи» обновлён. ${approved?'Теперь вам доступны тарифы Friendly Rate.':'При необходимости можно отправить новый запрос.'}</p><button data-return>Вернуться в «Ключи»</button>`;
 }else if(!signedIn){
  main.innerHTML='<h1>Вход в личный кабинет</h1><p>Войдите, чтобы подтвердить привязку к приложению «Ключи».</p><form><label for="email">Рабочая почта</label><input id="email" type="email" autocomplete="off" required><label for="password">Пароль</label><input id="password" type="password" value="demo-password" autocomplete="off" required><p class="hint">Тестовые данные заполнены для демонстрации.</p><p class="error" role="alert"></p><button type="submit">Войти</button></form><button class="secondary" data-return>Вернуться в «Ключи»</button>';
  main.querySelector('#email').value=data.email;
  main.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(main.querySelector('#email').value.trim().toLowerCase()!==data.email){main.querySelector('.error').textContent='Используйте почту, на которую отправлен запрос.';return;}signedIn=true;render();});
 }else{
  main.innerHTML=`<span class="status">Ожидает подтверждения</span><h1>Привязка к «Ключам»</h1><p>Подтвердите, что это ваш аккаунт. После привязки в приложении откроются тарифы для отельеров.</p><section class="request"><dl><dt>Номер в «Ключах»</dt><dd>${escape(formatPhone(data.phone))}</dd><dt>Аккаунт TravelLine</dt><dd>${escape(data.email)}</dd></dl></section><button data-decision="approved">Подтвердить</button><button class="reject" data-decision="rejected">Отклонить</button><button class="secondary" data-return>Решить позже</button>`;
  main.querySelectorAll('[data-decision]').forEach(button=>button.onclick=()=>{const current=request();if(current?.status!=='pending'||current.requestId!==data.requestId){render();return;}writePartnerRequest(localStorage,{...current,status:button.dataset.decision});render();});
 }
 main.querySelector('[data-return]')?.addEventListener('click',back);
}
window.addEventListener('storage',e=>{if(e.key===partnerRequestKey(token))render();});render();
