export function adaptFindSearch(source,component){
 const photo='className: "mt-5 flex w-full items-center gap-3.5 rounded-17 bg-soft py-3.5 pr-4 pl-3.5 text-left transition-colors hover:bg-fill"';
 if(!source.includes(photo))throw Error('Photo selection card anchor missing');
 source=source.replace(photo,photo.replace('"mt-5','"keys-find-photo mt-5'));
 const heading='n.jsx("h1", { className: "mb-[21px] text-28 leading-[1.18] font-medium tracking-[-1px]", children: "Куда поедем?" }), ';
 const a=source.indexOf('function aF()'),b=source.indexOf('function sF()',a),c=source.indexOf('const F4 =',b);
 if(a<0||b<0||c<0||!source.slice(a,b).includes(heading))throw Error('Find landing anchors missing');
 const modes='n.jsx(ru, { variant: "pill", label: "Способ поиска", value: e.search.intent, options: [{ value: "known", label: "Знаю, что ищу" }, { value: "discover", label: "Нужен совет" }], onChange: (u) => t({ type: "SEARCH_PATCH", patch: { intent: u, results: false } }) }), ';
 if(!source.slice(a,b).includes(modes))throw Error('Find search modes anchor missing');
 return source.slice(0,a)+source.slice(a,b).replace(heading,'n.jsx(KeysFindHeading, {}), ').replace(modes,'')+component+'\n'+source.slice(c);
}
