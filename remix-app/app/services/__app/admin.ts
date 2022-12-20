import * as yup from 'yup';
import { getLang } from '~/models/lang';
import { getTeam } from '~/models/team';
import { LangCode } from '~/types/lang';
import { RoleType } from '~/types/role';
import { baseSchemaForCreate } from '~/utils/schema_validator';

const langCodeValidator = yup
  .mixed<LangCode>()
  .oneOf(Object.values(LangCode))
  .required('language code cannot be empty');

export const newLangSchema = () => {
  const baseSchema = baseSchemaForCreate();
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

export const newTeamSchema = () => {
  const baseSchema = baseSchemaForCreate();
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

export const newUserSchema = () => {
  const baseSchema = baseSchemaForCreate();
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
    roles: yup.mixed<RoleType[]>().required('role is required'),
    origin_lang: langCodeValidator,
    target_lang: langCodeValidator,
    first_login: yup.boolean().default(true),
    email: yup.string().email().required(),
  });
  return userSchema;
};
