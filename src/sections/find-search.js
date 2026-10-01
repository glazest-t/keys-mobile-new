function sF() {
 const {state,dispatch,open}=J(),source=tt(),remote=source.source==='travelline';
 const [hotelId,setHotelId]=E.useState(null),search=state.search;
 return n.jsxs(n.Fragment,{children:[
  n.jsxs('form',{className:'keys-search-hero','aria-label':'Поиск отеля',onSubmit:event=>{
   event.preventDefault();hotelId?(source.recordOpen(hotelId),open({type:'hotel',hotelId})):dispatch({type:'SEARCH_SUBMIT',city:search.city});
  },children:[
   n.jsxs('div',{className:'keys-search-fields',children:[
    n.jsx(f4,{onHotelChange:setHotelId,variant:'line',required:!remote,value:search.city,onChange:city=>dispatch({type:'SEARCH_PATCH',patch:{city}})}),
    n.jsxs('div',{className:'keys-search-parameters',children:[
     n.jsxs('button',{type:'button',onClick:()=>open({type:'dates'}),children:[n.jsx(D,{name:'calendar'}),n.jsxs('span',{children:[n.jsx('small',{children:'Даты поездки'}),n.jsx('strong',{children:it(search.arrival,search.departure)})]})]}),
     n.jsxs('button',{type:'button',onClick:()=>open({type:'guests'}),children:[n.jsx(D,{name:'users'}),n.jsxs('span',{children:[n.jsx('small',{children:'Гости'}),n.jsx('strong',{children:Rt(search.party)})]})]})
    ]})
   ]}),
   n.jsx(H,{type:'submit',icon:'search',className:'keys-search-submit',children:'Найти отель'})
  ]}),
  n.jsx(B4,{})
 ]});
}

function KeysFindHeading(){
 const {open}=J();
 return n.jsxs('div',{className:'keys-find-heading',children:[
  n.jsx('h1',{children:'Куда поедем?'}),
  n.jsx('button',{type:'button',className:'keys-find-favorites','aria-label':'Избранные отели',title:'Избранные отели',onClick:()=>open({type:'saved'}),children:n.jsx(D,{name:'heart'})})
 ]});
}
