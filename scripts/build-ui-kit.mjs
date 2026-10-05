import {readFile,writeFile,readdir,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {components,scenarios,motion} from '../src/ui-kit-key/registry.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFile(path.join(root,p),'utf8');
const json=p=>read(p).then(JSON.parse);
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();
const hash=s=>createHash('sha256').update(s).digest('hex');
export async function buildUIkit(){
 const out=path.join(root,'dist/ui-kit');await rm(out,{recursive:true,force:true,maxRetries:3});await mkdir(out,{recursive:true});
 for(const f of ['key.css','key.js','templates.js','catalog.css','catalog.js','index.html','contracts.d.ts','handoff.html']) await cp(path.join(root,'src/ui-kit-key',f),path.join(out,f));
 const foundations=await json('design/ui-foundations.json');
 const tokenSource=await read('src/arbana/tokens.css');
 const firstRoot=tokenSource.slice(tokenSource.indexOf(':root{'),tokenSource.indexOf(':root[data-theme="dark"]'));
 const vars=Object.fromEntries([...firstRoot.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
 const palette={brand:vars['--color-brand'],brandHover:vars['--color-brand-hover'],text:vars['--color-ink'],muted:vars['--color-muted'],line:vars['--color-line'],surface:'#f5f7fb',card:'#ffffff',soft:vars['--color-soft'],softHover:vars['--color-soft-hover'],positive:vars['--color-success'],positiveSurface:vars['--color-success-bg'],warning:vars['--color-warning'],warningSurface:vars['--color-warning-bg'],danger:vars['--color-danger']};
 const colorDescriptions={brand:'Основное действие, ссылки, активный пункт',brandHover:'Наведение на основное действие',text:'Заголовки и основной текст',muted:'Подписи и второстепенная информация',line:'Единая обводка карточек и разделители',surface:'Нейтральная вспомогательная поверхность',card:'Фон приложения и карточек',soft:'Спокойный синий акцент, сегменты',softHover:'Наведение на вторичные действия',positive:'Успех, включённая услуга, оценка',positiveSurface:'Баллы и рекомендации друзей',warning:'Ожидание и внимание',warningSurface:'Фон предупреждения',danger:'Ошибка и опасное действие'};
 const kebab=s=>s.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
 const dimensions={};for(const n of foundations.spacingScale)dimensions['space'+n]={$type:'dimension',$value:{value:n,unit:'px'}};
 for(const [n,v] of Object.entries({radiusCard:20,radiusButton:14,radiusSheet:24,radiusItem:10,controlHeight:48,linkHeight:44,tabHeight:42,filterHeight:40,serviceActionHeight:36,iconControl:20,iconRow:22,iconNav:24,iconSmall:14,stroke:1.65})) dimensions[n]={$type:'dimension',$value:{value:v,unit:'px'}};
 const tokens={$description:'UI kit Keys · approved light theme. Current role scale takes priority over legacy reference variables.',color:Object.fromEntries(Object.entries(palette).map(([k,v])=>[k,{$type:'color',$value:{colorSpace:'srgb',components:[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255),alpha:1,hex:v},$description:colorDescriptions[k]}])),dimension:dimensions,typography:Object.fromEntries(Object.entries(foundations.typography).map(([k,v])=>[k,{$type:'typography',$value:{fontFamily:['Golos Text Variable','sans-serif'],fontSize:{value:v.size,unit:'px'},fontWeight:v.weight,letterSpacing:{value:0,unit:'px'},lineHeight:v.lineHeight/v.size}}])),motion:Object.fromEntries(motion.map(m=>[m.id,{$type:'duration',$value:{value:m.duration,unit:'ms'},$description:`${m.name}; ${m.easing}; ${m.property}`}]))};
 const fontCSS=tokenSource.slice(0,tokenSource.indexOf(':root{')).replaceAll('./assets/','./assets/');
 let css=fontCSS+'\n:root{color-scheme:light;--key-font:"Golos Text Variable",system-ui,sans-serif;\n';
 for(const [k,v] of Object.entries(palette))css+=`--key-${kebab(k)}:${v};\n`;
 css+='--key-ease-soft:cubic-bezier(.22,1,.36,1);--key-ease-ios:cubic-bezier(.32,.72,0,1);--key-ease-spring:cubic-bezier(.34,1.56,.64,1);\n';
 for(const [k,v] of Object.entries(dimensions))css+=`--key-${kebab(k)}:${v.$value.value}px;\n`;
 for(const [k,v] of Object.entries(foundations.typography))css+=`--key-type-${kebab(k)}:${v.weight} ${v.size}px/${v.lineHeight}px var(--key-font);\n`;
 css+='}\n';await writeFile(path.join(out,'tokens.css'),css);
 const originalIcons=await json('src/arbana/icons.json');
 const vendorPath='vendor/arbana/source/assets/index-C4VobzN0.js';const vendor=await read(vendorPath);
 const start=vendor.indexOf('OI={')+3,end=vendor.indexOf(';function D(',start);
 if(start<3||end<0)throw Error('Cannot extract current embedded icon registry');
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const node=(tag,props)=>{const c=props.children;const children=(Array.isArray(c)?c:[c]).filter(x=>x!=null).join('');if(tag==='fragment')return children;const attr=Object.entries(props).filter(([k])=>k!=='children').map(([k,v])=>`${k.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())}="${escape(v)}"`).join(' ');return `<${tag}${attr?' '+attr:''}>${children}</${tag}>`;};
 const embeddedIcons=vm.runInNewContext('('+vendor.slice(start,end)+')',{n:{Fragment:'fragment',jsx:node,jsxs:node}},{timeout:1000});
 const icons={...embeddedIcons,...originalIcons};
 const iconsSources=Object.fromEntries(Object.keys(icons).map(n=>[n,Object.hasOwn(originalIcons,n)?'src/arbana/icons.json':vendorPath+'#OI']));
 await mkdir(path.join(out,'icons'),{recursive:true});
 const svg=(inner)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
 for(const [name,body]of Object.entries(icons))await writeFile(path.join(out,'icons',name+'.svg'),svg(body));
 await writeFile(path.join(out,'icons.svg'),`<svg xmlns="http://www.w3.org/2000/svg"><defs>${Object.entries(icons).map(([name,body])=>`<symbol id="key-${name}" viewBox="0 0 24 24">${body}</symbol>`).join('')}</defs></svg>`);
 await mkdir(path.join(out,'assets'),{recursive:true});
 for(const f of await readdir(path.join(root,'src/arbana/assets')))if(f.endsWith('.woff2'))await cp(path.join(root,'src/arbana/assets',f),path.join(out,'assets',f));
 const assets={'hotel.jpg':'src/scenarios/maidens-hotel.jpg','next-trip.jpg':'src/scenarios/next-trip.jpg','avatar.jpg':'src/sections/profile-avatar.jpg','cafe.jpg':'src/home/nearby/nearby-cafe-generated.jpg','theatre.jpg':'src/home/nearby/theatre.jpg','restaurant.webp':'src/booking/restaurant.webp','breakfast.png':'src/booking/gallery/breakfast-dishes.png','buffet.png':'src/booking/gallery/breakfast-buffet.png',...Object.fromEntries(['deals','weekend','anywhere'].map(n=>[n+'.svg','src/sections/collections/'+n+'.svg']))};
 for(const [name,p]of Object.entries(assets))await cp(path.join(root,p),path.join(out,'assets',name));
 // Snapshot is self-contained; copy before creating it and exclude this UI-kit directory.
 const reference=path.join(out,'reference-app');await mkdir(reference,{recursive:true});
 for(const f of await readdir(path.join(root,'dist')))if(f!=='ui-kit')await cp(path.join(root,'dist',f),path.join(reference,f),{recursive:true});
 // Public handoff must not contain a deployment credential.
 await writeFile(path.join(reference,'maps/config.js'),'globalThis.KeysMapsConfig={apiKey:"",styleId:""};\n');
 const sources=(await walk(path.join(root,'src'))).filter(p=>!p.includes('/ui-kit-key/')&&!p.includes('/variants/')&&!p.includes('/header-concepts/')&&/\.(css|js|html|json)$/.test(p)&&!p.endsWith('leaflet.js')&&!p.endsWith('leaflet.css')&&!p.endsWith('header-concepts.html'));
 sources.push(path.join(root,vendorPath),path.join(root,'scripts/build-sections.mjs'),path.join(root,'design/ui-foundations.json'));
 const vendorCSS=(await walk(path.join(root,'vendor/arbana/source/assets'))).filter(f=>f.endsWith('.css'));sources.push(...vendorCSS);
 const files=[],styleInventory=[],motionInventory=[],svgInventory=[],keyframes=[];
 for(const file of sources){const rel=path.relative(root,file),text=await readFile(file,'utf8');const dest=path.join(out,'reference-source',rel);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,text);files.push({path:rel,sha256:hash(text),bytes:Buffer.byteLength(text)});
   for(const m of text.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{/g)){let i=m.index+m[0].length,depth=1;for(;i<text.length&&depth;i++){if(text[i]==='{')depth++;if(text[i]==='}')depth--;}keyframes.push({source:rel,name:m[1],css:text.slice(m.index,i)});}
   if(file.endsWith('.css')||file.endsWith('.html')){
    const cssTexts=file.endsWith('.html')?[...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]):[text];
    for(const cssText of cssTexts){for(const m of cssText.matchAll(/([^{}]+)\{([^{}]*)\}/g)){const declarations=m[2].trim(),selector=m[1].trim();if(/(?:font|color|padding|margin|gap|radius|shadow|height|width|animation|transition)/.test(declarations))styleInventory.push({source:rel,selector,declarations});if(/(?:animation|transition)/.test(declarations))motionInventory.push({source:rel,selector,declarations});}}
   }
   if(file.endsWith('.js')){for(const m of text.matchAll(/.{0,80}(?:\.animate\(|duration\s*:|easing\s*:|@keyframes).{0,200}/g))motionInventory.push({source:rel,excerpt:m[0]});}
   if(!rel.startsWith('vendor/'))for(const m of text.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)){if(m[0].length<10000)svgInventory.push({source:rel,markup:m[0]});}
 }
 const sourceHashes=Object.fromEntries(files.map(f=>[f.path,f.sha256]));
 const manifest={name:'UI kit Keys',version:'1.0.0',date:'2026-10-02',theme:'light',basis:'Current approved Keys / Project Tanya prototype; no changes to app behavior',entry:'index.html',styles:['tokens.css','key.css'],scripts:['data.js','templates.js','key.js'],components:components.length,icons:Object.keys(icons).length,scenarios:scenarios.length,sourceHashes,scope:{portable:'Canonical foundations and framework-independent component compositions with demo interactions.',reference:'Exact executable application snapshot plus full current source styles and behavior adapters; original runtime remains the visual authority for complex screens.',extensions:'Keyboard, focus management and missing loading/error examples in portable primitives are handoff extensions, not changes to prototype business logic.',maps:'2GIS API key intentionally empty in portable reference. Configure your own key; main prototype configuration unchanged.',rights:'Assets are copied from the supplied prototype; production usage rights are not newly licensed by this kit.'}};
 const output={'tokens.json':tokens,'tokens.reference.json':{notice:'Reference-only legacy token palette; canonical tokens.json takes precedence',variables:vars},'components.json':components,'scenarios.json':scenarios,'motion.json':motion,'icons.json':icons,'icons.sources.json':iconsSources,'styles.inventory.json':styleInventory,'motion.inventory.json':motionInventory,'keyframes.json':keyframes,'svg.inventory.json':svgInventory,'manifest.json':manifest,'foundations.json':foundations,'assets.json':assets};
 for(const [name,data]of Object.entries(output))await writeFile(path.join(out,name),JSON.stringify(data,null,2)+'\n');
 let references=[];
 try{const captures=await json('design/ui-kit-reference/index.json');references=captures.records.map(({id,image,selector})=>({id,image,selector}));await cp(path.join(root,'design/ui-kit-reference'),path.join(out,'rendered-reference'),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
 try{await cp(path.join(root,'design/ui-kit-verification.json'),path.join(out,'verification.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const data={references,foundations,palette,colorDescriptions,components,scenarios,motion,icons,manifest,inventoryCounts:{styleRules:styleInventory.length,motionRules:motionInventory.length,svg:svgInventory.length}};
 await writeFile(path.join(out,'data.js'),'window.KEY_DATA='+JSON.stringify(data)+';\n');
 const context={window:{KEY_DATA:data}};vm.runInNewContext(await read('src/ui-kit-key/templates.js'),context,{timeout:1000});
 const examples=Object.fromEntries(Object.entries(context.window.KeyTemplates.demos).map(([id,render])=>[id,render()]));
 await mkdir(path.join(out,'examples'),{recursive:true});
 for(const c of components){if(!examples[c.id])throw Error('Missing example '+c.id);await writeFile(path.join(out,'examples',c.id+'.html'),`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../"><title>${c.name} — UI kit Keys</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="key.css"><script src="data.js" defer></script><script src="templates.js" defer></script><script src="key.js" defer></script></head><body class="key-ui" style="margin:0;padding:16px"><main style="max-width:390px;margin:0 auto"><a class="k-link" href="index.html#${c.id}">← ${c.name} / UI kit Keys</a>${examples[c.id]}</main><script>addEventListener('DOMContentLoaded',()=>KeyUI.mount())</script></body></html>`);}
 await writeFile(path.join(out,'examples.json'),JSON.stringify(examples,null,2));
 await writeFile(path.join(out,'coverage.json'),JSON.stringify({date:manifest.date,components:components.map(c=>({id:c.id,example:`examples/${c.id}.html`,contract:true,source:c.source,states:c.states,scope:'Representative portable composition. Full behavior and source preserved in reference-app/reference-source.'})),scenarios,icons:Object.keys(icons).length,sourceFiles:files.length,styleRules:styleInventory.length,motionRecords:motionInventory.length},null,2));

 await writeFile(path.join(out,'START.txt'),'UI kit Keys — 1.0.0\n\nОткройте index.html. Для живого прототипа и корректной работы браузерных API запустите:\n  python3 -m http.server 8780\nЗатем откройте http://localhost:8780/\n\nПервый документ для разработчика: handoff.html\nМашинный контракт: manifest.json, components.json, contracts.d.ts\nПодключение: tokens.css → key.css → data.js → templates.js → key.js\nСнимок приложения: reference-app/index.html\nИсходные стили и логика: reference-source/\nСекреты и персональные пользовательские загрузки не включены.\n\nДанные, цены и начисления — примеры прототипа, не правила коммерческой программы.\n');
 console.log(`UI kit Keys: ${components.length} components, ${Object.keys(icons).length} icons, ${scenarios.length} scenarios, ${styleInventory.length} source rules.`);
 return {out,manifest};
}
if(process.argv[1]===fileURLToPath(import.meta.url))await buildUIkit();
