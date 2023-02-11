import type { CreateType, Key, Roll, UpdateType } from '~/types';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient, dbGetByKey, dbInsert, dbUpdate } from '~/models/external_services/dynamodb';

export const getRollsBySutraId = async (PK: string): Promise<Roll[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Roll);
  }
  return [];
};

export const getRollByPrimaryKey = async (key: Key): Promise<Roll | undefined> => {
  return await dbGetByKey({ tableName: process.env.TRANSLATION_TABLE, key });
};

const createRoll = async (roll: CreateType<Roll>) => {
  return await dbInsert({ tableName: process.env.TRANSLATION_TABLE, doc: roll });
};

const updateRoll = async (roll: UpdateType<Roll>) => {
  return await dbUpdate({ tableName: process.env.TRANSLATION_TABLE, doc: roll });
};

export const upsertRoll = async (roll: CreateType<Roll> | UpdateType<Roll>) => {
  const prevRoll = await getRollByPrimaryKey({ PK: roll.PK, SK: roll.SK });
  if (prevRoll) {
    const newRoll = {
      ...prevRoll,
      ...roll,
    };
    return await updateRoll(newRoll);
  }
  return await createRoll(roll as CreateType<Roll>);
};
