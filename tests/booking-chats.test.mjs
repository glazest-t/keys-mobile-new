import test from 'node:test';
import assert from 'node:assert/strict';
import {keysBookedChatHotelIds,keysBookingConversations} from '../src/sections/booking-chats.mjs';
test('chat eligibility includes booked stays and history, never search or an unfinished draft',()=>{
 const state={keysChatHistory:[{hotelId:'past'}],tripContext:{hasBooking:true},booking:{hotelId:'current'},search:{hotelId:'search'},reservation:{hotelId:'draft'},keysCreatedBookings:{confirmed:{booking:{id:'1',hotelId:'new'}},cancelled:{booking:{id:'2',hotelId:'cancelled',cancellation:{}}}}};
 assert.deepEqual([...keysBookedChatHotelIds(state)],['past','current','new','cancelled']);
 assert.equal(keysBookedChatHotelIds({tripContext:{hasBooking:false},booking:{hotelId:'unbooked'}}).size,0);
});
test('list excludes unsolicited seeded chats, keeps past messages and adds newly booked hotels',()=>{
 const past={hotelId:'past',messages:[{text:'История переписки'}]};
 const state={keysChatHistory:[{hotelId:'past'},{hotelId:'past'}],keysCreatedBookings:{b:{booking:{id:'b',hotelId:'new'}}},chat:{conversations:{past,unbooked:{hotelId:'unbooked'}}}};
 const conversations=keysBookingConversations(state);
 assert.deepEqual(conversations.map(item=>item.hotelId),['past','new']);
 assert.equal(conversations[0],past);
 assert.deepEqual(conversations[1].messages,[]);
});
