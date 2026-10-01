/* Shared local demo data for every feedback entry point; no separate review UI. */
(() => {
 const key='keys-trip-reviews-v1';
 const empty=()=>({rating:0,text:'',privateMessage:'',photos:[],submitted:false,tip:0});
 let records={};try{records=JSON.parse(localStorage.getItem(key))||{};}catch{}
 const get=kind=>structuredClone({...empty(),...records[kind]});
 const save=(kind,value)=>{records[kind]={...get(kind),...value};try{localStorage.setItem(key,JSON.stringify(records));return true;}catch{return false;}};
 const readPhoto=file=>new Promise((resolve,reject)=>{
  const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{try{const scale=Math.min(1,1000/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.78));}catch(error){reject(error);}finally{URL.revokeObjectURL(url);}};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Не удалось открыть фото.'));};image.src=url;
 });
 window.KeysGuestReviews={get,save,readPhoto};
})();
