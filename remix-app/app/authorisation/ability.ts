import { AbilityBuilder, PureAbility } from '@casl/ability';
import { RoleType } from '~/types';
import type { User } from '~/types/user';

type Actions = 'Create' | 'Read' | 'Update' | 'Delete';
type Subjects = 'Administration' | 'Sutra';

export const defineAbilityFor = (user: User) => {
  const { can, build } = new AbilityBuilder(PureAbility<[Actions, Subjects]>);
  if (user.roles.includes(RoleType.Admin)) {
    can('Read', 'Administration');
    can('Create', 'Sutra');
  }
  return build();
};
