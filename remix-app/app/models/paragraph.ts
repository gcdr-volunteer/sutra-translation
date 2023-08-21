import type { Paragraph } from '~/types/paragraph';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import type { CreatedType, CreateType, Key, UpdateType, Comment } from '~/types';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  dbBulkInsert,
  dbClient,
  dbGetByKey,
  dbInsert,
  dbUpdate,
} from '~/models/external_services/dynamodb';
import { logger } from '~/utils';
import { getAllRootCommentsForRoll } from '~/models/comment';

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

export const insertBulkParagraph = async (paragraphs: (Partial<Paragraph> & Required<Key>)[]) => {
  return await dbBulkInsert({ tableName: process.env.TRANSLATION_TABLE, docs: paragraphs });
};

export type ParagraphLoaderData = {
  origin: CreateType<Paragraph>;
  target?: CreateType<Paragraph> & { comments: Comment[] };
};
export type Paragraphs = ParagraphLoaderData[];
export const fetchParagraphsByRollId = async (rollId: string): Promise<Paragraphs> => {
  try {
    const originParagraphs = await getOriginParagraphsByRollId(rollId);
    const targetParagraphs = await getTargetParagraphsByRollId(rollId);
    const rootComments = await getAllRootCommentsForRoll(rollId.replace('ZH', 'EN'));
    const transformedComments = rootComments
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .sort((a, b) => new Date(a.updatedAt!).getTime() - new Date(b.updatedAt!).getTime())
      .reduce((acc, cur) => {
        if (cur.paragraphId in acc) {
          acc[cur.paragraphId].push(cur);
        } else {
          acc[cur.paragraphId] = [cur];
        }
        return acc;
      }, {} as Record<string, Comment[]>);
    const transformedTargets = targetParagraphs.reduce((acc, cur) => {
      // TODO: replace with user's profile
      const newParagraph = {
        ...cur,
        comments: transformedComments[cur.SK] || [],
      };
      // TODO: replace with user profile
      acc = { [cur.SK.replace('EN', 'ZH')]: newParagraph, ...acc };
      return acc;
    }, {} as Record<string, Paragraphs[0]['target']>);

    const paragraphs = originParagraphs?.reduce((acc, cur) => {
      const newParagraph = {
        origin: cur,
        target: transformedTargets[cur.SK] as Paragraphs[0]['target'],
      };
      acc = [...acc, newParagraph];
      return acc;
    }, [] as Paragraphs);

    return paragraphs;
  } catch (error) {
    console.log(error);
    return [];
  }
};
