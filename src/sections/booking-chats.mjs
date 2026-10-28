// A conversation belongs to a current or past booking, never to a search result.
export function keysBookedChatHotelIds(state){
 const ids=new Set((state.keysChatHistory||[]).map(trip=>trip.hotelId).filter(Boolean));
 if(state.tripContext?.hasBooking&&state.booking?.hotelId)ids.add(state.booking.hotelId);
 for(const record of Object.values(state.keysCreatedBookings||{})){
  const id=record.booking?.hotelId||record.draft?.hotelId;
  if(id&&record.booking?.id)ids.add(id);
 }
 return ids;
}
export function keysBookingConversations(state){
 return [...keysBookedChatHotelIds(state)].map(hotelId=>state.chat?.conversations?.[hotelId]||{
  hotelId,human:false,unread:0,draft:'',lastActivity:0,updatedLabel:'',messages:[]
 });
}
