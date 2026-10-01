// Reuse Arbana's trip-sharing sheet and reducer inside the host booking session.
export function adaptTripShare(js) {
 const start=js.indexOf('function ZH({ onClose: e }) {'),end=js.indexOf('const $j =',start);
 if(start<0||end<0)throw Error('Trip sharing anchors missing');
 let part=js.slice(start,end);
 part=part.replace('e(), l({ type: "friend-list" });','if (!t.keysShareSession) e(); l({ type: "friend-list" });');
 part=part.replace('a("Ссылка на отель и даты скопированы"), e();','a("Ссылка на отель и даты скопированы"), t.keysShareSession && keysPost("share-copied", {}), e();');
 part=part.replace('Отель и даты появятся у них в Поре.', 'Отель и даты появятся у них в Ключах.').replace('Поездка · Пора','Поездка · Ключи');
 js=js.slice(0,start)+part+js.slice(end);
 js=js.replace('function Pt(e, t) {', `function Pt(e, t) {
  if(t.type === "DEMO_LOAD" && e.keysShareSession) return {...t.state,keysShareSession:true,keysChangeSession:true,keysChangeRevision:e.keysChangeRevision,social:{...e.social,friendIds:t.state.social.friendIds},booking:e.booking,navigation:e.navigation,tripContext:e.tripContext};`);
 return js.replaceAll('url(/images/social/friends.png)','url(./images/social/friends.png)');
}
