import { Flex, Divider } from '@chakra-ui/react';
import { Outlet } from '@remix-run/react';
import { BreadCrumb } from '~/components/common';
import { json, redirect } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { assertAuthUser } from '../../auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  return json({});
};
export default function ReferenceRoute() {
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column' overflowY={'scroll'}>
      <BreadCrumb />
      <Divider mt={4} mb={4} borderColor={'primary.300'} />
      <Outlet />
    </Flex>
  );
}
