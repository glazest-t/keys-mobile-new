import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
import QRCode from 'qrcode';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'source'), stage=path.join(root,'.build'),dist=path.join(root,'dist');
await rm(stage,{recursive:true,force:true}); await rm(dist,{recursive:true,force:true});
await mkdir(stage,{recursive:true}); await mkdir(dist,{recursive:true});
await cp(path.join(source,'assets'),path.join(stage,'assets'),{recursive:true});
let js=await readFile(path.join(source,'index-C4VobzN0.js'),'utf8');
function replace(a,b){if(!js.includes(a))throw new Error('Upstream anchor missing: '+a.slice(0,90));js=js.replace(a,b);}
// Keep the original application and all its reducers. Replace only network integrations.
replace('new URL(window.location.origin+"/")','new URL(window.location.href)');
replace('function UV(){','function UV(){return Promise.resolve(window.PoraLocalMap);}\nfunction originalUV(){');
replace('function Ek(){','function Ek(){return "supported";}\nfunction originalEk(){');
replace('async function Ux(){','async function Ux(){return {active:true};}\nasync function originalUx(){');
replace('async function wk(e){','async function wk(e){return {endpoint:"local-demo",keys:{p256dh:"demo",auth:"demo"}};}\nasync function originalWk(e){');
replace('async function NV(){','async function NV(){return;}\nasync function originalNV(){');
replace('GC.createRoot(document.getElementById("root")).render(', 'globalThis.PoraDemo.engine={hotels:_n,hotel:Ie,initial:Xg,reducer:Pt,scenarios:Kj};GC.createRoot(document.getElementById("root")).render(');
replace('"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js")});','');
// Keep original demo scenario defaults, but select the matching layout on a fresh visit.
replace('sH(window.location.search)??"mobile"','sH(window.location.search)??(window.innerWidth>=900?"desktop":"mobile")');
// Give the local API the same current trip data used by the original application.
replace('l.current=a});const c=WC(l,r)','l.current=a;globalThis.PoraDemo.state=a;globalThis.PoraDemo.dispatch=r;globalThis.PoraDemo.saveTrip(a)});const c=WC(l,r)');
// Prevent Vite preloads: all chunks are bundled into the classic script for file:// support.
replace('Hl=function(', 'originalHl=function(');
js+='\nfunction Hl(load){return load();}\n';
js=js.replaceAll('Яндекс Карты включены — каждое открытие карты тратит суточный лимит','Автономная схема расположения отелей').replaceAll('Яндекс Карты выключены — запросы не тратятся','Автономная схема выключена');
js=js.replaceAll('"/images/','"./images/').replaceAll('"/videos/','"./videos/').replaceAll('"/icons/','"./icons/');
await writeFile(path.join(stage,'assets/index-C4VobzN0.js'),js);
const bootstrap=(await readFile(path.join(source,'bootstrap.json'),'utf8')).replaceAll('/images/','./images/');
const qr=await QRCode.toDataURL('otpauth://totp/Pora:demo?secret=JBSWY3DPEHPK3PXP&issuer=Pora',{width:256,margin:2});
const runtime=(await readFile(path.join(root,'src/local-api.js'),'utf8')).replace('__BOOTSTRAP__',bootstrap).replace('__QR_DATA_URL__',JSON.stringify(qr));
await writeFile(path.join(stage,'runtime.js'),runtime);
await writeFile(path.join(stage,'entry.js'),'import "./runtime.js";\nimport "../src/local-map.js";\nimport "./assets/index-C4VobzN0.js";');
await build({entryPoints:[path.join(stage,'entry.js')],outfile:path.join(dist,'assets/app.js'),bundle:true,format:'iife',target:'es2022',minify:true,legalComments:'eof',logLevel:'info'});
for(const folder of ['images','videos','icons']){
 try{await cp(path.join(source,folder),path.join(dist,folder),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
}
for(const f of await (await import('node:fs/promises')).readdir(path.join(source,'assets'))){
 if(/\.(woff2?|png|webp|jpg|svg)$/.test(f))await cp(path.join(source,'assets',f),path.join(dist,'assets',f));
}
let css=(await readFile(path.join(source,'index-CB6t6fWP.css'),'utf8')).replaceAll('/assets/','./assets/');
let html=await readFile(path.join(source,'index.html'),'utf8');
html=html.replace(/<script type="module"[^>]+><\/script>/,'<script defer src="./assets/app.js"></script>');
html=html.replace(/<link rel="stylesheet"[^>]+>/,()=>'<style>'+css+'</style>');
html=html.replaceAll('href="/','href="./');
html=html.replace('<meta name="theme-color"','<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\' \'wasm-unsafe-eval\' blob:; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; font-src \'self\' data:; media-src \'self\' data: blob:; connect-src \'none\'; worker-src blob:; object-src \'none\'; base-uri \'self\'" />\n    <meta name="theme-color"');
await writeFile(path.join(dist,'index.html'),html);
await writeFile(path.join(dist,'.nojekyll'),'');
await writeFile(path.join(dist,'manifest.webmanifest'),JSON.stringify({name:'Пора — ваша поездка',short_name:'Пора',start_url:'./',display:'standalone',background_color:'#ffffff',theme_color:'#2C5DEB',icons:[{src:'./icons/favicon-64.png',sizes:'64x64',type:'image/png'}]}));
// Testable original reducer, without mounting an interface or accessing any backend.
let library=js.replace(/globalThis\.PoraDemo\.engine=\{hotels:_n,hotel:Ie,initial:Xg,reducer:Pt,scenarios:Kj\};GC\.createRoot\(document\.getElementById\("root"\)\)\.render\(n\.jsx\(HC\.StrictMode,\{children:n\.jsx\(TX,\{\}\)\}\)\);/,'');
library+='\nexport {Xg as initial, Pt as reducer, _n as hotels, Ie as hotel, Kj as scenarios};';
await writeFile(path.join(stage,'assets/test-engine.js'),library);
await build({entryPoints:[path.join(stage,'assets/test-engine.js')],outfile:path.join(stage,'engine.cjs'),bundle:true,platform:'node',format:'cjs',target:'node22',logLevel:'silent'});
console.log('Static copy ready: dist/index.html');
