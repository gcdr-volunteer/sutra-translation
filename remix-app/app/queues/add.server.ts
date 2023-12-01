import { Queue } from 'quirrel/remix';
import superjson from 'superjson';

import { emitter } from '../utils/event_emitter';

export const addQueueEvtTranslation = 'gpt-translation';

export default Queue<{ identifier: string }>('queue/add', async (job) => {
  emitter.emit(addQueueEvtTranslation, superjson.stringify({ identifier: job.identifier }));
});
