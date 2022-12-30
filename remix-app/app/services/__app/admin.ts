import { json } from '@remix-run/node';
import { badRequest, created } from 'remix-utils';
import * as yup from 'yup';
import { createNewLang, getLang } from '~/models/lang';
import { createNewTeam, getTeam } from '~/models/team';
import { createNewUser, getWholeUserTable } from '~/models/user';
import { Team, User } from '~/types';
import { Intent, Kind } from '~/types/common';
import { Lang, LangCode } from '~/types/lang';
import { RoleType } from '~/types/role';
import { logger } from '~/utils';
import { baseSchemaFor, schemaValidator } from '~/utils/schema_validator';

const langCodeValidator = yup
  .mixed<LangCode>()
  .oneOf(Object.values(LangCode))
  .required('language code cannot be empty');

const newLangSchema = () => {
  const baseSchema = baseSchemaFor(Kind.LANG);
  const langSchema = baseSchema.shape({
    name: langCodeValidator.test(
      'is-name-exist',
      'language code already registered',
      async (value) => {
        const lang = await getLang(value!?.trim());
        return !Boolean(lang);
      }
    ),
    alias: yup.string().trim().required('language alias cannot be empty'),
  });
  return langSchema;
};

const newTeamSchema = () => {
  const baseSchema = baseSchemaFor(Kind.TEAM);
  const teamSchema = baseSchema.shape({
    name: yup
      .string()
      .trim()
      .required('team name cannot be empty')
      .test('is-name-exist', 'team name already registered', async (value) => {
        const team = await getTeam(value!);
        return !Boolean(team);
      }),
    alias: yup.string().trim().required('team alias cannot be empty'),
  });
  return teamSchema;
};

const newUserSchema = () => {
  const baseSchema = baseSchemaFor(Kind.USER);
  const userSchema = baseSchema.shape({
    username: yup.string().lowercase().trim().required('username canot be empty'),
    password: yup.string().required('password cannot be empty'),
    team: yup
      .string()
      .required('team cannot be empty')
      .test('is-team-exist', 'we dont have this team, please create first', async (value) => {
        const team = await getTeam(value!);
        return Boolean(team);
      }),
    roles: yup
      .mixed<RoleType[]>()
      .required('role is required')
      .test('is-valid-role', 'we donnot support this role yet', (roles) => {
        if (roles) {
          return roles.every((role) => Object.values(RoleType).includes(role));
        }
        return false;
      }),
    origin_lang: langCodeValidator,
    target_lang: langCodeValidator,
    first_login: yup.boolean().default(true),
    email: yup.string().email().required(),
  });
  return userSchema;
};

export const getLoaderData = async () => {
  const userTable = await getWholeUserTable();
  const teams: Team[] = [];
  const users: User[] = [];
  const langs: Lang[] = [];
  for (const ttype of userTable) {
    if (ttype.SK?.startsWith('USER')) {
      // we remove password, since there is no need let frontend knows password
      const { password, ...rest } = ttype as User;
      users.push(rest);
    }
    if (ttype.SK?.startsWith('TEAM')) {
      teams.push(ttype as Team);
    }
    if (ttype.SK?.startsWith('LANG')) {
      langs.push(ttype as Lang);
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
    logger.log(handleCreateNewUser.name, 'user', user);
    const newUser = { ...user, roles: [user.roles] };

    const result = await schemaValidator({
      schema: newUserSchema(),
      obj: newUser,
    });
    logger.log(handleCreateNewUser.name, 'result', result);
    await createNewUser(result);
    return created({ data: {}, intent: Intent.CREATE_USER });
  } catch (errors) {
    logger.error(handleCreateNewUser.name, 'errors', errors);
    return badRequest({ errors: errors, intent: Intent.CREATE_USER });
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
