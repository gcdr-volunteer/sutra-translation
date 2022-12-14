import { dbClient } from '~/clients/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type {
  UpdateItemCommandInput,
  GetItemCommandInput,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  UpdateItemCommand,
  ReturnValue,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

type CounterType = 'USER' | 'TEAM' | 'ROLE' | 'LANG';

const _createCounterFor = async (type: CounterType): Promise<{ counter: number }> => {
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK: `${type}-COUNTER`,
      counter: 0,
    }),
  };
  await dbClient.send(new PutItemCommand(params));
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
  const { Attributes } = await dbClient.send(new UpdateItemCommand(params));
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
  const { Item } = await dbClient.send(new GetItemCommand(params));
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
export const composeIdFor = ({ type, id }: { type: CounterType; id: number }) => {
  return `${type}-${id.toString().padStart(4, '0')}`;
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
