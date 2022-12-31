import { Flex, Box, Button } from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import { authenticator } from '~/auth.server';
import type { ActionArgs } from '@remix-run/node';
export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}
export default function TranslationRoute() {
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <Box my={8} textAlign='left'>
        <Form method='post'>
          <Button colorScheme={'iconButton'} width='full' mt={4} type='submit'>
            Logout
          </Button>
        </Form>
      </Box>
    </Flex>
  );
}
