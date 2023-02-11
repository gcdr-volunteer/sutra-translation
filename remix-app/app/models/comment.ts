import type { Comment } from '~/types/comment';
import type { QueryCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { dbUpdate } from '~/models/external_services/dynamodb';
import type { Key, UpdateType, User } from '~/types';
import {
  dbClient,
  dbGetByIndexAndKey,
  dbGetByKey,
  dbInsert,
} from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { utcNow } from '~/utils';

export const getAllCommentsByParentId = async (parentId?: string): Promise<Comment[]> => {
  const comments = await dbGetByIndexAndKey<Comment>({
    tableName: process.env.COMMENT_TABLE,
    key: { PK: 'COMMENT', parentId: parentId ?? '' },
    indexName: 'parentId-index',
  });
  comments?.sort((a, b) => {
    if (a.SK && b.SK) {
      if (a.SK > b.SK) {
        return 1;
      }
      if (a.SK < b.SK) {
        return -1;
      }
      return 0;
    }
    return 0;
  });
  return comments || [];
};

export const getCommentByKey = async (key: Key): Promise<Comment | undefined> => {
  return await dbGetByKey<Comment>({ tableName: process.env.COMMENT_TABLE, key });
};

export const createNewComment = async (comment: Comment) => {
  const newComment = { ...comment, PK: 'COMMENT', SK: `${comment.paragraphId}-${utcNow()}` };
  return await dbInsert({ tableName: process.env.COMMENT_TABLE, doc: newComment });
};

export const updateComment = async (comment: UpdateType<Comment>) => {
  return await dbUpdate({ tableName: process.env.COMMENT_TABLE, doc: comment });
};
export const getAllRootCommentsForRoll = async (rollId: string) => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    KeyConditionExpression: 'PK = :comment AND rollId = :rollId',
    FilterExpression: 'parentId = id',
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

export const getAllCommentsByRollId = async (rollId: string) => {
  return await dbGetByIndexAndKey({
    tableName: process.env.COMMENT_TABLE,
    key: { PK: 'COMMENT', rollId },
    indexName: 'rollId-index',
  });
};

export const getAllNotResolvedCommentsForMe = async (user?: User): Promise<Comment[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    FilterExpression: 'contains(#ping, :all) or contains(#ping, :me) and parentId = id',
    KeyConditionExpression: 'PK = :comment AND resolved = :resolved',
    ExpressionAttributeNames: {
      '#ping': 'ping',
    },
    ExpressionAttributeValues: marshall({
      ':comment': 'COMMENT',
      ':all': 'ALL',
      ':me': user?.SK,
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
