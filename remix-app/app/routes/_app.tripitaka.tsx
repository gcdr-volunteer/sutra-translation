import { Flex, Divider } from '@chakra-ui/react';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { BreadCrumb } from '~/components/common/breadcrumb';
import { assertAuthUser } from '~/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  return json({});
};

export default function TripitakaRoute() {
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <BreadCrumb />
      <Divider mt={4} mb={4} borderColor={'primary.300'} />
      <Outlet />
    </Flex>
  );
}
