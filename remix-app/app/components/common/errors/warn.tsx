import { Box, Heading, Text } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { ErrorPageProps } from '~/types/error';
export const Warning = (props: ErrorPageProps) => {
  const { heading, content } = props;
  return (
    <Box textAlign="center" py={10} px={6}>
      <WarningTwoIcon boxSize={'50px'} color={'orange.300'} />
      <Heading as="h2" size="xl" mt={6} mb={2}>
        {heading ?? 'General Warning'}
      </Heading>
      <Text color={'gray.500'}>{content}</Text>
    </Box>
  );
};
