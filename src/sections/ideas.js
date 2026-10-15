// Keys presentation for the reference's adaptive ideas engine.
function KeysIdeaArt({name,className=''}){return n.jsx('img',{src:'./ideas-art/'+name+(name.startsWith('destination-')?'.png':'.webp'),alt:'',className:'ki-art '+className,draggable:false});}
// Full-scene artwork from the updated reference; preferences retain compact icons.
function KeysIdeaCover({card,className=''}){
 const [failed,setFailed]=E.useState(false);
 return failed?n.jsx(KeysIdeaArt,{name:card.icon,className}):n.jsx('img',{src:'./ideas-art/covers/'+card.id+'.webp',alt:'',className:'ki-cover '+className,draggable:false,onError:()=>setFailed(true)});
}
// Presentation only: the existing reducer still owns selection and ranking.
function KeysIdeaFlight({flight,onDone}){
 E.useLayoutEffect(()=>{
  if(!flight)return;
  const target=document.querySelector('.ki-bag [data-preference-id="'+flight.id+'"] .ki-art');
  if(!target||window.matchMedia('(prefers-reduced-motion: reduce)').matches){onDone();return;}
  const rail=target.closest('.ki-bag-items'),chip=target.closest('[data-preference-id]');
  if(rail&&rail.scrollWidth>rail.clientWidth)rail.scrollLeft=chip.offsetLeft-rail.offsetLeft;
  const to=target.getBoundingClientRect(),from=flight.from;
  if(!to.width||to.bottom<0||to.top>innerHeight){onDone();return;}
  const picture=document.createElement('img');picture.src='./ideas-art/'+flight.icon+'.webp';picture.alt='';picture.className='ki-preference-flight';picture.setAttribute('aria-hidden','true');
  Object.assign(picture.style,{left:from.x+'px',top:from.y+'px',width:from.size+'px',height:from.size+'px'});
  document.body.append(picture);
  const dx=to.x-from.x,dy=to.y-from.y;
  const animation=picture.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:'translate('+dx*.45+'px,'+(dy*.45-70)+'px) scale(.85) rotate(-10deg)',offset:.45,opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale('+to.width/from.size+') rotate(0)',opacity:1}],{duration:640,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'});
  animation.onfinish=onDone;
  return()=>{animation.onfinish=null;animation.cancel();picture.remove();};
 },[flight,onDone]);
 return null;
}
// One removable preference chip for the questionnaire and the results summary.
function KeysPreferenceTag({card,onRemove,arriving=false}){
 return n.jsxs('button',{type:'button',className:'ki-preference-tag'+(arriving?' is-arriving':''),'data-preference-id':card.id,'aria-label':'Убрать желание: '+card.short,onClick:()=>onRemove(card.id),children:[n.jsx(KeysIdeaArt,{name:card.icon}),n.jsx('span',{children:card.short}),n.jsx(D,{name:'close',className:'ki-preference-remove'})]});
}
function KeysPreferenceChoice({axis,value,onChange}){
 const title=axis==='calm'?'Темп отдыха':'Окружение';
 const labels=axis==='calm'?['Спокойный','Баланс','Активный']:['Город','Не важно','Природа'];
 const selected=Math.abs(value)<.25?0:value<0?-1:1;
 return n.jsxs('fieldset',{className:'ki-preference',children:[
  n.jsx('legend',{children:title}),
  n.jsx('div',{className:'ki-preference-options',children:labels.map((label,index)=>{
   const option=index-1;
   return n.jsxs('label',{className:'ki-preference-option',children:[
    n.jsx('input',{type:'radio',name:'ki-preference-'+axis,value:option,checked:selected===option,onChange:()=>onChange(option)}),
    n.jsx('span',{children:label})
   ]},option);
  })})
 ]});
}
// Shared company choices for the onboarding question and later preference edits.
function KeysCompanyChoices({value,onChange,advance=false}){
 if(advance)return n.jsx('div',{className:'ki-company-cards',role:'group','aria-label':'С кем планируете поездку?',children:Object.entries(KeysIdeas.companies).map(([id,option])=>n.jsxs('button',{type:'button',className:'ki-company-card','data-company':id,'aria-pressed':value===id,onClick:()=>onChange(id),children:[n.jsx(KeysIdeaArt,{name:option.icon}),n.jsx('span',{children:option.label})]},id))});
 return n.jsx('div',{className:'ki-company-options',role:'radiogroup','aria-label':'С кем планируете поездку?',children:Object.entries(KeysIdeas.companies).map(([id,option])=>n.jsxs('label',{className:'ki-company-option',children:[
  n.jsx('input',{type:'radio',name:'ideas-company',value:id,checked:value===id,onChange:()=>onChange(id)}),
  n.jsx(KeysIdeaArt,{name:option.icon}),n.jsx('span',{children:option.label}),n.jsx('span',{className:'ki-company-radio','aria-hidden':true})
 ]},id))});
}
function KeysIdeaBudget({ideas,onChange}){
 const {min,max}=KeysIdeas.budgetRange(ideas),limit=50000,upper=max??limit;
 const change=(key,value)=>onChange({min:key==='min'?Math.min(value,upper):min,max:key==='max'?(value===limit?null:Math.max(value,min)):max});
 const input=(key,value,label)=>n.jsx('input',{type:'range',min:0,max:limit,step:500,value,'aria-label':label,'aria-valuetext':key==='max'&&max===null?'Без лимита':Te(value),onChange:event=>change(key,Number(event.target.value))});
 return n.jsxs('fieldset',{className:'ki-budget-range',children:[
  n.jsx('legend',{children:'Бюджет за ночь'}),
  n.jsxs('div',{className:'ki-budget-values','aria-live':'off',children:[n.jsxs('div',{children:[n.jsx('span',{children:'От'}),n.jsx('output',{children:Te(min)})]}),n.jsxs('div',{children:[n.jsx('span',{children:'До'}),n.jsx('output',{children:max===null?'Без лимита':Te(max)})]})]}),
  n.jsxs('div',{className:'ki-budget-slider',style:{'--range-from':(min/limit*100)+'%','--range-to':(upper/limit*100)+'%'},children:[n.jsx('div',{className:'ki-budget-track','aria-hidden':true}),input('min',min,'Минимальный бюджет за ночь'),input('max',upper,'Максимальный бюджет за ночь')]}),
  n.jsxs('div',{className:'ki-budget-scale','aria-hidden':true,children:[n.jsx('span',{children:'0 ₽'}),n.jsx('span',{children:'50 000 ₽+'})]})
 ]});
}
function KeysIdeasPage({onBack,embedded=false}){
 const {state,dispatch,open}=J(), engine=KeysIdeas;
 const initial=()=>{if(!embedded&&state.navigation.screen?.keysWish){const text=state.navigation.screen.keysWish,search={...state.search,city:''},ideas={...engine.initial(engine.company(search.party),engine.month(search)),destination:'*'};return {ideas:engine.reduce({...state,search,ideas},{type:'IDEAS_WISH',...engine.parse(text)}).ideas,stage:'results',entry:'request',wish:text};}try{const saved=JSON.parse(sessionStorage.getItem('keys-ideas-v1'));if(saved?.ideas?.likes&&saved?.ideas?.current)return embedded?{...saved,stage:'welcome'}:saved;}catch{}return {ideas:engine.initial(engine.company(state.search.party),engine.month(state.search)),stage:'welcome'};};
 const [model,setModel]=E.useState(initial),[tune,setTune]=E.useState(false),[topic,setTopic]=E.useState(null),[text,setText]=E.useState(()=>model.entry==='request'?model.wish||'':''),[reply,setReply]=E.useState(''),[sort,setSort]=E.useState('fit'),[expanded,setExpanded]=E.useState(false),[swipe,setSwipe]=E.useState(0),[leaving,setLeaving]=E.useState(false),[cityDraft,setCityDraft]=E.useState('');
 const [flight,setFlight]=E.useState(null);
 const landed=E.useCallback(()=>setFlight(null),[]);
 const touch=E.useRef(null),timer=E.useRef(null),scroll=E.useRef(null);
 const ideas=E.useMemo(()=>({...model.ideas,destination:model.ideas.destination??state.search.city??'Сочи'}),[model.ideas,state.search.city]),stage=model.stage,destination=ideas.destination??state.search.city??'Сочи',search=E.useMemo(()=>({...state.search,city:destination==='*'?'':destination}),[state.search,destination]);
 E.useEffect(()=>setFlight(null),[stage]);
 const regional=engine.regionalDestination({...ideas,destination});
 const env=E.useCallback(value=>({...state,search,ideas:{...value,destination:value.destination??destination},navigation:{...state.navigation,screen:{type:'ideas'}}}),[state,search,destination]);
 const act=action=>setModel(prev=>({...prev,ideas:engine.reduce(env(prev.ideas),action).ideas}));
 const go=next=>{if(embedded&&next!=='welcome'){sessionStorage.setItem('keys-ideas-v1',JSON.stringify({ideas,stage:next}));open({type:'describe'});return;}setModel(prev=>({...prev,stage:next}));setTopic(null);setReply('');scroll.current?.scrollTo({top:0});};
 E.useEffect(()=>{try{sessionStorage.setItem('keys-ideas-v1',JSON.stringify({...model,ideas}));}catch{}},[model,destination]);
 E.useEffect(()=>()=>clearTimeout(timer.current),[]);
 E.useLayoutEffect(()=>{if(document.documentElement.dataset.desktopAccount==='true')scroll.current?.closest('.keys-module-scroll')?.scrollTo({top:0});},[stage]);
 E.useEffect(()=>{setModel(prev=>({...prev,ideas:engine.refresh({search},prev.ideas)}));},[search.arrival,search.departure,destination]);
 const ranking=E.useMemo(()=>engine.rank(ideas,search,state.discovery.priceTick),[ideas,search,state.discovery.priceTick]);
 const total=ranking.fitting.length,selected=ideas.likes.map(engine.get).filter(Boolean),company=engine.companies[ideas.company],mood=engine.mood(ideas),step=ideas.current,item=engine.get(step.id);
 // The destination gate keeps the requested entry mode until a location is chosen.
 const requestDestination=(pendingAction=null)=>{
  const next={...model,ideas,stage:'destination',pendingAction,destinationReturn:pendingAction?'choose':stage};
  setTune(false);setTopic(null);setReply('');
  if(embedded){sessionStorage.setItem('keys-ideas-v1',JSON.stringify(next));open({type:'describe'});}else setModel(next);
 };
 const confirmDestination=city=>{
  let next=engine.reduce(env(ideas),{type:'IDEAS_DESTINATION',city}).ideas;
  setModel(model.pendingAction?{...model,ideas:next,stage:'company'}:{ideas:next,stage:model.destinationReturn==='where'?'choose':model.destinationReturn||'choose'});
  setTopic(null);setExpanded(false);setSort('fit');setReply('');setText('');
 };
 const confirmCompany=company=>{
  let next=engine.reduce(env(ideas),{type:'IDEAS_COMPANY',company}).ideas;
  if(model.pendingAction)next=engine.reduce(env(next),model.pendingAction).ideas;
  setModel({ideas:next,stage:model.pendingAction?.type==='IDEAS_WISH'?'results':'choose'});setTopic(null);scroll.current?.scrollTo({top:0});
 };
 const start=(mode='feed',like)=>requestDestination({type:'IDEAS_START',mode,like});
 const back=()=>{
  if(stage==='city'){go('destination');return;}
  if(stage==='company'){requestDestination(model.pendingAction||{type:'IDEAS_START',mode:ideas.mode});return;}
  if(stage==='destination'){
   if(!model.pendingAction&&model.destinationReturn){go(model.destinationReturn);return;}
   onBack?onBack():go('welcome');return;
  }
  if(topic){setTopic(null);return;}
  if(stage==='results'&&model.entry==='request'){
   sessionStorage.setItem('keys-ideas-v1',JSON.stringify({...model,ideas,stage:'welcome'}));
   dispatch({type:'NAV_TAB',tab:'find'});
   dispatch({type:'SEARCH_PATCH',patch:{intent:'discover',results:false}});
   return;
  }
  if(stage==='results'||stage==='where'){go('choose');return;}
  if(stage==='choose'){go('company');return;}
  onBack?onBack():dispatch({type:'SEARCH_PATCH',patch:{intent:'known',results:false}});
 };
 const sendWish=()=>{if(!text.trim())return;const wish=engine.parse(text);if(stage==='welcome'){
  const fresh={...engine.initial(ideas.company,engine.month(search)),destination};
  const next={ideas:engine.reduce(env(fresh),{type:'IDEAS_WISH',...wish}).ideas,stage:'results',entry:'request',wish:text.trim()};
  setReply('');setText('');setExpanded(false);setSort('fit');
  if(embedded){sessionStorage.setItem('keys-ideas-v1',JSON.stringify(next));open({type:'describe'});}else{setModel(next);scroll.current?.scrollTo({top:0});}
  return;
 }act({type:'IDEAS_WISH',...wish});setText('');setReply('Пожелания добавлены. Подборка обновилась.');};
 const flightFrom=(card,element)=>{
  if(!element||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
  const box=element.getBoundingClientRect(),size=Math.min(120,box.width,box.height);
  return {id:card.id,icon:card.icon,from:{x:box.x+(box.width-size)/2,y:box.y+Math.min((box.height-size)/2,box.height*.25),size}};
 };
 const decide=liked=>{if(leaving)return;const nextFlight=liked?flightFrom(item,scroll.current?.querySelector('.ki-hero-art')):null;setLeaving(true);setSwipe(liked?150:-150);timer.current=setTimeout(()=>{act({type:'IDEAS_ANSWER',id:step.id,liked});setFlight(nextFlight);setSwipe(0);setLeaving(false);},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);};
 const switchMode=value=>{act({type:'IDEAS_MODE',mode:value});setTopic(null);};
 const tabs=n.jsx(ru,{variant:'pill',label:'Как выбирать',value:ideas.mode,options:[{value:'feed',label:'Лента'},{value:'topics',label:'По темам'}],onChange:switchMode});
 const form=n.jsxs('form',{className:'ki-wish-form',onSubmit:e=>{e.preventDefault();sendWish();},children:[n.jsx(stage==='welcome'?'textarea':'input',{value:text,onChange:e=>{setText(e.target.value);if(reply)setReply('');},rows:stage==='welcome'?2:undefined,onKeyDown:e=>{if(stage==='welcome'&&e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(text.trim())sendWish();}},placeholder:stage==='welcome'?'Например, тишина, спа и бассейн…':'Напишите, чего хочется…','aria-label':'Пожелания к отдыху',maxLength:500}),n.jsx('button',{type:'submit',disabled:!text.trim(),'aria-label':stage==='welcome'?'Отправить запрос':'Добавить пожелания',title:stage==='welcome'?'Подобрать отели':undefined,children:n.jsx(D,{name:'arrow',className:'size-5'})})]});
 const destinationAction=n.jsxs('button',{type:'button',className:'ki-location-action',onClick:()=>requestDestination(),'aria-label':'Изменить направление: '+(destination==='*'?'Любой город':destination),children:[n.jsx(D,{name:'pin',className:'size-4'}),n.jsx('span',{children:destination==='*'?'Любой город':destination}),n.jsx(D,{name:'chevron',className:'size-4'})]});
 const destinationStep=n.jsxs('div',{className:'ki-destination-step',children:[
  n.jsxs('div',{className:'ki-destination-intro',children:[n.jsx('h2',{children:stage==='city'?'В каком городе ищем?':'Куда хочется поехать?'}),n.jsx('p',{children:stage==='city'?'Выберите город для вашей подборки.':'Есть планы или открыты новым направлениям?'})]}),
  stage==='city'?n.jsxs('div',{className:'ki-city-picker',children:[n.jsx(KeysIdeaArt,{name:'destination-city',className:'ki-city-art'}),n.jsxs('form',{className:'ki-city-form','aria-label':'Выбор города',onSubmit:event=>{event.preventDefault();if(cityDraft.trim())confirmDestination(cityDraft.trim());},children:[n.jsx(f4,{variant:'line',citiesOnly:true,required:true,value:cityDraft,onChange:setCityDraft}),n.jsx(H,{type:'submit',disabled:!cityDraft.trim(),children:'Продолжить'})]})]}):n.jsx('div',{className:'ki-destination-options',children:[
   {id:'any',title:'Любой город',description:'Найдём отель под ваши желания',action:()=>confirmDestination('*')},
   {id:'city',title:'Конкретный город',description:'Уже знаю, куда хочу поехать',action:()=>{setCityDraft(destination==='*'?'':destination);go('city');}}
  ].map(option=>n.jsxs('button',{type:'button',className:'ki-destination-card',onClick:option.action,children:[n.jsx(KeysIdeaArt,{name:'destination-'+option.id}),n.jsxs('span',{className:'ki-destination-copy',children:[n.jsx('strong',{children:option.title}),n.jsx('span',{children:option.description})]}),n.jsx(D,{name:'chevron',className:'size-5'})]},option.id))})
 ]});
 const companyStep=n.jsxs('div',{className:'ki-company-step',children:[
  n.jsxs('div',{className:'ki-destination-intro',children:[n.jsx('h2',{children:'С кем планируете поездку?'}),n.jsx('p',{children:'Подберём подходящие отели и впечатления.'})]}),
  n.jsx(KeysCompanyChoices,{value:ideas.companyChosen?ideas.company:null,advance:true,onChange:confirmCompany})
 ]});
 const resultButton=n.jsx(H,{onClick:()=>{setExpanded(false);go('results');},children:total?'Показать '+as(total):'Показать близкие варианты'});
 const bag=n.jsxs('aside',{className:'ki-bag','aria-label':'Ваши пожелания',children:[n.jsx('div',{className:'ki-bag-title',children:n.jsx('strong',{children:total?as(total)+' по вашим пожеланиям':'Точных совпадений пока нет'})}),n.jsx('div',{className:'ki-bag-items',children:selected.length?selected.map(card=>n.jsx(KeysPreferenceTag,{card,arriving:flight?.id===card.id,onRemove:id=>act({type:'IDEAS_DROP',id})},card.id)):n.jsx('p',{children:'Отмечайте «Хочу» — желания появятся здесь'})}),resultButton]});
 const topics=engine.topics.filter(group=>engine.allowed(group,ideas.company)&&group.options.some(id=>{const card=engine.get(id);return card&&engine.destinationAllowed(card,ideas);}));
 const activeTopic=topics.find(group=>group.id===topic);
 const themeBody=activeTopic?n.jsxs('div',{className:'ki-topic-options',children:[n.jsxs('div',{className:'ki-topic-title',children:[n.jsx('button',{type:'button','aria-label':'Назад к темам',onClick:()=>setTopic(null),children:n.jsx(D,{name:'back',className:'size-5'})}),n.jsx('h2',{children:activeTopic.label})]}),n.jsx('div',{className:'ki-topic-grid',children:activeTopic.options.map(engine.get).filter(card=>card&&engine.allowed(card,ideas.company)&&engine.destinationAllowed(card,ideas)).map(card=>{const lock=engine.locked(card,engine.month(search));return n.jsxs('button',{type:'button','aria-pressed':ideas.likes.includes(card.id),'aria-label':card.short+(lock?', '+lock:''),className:'ki-topic-card',onClick:event=>{const nextFlight=!lock&&!ideas.likes.includes(card.id)?flightFrom(card,event.currentTarget.querySelector('.ki-art')):null;act({type:lock?'IDEAS_LOCKED':'IDEAS_TOGGLE',id:card.id});setFlight(nextFlight);},children:[n.jsx(KeysIdeaArt,{name:card.icon}),n.jsx('strong',{children:card.short}),lock&&n.jsx('small',{children:lock}),ideas.likes.includes(card.id)&&n.jsx(D,{name:'check',className:'ki-topic-check size-4'})]},card.id);})})]}):n.jsxs('div',{className:'ki-topics',children:[n.jsx('h2',{children:'Что хочется попробовать?'}),n.jsx('div',{className:'ki-topic-grid',children:topics.map(group=>n.jsxs('button',{type:'button',className:'ki-topic-card',onClick:()=>setTopic(group.id),children:[n.jsx(KeysIdeaArt,{name:group.icon}),n.jsx('strong',{children:group.label}),group.options.some(id=>ideas.likes.includes(id))&&n.jsx('small',{children:'Выбрано: '+group.options.filter(id=>ideas.likes.includes(id)).length})]},group.id))})]});
 const advice=engine.advice(ideas);
 const locationChoices=n.jsxs('div',{className:'ki-area-choices',children:[n.jsx('h2',{children:advice.title}),n.jsx('p',{children:advice.text}),n.jsx('div',{className:'ki-area-map','aria-label':'Районы и отели на карте',children:n.jsx(E.Suspense,{fallback:n.jsx('p',{children:'Загружаем карту…'}),children:n.jsx(ZV,{hotels:[...ranking.fitting,...ranking.others],previewHeight:0,dates:search,priceTick:state.discovery.priceTick,booked:false,onSelect:ids=>{const id=Array.isArray(ids)?ids[0]:ids;if(id)open({type:'hotel-map',hotelId:id,selectedOnly:true});},onDismiss:()=>{}})})}),engine.areasRank(ideas).map(({area})=>n.jsxs('button',{type:'button','aria-pressed':ideas.district===area,onClick:()=>{act({type:'IDEAS_DISTRICT',district:area});go('results');},children:[n.jsx('span',{children:[n.jsx('strong',{children:engine.areas[area].label}),n.jsx('small',{children:engine.areas[area].text})]}),n.jsx(D,{name:'chevron',className:'size-4'})]},area)),n.jsx(H,{variant:'secondary',onClick:()=>{act({type:'IDEAS_DISTRICT',district:'any'});go('results');},children:'Район не важен'})]});
 const choose=n.jsxs('div',{className:'ki-workspace',children:[n.jsx('div',{className:'ki-choice-body',children:ideas.mode==='topics'?themeBody:n.jsxs(n.Fragment,{children:[step.type==='ex'&&item?n.jsxs(n.Fragment,{children:[n.jsxs('article',{key:step.id,className:'ki-idea-card ki-scene-card',style:{'--ki-tint':engine.tints[item.icon],transform:swipe?'translateX('+swipe+'px) rotate('+swipe/18+'deg)':undefined,opacity:leaving ? .25 : 1},onPointerDown:e=>{touch.current={x:e.clientX,y:e.clientY};},onPointerUp:e=>{const point=touch.current;touch.current=null;if(point&&Math.abs(e.clientX-point.x)>60&&Math.abs(e.clientX-point.x)>Math.abs(e.clientY-point.y)*1.2)decide(e.clientX>point.x);},onPointerCancel:()=>{touch.current=null;},children:[n.jsxs('div',{className:'ki-scene-meta',children:[destinationAction,n.jsx('span',{className:'ki-idea-kind',children:item.kind==='in'?'В отеле':engine.areas[item.area]?.label})]}),n.jsx(KeysIdeaCover,{card:item,className:'ki-hero-art'}),n.jsxs('div',{className:'ki-scene-caption',children:[n.jsx('h2',{children:engine.title(item,ideas.company)}),n.jsx('p',{children:item.text})]})]}),n.jsxs('div',{className:'ki-decisions',children:[n.jsx(H,{variant:'secondary',disabled:leaving,onClick:()=>decide(false),children:n.jsxs(n.Fragment,{children:[n.jsx(D,{name:'close',className:'size-4'}),'Не моё']})}),n.jsx(H,{disabled:leaving,onClick:()=>decide(true),children:n.jsxs(n.Fragment,{children:[n.jsx(D,{name:'heart',className:'size-4'}),'Хочу']})})]})]}):step.type==='ask'&&item?n.jsxs('section',{className:'ki-question',children:[n.jsx(KeysIdeaArt,{name:item.icon,className:'ki-question-art'}),n.jsx('h2',{children:item.title}),n.jsx('p',{children:item.text}),n.jsx('div',{className:'ki-question-answers',children:(item.id==='budget'?engine.budgets:item.options||[]).map(option=>n.jsx(H,{variant:'secondary',onClick:()=>act({type:'IDEAS_ASK',id:item.id,value:option.value}),children:option.label},option.value))})]}):step.type==='where'?n.jsxs('section',{className:'ki-question',children:[n.jsx(KeysIdeaArt,{name:'mountains',className:'ki-question-art'}),n.jsx('h2',{children:advice.title}),n.jsx('p',{children:advice.text}),advice.recommended&&n.jsx(H,{onClick:()=>act({type:'IDEAS_DISTRICT',district:advice.recommended}),children:'Жить '+engine.areas[advice.recommended].in}),n.jsx(H,{variant:'secondary',onClick:()=>go('where'),children:'Сравнить районы'}),n.jsx(H,{variant:'secondary',onClick:()=>act({type:'IDEAS_DISTRICT',district:'any'}),children:'Район не важен'})]}):n.jsxs('section',{className:'ki-question',children:[n.jsx(KeysIdeaArt,{name:'sea',className:'ki-question-art'}),n.jsx('h2',{children:'Уже можем подобрать'}),n.jsx('p',{children:selected.length?'Учтём ваши желания и покажем подходящие отели.':'Покажем отели с лучшими отзывами.'}),resultButton,step.left&&n.jsx(H,{variant:'secondary',onClick:()=>act({type:'IDEAS_MORE'}),children:'Ещё идеи'})]})]})}),bag]});
 const sorted=[...ranking.fitting].sort((a,b)=>sort==='cheap'?tx(a,search,state.discovery.priceTick).total-tx(b,search,state.discovery.priceTick).total:sort==='sea'?(a.seaDistance??99999)-(b.seaDistance??99999):sort==='quiet'?Number(b.quiet)-Number(a.quiet):0);
 const renderHotel=(hotel,near=false)=>{
  const reasons=engine.reasons(hotel,ideas,search,state.discovery.priceTick),matches=engine.matches(hotel,ideas);
  return n.jsxs('div',{className:'ki-hotel-result',children:[n.jsx(KeysResultsHotelCard,{hotel,local:hotel,locationCity:hotel.city,price:tx(hotel,search,state.discovery.priceTick),onOpen:()=>{dispatch({type:'SEARCH_PATCH',patch:{city:hotel.city}});dispatch({type:'HOTEL_OPEN',id:hotel.id});}}),n.jsxs('details',{className:'ki-match',children:[
   n.jsxs('summary',{children:[n.jsx('span',{children:near?'Что стоит учесть':'Почему подходит вам'}),matches.total>0&&n.jsx('span',{className:'ki-match-badge'+(matches.matched?' is-matched':''),'aria-label':'Совпало '+matches.matched+' из '+matches.total+' предпочтений',children:matches.matched+' из '+matches.total}),n.jsx(D,{name:'down',className:'ki-match-chevron'})]}),
   n.jsx('dl',{className:'ki-match-reasons',children:reasons.map((reason,index)=>{
    const [heading,...rest]=reason.text.split(' — '),description=rest.join(' — ');
    const title=reason.icon==='budget'?'Бюджет':heading;
    let detail=description.replace('рядом, ','').replace(/минут/g,'мин').replace('около часа на машине','≈ 1 ч на машине').replace('около полутора часов','≈ 1,5 ч в пути');
    if(description==='есть в отеле')detail='В отеле';
    if(reason.kind==='rv')detail='Уточнить';
    if(reason.kind==='no')detail=description==='нет в отеле'?'Нет в отеле':'Не подтверждено';
    if(reason.icon==='budget')detail=reason.kind==='ok'?'Подходит':(reason.text.startsWith('Дороже бюджета на ')?reason.text.replace('Дороже бюджета на ','+'):reason.text);
    return n.jsxs('div',{className:'ki-match-reason ki-match-'+reason.kind,title:reason.text,children:[
     n.jsx(KeysIdeaArt,{name:reason.icon,className:'ki-match-art'}),
     n.jsx('dt',{children:title}),detail&&n.jsx('dd',{children:detail})
    ]},index);
   })}),!reasons.length&&n.jsx('p',{className:'ki-match-empty',children:'Высокая оценка гостей и удобное расположение.'})
  ]})]},hotel.id);
 };

 return n.jsxs('section',{className:'ki-page'+(embedded?' ki-embedded':''),'data-ideas-stage':stage,'data-ideas-mode':ideas.mode,'aria-label':'Подбор отелей',children:[
 flight&&n.jsx(KeysIdeaFlight,{flight,onDone:landed}),
 !embedded&&n.jsxs('header',{className:'ki-header',children:[n.jsx(cs,{onClick:back,label:'Назад'}),stage==='choose'?n.jsxs(n.Fragment,{children:[n.jsx('h1',{className:'ki-sr-title',children:'Нужен совет'}),n.jsx('div',{className:'ki-header-mode',children:tabs})]}):stage==='results'?n.jsx('h1',{className:'ki-results-query-heading',children:n.jsxs('button',{type:'button',className:'ki-results-query',onClick:()=>requestDestination(),'aria-label':'Изменить город: '+(destination==='*'?'Любой город':destination),children:[n.jsx('span',{className:'ki-results-query-title',children:'Отели для вас'}),n.jsxs('span',{className:'ki-results-query-city',children:[n.jsx('span',{title:destination==='*'?'Любой город':destination,children:destination==='*'?'Любой город':destination}),n.jsx(D,{name:'down',className:'size-4'})]})]})}):n.jsx('h1',{children:stage==='where'?'Где остановиться':stage==='destination'||stage==='city'?'Направление':'Нужен совет'}),stage!=='destination'&&stage!=='city'&&stage!=='company'&&n.jsx('button',{type:'button',className:'ki-settings','aria-label':'Условия подбора',onClick:()=>setTune(true),children:n.jsx(D,{name:'sliders',className:'size-5'})})]}),
 (stage==='where'||stage==='choose'&&(ideas.mode==='topics'||step.type!=='ex'))&&n.jsx('div',{className:'ki-selection-controls',children:destinationAction}),
 stage!=='destination'&&stage!=='city'&&stage!=='company'&&ideas.note&&n.jsxs('div',{className:'ki-note',role:'status',children:[n.jsx('span',{children:ideas.note.text}),ideas.note.action&&n.jsx('button',{type:'button',onClick:()=>{const action=ideas.note.action;if(action.kind==='drop')act({type:'IDEAS_DROP',id:action.cardId});else go('where');act({type:'IDEAS_NOTE_CLEAR',id:ideas.note.id});},children:ideas.note.action.label}),n.jsx('button',{type:'button','aria-label':'Закрыть подсказку',onClick:()=>act({type:'IDEAS_NOTE_CLEAR',id:ideas.note.id}),children:n.jsx(D,{name:'close',className:'size-4'})})]}),
 n.jsx('div',{ref:scroll,className:'ki-scroll',children:stage==='welcome'?n.jsxs('div',{className:'ki-welcome',children:[n.jsxs('section',{className:'ki-welcome-card',children:[n.jsx('div',{className:'ki-welcome-art',children:(regional?['breakfast','cable','hammam']:['sleep','pool','hammam']).map(id=>{const card=engine.get(id);return n.jsxs('button',{type:'button','aria-label':'Хочу: '+card.short,onClick:()=>start('feed',id),children:[n.jsx(KeysIdeaCover,{card}),n.jsx('span',{children:card.fan||card.short})]},id);})}),n.jsx('h2',{children:'Как хочется отдохнуть?'}),n.jsx('p',{children:'Выберите впечатления — найдём отель, который вам подойдёт.'}),n.jsxs('div',{className:'ki-decisions',children:[n.jsx(H,{onClick:()=>start(),children:selected.length?'Продолжить':'Начать'}),n.jsx(H,{variant:'secondary',onClick:()=>start('topics'),children:'По темам'})]})]}),n.jsxs('section',{className:'ki-request-card','aria-labelledby':'ki-request-title',children:[n.jsx('h2',{id:'ki-request-title',children:'Или опишите свой отдых'}),form,reply&&n.jsx('p',{className:'ki-request-reply',role:'status',children:reply})]})]}):stage==='destination'||stage==='city'?destinationStep:stage==='company'?companyStep:stage==='choose'?choose:stage==='where'?locationChoices:n.jsxs('div',{className:'ki-results',children:[n.jsxs('section',{className:'ki-results-summary','aria-label':'Подборка по пожеланиям',children:[n.jsxs('div',{className:'ki-results-heading',children:[n.jsxs('div',{className:'ki-results-count',children:[n.jsx('h2',{children:total?as(total):'Близкие варианты'}),n.jsx('p',{children:total?'По вашим пожеланиям':'Точных совпадений пока нет'})]}),n.jsxs('button',{type:'button',className:'ki-link ki-edit-wishes','aria-label':'Изменить пожелания',onClick:()=>go('choose'),children:['Изменить',n.jsx(D,{name:'chevron',className:'size-4'})]})]}),selected.length>0&&n.jsx('div',{className:'ki-result-chips','aria-label':'Выбранные пожелания',children:selected.map(card=>n.jsx(KeysPreferenceTag,{card,onRemove:id=>act({type:'IDEAS_DROP',id})},card.id))})]}),n.jsx('div',{className:'keys-results-filters ki-refine','aria-label':'Сортировка отелей',role:'group',children:[['fit','По совпадению'],['cheap','Подешевле'],['sea','Ближе к морю'],['quiet','Потише']].filter(([value])=>value!=='sea'||regional||destination==='*').map(([value,label])=>n.jsx('button',{type:'button','aria-pressed':sort===value,onClick:()=>setSort(value),children:label},value))}),n.jsx('div',{className:'ki-hotel-grid',children:(expanded?sorted:sorted.slice(0,5)).map(hotel=>renderHotel(hotel))}),!expanded&&sorted.length>5&&n.jsx(H,{variant:'secondary',onClick:()=>setExpanded(true),children:'Показать ещё '+(sorted.length-5)}),total+ranking.others.length===0&&n.jsxs('section',{className:'ki-empty-city',children:[n.jsx('h2',{children:'Здесь пока нет отелей'}),n.jsx('p',{children:'Попробуйте другой город или поиск по всем направлениям.'}),n.jsx(H,{variant:'secondary',onClick:()=>requestDestination(),children:'Изменить направление'})]}),total<4&&ranking.others.length>0&&n.jsxs('section',{className:'ki-alternatives',children:[n.jsx('h2',{children:total?'Ещё варианты с компромиссами':'Не всё совпало — вот ближайшие варианты'}),n.jsx('div',{className:'ki-hotel-grid',children:ranking.others.slice(0,total?2:4).map(hotel=>renderHotel(hotel,true))})]}),n.jsx('section',{className:'ki-results-wish',children:[n.jsx('h2',{children:'Уточним подбор?'}),form,reply&&n.jsx('p',{role:'status',children:reply})]})]})}),
 tune&&n.jsxs(ct,{title:'Как мы вас поняли',onClose:()=>setTune(false),children:[n.jsx('div',{className:'ki-tune',children:[destinationAction,n.jsx(KeysCompanyChoices,{value:ideas.company,onChange:company=>act({type:'IDEAS_COMPANY',company})}),n.jsx('div',{className:'ki-preferences',children:['calm','nature'].map(axis=>n.jsx(KeysPreferenceChoice,{axis,value:ideas.manual[axis]??mood[axis],onChange:value=>act({type:'IDEAS_SCALE',axis,value})},axis))}),n.jsx(KeysIdeaBudget,{ideas,onChange:range=>act({type:'IDEAS_BUDGET',...range})}),regional&&n.jsx('label',{className:'ki-budget-label',children:['Район',n.jsx(St,{'aria-label':'Район',value:ideas.district||'any',options:[{value:'any',label:'Не важно'},...Object.entries(engine.areas).map(([value,area])=>({value,label:area.label}))],onChange:district=>act({type:'IDEAS_DISTRICT',district})})]}),n.jsx(H,{onClick:()=>setTune(false),children:'Готово'}),n.jsxs('button',{type:'button',className:'ki-reset-filters',onClick:()=>{setModel(prev=>({...prev,ideas:{...engine.initial(engine.company(search.party),engine.month(search)),destination}}));setTopic(null);setSort('fit');setReply('');},children:[n.jsx(D,{name:'repeat',className:'size-4'}),'Сбросить фильтры']})]})]})
 ]});
}
