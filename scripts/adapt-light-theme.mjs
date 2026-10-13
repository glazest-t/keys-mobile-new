// Keep the imported runtime, map theme and controls on the approved light palette.
export function adaptLightTheme(source) {
 const replace=(from,to)=>{
  if(!source.includes(from))throw new Error('Light theme anchor missing: '+from.slice(0,70));
  source=source.replace(from,to);
 };
 replace('const Px = { choice: "system", theme: "light", fixed: false };',
         'const Px = { choice: "light", theme: "light", fixed: true };');
 replace(`function $4() {
  const e = Z4(window.location.search), t = AF();
  return { choice: t, theme: CF(e, t, IF()), fixed: e !== null };
}`,`function $4() {
  return { choice: "light", theme: "light", fixed: true };
}`);
 replace(`function PF(e) {
  typeof window > "u" || (_F(e), Z4(window.location.search) !== null && window.history.replaceState(window.history.state, "", SF(window.location.href, e)), om());
}`,`function PF() {
  ek("light");
}`);
 return source;
}

// The imported HTML runs before the deferred app bundle. Keep its first paint
// on the same light palette instead of briefly restoring a saved dark theme.
export function adaptLightThemeDocument(html) {
 let replaced=0;
 const result=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,script=>{
  if(!script.includes("localStorage.getItem('pora-theme')")||!script.includes('prefers-color-scheme: dark'))return script;
  replaced++;
  return `<script>
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light only';
      var themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.content = '#2C5DEB';
    </script>`;
 });
 if(replaced!==1)throw new Error('Expected one imported theme bootstrap, found '+replaced);
 return result.replace(/<!--\s*Тема ставится до загрузки приложения[\s\S]*?-->/,'<!-- Keys supports only the light theme, including the first paint. -->');
}
