import {guestText} from './tone-of-voice.mjs';
// Presentation of previously saved system messages only. Never migrate storage
// or rewrite guest-authored chat messages, reviews, notes, or names.
globalThis.KeysGuestCopy={text:guestText};
