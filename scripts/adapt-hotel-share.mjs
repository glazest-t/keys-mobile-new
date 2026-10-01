export function adaptHotelShare(source,component){
 let js=source;
 const start=js.indexOf('function VU('),end=js.indexOf('const Qd =',start);
 if(start<0||end<0)throw Error('Hotel share component missing');
 js=js.slice(0,start)+component+'\n'+js.slice(end);
 const signature='function Yz({ hotelId: e, onDone: t }) {';
 if(!js.includes(signature))throw Error('Share collection component missing');
 js=js.replace(signature,'function Yz({ hotelId: e, onDone: t, allowCreate = true }) {');
 const a=js.indexOf('function Yz('),b=js.indexOf('\nfunction ',a+10);
 let collection=js.slice(a,b);
 collection=collection.replace('  return a.auth.user ?', '  if(a.auth.user&&!allowCreate&&!a.value?.items.length&&!a.error)return null;\n  return a.auth.user ?');
 collection=collection.replace('})] }) : n.jsx(H, { variant: "secondary", onClick: () => {', '})] }) : allowCreate ? n.jsx(H, { variant: "secondary", onClick: () => {');
 collection=collection.replace('children: "Создать общую подборку" })] })', 'children: "Создать общую подборку" }) : null] })');
 js=js.slice(0,a)+collection+js.slice(b);
 return js;
}
