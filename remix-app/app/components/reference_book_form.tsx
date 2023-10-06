import { useState } from 'react';
import type { CreatedType, Sutra, Team } from '~/types';
import type { ChangeEvent } from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
} from '@chakra-ui/react';
import { useActionData } from '@remix-run/react';

interface ReferenceBookFormProps {
  teams: Team[];
  sutras: CreatedType<Sutra>[];
}
export const ReferenceBookForm = (props: ReferenceBookFormProps) => {
  const { sutras, teams } = props || {};
  const { errors } =
    useActionData<{
      errors: { bookname: string; team: Team['name']; sutra: string };
    }>() || {};
  const [formState, setFormState] = useState<{
    bookname: string;
    team: Team['name'];
    sutra: string;
    order: string;
  }>({
    bookname: '',
    team: '',
    sutra: '',
    order: '1',
  });

  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newFormState = { ...formState, [type]: e.target.value };
    setFormState(newFormState);
  };

  return (
    <SimpleGrid spacing={4}>
      <FormControl isInvalid={Boolean(errors?.bookname)}>
        <FormLabel>
          Book Name:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.bookname}
          onChange={(e) => handleFormStateUpdate('bookname', e)}
          name='bookname'
          autoComplete='off'
        />
        {errors?.bookname ? <FormErrorMessage>{errors?.bookname}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.team)}>
        <FormLabel>
          Team:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Select
          placeholder='Select your team'
          value={formState.team}
          onChange={(e) => handleFormStateUpdate('team', e)}
          name='team'
          multiple={false}
        >
          {teams?.map((team) => (
            <option key={team.name} value={team.name}>
              {team.alias || team.name}
            </option>
          ))}
        </Select>
        {errors?.team ? <FormErrorMessage>{errors?.team}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.sutra)}>
        <FormLabel>
          Sutra:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Select
          placeholder='Select your sutra'
          value={formState.sutra}
          onChange={(e) => handleFormStateUpdate('sutra', e)}
          name='sutra'
          multiple={false}
        >
          {sutras?.map((sutra) => (
            <option key={sutra.SK} value={sutra.SK}>
              {sutra.title}
            </option>
          ))}
        </Select>
        {errors?.sutra ? <FormErrorMessage>{errors?.sutra}</FormErrorMessage> : null}
      </FormControl>
      <FormControl>
        <FormLabel>Book Order: (higher earlier)</FormLabel>
        <Input
          type='text'
          value={formState.order}
          onChange={(e) => handleFormStateUpdate('order', e)}
          name='order'
          autoComplete='off'
        />
      </FormControl>
    </SimpleGrid>
  );
};
