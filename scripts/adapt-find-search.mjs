export function adaptFindSearch(source,component){
 const heading='n.jsx("h1", { className: "mb-[21px] text-28 leading-[1.18] font-medium tracking-[-1px]", children: "Куда поедем?" }), ';
 const a=source.indexOf('function aF()'),b=source.indexOf('function sF()',a),c=source.indexOf('const F4 =',b);
 if(a<0||b<0||c<0||!source.slice(a,b).includes(heading))throw Error('Find landing anchors missing');
 return source.slice(0,a)+source.slice(a,b).replace(heading,'n.jsx(KeysFindHeading, {}), ')+component+'\n'+source.slice(c);
}
