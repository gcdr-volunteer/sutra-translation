import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { getGlossariesByTerm, getGlossaryByPage } from '~/models/glossary';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
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
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import type { Glossary } from '~/types';
import { assertAuthUser } from '~/auth.server';
import {
  handleCreateNewGlossary,
  handleUpdateGlossary,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { serverError, unauthorized } from 'remix-utils';
import { Can } from '~/authorisation';
import { logger } from '~/utils';
import { useModalErrors } from '~/hooks/useError';
import { useGlossary, useIsAtBottom } from '../hooks';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || undefined;
  const search = url.searchParams.get('search') || undefined;

  if (search) {
    const glossaries = await getGlossariesByTerm({ term: search });
    return json({ glossaries, nextPage: null, intent: Intent.SEARCH_GLOSSARY });
  }

  const { items: glossaries, nextPage } = await getGlossaryByPage(page);
  return json({ glossaries: glossaries, nextPage, intent: Intent.READ_GLOSSARY });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const user = await assertAuthUser(request);
    if (!user) {
      return redirect('/login');
    }
    const formData = await request.formData();
    const entryData = Object.fromEntries(formData.entries());
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

  const { glossaries: remoteGlossaries, nextPage: nextPageInfo } = useLoaderData<typeof loader>();

  const [nextPage, setNextPage] = useState<string | undefined | null>(nextPageInfo);
  const [glossaries, setGlossaries] = useState<Glossary[]>(remoteGlossaries);
  const [filteredGlossaries, setFilteredGlossaries] = useState<Glossary[]>(glossaries);
  const [filterValue, setFilterValue] = useState<string>('');
  const isAtBottom = useIsAtBottom();

  const fetcher = useFetcher<typeof loader>();

  const categories = useMemo(() => {
    const categories = new Set<string>();

    glossaries.forEach((glossary) => {
      if (glossary && glossary.sutra_name) {
        categories.add(glossary.sutra_name);
      }
    });
    return categories;
  }, [glossaries]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state === 'loading' || fetcher.state === 'submitting') {
      return;
    }

    if (fetcher.data && fetcher.data.intent === Intent.READ_GLOSSARY) {
      const newGlossary = fetcher.data.glossaries;
      setGlossaries((oldGlossaries) => [...oldGlossaries, ...newGlossary]);
    }
  }, [fetcher.data, fetcher.state]);

  const loadNext = () => {
    const query = `/glossary?page=${nextPage}`;
    if (nextPage) {
      fetcher.load(query);
    }
    const page = fetcher.data ? fetcher.data.nextPage : nextPage;
    setNextPage(page);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { errors } = useModalErrors({ modalErrors: actionData?.errors, isOpen });

  useEffect(() => {
    if (filterValue) {
      const newFilteredGlossaries = glossaries.filter(
        (glossary) => glossary.sutra_name === filterValue
      );
      setFilteredGlossaries(newFilteredGlossaries);
      setNextPage(null);
    } else {
      setFilteredGlossaries(glossaries);
    }
  }, [filterValue, setFilteredGlossaries, glossaries]);

  const tagColors = [
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
  ];

  const glossaryComp = (filterValue ? filteredGlossaries : glossaries)?.map((glossary, index) => {
    const i = glossary.sutra_name ? [...categories].indexOf(glossary.sutra_name) : 0;
    const color = tagColors[i];
    return (
      <GlossaryView
        tagColor={color}
        key={index}
        index={index}
        glossary={glossary}
        glossaryForm={
          <GlossaryDetailView intent={actionData?.intent} glossary={glossary} errors={errors} />
        }
      />
    );
  });

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_GLOSSARY && !actionData?.errors) {
      onClose();
    }
  }, [actionData, onClose]);

  return (
    <Box w='100%' backgroundColor='secondary.800'>
      <Box minH='100%'>
        <Flex p={10} w='100%' flexDir='column'>
          <Heading as='h5' size={'md'}>
            Glossary
          </Heading>
          <Divider mt={4} mb={4} borderColor={'primary.300'} />
          <Box w='97%'>
            <GlossarySearch
              setNextPage={setNextPage}
              glossaries={glossaries}
              categories={categories}
              filterValue={filterValue}
              setFilteredGlossaries={setFilteredGlossaries}
              setGlossaries={setGlossaries}
              setFilterValue={setFilterValue}
            />
            <InfiniteScroller
              nextPage={nextPage}
              loadNext={loadNext}
              loading={fetcher.state === 'loading' || fetcher.state === 'submitting'}
            >
              {glossaryComp}
            </InfiniteScroller>
            {nextPage && isAtBottom ? (
              <Center>
                <Spinner size='lg' color='primary.500' />
              </Center>
            ) : null}
          </Box>
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
    </Box>
  );
}

