import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useRef, useEffect } from 'react';
import { getGlossariesByTerm, getGlossaryByPage } from '~/models/glossary';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { AiOutlinePlus, AiOutlineEdit } from 'react-icons/ai';
import { FormModal } from '~/components/common';
import { Intent } from '~/types/common';
import { GlossaryForm } from '~/components/common/glossary_form';
import { useActionData, useLoaderData } from '@remix-run/react';
import type { Glossary } from '~/types';
import { assertAuthUser } from '~/auth.server';
import {
  handleCreateNewGlossary,
  handleUpdateGlossary,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { serverError, unauthorized } from 'remix-utils';
import { Can } from '~/authorisation';
import { useGlossary, useGlossarySearch } from '~/hooks';
import { logger } from '~/utils';
import { useModalErrors } from '~/hooks/useError';

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || undefined;
  const search = url.searchParams.get('search') || undefined;
  if (search) {
    const glossaries = await getGlossariesByTerm({ term: search });
    return json({ glossaries, nextPage: undefined, intent: Intent.SEARCH_GLOSSARY });
  }
  const { items: glossaries, nextPage } = await getGlossaryByPage(page);
  return json({ glossaries: glossaries, nextPage, intent: Intent.READ_GLOSSARY });
};

export const action = async ({ request }: ActionArgs) => {
  try {
    const user = await assertAuthUser(request);
    const formdata = await request.formData();
    const entryData = Object.fromEntries(formdata.entries());
    if (!user) {
      throw unauthorized({ message: 'you should login first' });
    }

    if (entryData.intent === Intent.CREATE_GLOSSARY) {
      return await handleCreateNewGlossary({
        newGlossary: entryData,
        user,
      });
    }

    if (entryData?.intent === Intent.UPDATE_GLOSSARY) {
      return await handleUpdateGlossary({
        newGlossary: entryData,
        user,
      });
    }
  } catch (error) {
    logger.error('glossary action', 'unknown error', error);
    throw serverError({ message: 'unknown error' });
  }
};

export default function GlossaryRoute() {
  const actionData = useActionData<{
    intent: Intent;
    errors: { origin: string; target: string; unknown: string };
  }>();

  const footRef = useRef<HTMLDivElement>(null);

  const { glossaries, nextPage, intent } = useLoaderData<typeof loader>();

  const glossarySearch = useGlossarySearch();
  const { gloss, isIntersecting } = useGlossary({
    glossaries,
    footRef,
    nextPage,
    intent,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { errors } = useModalErrors({ modalErrors: actionData?.errors, isOpen });

  const glossaryComp = gloss.length
    ? gloss.map((glossary, index) => (
        <GlossaryView
          key={index}
          glossary={glossary}
          glossaryForm={
            <GlossaryDetailView intent={actionData?.intent} glossary={glossary} errors={errors} />
          }
        />
      ))
    : null;

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_GLOSSARY && !actionData?.errors) {
      onClose();
    }
  }, [actionData, onClose]);

  return (
    <Box h='100%' w='100%'>
      <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
        <Heading as='h5' size={'md'}>
          Glossary
        </Heading>
        <Divider mt={4} mb={4} borderColor={'primary.300'} />
        <GlossarySearch {...glossarySearch} />
        {glossaryComp}
        <div ref={footRef} />
        {isIntersecting && nextPage ? <Spinner /> : null}
        {isOpen ? (
          <FormModal
            header='Add new glossary'
            body={<GlossaryForm errors={errors} />}
            isOpen={isOpen}
            onClose={onClose}
            value={Intent.CREATE_GLOSSARY}
            modalSize='3xl'
          />
        ) : null}
        <Can I='Create' this='Glossary'>
          <IconButton
            borderRadius={'50%'}
            w={12}
            h={12}
            pos={'fixed'}
            bottom={8}
            right={8}
            icon={<AiOutlinePlus />}
            aria-label='edit roll'
            colorScheme={'iconButton'}
            onClick={() => onOpen()}
          />
        </Can>
      </Flex>
    </Box>
  );
}
type GlossarySearchProps = ReturnType<typeof useGlossarySearch>;
export const GlossarySearch = (props: GlossarySearchProps) => {
  const { input, setInput, handleGlossarySearch } = props;
  return (
    <InputGroup size='md' w='97%' mb={4}>
      <Input
        pr='4.5rem'
        type={'text'}
        placeholder='Search Glossary'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <InputRightElement width='5rem'>
        <Button ml={2} h='100%' colorScheme='iconButton' size='sm' onClick={handleGlossarySearch}>
          Search
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};

type GlossaryViewProps = {
  glossary: Glossary;
  glossaryForm: React.ReactNode;
};
export const GlossaryView = ({ glossary, glossaryForm }: GlossaryViewProps) => {
  return (
    <Box w='97%'>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: 'primary.800', color: 'white' }}>
              <Box flex='1' textAlign='left'>
                <Tag bg='green.100' mr={4}>
                  {glossary.origin}
                </Tag>
                <Tag bg='blue.100'>{glossary.target}</Tag>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel background={'secondary.500'}>{glossaryForm}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

type GlossaryDetailViewProps = {
  glossary: Glossary;
  intent?: Intent;
  errors?: { origin: string; target: string; unknown: string };
};
const GlossaryDetailView = ({ glossary, intent, errors }: GlossaryDetailViewProps) => {
  const actionData = useActionData<typeof action>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (intent === Intent.UPDATE_GLOSSARY && !errors) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  const map = new Map<string, string | undefined>();
  map.set('origin', glossary.origin);
  map.set('target', glossary.target);
  map.set('short_definition', glossary.short_definition);
  map.set('options', glossary.options);
  map.set('note', glossary.note);
  map.set('example_use', glossary.example_use);
  map.set('related_terms', glossary.related_terms);
  map.set('terms_to_avoid', glossary.terms_to_avoid);
  map.set('discussion', glossary.discussion);
  const comp = Array.from(map.entries())
    .filter(([key, value]) => value)
    .map(([key, value]) => (
      // eslint-disable-next-line react/jsx-key
      <Box
        key={key}
        border={'1px'}
        p={2}
        borderColor={'gray.300'}
        bg={key === 'origin' ? 'green.100' : key === 'target' ? 'blue.100' : 'inherit'}
      >
        <Heading size='sm'>{key}</Heading>
        <Text>{value}</Text>
      </Box>
    ));

  return (
    <Flex flexDir={'column'}>
      <SimpleGrid columns={3}>
        {comp}
        <FormModal
          header='update glossary'
          body={<GlossaryForm glossary={glossary} errors={errors} />}
          isOpen={isOpen}
          onClose={onClose}
          value={Intent.UPDATE_GLOSSARY}
          modalSize='3xl'
        />
      </SimpleGrid>
      <Can I='Update' this='Glossary'>
        <IconButton
          colorScheme={'iconButton'}
          aria-label='update glossary'
          onClick={onOpen}
          icon={<AiOutlineEdit />}
          alignSelf='end'
        >
          Update
        </IconButton>
      </Can>
    </Flex>
  );
};
