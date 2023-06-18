import type {
  UpdateItemCommandInput,
  GetItemCommandInput,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { LangCode } from '~/types';
import { dbClient } from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  UpdateItemCommand,
  ReturnValue,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

type CounterType = 'USER' | 'TEAM' | 'ROLE' | 'LANG' | 'FOOTNOTE';

const _createCounterFor = async (type: CounterType): Promise<{ counter: number }> => {
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK: `${type}-COUNTER`,
      counter: 0,
    }),
  };
  await dbClient().send(new PutItemCommand(params));
  return { counter: 0 };
};

const _updateCounterFor = async (
  type: CounterType,
  counter: number
): Promise<{ counter: number }> => {
  const params: UpdateItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK: `${type}-COUNTER`,
    }),
    ExpressionAttributeNames: {
      '#counter': 'counter',
    },
    ExpressionAttributeValues: marshall({
      ':val': 1,
      ':counter': counter,
    }),
    // using opmistic locking
    // https://dynobase.dev/dynamodb-locking/
    ConditionExpression: '#counter = :counter',
    UpdateExpression: 'set #counter = #counter + :val',
    ReturnValues: ReturnValue.ALL_NEW,
  };
  const { Attributes } = await dbClient().send(new UpdateItemCommand(params));
  if (Attributes) {
    return unmarshall(Attributes) as { counter: number };
  }
  throw new Error('update user counter failed');
};

/**
 * This is a helper function, which will calculate and return the most recent counter
 * which can be used as a user | team | lang | role id
 * @returns the latest user id
 */
export const getCounterFor = async (type: CounterType): Promise<{ counter: number }> => {
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK: `${type}-COUNTER`,
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  if (Item) {
    const { counter } = unmarshall(Item) as { counter: number };
    await _updateCounterFor(type, counter);
    return { counter: counter + 1 };
  }
  return _createCounterFor(type);
};

/**
 * By given a type and id, this helper function is going to create a padding id, like 0001, 0002
 * @param param0
 * @returns
 */
export const composeIdForReference = ({ paragraphId, id }: { paragraphId: string; id: number }) => {
  return `${paragraphId}-R${id.toString().padStart(4, '0')}`;
};

/**
 * By given a type and id, this helper function is going to create a padding id, like 0001, 0002
 * @param param0
 * @returns
 */
export const composeIdForTranslation = ({
  lang,
  kind,
  version,
  id,
}: {
  lang: LangCode;
  kind: string;
  version: string;
  id: number | string;
}) => {
  return `${lang}-${kind}-${version.toUpperCase()}-${id.toString().padStart(4, '0')}`;
};

/**
 * New id composer for sutra
 */
export const composeIdForSutra = ({
  lang,
  version,
  id,
}: {
  lang: LangCode;
  version: string;
  id: string | number;
}) => {
  return `${lang}-${version}-S${id.toString().padStart(4, '0')}`;
};

/**
 * New id composer for Roll
 */
export const composeIdForRoll = ({ sutraId, id }: { sutraId: string; id: string | number }) => {
  return `${sutraId}-R${id.toString().padStart(4, '0')}`;
};

/**
 * New id composer for Paragraph
 */
export const composeIdForParagraph = ({ rollId, id }: { rollId: string; id: string | number }) => {
  return `${rollId}-P${id.toString().padStart(4, '0')}`;
};

/**
 * New id composer for Footnote
 */
export const composeIdForFootnote = ({
  paragraphId,
  id,
}: {
  paragraphId: string;
  id: string | number;
}) => {
  return `${paragraphId}-F${id.toString().padStart(4, '0')}`;
};

/**
 * The composed user id can be used as SK in user table
 * @param id the user id
 * @returns composed user id
 */
export const composeSKForUser = ({ email }: { email: string }) => {
  return `USER-${email}`;
};

export const composeSKForTeam = ({ name }: { name: string }) => {
  const newName = name.replace(/\s+/, '-');
  return `TEAM-${newName}`;
};

export const composeSKForLang = ({ name }: { name: string }) => {
  return `LANG-${name}`;
};

export const composeSKForRole = ({ name }: { name: string }) => {
  return `ROLE-${name}`;
};

export const composeSKForSutra = ({ lang, version }: { lang: string; version: string }) => {
  return `${lang}-${version?.toUpperCase()}`;
};
