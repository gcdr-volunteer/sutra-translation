import type { LoaderArgs } from '@remix-run/node';
import type { Comment } from '~/types';
import { eventStream } from 'remix-utils';
import { emitter, EVENTS } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  return eventStream(request.signal, (send) => {
    function handle(message: Comment) {
      send({
        event: 'new-message',
        data: JSON.stringify({ id: message.id, username: message.creatorAlias }),
      });
    }

    emitter.addListener(EVENTS.MESSAGE, handle);

    return () => {
      emitter.removeListener(EVENTS.MESSAGE, handle);
    };
  });
}
