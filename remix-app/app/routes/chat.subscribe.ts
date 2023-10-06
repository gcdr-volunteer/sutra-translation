import type { LoaderArgs } from '@remix-run/node';
import type { Comment } from '~/types';
import { eventStream } from 'remix-utils';
import { emitter, EVENTS } from '~/utils';
import { openai } from '../models/external_services/openai';

export async function loader({ request }: LoaderArgs) {
  return eventStream(request.signal, (send) => {
    function handle(message: Comment) {
      send({
        event: 'new-message',
        data: JSON.stringify({ id: message.id, username: message.creatorAlias }),
      });
    }

    async function gptHandle(message: string) {
      const completion = await openai().chat.completions.create(
        {
          model: 'gpt-4-0613',
          n: 1,
          messages: [
            {
              role: 'system',
              content: 'You are a professional Chinese to English translator',
            },
            {
              role: 'user',
              content: `${message}`,
            },
          ],
          stream: true,
        },
        { timeout: 15 * 1000 /* 15 seconds timeout*/ }
      );
      for await (const chunk of completion) {
        send({
          event: 'gpt',
          data: chunk.choices[0]?.delta?.content || '',
        });
      }
    }

    emitter.on(EVENTS.MESSAGE, handle);
    emitter.on(EVENTS.GPT, gptHandle);

    return () => {
      emitter.off(EVENTS.MESSAGE, handle);
      emitter.off(EVENTS.GPT, gptHandle);
    };
  });
}
