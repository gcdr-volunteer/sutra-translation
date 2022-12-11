import { Flex, Divider } from '@chakra-ui/react';
import { json, LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { assertAuthUser } from '~/auth.server';
import { BreadCrumb } from '~/components/common';
export default function TranslationRoute() {
  return (
    <Flex p={10} background="secondary.800" w="100%" flexDir="column">
      <BreadCrumb />
      <Divider mt={4} mb={4} borderColor={'primary.300'} />
      <Outlet />
    </Flex>
  );
}
