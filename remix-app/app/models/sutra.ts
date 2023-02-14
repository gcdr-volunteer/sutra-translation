import type { CreatedType, CreateType, Key, LangCode, UpdateType } from '~/types';
import type { Sutra } from '~/types/sutra';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  dbClient,
  dbGetByKey,
  dbGetByPartitionKey,
  dbInsert,
  dbUpdate,
} from '~/models/external_services/dynamodb';
import { composeSKForSutra } from './utils';

export const getSutrasByLangAndVersion = async (
  lang: LangCode,
  version: string
): Promise<CreatedType<Sutra>[]> => {
  const SK = composeSKForSutra({ lang, version });
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: marshall({
      ':PK': 'TRIPITAKA',
      ':SK': SK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as CreatedType<Sutra>);
  }
  return [];
};

export const getAllSutras = async (): Promise<CreatedType<Sutra>[]> => {
  return await dbGetByPartitionKey<CreatedType<Sutra>>('TRIPITAKA');
};

export const getSutraByPrimaryKey = async (key: Key): Promise<CreatedType<Sutra> | undefined> => {
  return await dbGetByKey({ tableName: process.env.TRANSLATION_TABLE, key });
};

const createSutra = async (sutra: CreateType<Sutra>) => {
  return await dbInsert({ tableName: process.env.TRANSLATION_TABLE, doc: sutra });
};

const updateSutra = async (sutra: UpdateType<Sutra>) => {
  return await dbUpdate({ tableName: process.env.TRANSLATION_TABLE, doc: sutra });
};

export const upsertSutra = async (sutra: CreateType<Sutra> | UpdateType<Sutra>) => {
  const prevSutra = await getSutraByPrimaryKey({ PK: sutra.PK, SK: sutra.SK });
  if (prevSutra) {
    const newSutra = {
      ...prevSutra,
      ...sutra,
    };
    return await updateSutra(newSutra);
  }
  return await createSutra(sutra as CreateType<Sutra>);
};
