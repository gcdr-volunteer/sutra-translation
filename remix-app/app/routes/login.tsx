import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import { emailRegex, logger } from '~/utils';
import {
  Flex,
  Box,
  Heading,
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
  Image,
  Grid,
  useBreakpointValue,
  Text,
  Container,
  Spacer,
} from '@chakra-ui/react';
import { useActionData, Form, NavLink } from '@remix-run/react';
import { commitSession, getSession } from '~/session.server';
import { onlyCreateAdminUserWhenFirstSystemUp } from '~/models/user';
import { Error } from '~/components/common/errors';
import { useTransitionState } from '../hooks';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import landingImage from '~/images/landing.webp';
import { FcGoogle } from 'react-icons/fc';

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
    const user = await authenticator.authenticate('credential', request);
    logger.info('login', 'after authentication');
    logger.log('login', 'user', user);
    if (user) {
      const session = await getSession(request.headers.get('cookie'));
      session.set(authenticator.sessionKey, user);

      const headers = new Headers({ 'Set-Cookie': await commitSession(session) });
      if (user.first_login) {
        logger.info('login', 'first login user');
        return redirect(`/update_password?email=${user.email}`, { headers });
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
  const isLargeScreen = useBreakpointValue({ base: false, md: true, lg: true });

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} minH='100vh'>
      {isLargeScreen && (
        <div>
          <Image
            src={landingImage}
            alt='Login Image'
            maxH='100vh'
            objectFit='cover'
            width='100%'
            objectPosition={'left top'}
            filter={'blur(1px)'}
          />
        </div>
      )}
      <Flex direction='column' justify='center' align='center' p={8} bg={'orange.50'}>
        <LoginHeader />
        <LoginForm actionData={actionData} />
      </Flex>
    </Grid>
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
  const [showPassword, setShowPassword] = useState(false);
  const { username, password } = props.actionData || {};
  return (
    <Container my={8} px={{ base: 20 }} textAlign='left'>
      <Form action='/login' method='post'>
        <FormControl isInvalid={Boolean(username)}>
          <FormLabel>Email address</FormLabel>
          <Input type='email' placeholder='Enter your email address' name='username' />
          {username ? <FormErrorMessage>{username}</FormErrorMessage> : null}
        </FormControl>

        <FormControl mt={4} isInvalid={Boolean(password)}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your password'
              name='password'
            />
            <InputRightElement width='3rem' onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <ViewOffIcon /> : <ViewIcon />}
            </InputRightElement>
          </InputGroup>
          {password ? <FormErrorMessage>{password}</FormErrorMessage> : null}
        </FormControl>

        <Stack isInline justifyContent='space-between' mt={4}>
          <Box>
            <Checkbox>Remember Me</Checkbox>
          </Box>
          <NavLink to='/reset_password'>
            <Text _hover={{ textDecoration: 'underline' }} color={`primary.500`}>
              Forgot your password?
            </Text>
          </NavLink>
        </Stack>

        <Button colorScheme={'iconButton'} width='full' mt={4} type='submit' disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Log In'}
        </Button>
      </Form>
      <Spacer h={8} />
      <Form action='/auth/google' method='post'>
        <Button
          leftIcon={<FcGoogle fontSize='1.5rem' />}
          colorScheme='iconButton'
          variant='solid'
          width={'full'}
          _hover={{ bg: 'blue.600' }}
          type='submit'
        >
          <Box as='span' display='flex' alignItems='center'>
            <Text fontSize='lg' fontWeight='semibold'>
              Sign in with Google
            </Text>
          </Box>
        </Button>
      </Form>
    </Container>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Error heading='Oops' content='We have trouble process your request, Please contact admin' />
  );
}
