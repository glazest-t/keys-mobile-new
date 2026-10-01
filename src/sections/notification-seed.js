/* Keep read state in storage; expose only events that have happened in this scenario. */
export function keysEnsureStayFeedbackNotification(account, save, day='day-2') {
 const before=JSON.stringify(account.notifications);
 const completed=day==='after',checkout=day==='checkout'||completed;
 const seedCompleted=completed&&!account.keysCompletedUnreadSeeded;
 const welcome=account.notifications.find(item=>item.id==='welcome');
 if(welcome)welcome.createdAt='2026-09-12T13:30:00+03:00';
 const first='keys-maidens-first-night-2026-09-13',last='keys-maidens-checkout-2026-09-19';
 const add=item=>{if(!account.notifications.some(other=>other.id===item.id))account.notifications.push(item);};
 if(day!=='day-1')add({id:first,category:'trip',title:'Как прошла первая ночь?',body:'Татьяна, всё ли в порядке? Поделитесь впечатлениями — это поможет отелю сделать ваше проживание комфортнее.',target:'stay-feedback',createdAt:'2026-09-13T10:00:00+03:00',readAt:null});
 if(checkout)add({id:last,category:'trip',title:'Как прошло проживание?',body:'Татьяна, спасибо, что были с нами! Расскажите, что вам понравилось и что мы можем улучшить.',target:'checkout-feedback',createdAt:'2026-09-19T09:00:00+03:00',readAt:null});
 // The completed-trip prototype starts with a new review invitation, then preserves reading.
 if(seedCompleted){account.notifications.find(item=>item.id===last).readAt=null;account.keysCompletedUnreadSeeded=true;}
 account.notifications.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 if(seedCompleted||JSON.stringify(account.notifications)!==before)save();
 return account.notifications.filter(item=>(item.id!==first||day!=='day-1')&&(item.id!==last||checkout));
}
