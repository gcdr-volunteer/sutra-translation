import { dbClient } from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PutItemCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { PutItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { Comment } from '~/types/comment';
import { utcNow } from '~/utils/datetime';

export const createNewComment = async (comment: Comment) => {
  const params: PutItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Item: marshall({
      PK: 'COMMENT',
      SK: utcNow(),
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
