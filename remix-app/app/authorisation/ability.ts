import { AbilityBuilder, PureAbility } from '@casl/ability';
import { User } from '~/types/user';

type Actions = 'Create' | 'Read' | 'Update' | 'Delete';
type Subjects = 'Administration' | 'Sutra';

export const defineAbilityFor = (user: User) => {
  const { can, cannot, build } = new AbilityBuilder(PureAbility<[Actions, Subjects]>);
  if (user.roles.includes('Admin')) {
    can('Read', 'Administration');
    can('Create', 'Sutra');
  }
  return build();
};
