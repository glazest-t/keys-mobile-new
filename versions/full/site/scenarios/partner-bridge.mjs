// Same-origin demo bridge; no request is sent to TravelLine.
export const partnerRequestKey=token=>'keys-partner-link-'+token;
export function readPartnerRequest(storage,token){
 if(!/^[a-z0-9-]{20,80}$/i.test(token||''))return null;
 try{const value=JSON.parse(storage.getItem(partnerRequestKey(token))||'null');return value&&value.token===token&&Number.isSafeInteger(value.requestId)&&typeof value.email==='string'&&typeof value.phone==='string'&&['pending','approved','rejected','expired'].includes(value.status)?value:null;}catch{return null;}
}
export function writePartnerRequest(storage,request){try{storage.setItem(partnerRequestKey(request.token),JSON.stringify(request));return true;}catch{return false;}}
export function matchingPartnerDecision(state,request){return state.status==='pending'&&request?.token===state.requestToken&&request.requestId===state.requestId&&request.email===state.email&&request.phone===state.phone&&['approved','rejected'].includes(request.status);}
