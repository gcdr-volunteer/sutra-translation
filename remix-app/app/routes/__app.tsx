import { Flex } from '@chakra-ui/react';
import { json, LoaderArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { assertAuthUser } from '~/auth.server';
import { Sidebar } from '~/components/common/sidebar';
import { createContext } from 'react';
import { User } from '~/types/user';
import { defineAbilityFor } from '~/authorisation';
import { AbilityContext } from '~/authorisation';
import { LangCode, RoleType } from '~/types';
export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  return json(user);
};
export const UserContext = createContext<User | undefined>({
  username: '',
  email: 'admin@gmail.com',
  roles: [RoleType.Viewer],
  origin_lang: LangCode.ZH,
  target_lang: LangCode.EN,
  team: '',
  first_login: false,
});
export default function AppRoute() {
  const user = useLoaderData<typeof loader>();
  const ability = defineAbilityFor(user);
  return (
    <AbilityContext.Provider value={ability}>
      <UserContext.Provider value={user ? user : undefined}>
        <Flex>
          <Sidebar />
          <Outlet />
        </Flex>
      </UserContext.Provider>
    </AbilityContext.Provider>
  );
}
