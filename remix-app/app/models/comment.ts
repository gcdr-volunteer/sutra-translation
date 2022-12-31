import { dbClient } from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { PutItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { utcNow } from '~/utils/datetime';
import type { Comment } from '~/types/comment';
import type {
  PutItemCommandInput,
  QueryCommandInput,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

export const createNewComment = async (comment: Comment) => {
  const params: PutItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Item: marshall({
      PK: 'COMMENT',
      SK: `${comment.paragraphId}-${utcNow()}`,
      ...comment,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const getAllCommentsForRoll = async (rollId: string) => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    KeyConditionExpression: 'PK = :comment AND rollId = :rollId',
    ExpressionAttributeValues: marshall({
      ':rollId': rollId,
      ':comment': 'COMMENT',
    }),
    IndexName: 'rollId-index',
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Comment);
  }
  return [];
};

export const resolveComment = async (SK: string) => {
  const params: UpdateItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Key: marshall({
      PK: 'COMMENT',
      SK,
    }),
    ExpressionAttributeNames: {
      '#resolved': 'resolved',
    },
    ExpressionAttributeValues: marshall({
      ':resolved': 1,
    }),
    UpdateExpression: 'Set #resolved = :resolved',
  };

  await dbClient().send(new UpdateItemCommand(params));
};

export const getAllNotResolvedCommentsForMe = async (): Promise<Comment[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    FilterExpression: 'contains(#targets, :all)',
    KeyConditionExpression: 'PK = :comment AND resolved = :resolved',
    ExpressionAttributeNames: {
      '#targets': 'targets',
    },
    ExpressionAttributeValues: marshall({
      ':comment': 'COMMENT',
      ':all': 'ALL',
      ':resolved': 0,
    }),
    IndexName: 'resolved-index',
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Comment);
  }
  return [];
};
