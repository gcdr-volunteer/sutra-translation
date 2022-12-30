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
import { getAllUsers } from '~/models/user';
import { Kind } from '~/types/common';
export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  const users = await getAllUsers(user?.email!);
  return json({
    data: {
      currentUser: user,
      allUsers: users,
    },
  });
};

export const AppContext = createContext<{
  // TODO: try to limit the user info exposure, no need to expose all the info
  currentUser?: User;
  allUsers: User[];
}>({
  currentUser: {
    username: '',
    email: 'admin@gmail.com',
    roles: [RoleType.Reader],
    origin_lang: LangCode.ZH,
    target_lang: LangCode.EN,
    team: '',
    first_login: false,
    kind: Kind.USER,
  },
  allUsers: [],
});
export default function AppRoute() {
  const {
    data: { currentUser, allUsers },
  } = useLoaderData<typeof loader>();
  // TODO: what if currentUser is undefined
  const ability = defineAbilityFor(currentUser!);
  return (
    <AbilityContext.Provider value={ability}>
      <AppContext.Provider value={{ currentUser, allUsers }}>
        <Flex>
          <Sidebar />
          <Outlet />
        </Flex>
      </AppContext.Provider>
    </AbilityContext.Provider>
  );
}
