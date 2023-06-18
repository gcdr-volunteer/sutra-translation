import { useState } from 'react';
import type { Sutra } from '~/types';
import type { ChangeEvent } from 'react';
import { FormControl, FormErrorMessage, FormLabel, Input, SimpleGrid } from '@chakra-ui/react';
import { useActionData } from '@remix-run/react';

type NewSutraState = Pick<
  Sutra,
  | 'title'
  | 'translator'
  | 'time_from'
  | 'time_to'
  | 'dynasty'
  | 'roll_start'
  | 'roll_count'
  | 'num_chars'
  | 'category'
>;
export const SutraForm = () => {
  const { errors } = useActionData<{ errors: NewSutraState }>() || {};
  const [formState, setFormState] = useState<NewSutraState>({
    title: '',
    translator: '',
    dynasty: '',
    category: '',
    roll_count: 0,
    roll_start: 0,
    time_from: 0,
    time_to: 0,
    num_chars: 0,
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
      <FormControl isInvalid={Boolean(errors?.title)}>
        <FormLabel>
          Sutra Name:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.title}
          onChange={(e) => handleFormStateUpdate('title', e)}
          name='title'
        />
        {errors?.title ? <FormErrorMessage>{errors?.title}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.translator)}>
        <FormLabel>
          Translator Name:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.translator}
          onChange={(e) => handleFormStateUpdate('translator', e)}
          name='translator'
        />
        {errors?.translator ? <FormErrorMessage>{errors?.translator}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.dynasty)}>
        <FormLabel>
          Dynasty:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.dynasty}
          onChange={(e) => handleFormStateUpdate('dynasty', e)}
          name='dynasty'
        />
        {errors?.dynasty ? <FormErrorMessage>{errors?.dynasty}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.category)}>
        <FormLabel>
          Category:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.category}
          onChange={(e) => handleFormStateUpdate('category', e)}
          name='category'
        />
        {errors?.category ? <FormErrorMessage>{errors?.category}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.roll_count)}>
        <FormLabel>
          Total Rolls:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='number'
          value={formState.roll_count}
          onChange={(e) => handleFormStateUpdate('roll_count', e)}
          name='roll_count'
        />
        {errors?.roll_count ? <FormErrorMessage>{errors?.roll_count}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.roll_start)}>
        <FormLabel>
          Roll Start:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='number'
          value={formState.roll_start}
          onChange={(e) => handleFormStateUpdate('roll_start', e)}
          name='roll_start'
        />
        {errors?.roll_start ? <FormErrorMessage>{errors?.roll_start}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.time_from)}>
        <FormLabel>
          Year Start:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='number'
          value={formState.time_from}
          onChange={(e) => handleFormStateUpdate('time_from', e)}
          name='time_from'
        />
        {errors?.time_from ? <FormErrorMessage>{errors?.time_from}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.time_to)}>
        <FormLabel>
          Year End:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='number'
          value={formState.time_to}
          onChange={(e) => handleFormStateUpdate('time_to', e)}
          name='time_to'
        />
        {errors?.time_to ? <FormErrorMessage>{errors?.time_to}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.num_chars)}>
        <FormLabel>
          Total Characters:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='number'
          value={formState.num_chars}
          onChange={(e) => handleFormStateUpdate('num_chars', e)}
          name='num_chars'
        />
        {errors?.num_chars ? <FormErrorMessage>{errors?.num_chars}</FormErrorMessage> : null}
      </FormControl>
    </SimpleGrid>
  );
};
