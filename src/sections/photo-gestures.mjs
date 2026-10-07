// Horizontal motion changes media. Only a deliberate upward swipe advances a hotel.
export function keysPhotoGesture(dx,dy){
 if(Math.abs(dx)<10&&Math.abs(dy)<10)return 'tap';
 if(Math.abs(dx)>=40&&Math.abs(dx)>Math.abs(dy)*1.2)return dx<0?'next-frame':'previous-frame';
 if(dy<=-60&&Math.abs(dy)>Math.abs(dx)*1.2)return 'next-hotel';
 return 'cancel';
}
