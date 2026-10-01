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
