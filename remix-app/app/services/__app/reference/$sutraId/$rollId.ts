import { created } from 'remix-utils';
import { getOriginParagraphsByRollId, insertBulkParagraph } from '~/models/paragraph';
import type { CreateType, Paragraph } from '~/types';
import { Intent } from '~/types/common';
import { logger } from '~/utils';

export const handleCreateBulkParagraph = async (paragraphs: CreateType<Paragraph>[]) => {
  try {
    await insertBulkParagraph(paragraphs);
    return created({ data: {}, intent: Intent.CREATE_BULK_PARAGRAPH });
  } catch (error) {
    logger.error(handleCreateBulkParagraph.name, 'error', error);
  }
};

export const handleGetLatestParagraphSK = async (rollId: string): Promise<number> => {
  try {
    const paragraphs = await getOriginParagraphsByRollId(rollId);
    if (paragraphs.length) {
      return paragraphs[paragraphs.length - 1].num;
    } else {
      return 0;
    }
  } catch (error) {
    logger.error(handleGetLatestParagraphSK.name, 'error', error);
    return 0;
  }
};
