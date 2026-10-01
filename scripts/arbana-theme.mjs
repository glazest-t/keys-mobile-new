import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const tokens=JSON.parse(await readFile(path.join(root,'design/arbana-tokens.json'),'utf8')).light;
const colorMap={};
function color(hex){
 const original=hex.toLowerCase();let h=original.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');if(h.length!==6)return hex;
 const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));const hi=Math.max(r,g,b),lo=Math.min(r,g,b),sat=hi-lo,avg=(r+g+b)/3;let token;
 if(hi===255&&lo===255)token='card';
 else if(hi<70&&sat<40)token='ink';
 else if(sat<24){token=avg>247?'paper':avg>238?'surface':avg>228?'line':avg>206?'edge-2':avg>160?'ink-8':avg>108?'muted':'ink';}
 else if(b>r+15&&b>g+8){token=lo>219?'soft':lo>185?'brand-mist':hi>185&&lo<120?'brand':hi<115?'ink':'ink-2';}
 else if(g>r+12&&g>b-10){token=lo>205?'success-bg':'success';}
 else if(r>g+25&&r>b+25){token=lo>210?'warning-bg':lo>150?'warning-bg-2':'danger';}
 else if(r>b+18&&g>b+7){token=lo>206?'warning-bg':'warning';}
 else if(r>b-25&&b>g+20){token=lo>195?'soft':'brand';}
 else token=avg>235?'surface':avg>218?'line':avg>180?'edge-2':avg>110?'muted':'ink-2';
 colorMap[original]='--color-'+token;return `var(--color-${token})`;
}
export async function buildArbanaTheme(fragment,buildShell){
 let css=[...fragment.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),...buildShell.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
 css=css.replace(/light-dark\(([^(),]+),[^()]+\)/g,'$1');
 css=css.replace(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g,color);
 css=css.replace(/font-family\s*:[^;}]+/g,'font-family:var(--font-sans)');
 css=css.replace(/font-weight\s*:\s*(600|700|800)/g,(_,n)=>`font-weight:${n==='600'?'500':'600'}`);
 css=css.replace(/font-size\s*:\s*(\d+)px/g,(_,n)=>{const sizes={9:11,10:11,11:12,12:13,13:14,19:20,23:24};const v=sizes[n]||+n;return `font-size:${tokens['--text-'+v]?`var(--text-${v})`:`${v}px`}`});
 css=css.replace(/border-radius\s*:\s*([^;}]+)/g,(_,value)=>'border-radius:'+value.replace(/(\d+)px/g,(raw,n)=>{if(+n>=100)return raw;const radii=[4,8,10,12,13,14,15,16,17,18,20,22,24,28,30];const nearest=radii.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);return nearest===18?'var(--radius-card)':`var(--radius-${nearest})`;}));
 css=css.replace(/box-shadow\s*:\s*([^;}]+)/g,(_,v)=>v.trim().startsWith('none')?'box-shadow:'+v:'box-shadow:var(--arbana-shadow-card)'+(v.includes('!important')?'!important':''));
 // Preserve every structural declaration. Shadows and borders are refined by the adapter.
 const adapter=await readFile(path.join(root,'src/arbana/adapter.css'),'utf8');
 await mkdir(path.join(root,'dist/arbana'),{recursive:true});
 await cp(path.join(root,'src/arbana'),path.join(root,'dist/arbana'),{recursive:true});
 await writeFile(path.join(root,'dist/arbana/theme.css'),'/* Generated visual remapping of the original prototype. Behaviour stays in src/prototype.html. */\n'+css+'\n'+adapter);
 await writeFile(path.join(root,'design/arbana-color-map.json'),JSON.stringify(colorMap,null,2));
}
