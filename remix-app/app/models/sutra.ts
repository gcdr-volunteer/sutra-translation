import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/models/external_services/dynamodb';
import { composeSKForSutra } from './utils';
import type { LangCode } from '~/types';
import type { Sutra } from '~/types/sutra';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';

export const getSutrasByLangAndVersion = async (
  lang: LangCode,
  version: string
): Promise<Sutra[]> => {
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
    return Items.map((Item) => unmarshall(Item) as Sutra);
  }
  return [];
};
