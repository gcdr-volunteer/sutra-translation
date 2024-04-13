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
    origin_sutra_text: glossary?.origin_sutra_text ?? '',
    target_sutra_text: glossary?.target_sutra_text ?? '',
    sutra_name: glossary?.sutra_name ?? '',
    volume: glossary?.volume ?? '',
    cbeta_frequency: glossary?.cbeta_frequency ?? '',
    glossary_author: glossary?.glossary_author ?? '',
    translation_date: glossary?.translation_date ?? '',
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
            Chinese Term<span style={{ color: 'red' }}>*</span>
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
            English Translation<span style={{ color: 'red' }}>*</span>
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
            <FormHelperText>The english term of the glossary</FormHelperText>
          )}
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Chinese Sutra Text</FormLabel>
          <Textarea
            name='origin_sutra_text'
            value={state.origin_sutra_text}
            onChange={(e) => handleChange('origin_sutra_text', e)}
          />
          <FormHelperText>The location where this term appears in sutra</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>English Sutra Text</FormLabel>
          <Textarea
            name='target_sutra_text'
            value={state.target_sutra_text}
            onChange={(e) => handleChange('target_sutra_text', e)}
          />
          <FormHelperText>The location where this term appears in sutra</FormHelperText>
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Sutra Name</FormLabel>
          <Textarea
            name='sutra_name'
            value={state.sutra_name}
            onChange={(e) => handleChange('sutra_name', e)}
          />
          <FormHelperText>The chinese sutra name</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Volume</FormLabel>
          <Textarea
            name='volume'
            value={state.volume}
            onChange={(e) => handleChange('volume', e)}
          />
          <FormHelperText>which volume appears in sutra</FormHelperText>
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>CBeta Frequency</FormLabel>
          <Textarea
            name='cbeta_frequency'
            value={state.cbeta_frequency}
            onChange={(e) => handleChange('cbeta_frequency', e)}
          />
          <FormHelperText>The term frequency in cbeta</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Glossary Author</FormLabel>
          <Textarea
            name='glossary_author'
            value={state.glossary_author}
            onChange={(e) => handleChange('glossary_author', e)}
          />
          <FormHelperText>The glossary contributor</FormHelperText>
        </FormControl>
      </HStack>
      <HStack w='100%'>
        <FormControl>
          <FormLabel>Translation Date</FormLabel>
          <Textarea
            name='translation_date'
            value={state.translation_date}
            onChange={(e) => handleChange('translation_date', e)}
          />
          <FormHelperText>The data of the translation</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Discussion</FormLabel>
          <Textarea
            name='discussion'
            value={state.discussion}
            onChange={(e) => handleChange('discussion', e)}
          />
          <FormHelperText>Extra comments on this glossary</FormHelperText>
        </FormControl>
      </HStack>
      <Input hidden readOnly name='PK' value={glossary?.PK} />
      <Input hidden readOnly name='SK' value={glossary?.SK} />
    </VStack>
  );
};