type GlossarySearchProps = {
  setGlossaries: (glossaries: Glossary[]) => void;
  setFilteredGlossaries: (glossaries: Glossary[]) => void;
  setFilterValue: (value: string) => void;
  setNextPage: (value: string | undefined | null) => void;
  categories: Set<string>;
  filterValue: string;
  glossaries: Glossary[];
};
export const GlossarySearch = (props: GlossarySearchProps) => {
  const {
    setGlossaries,
    categories,
    setFilterValue,
    filterValue,
    setFilteredGlossaries,
    glossaries,
    setNextPage,
  } = props;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { onSearch } = useGlossary({
    searchTerm,
    setGlossaries,
    setFilteredGlossaries,
    setFilterValue,
    setNextPage,
  });

  useEffect(() => {
    if (filterValue) {
      const newFilteredGlossaries = glossaries.filter(
        (glossary) => glossary.sutra_name === filterValue
      );
      setFilteredGlossaries(newFilteredGlossaries);
    } else {
      setFilteredGlossaries(glossaries);
    }
  }, [filterValue, setFilteredGlossaries, glossaries]);

  const onFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilterValue(value);
  };

  return (
    <InputGroup size='md' mb={4}>
      <Input
        pr='4.5rem'
        type={'text'}
        placeholder='Search Glossary'
        value={searchTerm}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        onChange={(e) => setSearchTerm(e.target.value)}
        _focus={{
          borderColor: 'none',
          boxShadow: 'none',
          outline: 'none',
        }}
      />
      <InputRightElement width='10rem'>
        <Select placeholder='Filter' onChange={onFilter} mr={2}>
          {Array.from(categories)?.map((category, index) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Button ml={2} h='100%' colorScheme='iconButton' size='sm' onClick={onSearch}>
          Search
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};

type GlossaryViewProps = {
  index: number;
  glossary: Glossary;
  glossaryForm: React.ReactNode;
  tagColor: string;
};
export const GlossaryView = ({ glossary, glossaryForm, index, tagColor }: GlossaryViewProps) => {
  return (
    <Box bg={index % 2 === 0 ? 'secondary.400' : 'inherit'}>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: 'primary.800', color: 'white' }}>
              <Box flex='5' textAlign='left'>
                <Tag bg='green.100' mr={4}>
                  {glossary.origin}
                </Tag>
                <Tag bg='blue.100'>{glossary.target}</Tag>
              </Box>
              <Box flex='1' textAlign='right'>
                <Tag bg={tagColor} mr={4}>
                  {glossary?.sutra_name}
                </Tag>
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
  map.set('chinese_term', glossary.origin);
  map.set('english_translation', glossary.target);
  map.set('origin_sutra_text', glossary.origin_sutra_text);
  map.set('target_sutra_text', glossary.target_sutra_text);
  map.set('sutra_name', glossary.sutra_name);
  map.set('volume', glossary.volume);
  map.set('cbeta_frequency', glossary.cbeta_frequency);
  map.set('glossary_author', glossary.glossary_author);
  map.set('translation_date', glossary.translation_date);
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
        bg={
          key === 'chinese_term'
            ? 'green.100'
            : key === 'english_translation'
            ? 'blue.100'
            : 'inherit'
        }
      >
        <Heading size='sm'>
          {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Heading>
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

const InfiniteScroller = (
  props: PropsWithChildren<{
    loading: boolean;
    loadNext: () => void;
    nextPage: string | undefined | null;
  }>
) => {
  const { children, loading, loadNext, nextPage } = props;
  const scrollListener = useRef(loadNext);

  useEffect(() => {
    scrollListener.current = loadNext;
  }, [loadNext]);

  const onScroll = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const scrollDifference = Math.floor(window.innerHeight + window.scrollY);
    const scrollEnded = documentHeight == scrollDifference;

    if (scrollEnded && !loading && nextPage) {
      scrollListener.current();
    }
  }, [loading, nextPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  return <>{children}</>;
};
