import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { getUserByEmail, updateUser, updateUserPassword } from '~/models/user';
import { destroySession, getSession } from '~/session.server';
import { logger, rawUtc } from '~/utils';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import dayjs from 'dayjs';
import { generateResetPasswordToken } from '../services/__app/reset_password';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const isFromLoginPage = request.headers.get('Referer')?.includes('/login');
  if (isFromLoginPage) {
    return json({ validLink: true });
  }
  const email = url.searchParams.get('email');
  const hash = url.searchParams.get('hash');
  if (!email || !hash) {
    return redirect('/login');
  }
  const user = await getUserByEmail(email);
  if (!user || !user.linkValidUtil) {
    return redirect('/login');
  }
  const isLinkExpired = rawUtc().isAfter(dayjs(user.linkValidUtil));
  if (isLinkExpired) {
    return json({ validLink: false });
  }
  const verifyHash = generateResetPasswordToken(user.password);
  if (verifyHash !== hash) {
    return redirect('/login');
  }

  return json({ validLink: true, email });
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const clonedRequest = request.clone();
    const form = await clonedRequest.formData();
    const newPass = form.get('new_pass') as string;
    const confirmPass = form.get('confirm_pass') as string;
    const url = new URL(clonedRequest.url);
    const email = url.searchParams.get('email');
    logger.log('update_password', 'email', email);
    logger.info('update_password', 'before validation');
    if (!email) {
      return redirect('/login');
    }
    if (!newPass || !confirmPass) {
      return json({ validLink: true, password: 'password cannot be empty' }, { status: 400 });
    }
    if (newPass !== confirmPass) {
      return json({ validLink: true, password: 'two passwords are not equal' }, { status: 400 });
    }
    logger.info('update_password', 'after validation');

    logger.info('update_password', 'before authentication');
    const user = await getUserByEmail(email);
    logger.info('update_password', 'after authentication');
    if (user) {
      logger.info('update_password', 'before update password');
      await updateUserPassword({ email: user.email, password: confirmPass });
      await updateUser({ PK: user.PK, SK: user.SK, linkValidUtil: '' });
      logger.info('update_password', 'after update password');

      logger.info('update_password', 'before destroy session');
      const session = await getSession(clonedRequest.headers.get('cookie'));
      await destroySession(session);
      logger.info('update_password', 'after destroy session');

      return redirect('/login');
    }
    return redirect('/login');
  } catch (error) {
    logger.error('update_password', 'message', (error as Error)?.message);
    logger.error('update_password', 'stack trace', (error as Error)?.stack);
    return json({ password: 'Internal Server Error' }, { status: 500 });
  }
}

export default function UpdatePasswordRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Flex minHeight='100vh' width='full' align='center' justifyContent='center'>
      {loaderData.validLink ? (
        <Box
          borderWidth={1}
          px={4}
          width='full'
          maxWidth='500px'
          borderRadius={4}
          textAlign='center'
          boxShadow='lg'
        >
          <Box p={4}>
            <UpdatePasswordHeader />
            <UpdatePasswordForm />
          </Box>
        </Box>
      ) : (
        <Heading as='h4' size='md'>
          Link is expired, please reset your password again
        </Heading>
      )}
    </Flex>
  );
}
const UpdatePasswordHeader = () => {
  return (
    <Box textAlign='center'>
      <Heading>Update Your Password</Heading>
    </Box>
  );
};

const UpdatePasswordForm = () => {
  const fetcher = useFetcher<{ password: string }>();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Box my={8} textAlign='left'>
      <fetcher.Form method='post'>
        <FormControl isInvalid={Boolean(fetcher.data?.password)}>
          <FormLabel>New Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your new password'
              name='new_pass'
            />
            <InputRightElement width='3rem' onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <ViewOffIcon /> : <ViewIcon />}
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl mt={4} isInvalid={Boolean(fetcher.data?.password)}>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Confirm your new password'
              name='confirm_pass'
            />
            <InputRightElement width='3rem' onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <ViewOffIcon /> : <ViewIcon />}
            </InputRightElement>
          </InputGroup>
          {fetcher.data?.password ? (
            <FormErrorMessage>{fetcher.data?.password}</FormErrorMessage>
          ) : null}
        </FormControl>

        <Button
          colorScheme={'iconButton'}
          width='full'
          mt={4}
          type='submit'
          disabled={fetcher.state === 'submitting'}
        >
          {fetcher.state === 'submitting' ? <Spinner /> : 'Save'}
        </Button>
      </fetcher.Form>
    </Box>
  );
};
