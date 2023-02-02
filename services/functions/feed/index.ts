import { SNSEvent } from 'aws-lambda';
import { addAvatamsakaSutraFeed } from './services';
export type FeedParams = {
  sutra: string;
  roll: string;
};
/**
 * !!! Important !!!
 * those id has been used, use other ids
 * ZH-SUTRA-V1-0000
 */
export const handler = async (event: SNSEvent) => {
  try {
    // TODO: add feed for different sutras and chapters
    const resultStr = event.Records[0].Sns.Message;
    const feedParams = JSON.parse(resultStr) as FeedParams;
    // T0279 is avatamsaka sutra
    if (feedParams.sutra === 'T0279') {
      await addAvatamsakaSutraFeed(feedParams);
    }
  } catch (error) {
    console.error('sutra feed error happened', error);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'ok',
  };
};
