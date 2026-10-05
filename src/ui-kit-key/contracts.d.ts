/** UI kit Keys 1.0 — framework-neutral public UI contracts. Money uses integer minor units. */
export type ISODate = string;
export type DateTime = string;
export type Money = {amount: number; currency: 'RUB'};
export type Route = {name: string; params: Record<string,string>; scrollTop?: number; focusId?: string};
export type Scenario = {kind:'search'} | {kind:'booked';arrivalDay:'day-8'|'day-3'|'arrival'} | {kind:'stay';stayDay:'day-1'|'day-2'|'checkout'} | {kind:'after'};
export type Image = {id:string;src:string;alt:string;width:number;height:number};
export type Coordinates = {latitude:number;longitude:number};
export type Hotel = {id:string;name:string;city:string;address:string;coordinates:Coordinates;images:Image[];accommodationType:string;stars?:number;rating?:number;reviewCount:number;distance?:{kind:'sea'|'centre';meters:number}};
export type Room = {id:string;name:string;number?:string;floor?:number;area:number;capacity:number;images:Image[]};
export type Guest = {id:string;firstName:string;lastName:string;phone?:string;email?:string;avatar?:string;documentRef?:string};
export type DateRange = {start:ISODate;end:ISODate};
export type DateAvailability = {date:ISODate;available:boolean;price?:Money};
export type TimeRange = {start:string;end:string;timezone:string};
export type Booking = {id:string;hotel:Hotel;room:Room;dates:DateRange;checkinTime:string;checkoutTime:string;nights:number;guests:Guest[];status:'confirmed'|'staying'|'completed'|'cancelled';payment:Payment;services:ServiceOrder[]};
export type BookingDraft = Pick<Booking,'dates'|'guests'>;
export type Payment = {status:'unpaid'|'partial'|'paid'|'refunded';total:Money;paid:Money;remaining:Money};
export type PaymentMethod = {id:string;type:'card'|'sbp';label:string};
export type Quote = {id:string;expiresAt:DateTime;total:Money;difference:Money;terms:string[]};
export type Rate = {id:string;name:string;price:Money;breakfastIncluded:boolean;freeCancellationUntil?:DateTime;prepaymentRequired:boolean};
export type Discount = {id:string;source:'keys'|'hotel';label:string;amount:Money;percent?:number};
export type ServiceStatus = 'available'|'included'|'requested'|'approved'|'in-progress'|'completed'|'cancelled'|'failed';
export type Service = {id:string;name:string;description:string;price?:Money;included:boolean;images:Image[];options?:{id:string;label:string;price?:Money}[]};
export type ServiceOrder = {id:string;serviceId:string;status:ServiceStatus;createdAt:DateTime;approvedAt?:DateTime;expectedAt?:DateTime;expectedRange?:TimeRange;completedAt?:DateTime;chargedAmount?:Money;optionId?:string};
export type BillItem = {id:string;orderId?:string;label:string;chargedAt:DateTime;amount:Money};
export type Upload = {id:string;name:string;mimeType:string;size:number;previewUrl?:string;status:'local'|'uploading'|'uploaded'|'failed';remoteRef?:string};
export type Document = {id:string;kind:'receipt'|'confirmation'|'stay-report';label:string;status:'available'|'generating'|'failed';downloadUrl?:string};
export type Place = {id:string;name:string;description:string;theme:string;images:Image[];coordinates:Coordinates;minutes:number;transport:'walk'|'car'|'transit';matchedInterests:string[]};
export type Marker = {id:string;coordinates:Coordinates;label:string;entity:Hotel|Place};
export type SearchQuery = {city:string;dates:DateRange;adults:number;children:number[];pet:boolean;business:boolean;car:boolean};
export type Collection = {id:string;label:string;illustration:string;query:Partial<SearchQuery>;tag:string};
export type Loyalty = {level:string;balance:number;progress:{value:number;target:number;unit:'trips'|'nights'|'spend'};rulesVersion:string};
export type PointTransaction = {id:string;bookingId?:string;amount:number;createdAt:DateTime;label:string;state:'pending'|'posted'|'reversed'};
export type Notification = {id:string;kind:'login'|'first-night-review'|'trip-review'|'service';title:string;body:string;createdAt:DateTime;readAt?:DateTime;route:Route};
export type Review = {id:string;bookingId:string;kind:'first-night'|'trip';rating:1|2|3|4|5;text:string;photos:Upload[];state:'draft'|'submitting'|'submitted'|'failed'};
export type Thread = {id:string;title:string;avatar?:string;unreadCount:number;lastMessage?:Message};
export type Message = {id:string;threadId:string;sender:'guest'|'hotel'|'assistant';text:string;createdAt:DateTime;state:'sending'|'sent'|'read'|'failed';attachments?:Upload[]};
export type Action = {id:string;label:string;variant:'primary'|'secondary'|'quiet'|'danger';disabled?:boolean;loading?:boolean};
export type Option = {value:string;label:string;disabled?:boolean};
export interface KeyUIEvent {type:string;component:string;value:unknown;originalEvent?:Event}
export interface KeyUIAPI {mount(root?:HTMLElement|Document):void;toast(message:string):void;openSheet(id:string,opener?:HTMLElement):void;closeSheet():void;destroy():void;}
/** Events bubble as CustomEvent<KeyUIEvent>('key:change'). Demo adapters do not book, pay, upload or send messages. */
declare global {interface Window {KeyUI:KeyUIAPI}}
