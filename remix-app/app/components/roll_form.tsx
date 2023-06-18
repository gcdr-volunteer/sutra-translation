import { useState } from 'react';
import type { Roll } from '~/types';
import type { ChangeEvent } from 'react';
import { FormControl, FormErrorMessage, FormLabel, Input, SimpleGrid } from '@chakra-ui/react';
import { useActionData } from '@remix-run/react';

type NewRollState = Pick<Roll, 'title' | 'subtitle' | 'category'>;
export const RollForm = () => {
  const { errors } = useActionData<{ errors: NewRollState }>() || {};
  const [formState, setFormState] = useState<NewRollState>({
    title: '',
    category: '',
    subtitle: '',
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
          Roll Title:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.title}
          onChange={(e) => handleFormStateUpdate('title', e)}
          name='title'
        />
        {errors?.title ? <FormErrorMessage>{errors?.title}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={Boolean(errors?.subtitle)}>
        <FormLabel>
          Roll Subtitle:<span style={{ color: 'red' }}>*</span>
        </FormLabel>
        <Input
          type='text'
          value={formState.subtitle}
          onChange={(e) => handleFormStateUpdate('subtitle', e)}
          name='subtitle'
        />
        {errors?.subtitle ? <FormErrorMessage>{errors?.subtitle}</FormErrorMessage> : null}
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
    </SimpleGrid>
  );
};
