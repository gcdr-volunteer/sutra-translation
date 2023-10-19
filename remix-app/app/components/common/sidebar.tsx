import {
  Avatar,
  Divider,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
  Box,
  useTheme,
  Spinner,
  useMediaQuery,
  Circle,
  useBoolean,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  InputGroup,
  Input,
  InputRightElement,
  List,
  ListItem,
  Tag,
  IconButton,
  InputLeftElement,
  Kbd,
} from '@chakra-ui/react';
import { NavLink, useFetcher } from '@remix-run/react';
import { FiHome } from 'react-icons/fi';
import { TbSquareLetterG, TbSquareLetterR, TbSquareLetterS } from 'react-icons/tb';
import {
  AiOutlineBook,
  AiOutlineSetting,
  AiOutlineRead,
  AiOutlineTable,
  AiOutlineSearch,
} from 'react-icons/ai';
import { MdOutlineManageAccounts } from 'react-icons/md';
import { Can } from '~/authorisation';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '~/routes/_app';
import { useDebounce, useSearchResultsNavigator, useTransitionState } from '../../hooks';
import { ArrowRightIcon, ArrowLeftIcon } from '@chakra-ui/icons';
import type { GlossarySearchResult, SearchResults } from '../../types';
import { match } from 'ts-pattern';
import { Intent } from '../../types/common';
export const Sidebar = () => {
  const { isLoading, isSubmitting } = useTransitionState();
  const { currentUser } = useContext(AppContext);
  const {
    colors: { primary, secondary },
  } = useTheme();
  const activeLinkColor = {
    color: primary[300],
  };
  const nonActiveLinkColor = {
    color: secondary[500],
  };

  const [expand, setExpand] = useBoolean(true);

  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [os, setOs] = useState<'Mac' | 'Win'>('Mac');

  useEffect(() => {
    const platform = navigator.platform;
    if (platform.includes('Mac')) {
      setOs('Mac');
    } else if (platform.includes('Win')) {
      setOs('Win');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (os === 'Mac' && event.metaKey && event.key === 'k') {
        onOpen();
      }
    };
    document.addEventListener('keydown', (e) => {
      handleKeyDown(e);
    });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (expand && !isLargerThan800) {
    return (
      <Box w='50px' background='primary.800'>
        <Flex
          flexDir='column'
          w='100%'
          alignItems='center'
          mb={4}
          h='100vh'
          pos={'sticky'}
          top='0'
          left='0'
        >
          <Flex mt={4} alignItems='center' flexDir='row' justifyContent='center' h='50px'>
            <Avatar
              size='sm'
              name={currentUser?.username ?? 'U'}
              src='https://bit.ly/broken-link'
            />
          </Flex>
          <Box flexGrow={1} />
          <Box onClick={setExpand.toggle} mb={4} cursor={'pointer'}>
            <Circle bg={'primary.300'} size={8}>
              <ArrowRightIcon boxSize={4} color={'secondary.800'} />
            </Circle>
          </Box>
        </Flex>
      </Box>
    );
  }
  return (
    <Box w='250px' background='primary.800'>
      <Flex
        px='5%'
        pos={'sticky'}
        top='0'
        left='0'
        h='100vh'
        w='250px'
        flexDir='column'
        justifyContent='space-between'
        boxShadow='0 4px 12px 0 rgba(0, 0, 0, 0.05)'
      >
        <VStack spacing={4}>
          {/* Logo section */}
          <VStack pt={6} w='100%'>
            <NavLink to='.' style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
              <Text as='b' fontSize={'3xl'} color={'secondary.300'}>
                {isLoading || isSubmitting ? <Spinner /> : null}
                Kumārajīva
              </Text>
            </NavLink>
            <Divider borderColor='primary.300' />
          </VStack>
          {/* menu section */}
          <Flex w='70%' flexDir={'column'} justifyContent={'space-between'}>
            <NavLink
              to='dashboard'
              style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
            >
              <Box
                px={6}
                py={2}
                _hover={{
                  color: 'secondary.500',
                  background: 'whiteAlpha.300',
                  borderRadius: 8,
                }}
              >
                <HStack justifyContent={'flex-start'}>
                  <Icon as={FiHome} />
                  <Text as='b'>Home</Text>
                </HStack>
              </Box>
            </NavLink>
            <Can I='Read' this='Translation'>
              <NavLink
                to='tripitaka'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <Box
                  px={6}
                  py={2}
                  _hover={{
                    color: 'secondary.500',
                    background: 'whiteAlpha.300',
                    borderRadius: 8,
                  }}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineBook} />
                    <Text as='b'>Translation</Text>
                  </HStack>
                </Box>
              </NavLink>
            </Can>
            <NavLink
              to='glossary'
              style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
            >
              <Box
                px={6}
                py={2}
                _hover={{
                  color: 'secondary.500',
                  background: 'whiteAlpha.300',
                  borderRadius: 8,
                }}
              >
                <HStack justifyContent={'flex-start'}>
                  <Icon as={AiOutlineTable} />
                  <Text as='b'>Glossary</Text>
                </HStack>
              </Box>
            </NavLink>
            <Can I='Read' this='Reference'>
              <NavLink
                to='reference'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <Box
                  px={6}
                  py={2}
                  _hover={{
                    color: 'secondary.500',
                    background: 'whiteAlpha.300',
                    borderRadius: 8,
                  }}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineRead} />
                    <Text as='b'>Reference</Text>
                  </HStack>
                </Box>
              </NavLink>
            </Can>
            <Can I='Read' this='Management'>
              <NavLink
                to='management'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <Box
                  px={6}
                  py={2}
                  _hover={{
                    color: 'secondary.500',
                    background: 'whiteAlpha.300',
                    borderRadius: 8,
                  }}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={MdOutlineManageAccounts} />
                    <Text as='b'>Management</Text>
                  </HStack>
                </Box>
              </NavLink>
            </Can>
            <Can I='Read' this='Administration'>
              <NavLink
                to='admin'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <Box
                  px={6}
                  py={2}
                  _hover={{
                    color: 'secondary.500',
                    background: 'whiteAlpha.300',
                    borderRadius: 8,
                  }}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineSetting} />
                    <Text as='b'>Admin</Text>
                  </HStack>
                </Box>
              </NavLink>
            </Can>
            <Box
              onClick={onOpen}
              px={6}
              py={2}
              color={'white'}
              cursor={'pointer'}
              _hover={{
                color: 'secondary.500',
                background: 'whiteAlpha.300',
                borderRadius: 8,
              }}
            >
              <HStack justifyContent={'flex-start'}>
                <Icon as={AiOutlineSearch} />
                <Text as='b' w='100%'>
                  Search
                </Text>
                <Box ml={0.5} display={'table'}>
                  <Kbd bg={'inherit'} mr={1} display={'table-cell'}>
                    {os === 'Mac' ? '⌘' : 'C^'}
                  </Kbd>
                  <Kbd bg={'inherit'} display={'table-cell'}>
                    k
                  </Kbd>
                </Box>
              </HStack>
            </Box>
          </Flex>
          <SearchModal isOpen={isOpen} onClose={onClose} />
        </VStack>
        {/* user profile section */}
        <Flex flexDir='column' w='100%' alignItems='center' mb={4}>
          <Divider borderColor={'primary.300'} />
          <Flex mt={4} alignItems='center' flexDir='row' w='100%' justifyContent='space-evenly'>
            <Flex flexDir='row'>
              <Avatar
                mr={2}
                size='sm'
                name={currentUser?.username ?? 'U'}
                src='https://bit.ly/broken-link'
              />
              <NavLink to='setting'>
                <Heading as='h3' size='sm' color='secondary.500'>
                  {currentUser?.username}
                </Heading>
                <Text color='secondary.500'>{currentUser?.roles[0]}</Text>
              </NavLink>
            </Flex>
            {!isLargerThan800 ? (
              <Box onClick={setExpand.toggle}>
                <ArrowLeftIcon boxSize={4} color={'secondary.800'} />
              </Box>
            ) : undefined}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>([]);
  const { setFocusIndex, focusIndex } = useSearchResultsNavigator(searchResults.length);
  const [searchType, setSearchType] = useState<'glossary' | 'sutra' | 'reference' | 'all'>('all');
  const typeToIcon = {
    glossary: (
      <InputLeftElement bg='iconButton.500' fontSize={'x-large'} h='100%'>
        <TbSquareLetterG color='white' />
      </InputLeftElement>
    ),
    sutra: (
      <InputLeftElement bg='iconButton.500' fontSize={'x-large'} h='100%'>
        <TbSquareLetterS color='white' />
      </InputLeftElement>
    ),
    reference: (
      <InputLeftElement bg='iconButton.500' fontSize={'x-large'} h='100%'>
        <TbSquareLetterR color='white' />
      </InputLeftElement>
    ),
    all: <></>,
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    if (debouncedSearchTerm.length > 3) {
      fetcher.submit(
        {
          intent: Intent.READ_OPENSEARCH,
          value: debouncedSearchTerm.value,
          type: searchType,
        },
        { method: 'post', action: '/search' }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const { intent, payload } = fetcher.data || { intent: '', payload: [] };
    if (intent === Intent.READ_OPENSEARCH) {
      setSearchResults(payload);
    }
  }, [fetcher?.data]);

  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSearchType('all');
      setSearchTerm('');
    }
    return () => {
      setSearchResults([]);
      setSearchType('all');
      setSearchTerm('');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', (e) => handleKeyDown(e));
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchType = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (
        searchTerm.startsWith('g') ||
        searchTerm.startsWith('gl') ||
        searchTerm.startsWith('glo')
      ) {
        setSearchType('glossary');
      } else if (
        searchTerm.startsWith('r') ||
        searchTerm.startsWith('re') ||
        searchTerm.startsWith('ref')
      ) {
        setSearchType('reference');
      } else if (
        searchTerm.startsWith('s') ||
        searchTerm.startsWith('su') ||
        searchTerm.startsWith('sut')
      ) {
        setSearchType('sutra');
      }
      setSearchTerm('');
    } else if (event.key === 'Backspace' && searchTerm.length === 0) {
      event.preventDefault();
      setSearchType('all');
    }
  };

  const getContent = (index: number) => {
    return match(searchResults[index])
      .with({ kind: 'glossary' }, ({ data }) => {
        return <GlossaryDetails {...data} />;
      })
      .with({ kind: 'reference' }, ({ data }) => {
        return (
          <>
            <Text mb={2} dangerouslySetInnerHTML={{ __html: data.origin }} />
            {data.target && <Text mb={2} dangerouslySetInnerHTML={{ __html: data.target }} />}
          </>
        );
      })
      .with({ kind: 'sutra' }, ({ data }) => {
        return (
          <>
            <Text mb={2} dangerouslySetInnerHTML={{ __html: data.origin }} />
            {data.target && <Text mb={2} dangerouslySetInnerHTML={{ __html: data.target }} />}
          </>
        );
      })
      .otherwise(() => <div></div>);
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
        <ModalOverlay />
        <ModalContent>
          <VStack>
            <InputGroup>
              {typeToIcon[searchType]}
              <Input
                ml={searchType === 'all' ? 0 : 2}
                variant={'filled'}
                boxShadow='none'
                size='lg'
                type={'text'}
                placeholder='Search'
                border={'none'}
                value={searchTerm}
                onKeyDown={(e) => handleSearchType(e)}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputRightElement h='100%'>
                {fetcher.state === 'loading' || fetcher.state === 'submitting' ? <Spinner /> : null}
              </InputRightElement>
            </InputGroup>
            {searchResults?.length ? (
              <HStack w='100%' alignItems={'flex-start'}>
                <List flex='1' borderRight={'1px solid lightgray'}>
                  {searchResults.map((result, index) =>
                    match(result)
                      .with(
                        { kind: 'glossary' },
                        { kind: 'reference' },
                        { kind: 'sutra' },
                        ({ data, kind }) => {
                          return (
                            <ListItem
                              px={2}
                              onClick={() => setFocusIndex(index)}
                              key={index}
                              onFocus={() => setFocusIndex(index)}
                              cursor='pointer'
                              bgColor={focusIndex === index ? 'gray.300' : 'inherit'}
                            >
                              <Box>
                                <Heading size='s' textTransform='uppercase'>
                                  <Tag
                                    size={'sm'}
                                    colorScheme={
                                      {
                                        glossary: 'green',
                                        reference: 'blue',
                                        sutra: 'purple',
                                      }[kind]
                                    }
                                    verticalAlign={'middle'}
                                    mr={1}
                                  >
                                    {kind}
                                  </Tag>
                                  {data.title}
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                  {data.subtitle}
                                </Text>
                              </Box>
                            </ListItem>
                          );
                        }
                      )
                      .otherwise(() => {
                        return <ListItem key={index}>unknown type</ListItem>;
                      })
                  )}
                </List>
                <Box flex='1' h='100%' p={2}>
                  {focusIndex >= 0 ? getContent(focusIndex) : <></>}
                </Box>
              </HStack>
            ) : null}
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export const GlossaryDetails = (glossary: GlossarySearchResult['data']) => {
  const {
    origin,
    target,
    short_definition,
    example_use,
    related_terms,
    terms_to_avoid,
    options,
    discussion,
  } = glossary;
  return (
    <>
      {origin && (
        <>
          <Heading as='h6' size={'xs'}>
            Origin:
          </Heading>
          <Text p={1} bg={'green.100'} mb={2}>
            {origin}
          </Text>
        </>
      )}
      {target && (
        <>
          <Heading as='h6' size={'xs'}>
            Target:
          </Heading>
          <Text p={1} bg={'blue.100'} mb={2}>
            {target}
          </Text>
        </>
      )}
      {short_definition && (
        <>
          <Heading as='h6' size={'xs'}>
            Short definition:
          </Heading>
          <Text mb={2}>{short_definition}</Text>
        </>
      )}
      {example_use && (
        <>
          <Heading as='h6' size={'xs'}>
            Example use:
          </Heading>
          <Text mb={2}>{example_use}</Text>
        </>
      )}
      {related_terms && (
        <>
          <Heading as='h6' size={'xs'}>
            Related terms:
          </Heading>
          <Text mb={2}>{related_terms}</Text>
        </>
      )}
      {terms_to_avoid && (
        <>
          <Heading as='h6' size={'xs'}>
            Terms to avoid:
          </Heading>
          <Text mb={2}>{terms_to_avoid}</Text>
        </>
      )}
      {options && (
        <>
          <Heading as='h6' size={'xs'}>
            Options:
          </Heading>
          <Text mb={2}>{options}</Text>
        </>
      )}
      {discussion && (
        <>
          <Heading as='h6' size={'xs'}>
            Discussion:
          </Heading>
          <Text mb={2}>{discussion}</Text>
        </>
      )}
    </>
  );
};
