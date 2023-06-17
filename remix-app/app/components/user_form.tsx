import { useState } from 'react';
import { LangCode } from '~/types/lang';
import type { CreatedType, Sutra } from '~/types';
import { RoleType } from '~/types';
import type { ChangeEvent } from 'react';
import type { Role, Team, User } from '~/types';
import type { Lang } from '~/types/lang';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
} from '@chakra-ui/react';
import { useActionData, useSubmit } from '@remix-run/react';
import { Intent } from '~/types/common';

interface UserFormProps {
  user?: User;
  teams: Team[];
  langs: Lang[];
  sutras: CreatedType<Sutra>[];
  isNew?: boolean;
}
export const UserForm = (props: UserFormProps) => {
  const { user, sutras } = props || {};
  const { errors } = useActionData<{ errors: User }>() || {};
  const [formState, setFormState] = useState<Omit<User, 'kind'>>({
    username: user?.username ?? '',
    email: user?.email ?? '',
    roles: user?.roles ?? [RoleType.Reader],
    team: user?.team ?? '',
    origin_lang: LangCode.ZH,
    target_lang: LangCode.EN,
    first_login: false,
    password: '',
    working_sutra: user?.working_sutra,
  });

  const submit = useSubmit();

  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let newFormState: Omit<User, 'kind'>;
    if (type === 'roles') {
      const role = e.target.value as Role['name'];
      newFormState = { ...formState, roles: [role] };
    } else {
      newFormState = { ...formState, [type]: e.target.value };
    }
    setFormState(newFormState);

    // This means we are going to update user
    if (!isNew) {
      const newObj: Record<string, string> = {
        intent: Intent.UPDATE_USER,
        [type]: e.target.value,
        PK: user?.PK ?? '',
        SK: user?.SK ?? '',
      };
      submit(newObj, { method: 'post', replace: false });
    }
  };
  const { teams, langs, isNew } = props;
  return (
    <SimpleGrid columns={isNew ? 2 : 3} spacing={4}>
      <FormControl isInvalid={Boolean(errors?.username)}>
        <FormLabel>User name:</FormLabel>
        <Input
          type='text'
          value={formState.username}
          onChange={(e) => handleFormStateUpdate('username', e)}
          name='username'
        />
        {errors?.username ? <FormErrorMessage>{errors?.username}</FormErrorMessage> : null}
      </FormControl>
      {isNew ? (
        <FormControl isInvalid={Boolean(errors?.password)}>
          <FormLabel>Password: </FormLabel>
          <Input
            type='text'
            value={formState.password}
            onChange={(e) => handleFormStateUpdate('password', e)}
            name='password'
          />
          {errors?.password ? <FormErrorMessage>{errors?.password}</FormErrorMessage> : null}
        </FormControl>
      ) : null}
      <FormControl isInvalid={Boolean(errors?.email)}>
        <FormLabel>Email:</FormLabel>
        <Input
          type='email'
          value={formState.email}
          onChange={(e) => handleFormStateUpdate('email', e)}
          name='email'
        />
        {errors?.email ? <FormErrorMessage>{errors?.email}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.team)}>
        <FormLabel>Team:</FormLabel>
        <Select
          placeholder='Select your team'
          value={formState.team}
          onChange={(e) => handleFormStateUpdate('team', e)}
          name='team'
          multiple={false}
        >
          {teams?.map((team) => (
            <option key={team.name} value={team.name}>
              {team.alias || team.name}
            </option>
          ))}
        </Select>
        {errors?.team ? <FormErrorMessage>{errors?.team}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.origin_lang)}>
        <FormLabel>Source Language:</FormLabel>
        <Select
          placeholder='Select the origin lang'
          value={formState.origin_lang}
          onChange={(e) => handleFormStateUpdate('origin_lang', e)}
          name='origin_lang'
          multiple={false}
        >
          {langs?.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {lang.alias}
            </option>
          ))}
        </Select>
        {errors?.origin_lang ? <FormErrorMessage>{errors?.origin_lang}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.target_lang)}>
        <FormLabel>Target Language:</FormLabel>
        <Select
          placeholder='Select the target lang'
          value={formState.target_lang}
          onChange={(e) => handleFormStateUpdate('target_lang', e)}
          name='target_lang'
          multiple={false}
        >
          {langs?.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {lang.alias}
            </option>
          ))}
        </Select>
        {errors?.target_lang ? <FormErrorMessage>{errors?.target_lang}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.roles)}>
        <FormLabel>Role:</FormLabel>
        <Select
          placeholder='Select the role'
          value={formState.roles[0]}
          onChange={(e) => handleFormStateUpdate('roles', e)}
          name='roles'
          multiple={false}
        >
          {Object.values(RoleType)?.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
        {errors?.roles ? <FormErrorMessage>{errors?.roles}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.roles)}>
        <FormLabel>Working Sutra:</FormLabel>
        <Select
          placeholder='Select the working sutra'
          value={formState.working_sutra}
          onChange={(e) => handleFormStateUpdate('working_sutra', e)}
          name='working_sutra'
          multiple={false}
        >
          {sutras?.map((sutra) => (
            <option key={sutra.SK} value={sutra.SK}>
              {sutra.title}
            </option>
          ))}
        </Select>
        {errors?.roles ? <FormErrorMessage>{errors?.roles}</FormErrorMessage> : null}
      </FormControl>
      <Input hidden readOnly name='PK' value={user?.PK} />
      <Input hidden readOnly name='SK' value={user?.SK} />
    </SimpleGrid>
  );
};
