import { created } from 'remix-utils';
import { upsertParagraph } from '~/models/paragraph';
import type { CreateType, Paragraph } from '~/types';
import { Intent } from '~/types/common';
import { getRandomInt, logger, sleep } from '~/utils';

export const handleCreateBulkParagraph = async (paragraphs: CreateType<Paragraph>[]) => {
  try {
    await Promise.all(
      paragraphs?.map((paragraph) =>
        sleep(getRandomInt(100, 1000)).then(() => upsertParagraph(paragraph))
      )
    );
    return created({ data: {}, intent: Intent.CREATE_BULK_PARAGRAPH });
  } catch (error) {
    logger.error(handleCreateBulkParagraph.name, 'error', error);
  }
};
