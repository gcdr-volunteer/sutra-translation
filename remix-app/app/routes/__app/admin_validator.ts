import * as yup from 'yup';

import type { AnyObjectSchema } from 'yup';
import { getTeam } from '~/models/team';
export const newTeamSchema = <T extends AnyObjectSchema>(baseSchema: T) => {
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
