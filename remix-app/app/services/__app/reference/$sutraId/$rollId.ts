import { getOriginParagraphsByRollId, insertBulkParagraph } from '~/models/paragraph';
import type { Paragraph, Key } from '~/types';
import { logger } from '~/utils';

export const handleCreateBulkParagraph = async (
  paragraphs: (Partial<Paragraph> & Required<Key>)[]
) => {
  await insertBulkParagraph(paragraphs);
};

export const handleGetLatestParagraphSK = async (rollId: string): Promise<number> => {
  try {
    const paragraphs = await getOriginParagraphsByRollId(rollId);
    if (paragraphs.length) {
      return parseInt(paragraphs[paragraphs.length - 1].SK.slice(-4));
    } else {
      return 0;
    }
  } catch (error) {
    logger.error(handleGetLatestParagraphSK.name, 'error', error);
    return 0;
  }
};
