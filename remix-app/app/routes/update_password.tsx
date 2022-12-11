import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { ActionArgs, json, LoaderArgs, redirect } from '@remix-run/node';
import { useActionData, Form, useTransition } from '@remix-run/react';
import { assertAuthUser, authenticator } from '~/auth.server';
import { updateUserPassword } from '~/models/user';
import { commitSession, getSession } from '~/session.server';

export const loader = async ({ request }: LoaderArgs) => {
  await assertAuthUser(request);
  return json({});
};

export async function action({ request }: ActionArgs) {
  try {
    const clonedRequest = request.clone();
    const form = await clonedRequest.formData();
    const newPass = form.get('new_pass') as string;
    const confirmPass = form.get('confirm_pass') as string;
    if (!newPass || !confirmPass) {
      return json({ password: 'password cannot be empty' }, { status: 400 });
    }
    if (newPass !== confirmPass) {
      return json({ password: 'two passwords are not equal' }, { status: 400 });
    }

    const user = await authenticator.isAuthenticated(request);
    if (user) {
      await updateUserPassword({ email: user.email, password: confirmPass });
      let session = await getSession(clonedRequest.headers.get('cookie'));

      let headers = new Headers({ 'Set-Cookie': await commitSession(session) });
      return redirect('/', { headers });
    }
    return redirect('/login');
  } catch (error) {
    return json({ password: 'Internal Server Error' }, { status: 500 });
  }
}

export default function UpdatePasswordRoute() {
  const actionData = useActionData<{ password: string }>();
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
          <UpdatePasswordHeader />
          <UpdatePasswordForm actionData={actionData} />
        </Box>
      </Box>
    </Flex>
  );
}
const UpdatePasswordHeader = () => {
  return (
    <Box textAlign="center">
      <Heading>Update Your Password</Heading>
    </Box>
  );
};

type LoginFormProps = {
  actionData?: {
    password: string;
  };
};
const UpdatePasswordForm = (props: LoginFormProps) => {
  const transition = useTransition();
  const isLoading = Boolean(transition.submission);
  const { password } = props.actionData || {};
  return (
    <Box my={8} textAlign="left">
      <Form method="post">
        <FormControl isInvalid={Boolean(password)}>
          <FormLabel>New Password</FormLabel>
          <Input type="password" placeholder="Enter your new password" name="new_pass" />
        </FormControl>

        <FormControl mt={4} isInvalid={Boolean(password)}>
          <FormLabel>Confirm Password</FormLabel>
          <Input type="password" placeholder="Confirm your new password" name="confirm_pass" />
          {password ? <FormErrorMessage>{password}</FormErrorMessage> : null}
        </FormControl>

        <Button colorScheme={'iconButton'} width="full" mt={4} type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Save'}
        </Button>
      </Form>
    </Box>
  );
};
