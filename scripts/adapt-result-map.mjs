import {transform} from 'esbuild';
// Allow the inline map to fit the whole result set, while other maps keep their defaults.
export async function adaptResultMap(source) {
 let js=(await transform(source,{minify:false,charset:'utf8'})).code;
 const replace=(before,after)=>{if(!js.includes(before))throw Error('Map canvas anchor missing: '+before);js=js.replace(before,after);};
 replace('origin: i, places: o, focus: s, onSelect: l }) {','origin: i, places: o, focus: s, onSelect: l, hotelPinWidth = 0 }) {');
 replace('topLeft: [72, 120], bottomRight: [72, 40]', 'topLeft: [Math.max(72, hotelPinWidth / 2 + 16), 120], bottomRight: [Math.max(72, hotelPinWidth / 2 + 16), 40]');
 replace('h = l.length >= Math.min(3, t.length) ? l : t;', 'h = o.fitAll ? t : l.length >= Math.min(3, t.length) ? l : t;');
 replace('R(e, h.map(M), { ...o, maxZoom: 14 });','R(e, h.map(M), { ...o, maxZoom: o.maxZoom ?? 14 });');
 replace('R(e, h.map(M), { ...o, maxZoom: o.maxZoom ?? 14 });\n      return;', 'R(e, h.map(M), { ...o, maxZoom: o.maxZoom ?? 14 });\n      if (o.fitAll) {\n        const timer = setTimeout(() => R(e, h.map(M), { ...o, maxZoom: o.maxZoom ?? 14 }), 320);\n        return () => clearTimeout(timer);\n      }\n      return;');
 replace('R(e, t.map(M), { ...o, maxZoom: 14, duration: 300 });','R(e, t.map(M), { ...o, maxZoom: o.maxZoom ?? 14, duration: 300 });');
 replace('booked: b, focusId: j }) {', 'booked: b, focusId: j, fitPadding, pinLabel }) {\n const compact = !!fitPadding?.compact;');
 replace('Math.abs(u[0] - d[0]) < 136 && Math.abs(u[1] - d[1]) < 52', 'Math.abs(u[0] - d[0]) < (compact ? 86 : 136) && Math.abs(u[1] - d[1]) < (compact ? 30 : 52)');
 replace('D = d ? 128 : 112', 'D = compact ? 82 : d ? 128 : 112');
 replace('S = b ? "Ваш отель" :', 'S = pinLabel || (b ? "Ваш отель" :');
 replace('(d ? "от " : "") + P, Z =', '(d ? "от " : "") + P), Z =');
 replace('D = compact ? 82 : d ? 128 : 112', 'D = pinLabel ? 220 : compact ? 82 : d ? 128 : 112');
 replace('children: b ? n.jsx("strong", { children: "Ваш отель" })', 'children: pinLabel ? n.jsx("strong", {children:pinLabel}) : b ? n.jsx("strong", { children: "Ваш отель" })');
 replace('"aria-label": "Показать все отели", title: "Показать все отели"', '"aria-label": t.length === 1 ? "Показать отель" : "Показать все отели", title: t.length === 1 ? "Показать отель" : "Показать все отели"');
 replace('height: 42, left: -D / 2, top: -21', 'height: compact ? 28 : 42, left: -D / 2, top: compact ? -14 : -21');
 js=js.replace('Не удалось загрузить подложку карты. Возможно, исчерпан суточный лимит Яндекс Карт.','Карта не загрузилась. Проверьте подключение к интернету. Отели доступны в списке.');
 return js;
}
