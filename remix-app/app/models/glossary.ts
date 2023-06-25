import { PutItemCommand, QueryCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { utcNow } from '~/utils';
import { dbClient, dbGetByKey, dbUpdate } from './external_services/dynamodb';
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
  const params: QueryCommandInput = {
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
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Glossary);
  }
  return [];
};
export const updateGlossary = async (doc: UpdateType<Glossary>) => {
  return await dbUpdate({ tableName: process.env.REFERENCE_TABLE, doc });
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
