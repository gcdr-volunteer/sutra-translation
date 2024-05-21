import { Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
export const loader = () => {
  return json({});
};
export default function AuthGoogleFailureRoute() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg={'primary.300'}>
      <Box bg={'secondary.300'} p={8} rounded='md' boxShadow='md' textAlign='center'>
        <Heading mb={6} color={'black'}>
          Login Failed
        </Heading>
        <Text mb={4} color={'black'} fontSize={'xl'}>
          Your login attempt was unsuccessful. Please check if you are using the correct google
          email account.
        </Text>
        <Text mb={6} color={'black'} fontSize={'xl'}>
          If you continue to have issues, please contact our support team to add you to the white
          list.
        </Text>
        <Button as={Link} to='/login' colorScheme='iconButton'>
          Go to Login
        </Button>
      </Box>
    </Flex>
  );
}
