import { Box, Flex } from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { assertAuthUser } from '~/auth.server';
import { Sidebar } from '~/components/common/sidebar';
import { createContext } from 'react';
import { defineAbilityFor, AbilityContext } from '~/authorisation';
import { LangCode, RoleType } from '~/types';
import { getAllUsers } from '~/models/user';
import { Kind } from '~/types/common';
import type { LoaderArgs } from '@remix-run/node';
import type { User } from '~/types/user';
import { notFound } from 'remix-utils';
export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const users = await getAllUsers(user.email);
  if (user) {
    return json({
      currentUser: user,
      allUsers: users,
    });
  }
  return notFound({ currentUser: null, allUsers: [] });
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
    password: '',
  },
  allUsers: [],
});
export default function AppRoute() {
  const { currentUser, allUsers } = useLoaderData<typeof loader>();
  // TODO: what if currentUser is undefined
  if (currentUser) {
    const ability = defineAbilityFor(currentUser);
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
  return <Box>user is not defined</Box>;
}
