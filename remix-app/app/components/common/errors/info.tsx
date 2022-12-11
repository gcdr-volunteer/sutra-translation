import { Box, Heading, Text } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { ErrorPageProps } from '~/types/error';
export const Info = (props: ErrorPageProps) => {
  const { heading, content } = props;
  return (
    <Box textAlign="center" py={10} px={6}>
      <InfoIcon boxSize={'50px'} color={'blue.500'} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        {heading ?? 'General Info'}
      </Heading>
      <Text color={'gray.500'}>{content}</Text>
    </Box>
  );
};
