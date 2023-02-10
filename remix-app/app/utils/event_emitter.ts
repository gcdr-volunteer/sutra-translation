import { EventEmitter } from 'events';

let emitter: EventEmitter;

declare global {
  // eslint-disable-next-line no-var
  var __emitter: EventEmitter | undefined;
}

if (!global.__emitter) {
  global.__emitter = new EventEmitter();
} else {
  emitter = global.__emitter;
}

export { emitter };
export const EVENTS = {
  MESSAGE: 'message',
};
