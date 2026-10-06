export function adaptSelectionStyle(source, welcome, ideas = '') {
 const icon=(paths)=>`n.jsx("svg", {viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.65,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true,children:n.jsx("path",{d:"${paths}"})})`;
 for(const name of ['EB','LB']){
  const start=source.indexOf(`function ${name}(`),end=source.indexOf('\n}',start)+2;
  if(start<0||end<2)throw Error('Missing selection component '+name);
  let part=source.slice(start,end);
  part=part.replace('className: "'+(name==='EB'?'ai-selection-chat ':'')+'relative flex h-full', 'className: "keys-selection-page '+(name==='EB'?'ai-selection-chat ':'')+'relative flex h-full');
  part=part.replace('children: "←"','children: '+icon('M19 12H5m7-7-7 7 7 7'));
  part=part.replace('children: "•••"','children: '+icon('M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6'));
  if(!part.includes('keys-selection-page '))throw Error('Missing selection style hook '+name);
  source=source.slice(0,start)+part+source.slice(end);
 }
 const start=source.indexOf('function TB('),end=source.indexOf('\nfunction jB()',start);
 if(start<0||end<0)throw Error('Missing selection welcome');
 source=source.slice(0,start)+welcome+'\n'+ideas+'\n'+source.slice(end);
 if(ideas){
  const entry='return tt().source === "travelline" ? n.jsx(w4, {}) : n.jsx(LB, { onBack: e });';
  if(!source.includes(entry))throw Error('Advice entry missing');
  source=source.replace(entry,'return n.jsx(KeysIdeasPage, {onBack:e});');
  const landing='return e.search.intent === "discover" ? n.jsx(C4, {}) : n.jsxs(n.Fragment, { children:';
  if(!source.includes(landing))throw Error('Advice landing missing');
  source=source.replace(landing,'return n.jsxs(n.Fragment, { children:');
  const body='n.jsx(sF, {})] });';
  if(!source.includes(body))throw Error('Find content missing');
  source=source.replace(body,'e.search.intent === "discover" ? n.jsx(KeysIdeasPage, {embedded:true}) : n.jsx(sF, {})] });');

 }
 return source;
}
