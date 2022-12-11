import { ActionArgs, json, redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import { emailRegex } from '~/utils';
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
} from '@chakra-ui/react';
import { useActionData, useTransition, Form } from '@remix-run/react';
import { commitSession, getSession } from '~/session.server';
import { onlyCreateAdminUserWhenFirstSystemUp } from '~/models/user';

export const loader = async () => {
  await onlyCreateAdminUserWhenFirstSystemUp();
  return json({});
};

export async function action({ request }: ActionArgs) {
  try {
    const clonedRequest = request.clone();
    const form = await clonedRequest.formData();
    const username = form.get('username');
    const password = form.get('password');
    if (!username) {
      return json({ username: 'username cannot be empty' }, { status: 400 });
    }
    if (!emailRegex.test(username as string)) {
      return json({ username: 'please enter valid email' }, { status: 400 });
    }
    if (!password) {
      return json({ password: 'password cannot be empty' }, { status: 400 });
    }
    const user = await authenticator.authenticate('form', request);
    if (user) {
      let session = await getSession(request.headers.get('cookie'));
      session.set(authenticator.sessionKey, user);

      let headers = new Headers({ 'Set-Cookie': await commitSession(session) });
      if (user.first_login) {
        return redirect('/update_password', { headers });
      }
      return redirect('/', { headers });
    } else {
      return json({ password: 'please enter correct credentials' }, { status: 401 });
    }
  } catch (error) {
    return json({ password: 'Internal Server Error' }, { status: 500 });
  }
}

export default function LoginRoute() {
  const actionData = useActionData<{ username: string; password: string }>();

  return (
    <Flex minHeight="100vh" width="full" align="center" justifyContent="center">
      <Box
        borderWidth={1}
        px={4}
        width="full"
        maxWidth="500px"
        borderRadius={4}
        textAlign="center"
        boxShadow="lg"
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
    <Box textAlign="center">
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
  const transition = useTransition();
  const isLoading = Boolean(transition.submission);
  const { username, password } = props.actionData || {};
  return (
    <Box my={8} textAlign="left">
      <Form method="post">
        <FormControl isInvalid={Boolean(username)}>
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="Enter your email address" name="username" />
          {username ? <FormErrorMessage>{username}</FormErrorMessage> : null}
        </FormControl>

        <FormControl mt={4} isInvalid={Boolean(password)}>
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Enter your password" name="password" />
          {password ? <FormErrorMessage>{password}</FormErrorMessage> : null}
        </FormControl>

        <Stack isInline justifyContent="space-between" mt={4}>
          <Box>
            <Checkbox>Remember Me</Checkbox>
          </Box>
          <Box>
            <Link color={`primary.500`}>Forgot your password?</Link>
          </Box>
        </Stack>

        <Button colorScheme={'iconButton'} width="full" mt={4} type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Log In'}
        </Button>
      </Form>
    </Box>
  );
};
