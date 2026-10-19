// Demonstration invitation links contain only display data, never verification credentials.
export function readPartnerInviter(search=''){
 const params=new URLSearchParams(search);
 const clean=value=>value?.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80);
 return {name:clean(params.get('inviter'))||'Юра Костин',hotel:clean(params.get('inviterHotel'))||'Maidens Hotel'};
}
export function partnerInvitationURL({href,name,hotel,brand='base'}){
 const current=new URL(href);
 const local=['localhost','127.0.0.1','[::1]'].includes(current.hostname)||current.protocol==='file:';
 const url=new URL(local?'https://glazest-t.github.io/keys-mobile-new/':current.origin+current.pathname);
 url.search=new URLSearchParams({scenario:'guest-invite',view:'mobile',brand:brand==='orbit'?'orbit':'base',inviter:name.trim().slice(0,80),inviterHotel:hotel.trim().slice(0,80)}).toString();
 return url.href;
}
export const escapePartnerText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
