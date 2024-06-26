import type { Team, UpdateType, User } from '~/types';
import type { Lang } from '~/types/lang';
import type { PublishCommandInput } from '@aws-sdk/client-sns';
import { json } from '@remix-run/node';
import { badRequest, created } from 'remix-utils';
import * as yup from 'yup';
import { createNewLang, getLang } from '~/models/lang';
import { createNewTeam, getTeam } from '~/models/team';
import { createNewUser, getWholeUserTable, updateUser } from '~/models/user';
import { Intent } from '~/types/common';
import { LangCode } from '~/types/lang';
import { RoleType } from '~/types/role';
import { logger } from '~/utils';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import { msgClient } from '~/models/external_services/sns';
import { PublishCommand } from '@aws-sdk/client-sns';
import { sendRegistrationEmail } from '../../models/external_services/ses';

const langCodeValidator = yup
  .mixed<LangCode>()
  .oneOf(Object.values(LangCode))
  .required('language code cannot be empty');

const newLangSchema = () => {
  const baseSchema = initialSchema();
  const langSchema = baseSchema.shape({
    name: langCodeValidator.test(
      'is-name-exist',
      'language code already registered',
      async (value) => {
        if (value) {
          const lang = await getLang(value?.trim());
          return !lang;
        }
        return false;
      }
    ),
    alias: yup.string().trim().required('language alias cannot be empty'),
    kind: yup.mixed<'LANG'>().default('LANG'),
  });
  return langSchema;
};

const newTeamSchema = () => {
  const baseSchema = initialSchema();
  const teamSchema = baseSchema.shape({
    name: yup
      .string()
      .trim()
      .required('team name cannot be empty')
      .test('is-name-exist', 'team name already registered', async (value) => {
        const team = await getTeam(value ?? '');
        return !team;
      }),
    alias: yup.string().trim().required('team alias cannot be empty'),
    kind: yup.mixed<'TEAM'>().default('TEAM'),
  });
  return teamSchema;
};

const newUserSchema = () => {
  const baseSchema = initialSchema();
  const userSchema = baseSchema.shape({
    username: yup.string().trim().required('username cannot be empty'),
    password: yup.string().required('password cannot be empty'),
    team: yup
      .string()
      .required('team cannot be empty')
      .test('is-team-exist', `we don't have this team, please create first`, async (value) => {
        const team = await getTeam(value ?? '');
        return Boolean(team);
      }),
    roles: yup
      .mixed<RoleType[]>()
      .required('role is required')
      .test('is-valid-role', 'we do not support this role yet', (roles) => {
        if (roles) {
          return roles.every((role) => Object.values(RoleType).includes(role));
        }
        return false;
      }),
    origin_lang: langCodeValidator,
    target_lang: langCodeValidator,
    working_sutra: yup.string().required('working sutra cannot be empty'),
    first_login: yup.boolean().default(true),
    email: yup.string().email().required(),
    kind: yup.mixed<'USER'>().default('USER'),
    intent: yup.string().strip(),
  });
  return userSchema;
};

export const getLoaderData = async () => {
  const userTable = await getWholeUserTable();
  const teams: Team[] = [];
  const users: User[] = [];
  const langs: Lang[] = [];
  for (const tableType of userTable) {
    if (tableType.SK?.startsWith('USER')) {
      // we remove password, since there is no need let frontend knows password
      const newUser = { ...tableType, password: '' } as User;
      users.push(newUser);
    }
    if (tableType.SK?.startsWith('TEAM')) {
      teams.push(tableType as Team);
    }
    if (tableType.SK?.startsWith('LANG')) {
      langs.push(tableType as Lang);
    }
  }
  return {
    teams,
    users,
    langs,
  };
};

export const handleCreateNewUser = async (user: Omit<User, 'kind'>) => {
  try {
    // TODO: using sns service to send email to newly created user
    logger.log(handleCreateNewUser.name, 'user', user);
    const newUser = { ...user, roles: [user.roles] };

    const result = await schemaValidator({
      schema: newUserSchema(),
      obj: newUser,
    });
    logger.log(handleCreateNewUser.name, 'result', result);
    await createNewUser(result);
  } catch (errors) {
    logger.error(handleCreateNewUser.name, 'errors', errors);
    return badRequest({ errors: errors, intent: Intent.CREATE_USER });
  }
};

export const handleSendRegistrationEmail = async ({
  email,
  username,
}: {
  email: string;
  username: string;
}) => {
  logger.log(handleSendRegistrationEmail.name, 'params', { email, username });
  await sendRegistrationEmail({ email, username });
};

export const handleUpdateUser = async (user: UpdateType<User>) => {
  try {
    logger.log(handleUpdateUser.name, 'user', user);
    await updateUser(user);
  } catch (errors) {
    logger.error(handleCreateNewUser.name, 'errors', errors);
    return badRequest({ errors: errors, intent: Intent.UPDATE_USER });
  }
};

export const handleCreateNewTeam = async (team: Omit<Team, 'kind'>) => {
  try {
    const result = await schemaValidator({
      schema: newTeamSchema(),
      obj: team,
    });
    await createNewTeam(result);
    return created({ data: {}, intent: Intent.CREATE_TEAM });
  } catch (errors) {
    return badRequest({ errors: errors, intent: Intent.CREATE_TEAM });
  }
};

export const handleCreateNewLang = async (lang: Omit<Lang, 'kind'>) => {
  try {
    const result = await schemaValidator({
      schema: newLangSchema(),
      obj: lang,
    });
    await createNewLang(result);
    return json({ data: [] }, { status: 200 });
  } catch (errors) {
    return json({ errors: errors });
  }
};

export type SutraFeed = {
  sutra: string;
  roll: string;
};
export const feedSutra = async ({ sutra, roll }: SutraFeed) => {
  const params: PublishCommandInput = {
    TopicArn: process.env.TOPIC_ARN,
    Message: JSON.stringify({
      sutra,
      roll,
    }),
  };
  await msgClient().send(new PublishCommand(params));
};
