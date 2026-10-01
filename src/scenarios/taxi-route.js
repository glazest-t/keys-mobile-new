/* Official Yandex Go universal link. Coordinates stay in memory only. */
(() => {
 const destination={latitude:55.737954,longitude:37.585621};
 function createUrl(point){
  const url=new URL('https://3.redirect.appmetrica.yandex.com/route');
  const valid=point&&Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&Math.abs(point.latitude)<=90&&Math.abs(point.longitude)<=180;
  if(valid){url.searchParams.set('start-lat',point.latitude);url.searchParams.set('start-lon',point.longitude);}
  url.searchParams.set('end-lat',destination.latitude);url.searchParams.set('end-lon',destination.longitude);
  url.searchParams.set('ref','keys');url.searchParams.set('lang','ru');
  url.searchParams.set('appmetrica_tracking_id','25395763362139037');
  return url.href;
 }
 function locate(){
  return new Promise((resolve,reject)=>{
   if(!globalThis.navigator?.geolocation){reject({code:0});return;}
   let settled=false;
   const finish=(callback,value)=>{if(settled)return;settled=true;clearTimeout(timer);callback(value);};
   const timer=setTimeout(()=>finish(reject,{code:3}),12000);
   navigator.geolocation.getCurrentPosition(position=>finish(resolve,{latitude:position.coords.latitude,longitude:position.coords.longitude}),error=>finish(reject,error),{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  });
 }
 globalThis.KeysTaxiRoute={createUrl,locate};
})();
