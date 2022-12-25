import * as deepl from 'deepl-node';
import { QuotaExceededError, TooManyRequestsError } from 'deepl-node';
const translator = new deepl.Translator(process.env.DEEPL_AUTHKEY);

export const translateZH2EN = async (content: string[]): Promise<string[] | undefined> => {
  try {
    const results = await translator.translateText(content, 'zh', 'en-US');

    return results?.map((result) => result.text);
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      throw new Error('Oops, we run out of deelp quota, please contact admin for more quotas');
    }
    if (error instanceof TooManyRequestsError) {
      throw new Error('Oops, too many requests, slow down, slow down');
    }
  }
};
