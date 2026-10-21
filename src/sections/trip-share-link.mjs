// QR and the native share action must encode the same access and trip state.
export function keysTripShareUrl(raw, access, {stayDay, brand} = {}) {
 const url = new URL(raw);
 if (['localhost','127.0.0.1','[::1]'].includes(url.hostname) || url.protocol === 'file:') {
  const publicPage = new URL('https://glazest-t.github.io/keys-mobile-new/sections/index.html');
  publicPage.search = url.search;
  url.href = publicPage.href;
 }
 url.searchParams.set('access', access === 'manage' ? 'manage' : 'read');
 if (stayDay) url.searchParams.set('stayDay', stayDay === 'checkout' ? 'checkout' : 'day-2');
 if (brand) url.searchParams.set('brand', brand);
 return url.href;
}
