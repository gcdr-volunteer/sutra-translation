/* eslint-disable @typescript-eslint/no-unused-vars */
import { Can } from '~/authorisation';
import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Paragraph, Glossary as TGlossary, CreatedType, Reference, Glossary } from '~/types';
import {
  useActionData,
  useSubmit,
  Form,
  useNavigate,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import {
  Tag,
  Box,
  Flex,
  Text,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  ButtonGroup,
  IconButton,
  Textarea,
  Divider,
  Button,
  Tooltip,
  useBoolean,
  HStack,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  InputGroup,
  Collapse,
  List,
  ListItem,
  useToast,
  Highlight,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  Icon,
  InputRightElement,
  Skeleton,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react';
import { json, redirect } from '@remix-run/node';
import { BiTable, BiSearch, BiNote, BiCheck, BiGlasses } from 'react-icons/bi';
import { AiFillGoogleCircle, AiOutlineGoogle } from 'react-icons/ai';
import { Warning } from '~/components/common/errors';
import { FormModal } from '~/components/common';
import {
  handleChatGPT,
  handleCreateNewGlossary,
  handleNewTranslationParagraph,
  handleOpenaiFetch,
  handleSearchByTerm,
  handleSearchGlossary,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { Intent } from '~/types/common';
import { assertAuthUser } from '~/auth.server';
import { useDebounce, useKeyPress, useSetTheme, useTransitionState } from '~/hooks';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import { handleGetReferencesByPK } from '~/models/reference';
import { GlossaryForm } from '~/components/common/glossary_form';
import { useModalErrors } from '~/hooks/useError';
import { handleGetAllRefBooks } from '../../../../../../services/__app/reference/$sutraId/$rollId.staging';
import { badRequest, created } from 'remix-utils';

export const loader = async ({ params, request }: LoaderArgs) => {
  const { rollId, sutraId, paragraphId } = params;
  if (!rollId) {
    throw badRequest('roll id cannot be empty');
  }
  if (!sutraId) {
    throw badRequest('sutra id cannot be empty');
  }
  if (!paragraphId) {
    throw badRequest('paragraph id cannot be empty');
  }
  const paragraph = await getParagraphByPrimaryKey({ PK: rollId, SK: paragraphId });
  const references = await handleGetReferencesByPK(paragraphId);
  const refbooks = await handleGetAllRefBooks(sutraId);
  const sortedBooks = refbooks.map((refbook) => refbook.name);

  return json({
    paragraph,
    references: references.sort((a, b) => {
      const indexA = sortedBooks.indexOf(a.name);
      const indexB = sortedBooks.indexOf(b.name);
      return indexA - indexB;
    }),
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId, rollId, paragraphId } = params;
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  if (!sutraId) {
    throw badRequest('sutraId cannot be empty');
  }
  if (!rollId) {
    throw badRequest('roll id cannot be empty');
  }
  if (!paragraphId) {
    throw badRequest('paragraph id cannot be empty');
  }
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_OPENAI) {
    const { category, content } = entryData;
    // Uncomment the following line when doing debug
    // return json({ payload: {}, intent: Intent.READ_OPENAI });
    if (content) {
      // const origins = await replaceWithGlossary(rest as Record<string, string>);
      const translation = await handleOpenaiFetch({
        content: content as string,
        category: category as string,
      });
      return json({ payload: { translation }, intent: Intent.READ_OPENAI });
    }
  }

  if (entryData?.intent === Intent.ASK_OPENAI) {
    try {
      const result = await handleChatGPT({ text: entryData?.text as string });
      return json({ payload: result, intent: Intent.ASK_OPENAI });
    } catch (error) {
      return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
    }
  }

  if (entryData?.intent === Intent.CREATE_TRANSLATION) {
    // Uncomment the following line when doing debug
    // return json({ payload: { index: entryData?.index }, intent: Intent.CREATE_TRANSLATION });
    const prevParagraph = await getParagraphByPrimaryKey({
      PK: rollId.replace('ZH', 'EN'),
      SK: paragraphId.replace('ZH', 'EN'),
    });
    if (prevParagraph?.finish) {
      return json({
        intent: Intent.CREATE_TRANSLATION,
        errors: { finish: true },
      });
    }

    await handleNewTranslationParagraph({
      sutraId,
      rollId,
      paragraphId,
      content: entryData?.content as string,
      num: parseInt(entryData?.num as string, 10) as number,
    });
    return created({
      intent: Intent.CREATE_TRANSLATION,
      payload: { finish: true },
    });
  }

  if (entryData?.intent === Intent.CREATE_GLOSSARY) {
    return await handleCreateNewGlossary({ newGlossary: entryData, user });
  }
  if (entryData?.intent === Intent.READ_OPENSEARCH) {
    if (entryData?.value) {
      if (entryData?.glossary_only === 'true') {
        return await handleSearchGlossary({ text: entryData?.value as string, filter: 'origin' });
      }
      return await handleSearchByTerm(entryData.value as string);
    }
  }
  return json({});
};

export default function ParagraphStagingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState(true);
  const { references, paragraph } = loaderData;
  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_TRANSLATION && actionData?.payload?.finish) {
      setCollapse(false);
      const newloc = location.pathname.split('/').slice(0, -1).join('/');
      navigate(newloc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  if (paragraph) {
    return (
      <Collapse key={paragraph.content} in={collapse} animateOpacity style={{ overflow: 'none' }}>
        <TranlationWorkspace origin={paragraph} references={references} />
      </Collapse>
    );
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}

interface WorkSpaceProps {
  origin: CreatedType<Paragraph>;
  references: CreatedType<Reference>[];
}
function TranlationWorkspace({ origin, references }: WorkSpaceProps) {
  const { content, category } = origin;
  const actionData = useActionData();
  const [workspaceText, setWorkspaceText] = useState('');
  const submit = useSubmit();
  const [glossary, setGlossary] = useBoolean(false);
  const { isSubmitting } = useTransitionState();
  const [refresh, setRefresh] = useState<number>(1);
  const [openaiTranslation, setOpenaiTranslation] = useState<string>('');

  const [text, setText] = useState('');

  const handleSubmitTranslation = () => {
    setWorkspaceText('');
    submit(
      {
        num: origin.num,
        content: text || workspaceText,
        intent: Intent.CREATE_TRANSLATION,
      },
      { replace: false, method: 'post' }
    );
  };

  useEffect(() => {
    if (refresh) {
      submit(
        {
          intent: Intent.READ_OPENAI,
          content: content,
          category: category,
        },
        { method: 'post', replace: false }
      );
    }
  }, [refresh, submit, content, category]);

  useEffect(() => {
    if (actionData?.intent === Intent.READ_OPENAI && actionData?.payload?.translation) {
      setOpenaiTranslation(actionData.payload.translation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const toast = useToast();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_TRANSLATION && actionData?.errors?.finish) {
      toast({
        title: 'Already translated',
        description: 'This paragraph has been translated, please select another paragraph.',
        status: 'warning',
        duration: 4000,
        isClosable: false,
      });
    }
  }, [actionData, toast]);

  const { fontSize, fontFamilyOrigin, fontFamilyTarget } = useSetTheme();

  // TODO: refactor this code to sub components
  return (
    <Flex gap={4} flexDir='column' justifyContent='space-between'>
      <Card
        w='100%'
        pos={'sticky'}
        overflowY={'auto'}
        background={'secondary.200'}
        borderRadius={12}
        top={0}
        zIndex={10}
      >
        <CardHeader>
          <Heading size='sm'>Origin</Heading>
        </CardHeader>
        <CardBody>
          <Text fontSize={fontSize} fontFamily={fontFamilyOrigin}>
            {origin.content}
          </Text>
        </CardBody>
      </Card>
      <Card w='100%' background={'secondary.300'} borderRadius={12}>
        <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
          <Heading size='sm'>OpenAI</Heading>
          <ButtonGroup variant='outline' spacing='6'>
            <IconButton
              isLoading={isSubmitting}
              icon={<RepeatIcon />}
              onClick={() => {
                setRefresh((pre) => pre + 1);
                setWorkspaceText(openaiTranslation);
              }}
              aria-label='refresh'
            />
            <OpenAIModal />
            <IconButton
              icon={<CopyIcon />}
              aria-label='copy'
              onClick={() => {
                setWorkspaceText(openaiTranslation);
              }}
            />
          </ButtonGroup>
        </CardHeader>
        <CardBody>
          <Text fontFamily={fontFamilyTarget} fontSize={fontSize}>
            {openaiTranslation}
          </Text>
        </CardBody>
      </Card>
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <AccordionButton _expanded={{ bg: 'iconButton.500', color: 'white' }}>
            <Box as='span' flex='1' textAlign='left' fontWeight={'bold'}>
              References
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {references.length
              ? references?.map((reference: { name: string; content: string }) => (
                  <Card
                    key={reference.content}
                    w='100%'
                    background={'secondary.400'}
                    borderRadius={12}
                    mb={4}
                  >
                    <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
                      <Heading size='sm'>{reference.name}</Heading>
                      <ButtonGroup variant='outline' spacing='6'>
                        <IconButton
                          icon={<CopyIcon />}
                          aria-label='copy'
                          onClick={() => {
                            setWorkspaceText(reference.content);
                          }}
                        />
                      </ButtonGroup>
                    </CardHeader>
                    <CardBody>
                      <Text fontFamily={fontFamilyTarget} fontSize={fontSize}>
                        {reference?.content ?? ''}
                      </Text>
                    </CardBody>
                  </Card>
                ))
              : null}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Can I='Update' this='Paragraph'>
        <Card background={'secondary.500'} w='100%' borderRadius={12}>
          <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
            <Heading size='sm'>Workspace</Heading>
          </CardHeader>
          <CardBody as={Flex} flexDir={'column'}>
            <ButtonGroup colorScheme={'iconButton'} variant={'outline'} p={4} mb={2}>
              <Tooltip label='open glossary' openDelay={1000}>
                <IconButton
                  onClick={setGlossary.toggle}
                  icon={<BiTable />}
                  aria-label='glossary button'
                />
              </Tooltip>
              <SearchModal />
              <Button
                disabled={isSubmitting}
                marginLeft={'auto'}
                onClick={handleSubmitTranslation}
                colorScheme={'iconButton'}
              >
                Submit
              </Button>
            </ButtonGroup>
            {glossary ? <GlossaryModal /> : null}
            <Form method='post' style={{ height: '100%' }}>
              <Textarea
                height={'150px'}
                fontFamily={fontFamilyTarget}
                fontSize={fontSize}
                value={text || workspaceText}
                onChange={(e) => setText(e.target.value)}
              />
            </Form>
          </CardBody>
        </Card>
      </Can>
    </Flex>
  );
}
const GlossaryModal = () => {
  const { isOpen: isOpenNote, onOpen: onOpenNote, onClose: onCloseNote } = useDisclosure();
  const actionData = useActionData<{
    intent: Intent;
    payload: { origin: string; target: string };
    errors?: { origin: string; target: string; unknown: string };
  }>();
  const toast = useToast();
  const [origin, setOrigin] = useState('');
  const [target, setTarget] = useState('');

  const { errors } = useModalErrors({ modalErrors: actionData?.errors, isOpen: isOpenNote });

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_GLOSSARY && actionData.payload) {
      const { origin, target } = actionData.payload;
      setOrigin('');
      setTarget('');
      toast({
        title: 'Glossary created',
        description: `We've created glossary ${origin} <-> ${target}`,
        status: 'success',
        duration: 3000,
        position: 'top',
      });
      onCloseNote();
    }
    if (actionData?.intent === Intent.CREATE_GLOSSARY && actionData.errors) {
      const { unknown, origin, target } = actionData.errors;
      setOrigin('');
      setTarget('');
      toast({
        title: 'Glossary creation failed',
        description: `Oops, ${unknown ?? origin ?? target}`,
        status: 'warning',
        duration: 3000,
        position: 'top',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const handleChange = (type: string, event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'origin') {
      setOrigin(event.target?.value);
    }
    if (type === 'target') {
      setTarget(event.target?.value);
    }
  };

  return (
    <HStack mb={4}>
      <Form method='post' style={{ width: '100%' }}>
        <HStack>
          <InputGroup _focus={{ outline: 'none' }}>
            <Input
              type='text'
              name='origin'
              placeholder='origin'
              mr={4}
              value={origin}
              onChange={(e) => handleChange('origin', e)}
            />
            <Input
              type='text'
              name='target'
              value={target}
              placeholder='target'
              onChange={(e) => handleChange('target', e)}
            />
          </InputGroup>
          <ButtonGroup colorScheme={'iconButton'} variant={'outline'}>
            <IconButton onClick={onOpenNote} icon={<BiNote />} aria-label='glossary note' />
            <IconButton
              // onClick={discardGlossary}
              type='submit'
              name='intent'
              value={Intent.CREATE_GLOSSARY}
              icon={<BiCheck />}
              aria-label='submit glossary'
            />
          </ButtonGroup>
        </HStack>
      </Form>
      <FormModal
        header='Add note to glossary'
        body={<GlossaryForm glossary={{ origin, target }} errors={errors} />}
        value={Intent.CREATE_GLOSSARY}
        isOpen={isOpenNote}
        onClose={onCloseNote}
      />
    </HStack>
  );
};

const OpenAIModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [text, setText] = useState('');
  const [conversations, setConversations] = useState<string[]>([]);
  const submit = useSubmit();

  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.intent === Intent.ASK_OPENAI) {
      setConversations((prev) => [...prev, actionData.payload]);
    }
  }, [actionData]);

  const handleCreateNewMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit(
        {
          intent: Intent.ASK_OPENAI,
          text: text.trim(),
        },
        { method: 'post', replace: true }
      );
      setConversations((prev) => [...prev, text]);
      setText('');
    }
  };

  const conversationRef = useCallback(
    (node: HTMLDivElement) => {
      if (node || conversations.length) {
        node?.scrollIntoView();
      }
    },
    [conversations]
  );

  const { isSubmitting } = useTransitionState();
  return (
    <>
      <Tooltip label='open chatgpt' openDelay={1000} closeDelay={1000}>
        <IconButton
          disabled={isSubmitting}
          onClick={onOpen}
          icon={<BiGlasses />}
          aria-label='custom openai'
        />
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose} size={'3xl'}>
        <ModalOverlay />
        <ModalContent height={'80vh'}>
          <ModalHeader>GPT translation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex flex={1} direction={'column'} height={'100%'} maxH={'65vh'}>
              <Box flexGrow={1} overflowY={'scroll'}>
                {conversations.map((conversion, index, arr) => {
                  return <Conversation key={index} index={index} text={conversion} />;
                })}
                {isSubmitting ? (
                  <Stack align={'flex-end'} px={2}>
                    <Skeleton height='40px' w='60%' color={'blue.100'} />;
                  </Stack>
                ) : null}
                <Box ref={conversationRef} />
                {/* <Box ref={conversationRef} /> */}
              </Box>
              <Divider my={4} />
              <Box height={'75px'}>
                <Textarea
                  height={'100px'}
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleCreateNewMessage}
                  placeholder='you can press Enter to send your text'
                />
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Conversation = ({ text, index }: { text: string; index: number }) => {
  return (
    <VStack w='100%' align={index % 2 === 0 ? 'flex-start' : 'flex-end'} mb={4} px={2}>
      <Text
        maxW={'60%'}
        as={'span'}
        background={index % 2 === 0 ? 'green.100' : 'blue.100'}
        borderRadius={8}
        px={2}
        py={1}
      >
        {text}
      </Text>
    </VStack>
  );
};

