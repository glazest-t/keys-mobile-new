function TB({children:e,onPrompt:t,title:a=true}) {
 const [r,l]=E.useState(0),c=_0.slice(0,-1),u=_0[_0.length-1],m=[...c.slice(r),...c.slice(0,r)].slice(0,wB);
 const labels={'pool-and-quiet':'Бассейн и вкусный ужин','family-break':'Отдохнуть с детьми','couple':'Вдвоём у моря','recharge':'Тишина и спа','work-and-rest':'Работа и отдых','pet':'С питомцем'};
 return n.jsxs('div',{className:'keys-selection-welcome',children:[
  a&&n.jsxs('section',{className:'keys-selection-intro',children:[n.jsx('h2',{children:'Какой отдых хотите?'}),n.jsx('p',{children:'Расскажите о пожеланиях — подберём подходящие отели.'})]}),e,
  n.jsxs('div',{className:'keys-selection-ideas-heading',children:[n.jsx('h2',{children:'Идеи для поездки'}),n.jsxs('button',{type:'button',onClick:()=>l((r+3)%c.length),children:['Ещё идеи',n.jsx(D,{name:'repeat'})]})]}),
  n.jsx('div',{className:'keys-selection-ideas',children:m.map(h=>n.jsxs('button',{type:'button',onClick:()=>t(h.text),children:[n.jsx(D,{name:h.icon}),n.jsx('span',{children:labels[h.id]??h.title})]},h.id))}),
  n.jsxs('button',{type:'button',className:'keys-selection-unsure',onClick:()=>t(u.text),children:[u.title,n.jsx(D,{name:'chevron'})]})
 ]});
}
