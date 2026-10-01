function VU({hotel,onClose}) {
 const {state,toast}=J(),[fallback,setFallback]=E.useState(false);
 const url=Kg(window.location.href,hotel.id,state.search);
 const copy=async()=>{try{await navigator.clipboard.writeText(url);toast('Ссылка на отель скопирована');onClose();}catch{setFallback(true);}};
 const share=async()=>{try{await navigator.share({title:hotel.name,url});onClose();}catch(error){if(error?.name!=='AbortError')setFallback(true);}};
 return n.jsx(ct,{title:'Поделиться отелем',onClose,children:n.jsxs('div',{className:'keys-hotel-share-content',children:[
  n.jsxs('div',{className:'keys-hotel-share-actions',children:[
   typeof navigator.share==='function'&&n.jsx(H,{variant:'secondary',icon:'share',onClick:share,children:'Поделиться ссылкой'}),
   n.jsx(H,{variant:'secondary',icon:'copy',onClick:copy,children:'Копировать ссылку'})
  ]}),
  fallback&&n.jsxs('label',{className:'keys-hotel-share-fallback',children:[n.jsx('span',{children:'Ссылка на отель'}),n.jsx('input',{'aria-label':'Ссылка на отель',readOnly:true,value:url,onFocus:event=>event.currentTarget.select()})]})
 ]})});
}
