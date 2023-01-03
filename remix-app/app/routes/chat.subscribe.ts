import type { LoaderArgs } from '@remix-run/node';
import type { Comment } from '~/types';
import { EventEmitter } from 'node:events';
import { eventStream } from 'remix-utils';
export const emitter = new EventEmitter();

// import { emitter } from "~/services/emitter.server";

export async function loader({ request }: LoaderArgs) {
  return eventStream(request.signal, function setup(send) {
    function handle(message: Comment) {
      send({ event: 'new-message', data: message.id });
    }

    emitter.on('message', handle);

    return function clear() {
      emitter.off('message', handle);
    };
  });
}
