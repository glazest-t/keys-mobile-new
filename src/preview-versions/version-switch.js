/* Version navigation is preview chrome; application code in Full stays frozen. */
(() => {
 if (window.parent !== window) return;
 const root = new URL('../', document.currentScript.src);
 const full = new URL('versions/full/', root);
 const current = location.pathname.startsWith(full.pathname) ? 'full' : 'november';
 const toolbar = document.getElementById('keysScenarioControls');
 if (!toolbar) return;
 const control = document.createElement('div');
 control.className = 'keys-brand-control keys-scenario-control keys-version-control';
 control.innerHTML = '<select id="keys-prototype-version" aria-label="Версия прототипа" title="Версия прототипа"><option value="november">Ноябрь</option><option value="full">Полная</option></select>';
 const select = control.querySelector('select');
 select.value = current;
 document.documentElement.dataset.keysPrototypeVersion = current;
 // The former appearance setting contained just one option (Базовый).
 // Keep that appearance and use its compact slot for the version setting.
 const appearance = toolbar.querySelector('.keys-brand-control');
 if (appearance) appearance.replaceWith(control);
 else toolbar.prepend(control);
 select.addEventListener('change', () => {
  const target = new URL(select.value === 'full' ? full : root);
  target.search = location.search;
  target.searchParams.delete('v');
  target.searchParams.delete('version');
  target.hash = location.hash;
  location.assign(target.href);
 });
})();
