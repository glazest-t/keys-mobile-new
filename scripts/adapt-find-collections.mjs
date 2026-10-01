export function adaptFindCollections(source){
 const replace=(from,to)=>{if(!source.includes(from))throw Error('Collection anchor missing: '+from);source=source.replace(from,to);};
 replace('const h = Vc(u.id), f =', 'if (!keysCollectionMatches(u,e,t)) return false;\n    const h = Vc(u.id), f =');
 replace('city: t.city, results: true, filters: [...e.search.filters]', 'city: t.city, keysCollection:null, results: true, filters: [...e.search.filters]');
 return source;
}
