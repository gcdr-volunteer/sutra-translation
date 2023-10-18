import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { sendResetPasswordEmail } from '~/services/__app/reset_password';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email');
  if (email) {
    await sendResetPasswordEmail(email as string);
  }
  return json({ payload: { submitted: true } });
};
export default function ResetPassword() {
  const fetcher = useFetcher<typeof action>();

  return (
    <Flex
      bgGradient='linear(to-r, secondary.400, secondary.200, secondary.800)'
      minHeight='100vh'
      width='full'
      align='center'
      justifyContent='center'
    >
      {fetcher.data?.payload.submitted ? (
        <Box textAlign='center'>
          <Heading as='h4' size='md'>
            Please check your inbox for the reset password link
          </Heading>
        </Box>
      ) : (
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
            <Box textAlign='center'>
              <Heading>Reset password</Heading>
            </Box>
            <fetcher.Form method='post'>
              <FormControl>
                <FormLabel>Email address</FormLabel>
                <Input type='email' placeholder='Enter your email address' name='email' />
              </FormControl>

              <Button
                colorScheme={'iconButton'}
                width='full'
                mt={4}
                type='submit'
                disabled={fetcher.state === 'submitting'}
              >
                {fetcher.state === 'submitting' ? <Spinner /> : 'Submit'}
              </Button>
            </fetcher.Form>
          </Box>
        </Box>
      )}
    </Flex>
  );
}
