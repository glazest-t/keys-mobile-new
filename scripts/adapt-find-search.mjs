export function adaptFindSearch(source,component){
 const photo='className: "mt-5 flex w-full items-center gap-3.5 rounded-17 bg-soft py-3.5 pr-4 pl-3.5 text-left transition-colors hover:bg-fill"';
 if(!source.includes(photo))throw Error('Photo selection card anchor missing');
 source=source.replace(photo,photo.replace('"mt-5','"keys-find-photo mt-5'));
 const heading='n.jsx("h1", { className: "mb-[21px] text-28 leading-[1.18] font-medium tracking-[-1px]", children: "Куда поедем?" }), ';
 const a=source.indexOf('function aF()'),b=source.indexOf('function sF()',a),c=source.indexOf('const F4 =',b);
 if(a<0||b<0||c<0||!source.slice(a,b).includes(heading))throw Error('Find landing anchors missing');
 return source.slice(0,a)+source.slice(a,b).replace(heading,'n.jsx(KeysFindHeading, {}), ')+component+'\n'+source.slice(c);
}
