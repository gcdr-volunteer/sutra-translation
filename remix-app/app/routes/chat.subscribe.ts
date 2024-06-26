import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import type { Comment } from '~/types';
import { eventStream } from 'remix-utils';
import { emitter, EVENTS, logger } from '~/utils';
import { handleOpenaiStreamFetch } from '../services/__app/tripitaka/$sutraId/$rollId/staging';
import type { AxiosError } from 'axios';
import { APIConnectionTimeoutError } from 'openai/error';
import { addQueueEvtTranslation } from '../queues/add.server';

export const headers: HeadersFunction = () => {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
};
export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(
    request.signal,
    (send, abort) => {
      function handle(message: Comment) {
        send({
          event: 'new-message',
          data: JSON.stringify({ id: message.id, username: message.creatorAlias }),
        });
      }

      async function gptHandle(message: string) {
        // const jsonValue = JSON.parse(message) as { json: { identifier: string } };
        logger.info(gptHandle.name, message);
        try {
          const stream = await handleOpenaiStreamFetch({ content: message });

          for await (const chunk of stream) {
            const data = chunk?.choices[0]?.delta?.content || '';
            if (data) {
              await send({ event: addQueueEvtTranslation, data });
            }
          }
          return;
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.code === 'ECONNABORTED' && axiosError?.message?.includes('timeout')) {
            logger.warn(gptHandle.name, 'openai server timeout');
            send({
              event: addQueueEvtTranslation,
              data: 'openai server timeout, please refresh or edit by yourself',
            });
          }
          if (error instanceof APIConnectionTimeoutError) {
            logger.warn(gptHandle.name, 'openai server timeout');
            send({
              event: addQueueEvtTranslation,
              data: 'openai server timeout, please refresh or edit by yourself',
            });
          }
          if (axiosError.response) {
            logger.error(gptHandle.name, 'response', axiosError.response);
            return axiosError.response?.statusText;
          }
          logger.error(gptHandle.name, error);
          send({
            event: addQueueEvtTranslation,
            data: 'openai service is not avaiable at this moment',
          });
        }
      }

      emitter.on(EVENTS.MESSAGE, handle);
      emitter.on(EVENTS.TRANSLATION, gptHandle);

      return () => {
        emitter.off(EVENTS.MESSAGE, handle);
        emitter.off(EVENTS.TRANSLATION, gptHandle);
      };
    },
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    }
  );
}
