import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/clients/dynamodb';
import { LangCode } from '~/types';
import { Sutra } from '~/types/sutra';
import { composeSKForSutra } from './utils';

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
  const { Items } = await dbClient.send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Sutra);
  }
  return [];
};
