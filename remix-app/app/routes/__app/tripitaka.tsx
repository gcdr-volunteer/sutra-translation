import { Flex, Divider } from '@chakra-ui/react';
import { Outlet } from '@remix-run/react';
import { BreadCrumb } from '~/components/common/breadcrumb';

export default function TripitakaRoute() {
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <BreadCrumb />
      <Divider mt={4} mb={4} borderColor={'primary.300'} />
      <Outlet />
    </Flex>
  );
}
