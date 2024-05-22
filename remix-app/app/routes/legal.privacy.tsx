import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  useColorModeValue,
} from '@chakra-ui/react';

export default function PrivacyPolicyPage() {
  const bgColor = useColorModeValue('primary.300', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Flex minH='100vh' align='center' justify='center' bg={bgColor}>
      <Box bg={useColorModeValue('white', 'white')} p={8} rounded='md' boxShadow='md' maxW='800px'>
        <Heading mb={6} color={textColor}>
          Privacy Policy
        </Heading>
        <Text mb={4} color={textColor}>
          We take your privacy seriously. This Privacy Policy outlines how we collect, use, and
          protect your personal information when you log in with your Google account.
        </Text>
        <Heading size='md' mt={6} mb={2} color={textColor}>
          Information We Collect
        </Heading>
        <UnorderedList spacing={2}>
          <ListItem color={textColor}>
            Your name, email address, and profile photo (if provided by Google)
          </ListItem>
          <ListItem color={textColor}>
            Additional information from your Google account, as permitted by your Google account
            settings
          </ListItem>
        </UnorderedList>
        <Heading size='md' mt={6} mb={2} color={textColor}>
          How We Use Your Information
        </Heading>
        <UnorderedList spacing={2}>
          <ListItem color={textColor}>
            To authenticate your login and provide access to our services
          </ListItem>
          <ListItem color={textColor}>
            To personalize your experience and provide relevant content
          </ListItem>
          <ListItem color={textColor}>
            To communicate with you about our products and services
          </ListItem>
        </UnorderedList>
        <Heading size='md' mt={6} mb={2} color={textColor}>
          Data Security
        </Heading>
        <Text mb={4} color={textColor}>
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, disclosure, or misuse.
        </Text>
        <Text mb={4} color={textColor}>
          If you have any questions or concerns about our Privacy Policy, please contact us at
          [insert contact information].
        </Text>
      </Box>
    </Flex>
  );
}
