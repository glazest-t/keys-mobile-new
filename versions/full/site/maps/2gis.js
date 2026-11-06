/* Shared 2GIS MapGL provider. All coordinates are [longitude, latitude]. */
(() => {
 let loading;
 const config=()=>globalThis.KeysMapsConfig||{};
 const enabled=()=>!!config().apiKey;
 function load(){
  if(!enabled())return Promise.reject(new Error('2GIS access key is not configured'));
  if(globalThis.mapgl)return Promise.resolve(globalThis.mapgl);
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://mapgl.2gis.com/api/js/v1';script.async=true;
   const fail=()=>{clearTimeout(timer);script.remove();reject(new Error('2GIS library failed to load'));};
   const timer=setTimeout(fail,20000);
   script.onload=()=>{clearTimeout(timer);globalThis.mapgl?resolve(globalThis.mapgl):fail();};script.onerror=fail;
   document.head.append(script);
  }).catch(error=>{loading=null;throw error;});
  return loading;
 }
 const padding=value=>({left:value?.topLeft?.[0]??34,top:value?.topLeft?.[1]??34,right:value?.bottomRight?.[0]??34,bottom:value?.bottomRight?.[1]??34});
 function fit(map,points,options={}){
  if(!points.length)return;
  const lon=points.map(p=>p[0]),lat=points.map(p=>p[1]);
  map.fitBounds({southWest:[Math.min(...lon),Math.min(...lat)],northEast:[Math.max(...lon),Math.max(...lat)]},{padding:padding(options),maxZoom:options.maxZoom??15,animation:{duration:options.duration??0}});
 }
 function create(container,options={}){
  const api=globalThis.mapgl;
  if(!api||!enabled())throw new Error('2GIS is not ready');
  return new api.Map(container,{
   key:config().apiKey,center:options.center,zoom:options.zoom??14,
   minZoom:options.minZoom??3,maxZoom:options.maxZoom??19,
   lang:'ru',pitch:0,rotation:0,enableTrackResize:true,
   disablePitchByUserInteraction:true,disableRotationByUserInteraction:true,
   disableZoomOnScroll:options.scrollZoom===false,zoomControl:options.controls===false?false:'topRight',
   defaultBackgroundColor:'#f4f6f1',...(config().styleId?{style:config().styleId}:{})
  });
 }
 class Layer{constructor(props={}){this.props=props;}update(props){Object.assign(this.props,props);}}
 class Marker extends Layer{
  constructor(props,element){super(props);this.element=element;this.handlers=[];
   for(const [event,key] of [['click','onClick'],['mouseenter','onMouseEnter'],['mouseleave','onMouseLeave']]){
    const handler=event=>{if(key==='onClick')event.stopPropagation();this.props[key]?.(event);};
    element.addEventListener(event,handler);this.handlers.push([event,handler]);
   }
  }
  update(props){super.update(props);if(props.coordinates)this.native?.setCoordinates(props.coordinates);if(props.zIndex!==undefined)this.native?.setZIndex(props.zIndex);}
  destroy(){this.native?.destroy();this.native=null;for(const [event,handler] of this.handlers)this.element.removeEventListener(event,handler);}
 }
 class Listener extends Layer{}
 class HotelMap{
  constructor(container,options){
   this.container=container;this.zoomRange=options.zoomRange??{min:3,max:19};this.children=new Set();this.ready=false;
   this.native=create(container,{...options.location,minZoom:this.zoomRange.min,maxZoom:this.zoomRange.max,controls:false});
   this.native.on('idle',()=>{this.ready=true;this.emit('onStateChanged',this.tileState());});
   this.native.on('moveend',()=>{this.emit('onActionEnd',{});this.emit('onUpdate',{mapInAction:false});});
   this.native.on('click',()=>this.emit('onClick',null));
   this.native.on('styleloaderror',()=>{this.ready=false;this.emit('onError',{});});
   this.observer=new ResizeObserver(()=>{this.native.invalidateSize();this.emit('onResize',{});});this.observer.observe(container);
  }
  get center(){return this.native.getCenter();}
  get zoom(){return this.native.getZoom();}
  get size(){const [x,y]=this.native.getSize();return {x,y};}
  tileState(){return {getLayerState:()=>({tilesTotal:1,tilesLoaded:this.ready?1:0})};}
  emit(name,event){for(const child of this.children)if(child instanceof Listener)child.props[name]?.(event);}
  addChild(child){
   child.map=this;this.children.add(child);
   if(child instanceof Marker){child.native=new globalThis.mapgl.HtmlMarker(this.native,{coordinates:child.props.coordinates,html:child.element,anchor:[0,0],zIndex:child.props.zIndex??1,interactive:true,preventMapInteractions:true});}
   if(child instanceof Listener)queueMicrotask(()=>{if(this.children.has(child))child.props.onStateChanged?.(this.tileState());});
   return this;
  }
  removeChild(child){this.children.delete(child);child.destroy?.();child.map=null;return this;}
  update(){} // Theme is fixed to the light map style.
  setLocation(location){const animation={duration:location.duration??0};if(location.center)this.native.setCenter(location.center,animation);if(location.zoom!==undefined)this.native.setZoom(location.zoom,animation);}
  project(point){return this.native.project(point);}
  fit(points,options){fit(this.native,points,options);}
  ensureVisible(point,options){
   const [x,y]=this.project(point),{x:w,y:h}=this.size,p=padding(options);
   const dx=x<p.left?x-p.left:x>w-p.right?x-(w-p.right):0;
   const dy=y<p.top?y-p.top:y>h-p.bottom?y-(h-p.bottom):0;
   if(dx||dy)this.native.setCenter(this.native.unproject([w/2+dx,h/2+dy]),{duration:200});
  }
  destroy(){this.observer.disconnect();for(const child of [...this.children])this.removeChild(child);this.native.destroy();}
 }
 function routeURL({from,to,mode='car'}){
  const type={walk:'pedestrian',transit:'bus',car:'car'}[mode]||'car';
  return 'https://2gis.ru/directions/tab/'+type+'/points/'+(from?from.join(','):'')+'|'+to.join(',');
 }
 const hotelAdapter={YMap:HotelMap,YMapMarker:Marker,YMapListener:Listener,YMapDefaultSchemeLayer:Layer,YMapDefaultFeaturesLayer:Layer};
 globalThis.KeysMaps={enabled,load,create,fit,routeURL,hotelAdapter};
})();
