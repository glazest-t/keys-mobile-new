/* Shared header markup for the base prototype and the imported React sections. */
(() => {
  const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const bell=svg('<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3a2 2 0 0 0 4 0"/>');
  const list=svg('<path d="M4 6h16M4 12h16M4 18h16"/>');
  const defaultAvatar=new URL('../sections/profile-avatar.jpg',document.currentScript.src).href;
  const avatarKey='keys-profile-avatar-v1';
  const validAvatar=value=>typeof value==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value);
  let avatar=defaultAvatar;
  try{const saved=localStorage.getItem(avatarKey);if(validAvatar(saved))avatar=saved;}catch{}
  const setAvatar=value=>{avatar=validAvatar(value)?value:defaultAvatar;document.querySelectorAll('[data-header-avatar]').forEach(img=>img.src=avatar);};
  window.addEventListener('storage',event=>{if(event.key===avatarKey||event.key===null)setAvatar(event.key===null?null:event.newValue);});
  const markup=(unread=true)=>`<button type="button" class="keys-app-logo" data-header-action="home" aria-label="Ключи — главная"><span>ключи</span></button><div class="keys-app-actions"><button type="button" class="keys-app-bell" data-header-action="notifications" aria-label="${unread?'Уведомления, есть новые':'Уведомления'}">${bell}<span class="keys-app-unread"${unread?'':' hidden'} aria-hidden="true"></span></button><button type="button" class="keys-app-profile" data-header-action="profile" aria-label="Профиль"><span class="keys-app-initial" aria-hidden="true"><img data-header-avatar src="${avatar}" alt=""></span>${list}</button></div>`;
  const create=()=>{const el=document.createElement('header');el.className='keys-app-header';el.innerHTML=markup();return el;};
  const setUnread=(header,unread)=>{header.querySelector('.keys-app-unread').hidden=!unread;header.querySelector('.keys-app-bell').setAttribute('aria-label',unread?'Уведомления, есть новые':'Уведомления');};
  window.KeysAppHeader={markup,create,setUnread,setAvatar};
})();
