import type { Comment, Message } from '~/types/comment';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { dbUpdate } from '~/models/external_services/dynamodb';
import type { CreatedType, Key, UpdateType, User } from '~/types';
import {
  dbClient,
  dbGetByIndexAndKey,
  dbGetByKey,
  dbInsert,
} from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { utcNow } from '~/utils';

export const getAllCommentsByParentId = async (parentId?: string): Promise<Comment[]> => {
  const comments = await dbGetByIndexAndKey<Comment>({
    tableName: process.env.REFERENCE_TABLE,
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
  return await dbGetByKey<Comment>({ tableName: process.env.REFERENCE_TABLE, key });
};

export const createNewComment = async (comment: Comment) => {
  const newComment = { ...comment, PK: 'COMMENT', SK: `${comment.paragraphId}-${utcNow()}` };
  return await dbInsert({ tableName: process.env.REFERENCE_TABLE, doc: newComment });
};

export const updateComment = async (comment: UpdateType<Comment>) => {
  return await dbUpdate({ tableName: process.env.REFERENCE_TABLE, doc: comment });
};

export const createNewMessage = async (message: Message) => {
  const newMessage = { ...message, PK: 'COMMENT', SK: `${message.paragraphId}-${utcNow()}` };
  return await dbInsert({ tableName: process.env.REFERENCE_TABLE, doc: newMessage });
};

export const getAllRootCommentsForRoll = async (rollId: string) => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
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

export const getAllMessageForComment = async (commentId: string) => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
    KeyConditionExpression: 'PK = :comment AND parentId = :parentId',
    ExpressionAttributeValues: marshall({
      ':parentId': commentId,
      ':comment': 'COMMENT',
    }),
    IndexName: 'parentId-index',
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Comment);
  }
  return [];
};

export const resolveComment = async (props: {
  rollId: string;
  paragraphId: string;
  before: string;
  after: string;
  commentId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}) => {
  const {
    rollId,
    paragraphId,
    before,
    after,
    commentId,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
  } = props;
  return await dbClient().send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.HISTORY_TABLE,
            Item: marshall({
              PK: 'PARAGRAPH',
              SK: paragraphId,
              before,
              after,
              commentId,
              createdBy,
              updatedBy,
              createdAt,
              updatedAt,
            }),
          },
        },
        {
          Update: {
            TableName: process.env.REFERENCE_TABLE,
            Key: marshall({
              PK: 'COMMENT',
              SK: commentId,
            }),
            UpdateExpression: 'set #resolved = :resolved',
            ExpressionAttributeNames: {
              '#resolved': 'resolved',
            },
            ExpressionAttributeValues: marshall({
              ':resolved': 1,
            }),
          },
        },
        {
          Update: {
            TableName: process.env.TRANSLATION_TABLE,
            Key: marshall({
              PK: rollId,
              SK: paragraphId,
            }),
            UpdateExpression: 'set #content = :content',
            ExpressionAttributeNames: {
              '#content': 'content',
            },
            ExpressionAttributeValues: marshall({
              ':content': after,
            }),
          },
        },
      ],
    })
  );
};

export const getAllCommentsByRollId = async (rollId: string) => {
  return await dbGetByIndexAndKey({
    tableName: process.env.REFERENCE_TABLE,
    key: { PK: 'COMMENT', rollId },
    indexName: 'rollId-index',
  });
};

export const getAllNotResolvedCommentsForRoll = async (roll: string) => {
  const comments = await dbGetByIndexAndKey<CreatedType<Comment>>({
    tableName: process.env.REFERENCE_TABLE,
    key: { PK: 'COMMENT', resolved: 0 },
    indexName: 'resolved-index',
  });
  return comments.filter((comment) => comment.rollId === roll);
};

export const getAllNotResolvedCommentsForMe = async (user?: User): Promise<Comment[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.REFERENCE_TABLE,
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
