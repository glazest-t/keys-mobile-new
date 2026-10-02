import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/maps/2gis.js','utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function setup(config={apiKey:'test-only'},sdk=true){
 const maps=[],markers=[],observers=[],scripts=[];
 class MapGL{
  constructor(container,options){this.options=options;this.center=options.center;this.zoom=options.zoom;this.events={};maps.push(this);}
  on(name,callback){this.events[name]=callback;}
  getCenter(){return this.center;} getZoom(){return this.zoom;} getSize(){return [400,600];}
  setCenter(point){this.center=point;} setZoom(zoom){this.zoom=zoom;}
  project(point){return point;} unproject(point){return point;}
  fitBounds(bounds,options){this.fit={bounds,options};}
  invalidateSize(){this.resized=true;} destroy(){this.destroyed=true;}
 }
 class HtmlMarker{
  constructor(map,options){this.options=options;markers.push(this);}
  setCoordinates(point){this.options.coordinates=point;} setZIndex(z){this.options.zIndex=z;}
  destroy(){this.destroyed=true;}
 }
 const context={KeysMapsConfig:config,mapgl:sdk?{Map:MapGL,HtmlMarker}:undefined,queueMicrotask,setTimeout,clearTimeout,
  document:{createElement:()=>({remove(){this.removed=true;}}),head:{append:script=>scripts.push(script)}},
  ResizeObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 };
 vm.runInNewContext(source,context);
 return {api:context.KeysMaps,context,maps,markers,observers,scripts};
}
test('missing key does not load SDK; parallel consumers share one request and retry after failure',async()=>{
 const missing=setup({},false);await assert.rejects(missing.api.load(),/not configured/);assert.equal(missing.scripts.length,0);
 const app=setup(undefined,false),first=app.api.load(),second=app.api.load();assert.equal(first,second);assert.equal(app.scripts.length,1);
 app.scripts[0].onerror();await assert.rejects(first,/failed to load/);assert.equal(app.scripts[0].removed,true);
 const retry=app.api.load();app.context.mapgl={Map:class{}};app.scripts[1].onload();assert.equal(await retry,app.context.mapgl);
});
test('fit preserves longitude/latitude, asymmetric card padding and maximum zoom',()=>{
 const {api,maps}=setup();const map=api.create({}, {center:[37.5,55.7],zoom:14});
 api.fit(map,[[37.6,55.8],[37.4,55.6]],{topLeft:[20,40],bottomRight:[30,180],maxZoom:13});
 assert.deepEqual(plain(maps[0].fit),{bounds:{southWest:[37.4,55.6],northEast:[37.6,55.8]},options:{padding:{left:20,top:40,right:30,bottom:180},maxZoom:13,animation:{duration:0}}});
 assert.equal(map.options.rotation,0);assert.equal(map.options.disableRotationByUserInteraction,true);
});
test('hotel bridge preserves marker selection, movement, updates and cleanup',async()=>{
 const {api,maps,markers,observers}=setup(),a=api.hotelAdapter,map=new a.YMap({}, {location:{center:[37,55],zoom:12}});
 let selected=0,loaded=0,moved=0,failed=0;const handlers=new Map();
 const element={addEventListener:(event,fn)=>handlers.set(event,fn),removeEventListener:event=>handlers.delete(event)};
 const marker=new a.YMapMarker({coordinates:[37.5,55.7],onClick:()=>selected++},element);
 map.addChild(marker).addChild(new a.YMapListener({onActionEnd:()=>moved++,onStateChanged:event=>loaded=event.getLayerState().tilesLoaded,onError:()=>failed++}));
 await Promise.resolve();assert.equal(loaded,0);maps[0].events.idle();assert.equal(loaded,1);
 let stopped=false;handlers.get('click')({stopPropagation:()=>stopped=true});assert.equal(selected,1);assert.equal(stopped,true);
 marker.update({coordinates:[38,56],zIndex:10});assert.deepEqual(plain(markers[0].options.coordinates),[38,56]);assert.equal(markers[0].options.zIndex,10);
 maps[0].events.moveend();assert.equal(moved,1);maps[0].events.styleloaderror();assert.equal(failed,1);
 observers[0].callback();assert.equal(maps[0].resized,true);
 map.ensureVisible([200,580],{topLeft:[20,20],bottomRight:[20,180]});assert.deepEqual(plain(maps[0].center),[200,460]);
 map.destroy();assert.equal(maps[0].destroyed,true);assert.equal(markers[0].destroyed,true);assert.equal(observers[0].disconnected,true);assert.equal(handlers.size,0);
});
test('route to hotel leaves departure unset for location detection in 2GIS',()=>{
 const {api}=setup();assert.equal(api.routeURL({to:[37.585621,55.737954]}),'https://2gis.ru/directions/tab/car/points/|37.585621,55.737954');
});

test('local API permits 2GIS fetches and keeps unrelated requests offline',async()=>{
 const {adapt2gisRuntime}=await import('../scripts/adapt-2gis.mjs');
 const upstream=readFileSync('vendor/arbana/src/local-api.js','utf8');
 // Exercise the actual intercepted fetch body without initializing the unrelated demo database.
 const source=adapt2gisRuntime(upstream);
 const body=source.slice(source.indexOf('  const keysMapFetch='),source.lastIndexOf('})();'));
 let network=[],local=[];
 const scope={URL,Response,location:{href:'http://127.0.0.1:8765/sections/'},fetch:async (...args)=>{network.push(args);return new Response('map');},handle:(...args)=>{local.push(args);return {ok:true};}};
 vm.runInNewContext(body,scope);
 assert.equal(await (await scope.fetch('https://styles.api.2gis.com/style')).text(),'map');
 assert.equal(await (await scope.fetch(new URL('https://keys.api.2gis.com/public/key'))).text(),'map');
 assert.equal((await scope.fetch('https://2gis.com.evil.test/style')).status,503);
 assert.equal((await scope.fetch('https://example.com/style')).status,503);
 assert.equal((await scope.fetch('/api/v1/profile')).status,200);
 assert.equal(network.length,2);assert.equal(local.length,1);
});
