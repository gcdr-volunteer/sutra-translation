import type { CreateType, Doc, Key, UpdateType } from '~/types';
import type {
  GetItemCommandInput,
  UpdateItemCommandInput,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutItemCommand,
  ReturnValue,
  UpdateItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type { PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { utcNow } from '~/utils';
// Can be removed after refactor
export const dbClient = () => new DynamoDBClient({ region: process.env.REGION });

export const dbGetByKey = async <T>({
  tableName,
  key,
}: {
  key: Key;
  tableName: string;
}): Promise<T | undefined> => {
  const params: GetItemCommandInput = {
    TableName: tableName,
    Key: marshall({
      PK: key.PK,
      SK: key.SK,
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as T;
  }
  return undefined;
};

export const dbGetByIndexAndKey = async <T>({
  tableName,
  indexName,
  key,
}: {
  tableName: string;
  key: Record<string, string>;
  indexName: string;
}) => {
  const params: QueryCommandInput = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: Object.keys(key).reduce((acc, cur, index, array) => {
      if (index === array.length - 1) {
        acc += `${cur} = :${cur}`;
        return acc;
      }
      acc += `${cur} = :${cur} AND `;
      return acc;
    }, '' as string),
    ExpressionAttributeValues: marshall({
      ...Object.entries(key).reduce((acc, [key, value]) => {
        acc[`:${key}`] = value;
        return acc;
      }, {} as Record<string, string>),
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as T);
  }
  return undefined;
};

export const dbInsert = async ({ tableName, doc }: { doc: CreateType<Doc>; tableName: string }) => {
  const newDoc = {
    ...doc,
    createdAt: utcNow(),
    updatedAt: utcNow(),
    ...(doc.createdBy ? { createdBy: doc.createdBy } : { createdBy: 'Admin' }),
    ...(doc.updatedBy ? { updatedBy: doc.updatedBy } : { createdBy: 'Admin' }),
  };
  const params: PutItemCommandInput = {
    TableName: tableName,
    Item: marshall(
      {
        ...newDoc,
      },
      { removeUndefinedValues: true }
    ),
    ConditionExpression: 'attribute_not_exists(#PK)',
    ExpressionAttributeNames: {
      '#PK': 'PK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const dbUpdate = async ({ tableName, doc }: { doc: UpdateType<Doc>; tableName: string }) => {
  // We cannot update PK and SK
  const { SK, PK, ...rest } = { ...doc, updatedAt: utcNow() };

  const keys = Object.keys(rest);
  const updates = keys.reduce((acct, item) => {
    acct.push(`#${item} = :${item}`);
    return acct;
  }, [] as string[]);
  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: marshall({
      PK: PK,
      SK: SK,
    }),
    ConditionExpression: 'attribute_exists(PK)',
    UpdateExpression: `set ${updates.join(',')}`,
    ExpressionAttributeNames: keys.reduce((acct, item) => {
      acct[`#${item}`] = item;
      return acct;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>),
    ExpressionAttributeValues: marshall({
      ...Object.entries(rest).reduce((acct, [key, value]) => {
        acct[`:${key}`] = value;
        return acct;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as Record<string, any>),
    }),
    ReturnValues: ReturnValue.ALL_NEW,
  };
  return await dbClient().send(new UpdateItemCommand(params));
};
