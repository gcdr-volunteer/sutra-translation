import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import { emailRegex, logger } from '~/utils';
import {
  Flex,
  Box,
  Heading,
  Link,
  FormControl,
  FormLabel,
  Stack,
  Input,
  Checkbox,
  Button,
  FormErrorMessage,
  Spinner,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useActionData, Form, NavLink } from '@remix-run/react';
import { commitSession, getSession } from '~/session.server';
import { onlyCreateAdminUserWhenFirstSystemUp } from '~/models/user';
import { Error } from '~/components/common/errors';
import { useTransitionState } from '../hooks';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export const loader = async () => {
  await onlyCreateAdminUserWhenFirstSystemUp();
  return json({});
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const clonedRequest = request.clone();
    const form = await clonedRequest.formData();
    const username = form.get('username') as string;
    const password = form.get('password') as string;
    logger.log('login', 'username', username);
    logger.info('login', 'before validation');
    if (!username) {
      return json({ username: 'username cannot be empty' }, { status: 400 });
    }
    if (!emailRegex.test(username)) {
      return json({ username: 'please enter valid email' }, { status: 400 });
    }
    if (!password) {
      return json({ password: 'password cannot be empty' }, { status: 400 });
    }
    logger.info('login', 'after validation');
    logger.info('login', 'before authentication');
    const user = await authenticator.authenticate('form', request);
    logger.info('login', 'after authentication');
    logger.log('login', 'user', user);
    if (user) {
      const session = await getSession(request.headers.get('cookie'));
      session.set(authenticator.sessionKey, user);

      const headers = new Headers({ 'Set-Cookie': await commitSession(session) });
      if (user.first_login) {
        logger.info('login', 'first login user');
        return redirect('/update_password', { headers });
      }
      logger.info('login', 'redirect to root page');
      return redirect('/', { headers });
    } else {
      logger.info('login', 'wrong credentials');
      return json({ password: 'please enter correct credentials' }, { status: 401 });
    }
  } catch (error: unknown) {
    logger.error('login', 'message', (error as Error)?.message);
    logger.error('login', 'stack trace', (error as Error)?.stack);
    return json({ password: 'Internal Server Error' }, { status: 500 });
  }
}

export default function LoginRoute() {
  const actionData = useActionData<{ username: string; password: string }>();

  return (
    <Flex
      bgGradient='linear(to-r, secondary.400, secondary.200, secondary.800)'
      minHeight='100vh'
      width='full'
      align='center'
      justifyContent='center'
    >
      <Box
        bg={'white'}
        borderWidth={1}
        px={4}
        width='full'
        maxWidth='500px'
        borderRadius={4}
        textAlign='center'
        boxShadow='lg'
      >
        <Box p={4}>
          <LoginHeader />
          <LoginForm actionData={actionData} />
        </Box>
      </Box>
    </Flex>
  );
}

const LoginHeader = () => {
  return (
    <Box textAlign='center'>
      <Heading>Login to Your Account</Heading>
    </Box>
  );
};

type LoginFormProps = {
  actionData?: {
    username: string;
    password: string;
  };
};
const LoginForm = (props: LoginFormProps) => {
  const { isLoading } = useTransitionState();
  const [showpassword, setShowpassword] = useState(false);
  const { username, password } = props.actionData || {};
  return (
    <Box my={8} textAlign='left'>
      <Form method='post'>
        <FormControl isInvalid={Boolean(username)}>
          <FormLabel>Email address</FormLabel>
          <Input type='email' placeholder='Enter your email address' name='username' />
          {username ? <FormErrorMessage>{username}</FormErrorMessage> : null}
        </FormControl>

        <FormControl mt={4} isInvalid={Boolean(password)}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showpassword ? 'text' : 'password'}
              placeholder='Enter your password'
              name='password'
            />
            <InputRightElement width='3rem' onClick={() => setShowpassword((prev) => !prev)}>
              {showpassword ? <ViewOffIcon /> : <ViewIcon />}
            </InputRightElement>
          </InputGroup>
          {password ? <FormErrorMessage>{password}</FormErrorMessage> : null}
        </FormControl>

        <Stack isInline justifyContent='space-between' mt={4}>
          <Box>
            <Checkbox>Remember Me</Checkbox>
          </Box>
          <NavLink to='/reset_password'>
            <Link color={`primary.500`}>Forgot your password?</Link>
          </NavLink>
        </Stack>

        <Button colorScheme={'iconButton'} width='full' mt={4} type='submit' disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Log In'}
        </Button>
      </Form>
    </Box>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Error heading='Oops' content='We have trouble process your request, Please contact admin' />
  );
}
