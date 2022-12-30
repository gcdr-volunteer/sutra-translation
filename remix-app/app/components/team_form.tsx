import { useActionData } from '@remix-run/react';
import { ChangeEvent, useState } from 'react';
import { Team } from '~/types';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

interface TeamFormProps {
  teams: Team[];
  onClose: () => void;
}
export const TeamForm = (props: TeamFormProps) => {
  const { errors } = useActionData<{ errors: { name: string; alias: string } }>() || {};
  const [formState, setFormState] = useState<Omit<Team, 'kind'>>({
    name: '',
    alias: '',
  });
  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newFormState = { ...formState, [type]: e.target.value };
    setFormState(newFormState);
  };
  const { teams } = props;
  return (
    <Box>
      {teams.length ? (
        <TableContainer mb={8}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Team</Th>
                <Th>Alias</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teams.map((team) => (
                <Tr key={team.name}>
                  <Td>{team.name}</Td>
                  <Td>{team.alias}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
      <SimpleGrid columns={2} spacing={4}>
        <FormControl isInvalid={Boolean(errors?.name)}>
          <FormLabel>Team name:</FormLabel>
          <Input
            type="text"
            value={formState.name}
            onChange={(e) => handleFormStateUpdate('name', e)}
            name="team_name"
          />
          {errors?.name ? <FormErrorMessage>{errors?.name}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={Boolean(errors?.alias)}>
          <FormLabel>Team alias:</FormLabel>
          <Input
            type="text"
            value={formState.alias}
            onChange={(e) => handleFormStateUpdate('alias', e)}
            name="team_alias"
          />
          {errors?.alias ? <FormErrorMessage>{errors?.alias}</FormErrorMessage> : null}
        </FormControl>
      </SimpleGrid>
    </Box>
  );
};
