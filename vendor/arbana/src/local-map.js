/* Small, offline map adapter: preserves the original map pins, cards and controls. */
(() => {
  const projection={
    toWorldCoordinates([lon,lat]) {return {x:lon/180,y:Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360))/Math.PI};},
    fromWorldCoordinates({x,y}) {return [x*180,(2*Math.atan(Math.exp(y*Math.PI))-Math.PI/2)*180/Math.PI];}
  };
  class Layer {constructor(props={}){this.props=props;}update(props){Object.assign(this.props,props);this.map?.render();}}
  class Marker extends Layer {constructor(props,node){super(props);this.element=node;this.element.style.position='absolute';this.element.style.width='max-content';for(const [event,handler] of [['click',props.onClick],['mouseenter',props.onMouseEnter],['mouseleave',props.onMouseLeave]])if(handler)node.addEventListener(event,handler);}}
  class Listener extends Layer {}
  const svgNS='http://www.w3.org/2000/svg';
  class Map {
    constructor(container,options){
      this.container=container;this.center=options.location.center;this.zoom=options.location.zoom??14;this.zoomRange=options.zoomRange??{min:7,max:18};this.projection=projection;this.children=new Set();this.theme=options.theme;
      container.style.overflow='hidden';container.style.touchAction='none';
      this.surface=document.createElementNS(svgNS,'svg');this.surface.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';container.append(this.surface);
      this.credit=document.createElement('span');this.credit.textContent='Схема расположения · офлайн';this.credit.style.cssText='position:absolute;bottom:4px;left:8px;font:10px sans-serif;color:#687578;background:#fff9;border-radius:4px;padding:3px 6px;z-index:1;pointer-events:none';container.append(this.credit);
      this.pointer=null;
      this.down=e=>{if(e.target.closest('button,[role=button]'))return;this.pointer={x:e.clientX,y:e.clientY,center:this.center};container.setPointerCapture?.(e.pointerId);};
      this.move=e=>{if(!this.pointer)return;const w=projection.toWorldCoordinates(this.pointer.center),scale=2**(this.zoom+7);this.center=projection.fromWorldCoordinates({x:w.x-(e.clientX-this.pointer.x)/scale,y:w.y+(e.clientY-this.pointer.y)/scale});this.render();};
      this.up=()=>{if(this.pointer){this.pointer=null;this.emit('onActionEnd',{});this.emit('onUpdate',{mapInAction:false});}};
      this.wheel=e=>{e.preventDefault();this.setLocation({zoom:this.zoom+(e.deltaY<0?1:-1)});};
      this.dbl=e=>{if(!e.target.closest('button'))this.setLocation({zoom:this.zoom+1});};
      for(const [event,handler]of [['pointerdown',this.down],['pointermove',this.move],['pointerup',this.up],['pointercancel',this.up],['wheel',this.wheel],['dblclick',this.dbl]])container.addEventListener(event,handler,{passive:false});
      this.observer=new ResizeObserver(()=>{this.render();this.emit('onResize',{});});this.observer.observe(container);this.render();
    }
    get size(){return {x:this.container.clientWidth,y:this.container.clientHeight};}
    get bounds(){const w=projection.toWorldCoordinates(this.center),s=2**(this.zoom+7),{x,y}=this.size;return [projection.fromWorldCoordinates({x:w.x-x/2/s,y:w.y-y/2/s}),projection.fromWorldCoordinates({x:w.x+x/2/s,y:w.y+y/2/s})];}
    point(coordinates){const p=projection.toWorldCoordinates(coordinates),c=projection.toWorldCoordinates(this.center),s=2**(this.zoom+7);return [this.size.x/2+(p.x-c.x)*s,this.size.y/2-(p.y-c.y)*s];}
    emit(name,arg){for(const c of this.children)if(c instanceof Listener)c.props[name]?.(arg);}
    addChild(child){child.map=this;this.children.add(child);if(child instanceof Marker)this.container.append(child.element);this.render();if(child instanceof Listener){queueMicrotask(()=>child.props.onStateChanged?.({getLayerState:()=>({tilesTotal:1,tilesLoaded:1})}));}return this;}
    removeChild(child){this.children.delete(child);child.element?.remove();child.map=null;return this;}
    update(options){Object.assign(this,options);this.render();}
    setLocation(loc){if(loc.center)this.center=loc.center;if(loc.zoom!==undefined)this.zoom=Math.max(this.zoomRange.min??7,Math.min(this.zoomRange.max??18,loc.zoom));this.render();this.emit('onUpdate',{mapInAction:false});}
    render(){
      const dark=this.theme==='dark';this.container.style.background=dark?'#283636':'#e5ece2';
      const line=points=>points.map((p,i)=>(i?'L':'M')+this.point(p).join(' ')).join(' ');
      const coast=[[38.7,44.4],[39.3,44.0],[39.51,43.81],[39.66,43.63],[39.715,43.575],[39.74,43.554],[39.80,43.50],[39.895,43.425],[39.98,43.395],[40.28,43.21]];
      const sea=[...coast,[40.4,42],[38,42],[38.7,44.4]];
      const route=coast.map(([x,y])=>[x+.012,y+.017]);
      const mount=[[39.89,43.43],[39.98,43.52],[40.12,43.64],[40.25,43.68],[40.32,43.7]];
      this.surface.innerHTML=`<path d="${line(sea)}Z" fill="${dark?'#203b49':'#bedfe9'}"/><path d="${line(coast)}" fill="none" stroke="${dark?'#587474':'#c3d7c0'}" stroke-width="8"/><path d="${line(route)}" fill="none" stroke="${dark?'#7a7764':'#fff'}" stroke-width="9"/><path d="${line(route)}" fill="none" stroke="${dark?'#aca17b':'#e7d9ac'}" stroke-width="3"/><path d="${line(mount)}" fill="none" stroke="${dark?'#8d896f':'#fff'}" stroke-width="5"/>`;
      for(const [text,pos]of [['Сочи',[39.724,43.604]],['Адлер',[39.913,43.447]],['Красная Поляна',[40.206,43.68]],['Чёрное море',[39.67,43.46]]]){const [x,y]=this.point(pos);if(x< -100||y< -30||x>this.size.x+100||y>this.size.y+30)continue;const label=document.createElementNS(svgNS,'text');label.setAttribute('x',x);label.setAttribute('y',y);label.setAttribute('fill',dark?'#b9cbc9':'#637778');label.setAttribute('font-size','14');label.setAttribute('font-family','Golos Text, sans-serif');label.textContent=text;this.surface.append(label);}
      for(const c of this.children){if(!(c instanceof Marker))continue;const[x,y]=this.point(c.props.coordinates);c.element.style.left=x+'px';c.element.style.top=y+'px';c.element.style.zIndex=String(c.props.zIndex??10);}
    }
    destroy(){this.observer.disconnect();for(const [event,handler]of [['pointerdown',this.down],['pointermove',this.move],['pointerup',this.up],['pointercancel',this.up],['wheel',this.wheel],['dblclick',this.dbl]])this.container.removeEventListener(event,handler);for(const c of this.children)c.element?.remove();this.children.clear();this.surface.remove();this.credit.remove();}
  }
  globalThis.PoraLocalMap={YMap:Map,YMapMarker:Marker,YMapListener:Listener,YMapDefaultSchemeLayer:Layer,YMapDefaultFeaturesLayer:Layer,ready:Promise.resolve()};
})();
