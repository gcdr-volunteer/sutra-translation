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
import { useActionData } from '@remix-run/react';
import { ChangeEvent, useState } from 'react';
import { Lang, LangCode } from '~/types';

interface LangFormProps {
  langs: Lang[];
  onClose: () => void;
}
export const LangForm = (props: LangFormProps) => {
  const { errors } = useActionData<{ errors: { name: string; alias: string } }>() || {};
  const [formState, setFormState] = useState<Omit<Lang, 'kind'>>({
    name: '' as LangCode,
    alias: '',
  });
  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newFormState = { ...formState, [type]: e.target.value };
    setFormState(newFormState);
  };
  const { langs } = props;
  return (
    <Box>
      {langs.length ? (
        <TableContainer mb={8}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Language</Th>
                <Th>Alias</Th>
              </Tr>
            </Thead>
            <Tbody>
              {langs.map((lang) => (
                <Tr key={lang.name}>
                  <Td>{lang.name}</Td>
                  <Td>{lang.alias}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
      <SimpleGrid columns={2} spacing={4}>
        <FormControl isInvalid={Boolean(errors?.name)}>
          <FormLabel>Language name:</FormLabel>
          <Input
            type="text"
            value={formState.name}
            onChange={(e) => handleFormStateUpdate('name', e)}
            name="lang_name"
          />
          {errors?.name ? <FormErrorMessage>{errors?.name}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={Boolean(errors?.alias)}>
          <FormLabel>Language alias:</FormLabel>
          <Input
            type="text"
            value={formState.alias}
            onChange={(e) => handleFormStateUpdate('alias', e)}
            name="lang_alias"
          />
          {errors?.alias ? <FormErrorMessage>{errors?.alias}</FormErrorMessage> : null}
        </FormControl>
      </SimpleGrid>
    </Box>
  );
};
