import type { Paragraph } from '~/types/paragraph';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import type { CreatedType, CreateType, Key, UpdateType } from '~/types';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient, dbGetByKey, dbInsert, dbUpdate } from '~/models/external_services/dynamodb';
import { logger } from '~/utils';

export const getParagraphsByRollId = async (PK?: string): Promise<CreatedType<Paragraph>[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as CreatedType<Paragraph>);
  }
  return [];
};

export const getOriginParagraphsByRollId = async (
  PK: string
): Promise<CreatedType<Paragraph>[]> => {
  return getParagraphsByRollId(PK);
};

export const getTargetParagraphsByRollId = async (
  PK: string
): Promise<CreatedType<Paragraph>[]> => {
  const key = PK.replace('ZH', 'EN');
  return getParagraphsByRollId(key);
};

export const getParagraphByPrimaryKey = async (
  key: Key
): Promise<CreatedType<Paragraph> | undefined> => {
  return await dbGetByKey({ key, tableName: process.env.TRANSLATION_TABLE });
};

export const createParagraph = async (paragraph: CreateType<Paragraph>) => {
  return await dbInsert({ tableName: process.env.TRANSLATION_TABLE, doc: paragraph });
};

export const updateParagraph = async (paragraph: UpdateType<Paragraph>) => {
  return await dbUpdate({ tableName: process.env.TRANSLATION_TABLE, doc: paragraph });
};

export const upsertParagraph = async (paragraph: CreateType<Paragraph> | UpdateType<Paragraph>) => {
  const prevParagraph = await getParagraphByPrimaryKey({ PK: paragraph.PK, SK: paragraph.SK });
  if (prevParagraph) {
    const newParagraph = {
      ...prevParagraph,
      ...paragraph,
      content: prevParagraph?.content
        ? `${prevParagraph.content} ${paragraph.content}`
        : paragraph.content,
    };
    logger.log(upsertParagraph.name, 'updateParagraph', newParagraph);
    return await updateParagraph(newParagraph);
  } else {
    logger.log(upsertParagraph.name, 'insertParagraph', paragraph);
    return await createParagraph(paragraph as CreateType<Paragraph>);
  }
};
