import { PutItemCommand, QueryCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { logger, rawUtc, utcNow } from '~/utils';
import { dbBulkInsert, dbClient, dbGetByKey, dbUpdate } from './external_services/dynamodb';
import type { PutItemCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import type { Glossary } from '~/types/glossary';
import type { UpdateType } from '~/types';

export const createNewGlossary = async (glossary: Glossary) => {
  const { PK, SK, ...rest } = glossary;
  const sortKey = `GLOSSARY-${utcNow()}`;
  const params: PutItemCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
    Item: marshall(
      {
        PK: 'GLOSSARY',
        SK: sortKey,
        ...rest,
      },
      {
        removeUndefinedValues: true,
      }
    ),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const getAllGlossary = async (): Promise<Glossary[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: marshall({
      ':pk': 'GLOSSARY',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Glossary);
  }
  return [];
};

export const getGlossaryByPage = async (
  nextPage?: string
): Promise<{ items: Glossary[]; nextPage?: string }> => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
    KeyConditionExpression: 'PK = :pk',
    Limit: 25,
    ExpressionAttributeValues: marshall({
      ':pk': 'GLOSSARY',
    }),
    ExclusiveStartKey: nextPage ? JSON.parse(nextPage) : nextPage,
    ScanIndexForward: false,
  };

  const { Items, LastEvaluatedKey } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    const items = Items.map((Item) => unmarshall(Item) as Glossary);
    return {
      items,
      nextPage: JSON.stringify(LastEvaluatedKey) || undefined,
    };
  }
  return {
    items: [],
    nextPage: undefined,
  };
};

export const getGlossariesByTerm = async ({ term }: { term: string }): Promise<Glossary[]> => {
  let lastEvaluatedKey = undefined;
  const items: Glossary[] = [];
  do {
    const params: QueryCommandInput = {
      ExclusiveStartKey: lastEvaluatedKey,
      TableName: process.env.REFERENCE_TABLE,
      FilterExpression: `contains(#content, :term)`,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeNames: {
        '#content': 'content',
      },
      ExpressionAttributeValues: marshall({
        ':term': term,
        ':pk': 'GLOSSARY',
      }),
    };
    const { Items, LastEvaluatedKey } = await dbClient().send(new QueryCommand(params));
    if (Items?.length) {
      const founds = Items.map((Item) => unmarshall(Item) as Glossary);
      items.push(...founds);
    }
    lastEvaluatedKey = LastEvaluatedKey;
  } while (lastEvaluatedKey);
  return items;
};

export const updateGlossary = async (doc: UpdateType<Glossary>) => {
  return await dbUpdate({ tableName: process.env.REFERENCE_TABLE, doc });
};

export const isOriginTermExist = async ({ term }: { term: string }): Promise<boolean> => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
    FilterExpression: `#origin = :origin`,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeNames: {
      '#origin': 'origin',
    },
    ExpressionAttributeValues: marshall({
      ':origin': term,
      ':pk': 'GLOSSARY',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return true;
  }
  return false;
};

export const upsertGlossary = async (glossary: Glossary | UpdateType<Glossary>) => {
  if (glossary?.PK && glossary?.SK) {
    const prevGlossary = await dbGetByKey({
      tableName: process.env.REFERENCE_TABLE,
      key: { PK: glossary.PK ?? '', SK: glossary.SK ?? '' },
    });
    if (prevGlossary) {
      const newGlossary = {
        ...prevGlossary,
        ...glossary,
      };
      return await updateGlossary(newGlossary as UpdateType<Glossary>);
    }
  }
  return await createNewGlossary(glossary as Glossary);
};

export const insertBulkGlossary = async (glossaries: Glossary[]) => {
  const batchSize = 25;
  logger.info('Inserting bulk glossaries', glossaries.length);
  if (glossaries.length) {
    for (let i = 0; i < glossaries.length; i += batchSize) {
      const batch = glossaries.slice(i, i + batchSize);
      const now = rawUtc();
      await dbBulkInsert({
        tableName: process.env.REFERENCE_TABLE,
        docs: batch.map((glossary, index) => ({
          PK: 'GLOSSARY',
          SK: `GLOSSARY-${now.add(index, 'millisecond').format('YYYY-MM-DD HH:mm:ss.SSS')}`,
          ...glossary,
        })),
      });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second
    }
  }
};
