import { Box, Stat, StatHelpText, StatLabel, StatNumber, Tag } from '@chakra-ui/react';

export const Stats = () => {
  return (
    <Box>
      <Stat>
        <StatLabel>Number of Teams</StatLabel>
        <StatNumber>2</StatNumber>
        <StatHelpText>Feb 12 - Feb 28</StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>Supported Languages</StatLabel>
        <StatNumber>2</StatNumber>
        <StatHelpText>
          <Tag size={'sm'} variant='solid' colorScheme='teal'>
            Chinese
          </Tag>
          <Tag size={'sm'} variant='solid' colorScheme='teal'>
            English
          </Tag>
        </StatHelpText>
      </Stat>
    </Box>
  );
};
