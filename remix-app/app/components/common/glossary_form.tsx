import {
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  HStack,
  VStack,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Glossary } from '~/types';

type GlossaryProps = {
  glossary?: Omit<Glossary, 'kind'>;
  errors?: { origin: string; target: string; unknown: string };
};
export const GlossaryForm = ({ glossary, errors }: GlossaryProps) => {
  const [state, setState] = useState<Omit<Glossary, 'kind'>>({
    origin: glossary?.origin ?? '',
    target: glossary?.target ?? '',
    short_definition: glossary?.short_definition ?? '',
    options: glossary?.options ?? '',
    note: glossary?.note ?? '',
    example_use: glossary?.example_use ?? '',
    related_terms: glossary?.related_terms ?? '',
    terms_to_avoid: glossary?.terms_to_avoid ?? '',
    discussion: glossary?.discussion ?? '',
  });

  const toast = useToast();
  useEffect(() => {
    if (errors?.unknown) {
      toast({
        title: 'Glossary creation failed',
        description: `Oops, ${errors.unknown}`,
        status: 'warning',
        duration: 4000,
        position: 'top',
      });
    }
  }, [errors, toast]);

  const handleChange = (type: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target) {
      setState((prev) => ({ ...prev, [type]: e.target.value }));
    }
  };

  return (
    <VStack spacing={4} flexDir='column'>
      <HStack w='100%'>
        <FormControl isInvalid={Boolean(errors?.origin)}>
          <FormLabel>
            Origin<span style={{ color: 'red' }}>*</span>
          </FormLabel>
          <Input
            type='text'
            name='origin'
            value={state.origin}
            onChange={(e) => handleChange('origin', e)}
          />
          {errors?.origin ? (
            <FormErrorMessage>{errors?.origin}</FormErrorMessage>
          ) : (
            <FormHelperText>The original term of the glossary</FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={Boolean(errors?.target)}>
          <FormLabel>
            Target<span style={{ color: 'red' }}>*</span>
          </FormLabel>
          <Input
            type='text'
            name='target'
            value={state.target}
            onChange={(e) => handleChange('target', e)}
          />
          {errors?.target ? (
            <FormErrorMessage>{errors?.target}</FormErrorMessage>
          ) : (
            <FormHelperText>The target term of the glossary</FormHelperText>
          )}
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Short Definition</FormLabel>
          <Textarea
            name='short_definition'
            value={state.short_definition}
            onChange={(e) => handleChange('short_definition', e)}
          />
          <FormHelperText>The definition of the term</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Options</FormLabel>
          <Textarea
            name='options'
            value={state.options}
            onChange={(e) => handleChange('options', e)}
          />
          <FormHelperText>Alternative terms</FormHelperText>
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea name='note' value={state.note} onChange={(e) => handleChange('note', e)} />
          <FormHelperText>The note to this glossary</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Example Use</FormLabel>
          <Textarea
            name='example_use'
            value={state.example_use}
            onChange={(e) => handleChange('example_use', e)}
          />
          <FormHelperText>The example use cases of this term</FormHelperText>
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Related Terms</FormLabel>
          <Textarea
            name='related_terms'
            value={state.related_terms}
            onChange={(e) => handleChange('related_terms', e)}
          />
          <FormHelperText>Related term to this glossary</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Terms to avoid</FormLabel>
          <Textarea
            name='terms_to_avoid'
            value={state.terms_to_avoid}
            onChange={(e) => handleChange('terms_to_avoid', e)}
          />
          <FormHelperText>Terms should be avoided</FormHelperText>
        </FormControl>
      </HStack>
      <FormControl>
        <FormLabel>Discussion</FormLabel>
        <Textarea
          name='discussion'
          value={state.discussion}
          onChange={(e) => handleChange('discussion', e)}
        />
        <FormHelperText>Extra comments on this glossary</FormHelperText>
      </FormControl>
      <Input hidden readOnly name='PK' value={glossary?.PK} />
      <Input hidden readOnly name='SK' value={glossary?.SK} />
    </VStack>
  );
};
