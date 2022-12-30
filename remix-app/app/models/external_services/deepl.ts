import * as deepl from 'deepl-node';
import { QuotaExceededError, TooManyRequestsError } from 'deepl-node';
import { logger } from '~/utils';
// The reason we have to pass serverUrl is because different subscription
// will have different url
const deeplClient = () =>
  new deepl.Translator(process.env.DEEPL_AUTHKEY, { serverUrl: process.env.DEEPL_URL });

export const translateZH2EN = async (content: string[]): Promise<string[] | undefined> => {
  try {
    const results = await deeplClient().translateText(content, 'zh', 'en-US');

    return results?.map((result) => result.text);
  } catch (error) {
    logger.error('translateZH2EN', 'error', error);
    if (error instanceof QuotaExceededError) {
      throw new Error('Oops, we run out of deelp quota, please contact admin for more quotas');
    }
    if (error instanceof TooManyRequestsError) {
      throw new Error('Oops, too many requests, slow down, slow down');
    }
  }
};
