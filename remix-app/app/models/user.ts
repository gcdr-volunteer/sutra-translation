import type {
  PutItemCommandInput,
  GetItemCommandInput,
  UpdateItemCommandInput,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { UpdateType } from '~/types';
import type { User } from '~/types/user';
import type { Team } from '~/types/team';
import type { Lang } from '~/types/lang';
import {
  PutItemCommand,
  ReturnValue,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { composeSKForUser } from './utils';
import bcrypt from 'bcryptjs';
import { LangCode } from '~/types/lang';
import * as role from '~/types/role';
import { Kind } from '~/types/common';
import { dbClient, dbGetByKey, dbUpdate } from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from '~/utils';
interface DBUser extends User {
  password: string;
}
const _isAdminUserExist = async (): Promise<boolean> => {
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK: 'USER-pttdev123@gmail.com',
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  return Boolean(Item);
};
const _createAdminUser = async () => {
  const adminUser: User = {
    username: 'Terry Pan',
    password: '0987654321',
    team: 'Team1',
    origin_lang: LangCode.ZH,
    target_lang: LangCode.EN,
    roles: [role.RoleType.Admin],
    email: 'pttdev123@gmail.com',
    first_login: true,
    kind: Kind.USER,
  };
  await createNewUser(adminUser);
};

export const onlyCreateAdminUserWhenFirstSystemUp = async (): Promise<void> => {
  const isAdminExist = await _isAdminUserExist();
  if (!isAdminExist) {
    await _createAdminUser();
  }
};

export const getUserByEmail = async (email: string): Promise<DBUser | undefined> => {
  const SK = composeSKForUser({ email });
  const user = await dbGetByKey<DBUser>({
    key: { PK: 'TEAM', SK },
    tableName: process.env.USER_TABLE,
  });
  logger.log(getUserByEmail.name, 'user', user);
  return user;
};

export const updateUser = async (user: UpdateType<User>) => {
  return await dbUpdate({ tableName: process.env.USER_TABLE, doc: user });
};

export const updateUserPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const SK = composeSKForUser({ email });
  const hashedPassword = await bcrypt.hash(password, 10);
  const params: UpdateItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
    ConditionExpression: 'attribute_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
      '#password': 'password',
    },
    ExpressionAttributeValues: marshall({
      ':password': hashedPassword,
      ':first_login': false,
    }),
    UpdateExpression: 'Set #password = :password, first_login = :first_login',
  };

  await dbClient().send(new UpdateItemCommand(params));
};

export const createNewUser = async (user: User) => {
  const { password, email, ...rest } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sortKey = composeSKForUser({ email: email });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK: sortKey,
      email,
      password: hashedPassword,
      ...rest,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  const results = await dbClient().send(new PutItemCommand(params));
  return results;
};

export const getAllUsers = async (currentUser?: string): Promise<User[]> => {
  if (currentUser) {
    const params: QueryCommandInput = {
      TableName: process.env.USER_TABLE,
      KeyConditionExpression: 'PK = :team AND begins_with(SK, :user)',
      FilterExpression: 'email <> :currentUser',
      ExpressionAttributeValues: marshall(
        {
          ':team': 'TEAM',
          ':user': 'USER',
          ':currentUser': currentUser,
        },
        { removeUndefinedValues: true }
      ),
    };
    const { Items } = await dbClient().send(new QueryCommand(params));
    if (Items?.length) {
      return Items.map((Item) => {
        const { password, ...rest } = unmarshall(Item) as User;
        return rest as User;
      });
    }
  }
  return [];
};

type UserTableResp = Team | User | Lang;
export const getWholeUserTable = async () => {
  const params: QueryCommandInput = {
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'PK = :team',
    ExpressionAttributeValues: marshall({
      ':team': 'TEAM',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as UserTableResp);
  }
  return [];
};
