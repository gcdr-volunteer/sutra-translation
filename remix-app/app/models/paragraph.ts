import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient, dbGetByKey, dbInsert, dbUpdate } from '~/models/external_services/dynamodb';
import type { Paragraph } from '~/types/paragraph';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { logger } from '~/utils';

export const getParagraphsByRollId = async (PK?: string): Promise<Paragraph[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Paragraph);
  }
  return [];
};

export const getOriginParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  return getParagraphsByRollId(PK);
};

export const getTargetParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  const key = PK.replace('ZH', 'EN');
  return getParagraphsByRollId(key);
};

export const getParagraphByPrimaryKey = async ({
  PK,
  SK,
}: {
  PK?: string;
  SK?: string;
}): Promise<Paragraph | undefined> => {
  return await dbGetByKey({ key: { PK, SK }, tableName: process.env.TRANSLATION_TABLE });
};

const createParagraph = async (paragraph: Paragraph) => {
  return await dbInsert({ tableName: process.env.TRANSLATION_TABLE, doc: paragraph });
};

const updateParagraph = async (paragraph: Paragraph) => {
  return await dbUpdate({ tableName: process.env.TRANSLATION_TABLE, doc: paragraph });
};

export const upsertParagraph = async (paragraph: Paragraph) => {
  const prevParagraph = await getParagraphByPrimaryKey({ PK: paragraph.PK, SK: paragraph.SK });
  if (prevParagraph) {
    const newParagraph = {
      ...prevParagraph,
      ...paragraph,
      content: `${prevParagraph.content} ${paragraph.content}`,
    };
    logger.log(upsertParagraph.name, 'updateParagraph', newParagraph);
    return await updateParagraph(newParagraph);
  }
  logger.log(upsertParagraph.name, 'insertParagraph', paragraph);
  return await createParagraph(paragraph);
};