const SearchModal = () => {
  const { isOpen: isOpenSearch, onOpen: onOpenSearch, onClose: onCloseSearch } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    results: (Paragraph | TGlossary | Reference)[];
    counterParts: (Paragraph | TGlossary)[];
  }>({ counterParts: [], results: [] });
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const submit = useSubmit();
  const actionData = useActionData();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    if (debouncedSearchTerm.length > 3) {
      submit(
        {
          intent: Intent.READ_OPENSEARCH,
          value: debouncedSearchTerm.value,
          glossary_only: String(show),
        },
        { method: 'post', replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, show]);
  const arrowUpPressed = useKeyPress('ArrowUp');
  const arrowDownPressed = useKeyPress('ArrowDown');

  useEffect(() => {
    if (arrowUpPressed) {
      if (focusIndex > 0) {
        setFocusIndex((pre) => pre - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      if (focusIndex < searchResults.results.length - 1) {
        setFocusIndex((pre) => pre + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrowDownPressed]);

  useEffect(() => {
    if (actionData?.intent === Intent.READ_OPENSEARCH) {
      setSearchResults(actionData.payload);
    }
    if (!isOpenSearch) {
      setSearchTerm('');
      setSearchResults({ counterParts: [], results: [] });
    }
  }, [actionData, isOpenSearch]);

  const getContent = (index: number) => {
    const result = searchResults.results[index];
    if (result?.kind === 'PARAGRAPH') {
      const counterPart = searchResults.counterParts.find(
        (counterPart) => counterPart.kind === 'PARAGRAPH' && counterPart?.num === result.num
      );
      return (result.content as unknown as string[])?.map((text) => (
        <div key={text}>
          <Text mb={2} dangerouslySetInnerHTML={{ __html: text }} />
          <Text mb={2}>{counterPart?.content}</Text>
        </div>
      ));
    }
    if (result?.kind === 'GLOSSARY') {
      return <GlossaryDetails glossary={result} />;
    }
    if (result?.kind === 'REFERENCE') {
      return <Text mb={2} dangerouslySetInnerHTML={{ __html: result.content }} />;
    }
    return '';
  };
  return (
    <>
      <Tooltip label='open searchbar' openDelay={1000}>
        <IconButton onClick={onOpenSearch} icon={<BiSearch />} aria-label='search button' />
      </Tooltip>
      <Modal isOpen={isOpenSearch} onClose={onCloseSearch} size='3xl'>
        <ModalOverlay />
        <ModalContent>
          <VStack>
            <InputGroup>
              <Input
                variant={'filled'}
                boxShadow='none'
                size='lg'
                type={'text'}
                placeholder='Search'
                border={'none'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputRightElement
                h={'100%'}
                onClick={handleClick}
                children={
                  !show ? (
                    <Icon mr={2} as={AiOutlineGoogle} boxSize={'2rem'} />
                  ) : (
                    <Icon mr={2} as={AiFillGoogleCircle} boxSize={'2rem'} />
                  )
                }
              />
            </InputGroup>
            {searchResults.results?.length ? (
              <HStack w='100%' alignItems={'flex-start'}>
                <List flex='1' borderRight={'1px solid lightgray'}>
                  {searchResults.results.map((result, index) => {
                    if (result?.kind === 'PARAGRAPH') {
                      return (
                        <ListItem
                          px={2}
                          onClick={() => setFocusIndex(index)}
                          key={index}
                          onFocus={() => setFocusIndex(index)}
                          cursor='pointer'
                          bgColor={focusIndex === index ? 'gray.300' : 'inherit'}
                        >
                          <HStack justifyContent={'space-between'}>
                            <Box>
                              <Heading size='s' textTransform='uppercase'>
                                <Tag
                                  size={'sm'}
                                  colorScheme='yellow'
                                  verticalAlign={'middle'}
                                  mr={1}
                                >
                                  Sutra
                                </Tag>
                                {result.sutra}
                              </Heading>
                              <Text pt='2' fontSize='sm'>
                                {result.roll},{` p.${result.num}`}
                              </Text>
                            </Box>
                          </HStack>
                        </ListItem>
                      );
                    }
                    if (result?.kind === 'GLOSSARY') {
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
                              <Tag size={'sm'} colorScheme='green' verticalAlign={'middle'} mr={1}>
                                Glossary
                              </Tag>
                              {result.origin}
                            </Heading>
                            <Text pt='2' fontSize='sm'>
                              {result.target}
                            </Text>
                          </Box>
                        </ListItem>
                      );
                    }
                    if (result?.kind === 'REFERENCE') {
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
                              <Tag size={'sm'} colorScheme='green' verticalAlign={'middle'} mr={1}>
                                Reference
                              </Tag>
                              {result.name}
                            </Heading>
                            <Text pt='2' fontSize='sm'>
                              {result.sutra},{`${result.roll}`},
                              {` p.${result?.paragraphId.slice(-4)}`}
                            </Text>
                          </Box>
                        </ListItem>
                      );
                    }
                    return <ListItem key={index}>unknown type</ListItem>;
                  })}
                </List>
                <Box flex='1' h='100%' p={2}>
                  {focusIndex >= 0 ? getContent(focusIndex) : ''}
                </Box>
              </HStack>
            ) : null}
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

type GlossaryDetailsProps = {
  glossary: Glossary;
};
export const GlossaryDetails = ({ glossary }: GlossaryDetailsProps) => {
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
