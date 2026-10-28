// Hotel chat is AI-only; human handoff is not available in this prototype.
const labelAssistant=source=>source.replaceAll('Помощник отеля','ИИ-ассистент отеля').replaceAll('помощник отеля','ИИ-ассистент отеля');
function replaceRequired(source,from,to){
 if(!source.includes(from))throw Error('Hotel chat integration anchor missing: '+from);
 return source.replace(from,to);
}
function header({jsx,icon,hotel,back,open,notice}){
 const j=jsx;
 return `${j}.jsxs("header",{className:"keys-hotel-chat-header",children:[
  ${back?`${j}.jsx("button",{type:"button",className:"keys-chat-back",onClick:${back},"aria-label":"Назад",children:${j}.jsx(${icon},{name:"back",className:"size-5"})}),`:''}
  ${j}.jsx("button",{type:"button",className:"keys-chat-hotel",onClick:${open},children:${j}.jsx("h1",{title:${hotel}.name,children:${hotel}.name})}),
  ${j}.jsx("button",{type:"button",className:"keys-chat-hotel-notices","aria-label":"Уведомления отеля "+${hotel}.name,onClick:${notice},children:${j}.jsx(${icon},{name:"bell",className:"size-5"})}),
  ${j}.jsx("p",{className:"keys-chat-ai-label",children:"ИИ-ассистент"})]})`;
}
export function adaptHotelChat(source){
 source=labelAssistant(source).replaceAll("ИИ-ассистент отеля · ответит сразу","ИИ-ассистент отеля");
 const start=source.indexOf('function Bq() {'),end=source.indexOf('\nfunction ',start+1);
 let chat=source.slice(start,end);
 const from=chat.indexOf('children: [n.jsxs("div", { className: "sticky top-0');
 const to=chat.indexOf('n.jsxs("div", { ref: x, "aria-label": "Переписка с отелем');
 if(from<0||to<0)throw Error('Mobile hotel chat header anchor missing');
 chat=chat.slice(0,from)+'children: ['+header({jsx:'n',icon:'D',hotel:'u',back:'r',open:'() => a({type:"hotel",hotelId:c})',notice:'()=>a({type:"notifications",system:true,hotelId:c})'})+', '+chat.slice(to);
 source=source.slice(0,start)+chat+source.slice(end);
 source=replaceRequired(source,'if (h.some((g) => g.handoff)) return Iv(m, t.hotelId);','if (h.some((g) => g.handoff)) return pm(m,t.hotelId,[{id:u+"-a",sender:"ai",text:"Я ИИ-ассистент отеля. Помогу с вопросами о номерах, услугах и условиях проживания. Уточните, что вы хотите узнать."}]);');
 source=replaceRequired(source,'return Iv(l, r);','return l;');
 return source.replace('f ? "ИИ-ассистент отеля «" + f.name + "»" : "Помощник"','f ? "ИИ-ассистент" : "Помощник"');
}
export function adaptDesktopHotelChat(source){
 const picker=source.indexOf('id:"desktop-new-chat"'),pickerStart=source.lastIndexOf('function ',picker),pickerEnd=source.indexOf('function ',picker);
 if(picker<0||pickerStart<0||pickerEnd<0)throw Error('Desktop new-chat picker anchor missing');
 const signature=source.slice(pickerStart,source.indexOf('{const',pickerStart));
 source=source.slice(0,pickerStart)+signature+'{return null}'+source.slice(pickerEnd);
 const newChat=source.indexOf('"Новый чат с отелем"]})');
 if(newChat>=0){const start=source.lastIndexOf('e.jsxs("button"',newChat);source=source.slice(0,start)+'null'+source.slice(newChat+'"Новый чат с отелем"]})'.length);}
 source=source.replace('Напишите любому отелю из каталога — кнопка «Новый чат» слева наверху. Сначала ответит ИИ-ассистент отеля, сотрудника можно позвать прямо в диалоге.','Чат с отелем появится после бронирования. Переписка сохранится и после поездки.');

 source=labelAssistant(source).replaceAll("ИИ-ассистент отеля · ответит сразу","ИИ-ассистент отеля");
 const marker=source.indexOf('"data-testid":"desktop-chat-conversation"');
 const from=source.indexOf('e.jsxs("header",',marker),to=source.indexOf('e.jsxs("div",{ref:d,"aria-label":"Переписка с отелем',from);
 if(marker<0||from<0||to<0)throw Error('Desktop hotel chat header anchor missing');
 source=source.slice(0,from)+header({jsx:'e',icon:'p',hotel:'n',open:'()=>t({type:"HOTEL_OPEN",id:s})',notice:'()=>t({type:"OPEN",screen:{type:"notifications",system:true,hotelId:s}})'})+','+source.slice(to);
 source=replaceRequired(source,'c.human?e.jsx("span",{className:"shrink-0 rounded-full bg-success-bg px-2.5 py-1.5 text-11 text-success",children:"На связи"}):e.jsx(ee,{label:"Позвать сотрудника",icon:"user",onClick:()=>l({type:"HANDOFF",hotelId:s})})','null');
 return source;
}
