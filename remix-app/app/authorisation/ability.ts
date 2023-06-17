import { AbilityBuilder, PureAbility } from '@casl/ability';
import { RoleType } from '~/types';
import type { User } from '~/types/user';

type Actions = 'Create' | 'Read' | 'Update' | 'Delete';
type Subjects =
  | 'Administration'
  | 'Sutra'
  | 'Paragraph'
  | 'Reference'
  | 'Management'
  | 'Translation';

export const defineAbilityFor = (user: User) => {
  const { can, build } = new AbilityBuilder(PureAbility<[Actions, Subjects]>);
  if (user.roles.includes(RoleType.Admin)) {
    can('Read', 'Administration');
    can('Create', 'Sutra');
  }
  if (
    user.roles.includes(RoleType.Editor) ||
    user.roles.includes(RoleType.Admin) ||
    user.roles.includes(RoleType.Manager) ||
    user.roles.includes(RoleType.Leader)
  ) {
    can('Read', 'Paragraph');
    can('Create', 'Paragraph');
    can('Update', 'Paragraph');
    can('Delete', 'Paragraph');
  }
  if (
    user.roles.includes(RoleType.Assistor) ||
    user.roles.includes(RoleType.Admin) ||
    user.roles.includes(RoleType.Manager)
  ) {
    can('Read', 'Reference');
  }
  if (
    user.roles.includes(RoleType.Leader) ||
    user.roles.includes(RoleType.Admin) ||
    user.roles.includes(RoleType.Manager)
  ) {
    can('Read', 'Management');
  }
  if (
    user.roles.includes(RoleType.Admin) ||
    user.roles.includes(RoleType.Editor) ||
    user.roles.includes(RoleType.Reviewer) ||
    user.roles.includes(RoleType.Manager) ||
    user.roles.includes(RoleType.Leader)
  ) {
    can('Read', 'Translation');
  }
  return build();
};
