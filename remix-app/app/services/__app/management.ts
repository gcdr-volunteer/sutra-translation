import { getAllNotResolvedCommentsForRoll } from '~/models/comment';
import { dbUpdate } from '~/models/external_services/dynamodb';
import { getParagraphsByRollId } from '~/models/paragraph';
import { getRollByPrimaryKey } from '~/models/roll';

export const handleIsSutraRollComplete = async ({
  sutra,
  roll,
}: {
  sutra: string;
  roll: string;
}): Promise<{ isCompleted: true | false; type?: 'comment' | 'paragraph' }> => {
  const comments = await getAllNotResolvedCommentsForRoll(roll);
  if (comments?.length) {
    return {
      type: 'comment',
      isCompleted: false,
    };
  }
  const origins = await getParagraphsByRollId(roll.replace('EN', 'ZH'));
  const targets = await getParagraphsByRollId(roll);
  if (origins.length !== targets.length) {
    return {
      type: 'paragraph',
      isCompleted: false,
    };
  }

  return {
    isCompleted: true,
  };
};

export const handleMarkRollComplete = async ({ sutra, roll }: { sutra: string; roll: string }) => {
  const rolldoc = await getRollByPrimaryKey({ PK: sutra, SK: roll });
  if (rolldoc) {
    return dbUpdate({
      tableName: process.env.TRANSLATION_TABLE,
      doc: { ...rolldoc, SK: rolldoc.SK ?? '', PK: rolldoc?.PK ?? '', finish: true },
    });
  }
};
