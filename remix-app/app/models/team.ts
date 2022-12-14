import { Team } from '~/types/team';
import { dbClient } from '~/clients/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommandInput,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  PutItemCommand,
  ReturnValue,
  QueryCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { composeSKForTeam } from './utils';

export const createNewTeam = async (team: Team) => {
  const { name } = team;
  const SK = composeSKForTeam({ name });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK,
      ...team,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  const results = await dbClient.send(new PutItemCommand(params));
  return results;
};

export const getTeam = async (name: string) => {
  const SK = composeSKForTeam({ name });
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
  };
  const { Item } = await dbClient.send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as Team;
  }
  return undefined;
};

export const deleteTeam = async (name: string) => {
  const SK = composeSKForTeam({ name });
  const params: DeleteItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
  };
  await dbClient.send(new DeleteItemCommand(params));
};

export const getAllTeams = async (): Promise<Team[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'PK = :team AND begins_with(SK, :team)',
    ExpressionAttributeValues: marshall({
      ':team': 'TEAM',
    }),
  };
  const { Items } = await dbClient.send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Team);
  }
  return [];
};
