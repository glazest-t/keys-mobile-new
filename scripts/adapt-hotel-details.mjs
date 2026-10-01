export function adaptHotelDetails(source,components){
 const start=source.indexOf('function TY('),end=source.indexOf('function kY(',start);
 if(start<0||end<0)throw Error('Hotel overview components missing');
 let js=source.slice(0,start)+components+'\n'+source.slice(end);
 const hotel=js.indexOf('function mV() {'),next=js.indexOf('const Nk =',hotel);
 if(hotel<0||next<0)throw Error('Hotel page component missing');
 return js.slice(0,hotel)+'function mV() { return n.jsx(KeysHotelPage, {}); }\n'+js.slice(next);
}
