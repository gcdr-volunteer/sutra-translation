/* eslint-disable @typescript-eslint/no-unused-vars */
import { Can } from '~/authorisation';
import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Paragraph, Glossary as TGlossary, CreatedType, Reference, Glossary } from '~/types';
import {
  useActionData,
  useLocation,
  useSubmit,
  Form,
  useNavigate,
  useLoaderData,
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
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon } from '@chakra-ui/icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { json } from '@remix-run/node';
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
import { logger, splitParagraph } from '~/utils';
import { getParagraphByPrimaryKey, getParagraphsByRollId } from '~/models/paragraph';
import { getFootnotesByPartitionKey } from '~/models/footnote';
import { getReferencesBySK } from '~/models/reference';
import { GlossaryForm } from '~/components/common/glossary_form';
import { getAllGlossary } from '~/models/glossary';
import { translate } from '~/models/external_services/openai';
import { unauthorized } from 'remix-utils';
import { useModalErrors } from '~/hooks/useError';

export const loader = async ({ params, request }: LoaderArgs) => {
  const { rollId } = params;
  const url = new URL(request.url);
  const ps = [...new Set(url.searchParams.getAll('p'))];
  const paragraphs = await Promise.all(
    ps.map((p) => getParagraphByPrimaryKey({ PK: rollId ?? '', SK: p }))
  );
  const references = await Promise.all(ps.map((p) => getReferencesBySK(p)));
  const rollIdInTargetLang = rollId?.replace('ZH', 'EN') ?? '';
  const targetParagraphs = await getParagraphsByRollId(rollIdInTargetLang);
  const footnotes = await getFootnotesByPartitionKey(rollIdInTargetLang);
  const paragraph = targetParagraphs.find((paragraph) => !paragraph.finish);
  return json({
    sentenceIndex: paragraph?.sentenceIndex ?? -1,
    paragraphIndex: paragraph?.paragraphIndex ?? -1,
    paragraph,
    footnotes: footnotes.filter((footnote) => footnote.paragraphId === paragraph?.SK),
    paragraphs,
    references,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId, rollId } = params;
  const user = await assertAuthUser(request);
  if (!user) {
    throw unauthorized({ message: 'you should login first' });
  }
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_OPENAI) {
    const { intent, category, ...rest } = entryData;
    // Uncomment the following line when doing debug
    // return json({ data: {}, intent: Intent.READ_DEEPL });
    if (Object.keys(rest)?.length) {
      // const origins = await replaceWithGlossary(rest as Record<string, string>);
      const obj = await handleOpenaiFetch({
        origins: rest as Record<string, string>,
        category: category as string,
      });
      return json({ payload: obj, intent: Intent.READ_OPENAI });
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
  if (entryData?.intent === Intent.UPDATE_OPENAI) {
    const origin = entryData?.origin as string;
    const category = entryData?.category as string;
    const glossaries = await getAllGlossary();
    const sourceGlossaries = glossaries
      ?.filter((glossary) => origin?.includes(glossary.origin))
      ?.reduce((acc, glossary) => {
        acc[glossary.origin] = glossary.target;
        return acc;
      }, {} as Record<string, string>);

    const translation = await translate({ text: origin, category }, sourceGlossaries);
    return json({ intent: Intent.UPDATE_OPENAI, origin, translation });
  }

  if (entryData?.intent === Intent.CREATE_TRANSLATION) {
    // Uncomment the following line when doing debug
    // return json({ payload: { index: entryData?.index }, intent: Intent.CREATE_TRANSLATION });

    return await handleNewTranslationParagraph(
      {
        paragraphIndex: entryData?.paragraphIndex as string,
        sentenceIndex: entryData?.sentenceIndex as string,
        totalSentences: entryData?.totalSentences as string,
        PK: entryData?.PK as string,
        SK: entryData?.SK as string,
        content: entryData?.content as string,
      },
      // TODO: using frontend route props passing
      { sutraId, rollId }
    );
  }

  if (entryData?.intent === Intent.CREATE_GLOSSARY) {
    return await handleCreateNewGlossary({ newGlossary: entryData, user });
  }
  if (entryData?.intent === Intent.READ_OPENSEARCH) {
    logger.log('action', 'value', entryData);
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
  const { references } = loaderData;
  const actionData = useActionData<{
    payload: { paragraphIndex: number; sentenceIndex: number } | Record<string, string>;
    intent: Intent;
    type: 'paragraph' | 'sentence';
  }>();
  const [translation, setTranslation] = useState<Record<string, string>>({});
  const [sentenceFinish, setSentenceFinish] = useState<Record<string, boolean>>({});
  const [paragraphFinish, setParagraphFinish] = useState<Record<string, boolean>>({});

  const paragraphs = loaderData.paragraphs;
  const ref = useRef(paragraphs);
  useEffect(() => {
    paragraphs?.reduce(
      (acc, cur, i) => {
        const sentences = splitParagraph(cur);
        if (sentences.length > 1) {
          sentences.reduce(
            (accu, curr, j) => {
              acc[`${i}.${j}`] = curr;
              return accu;
            },
            { acc }
          );
        } else {
          acc[`${i}`] = cur?.content || '';
        }
        acc['category'] = cur?.category ?? 'PARAGRAPH';
        return acc;
      },
      { intent: Intent.READ_OPENAI } as Record<string, string>
    );
    const paragraphFinish = paragraphs?.reduce((acc, _, index) => {
      acc[index] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setParagraphFinish(paragraphFinish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaderData) {
      const { sentenceIndex, paragraphIndex } = loaderData;
      const sentenceFinish: Record<string, boolean> = {};
      for (let i = 0; i <= paragraphIndex; i++) {
        for (let j = 0; j <= sentenceIndex; j++) {
          sentenceFinish[`${i}.${j}`] = true;
        }
      }
      setSentenceFinish((prev) => ({ ...prev, ...sentenceFinish }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  useEffect(() => {
    if (actionData?.intent === Intent.READ_OPENAI) {
      setTranslation(actionData.payload as Record<string, string>);
    }
    if (actionData?.intent === Intent.CREATE_TRANSLATION) {
      const { paragraphIndex = 0, finish } = actionData.payload as {
        paragraphIndex: number;
        sentenceIndex: number;
        finish: boolean;
      };
      if (actionData) {
        setParagraphFinish((prev) => ({ ...prev, [paragraphIndex]: finish }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const { fontFamilyOrigin, fontFamilyTarget, fontSize } = useSetTheme();

  const paragraphsComp = ref.current?.map((paragraph, i, arr) => {
    const sentences = splitParagraph(paragraph);
    // const paragraphIndex = actionData?.data?.paragraphIndex ?? 0;
    if (sentences.length >= 2) {
      return (
        // collapse only when paragraph finish and all sentences finish
        <Box key={i}>
          <Collapse in={!paragraphFinish[i]} unmountOnExit={true}>
            <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
              <Text fontSize={fontSize} fontFamily={fontFamilyOrigin}>
                <Highlight
                  query={
                    sentences[loaderData.paragraphIndex >= i ? loaderData.sentenceIndex + 1 : 0]
                  }
                  styles={{ px: '1', py: '1', bg: 'orange.100', whiteSpace: 'wrap' }}
                >
                  {paragraph?.content || ''}
                </Highlight>
              </Text>
            </Box>
            {loaderData?.paragraph?.content ? (
              <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
                <Text fontSize={fontSize} fontFamily={fontFamilyTarget}>
                  {loaderData?.paragraph?.content}
                </Text>
              </Box>
            ) : null}
          </Collapse>
          {sentences.map((sentence, j, arr) => {
            if (j >= loaderData.sentenceIndex && paragraph) {
              const newParagraph = { ...paragraph, content: sentence };
              return (
                <Collapse
                  key={j}
                  in={paragraphFinish[i] === true ? false : !sentenceFinish[`${i}.${j}`]}
                  animateOpacity={true}
                  unmountOnExit={true}
                  style={{ overflow: 'visible' }}
                >
                  <TranlationWorkspace
                    isFirst={j === loaderData.sentenceIndex + 1}
                    origin={newParagraph}
                    paragraphIndex={i}
                    sentenceIndex={j}
                    totalSentences={sentences.length - 1}
                    translation={Object.keys(translation).length ? translation[`${i}.${j}`] : ''}
                    reference={references?.[i]?.[j] ?? ''}
                    totalParagraphs={ref?.current.length - 1}
                  />
                  {j !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
                </Collapse>
              );
            }
            return null;
          })}
        </Box>
      );
    }
    return (
      <Collapse
        key={i}
        in={!paragraphFinish[i]}
        unmountOnExit={i !== arr.length - 1}
        animateOpacity={true}
      >
        <TranlationWorkspace
          isFirst={paragraphFinish[i - 1] || i === 0}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          origin={paragraph!}
          paragraphIndex={i}
          translation={Object.keys(translation).length ? translation[`${i}`] : ''}
          reference={references?.[i]?.[0] ?? ''}
          totalParagraphs={ref?.current.length - 1}
        />
        {i !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
      </Collapse>
    );
  });
  if (ref.current?.length) {
    return <Box px={16}>{paragraphsComp}</Box>;
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}

type FN = {
  paragraphId: string;
  offset: number;
  content: string;
  sentence: string;
};
interface WorkSpaceProps {
  origin: CreatedType<Paragraph>;
  paragraphIndex: number;
  translation: string;
  reference: CreatedType<Reference>;
  totalParagraphs: number;
  sentenceIndex?: number;
  totalSentences?: number;
  isFirst: boolean;
}
function TranlationWorkspace({
  origin,
  translation,
  paragraphIndex,
  reference,
  totalParagraphs,
  sentenceIndex,
  totalSentences,
  isFirst,
}: WorkSpaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [content, setContent] = useState('');
  const submit = useSubmit();
  const [glossary, setGlossary] = useBoolean(false);
  const [cursorPos, setCursorPos] = useState(-1);
  const [footnotes, setFootnotes] = useState<FN[]>([]);
  const { isSubmitting } = useTransitionState();
  const [refresh, setRefresh] = useState<number>(0);
  const [latestTranslation, setLatestTranslation] = useState<string>('');
  const [prevTranslation, setPrevTranslation] = useState<string>('');

  const [text, setText] = useState('');

  useEffect(() => {
    if (translation) {
      setPrevTranslation(translation);
    }
  }, [translation]);

  const refce = useRef();
  const handleSubmitTranslation = () => {
    setContent('');
    submit(
      {
        PK: origin.PK,
        SK: origin.SK,
        paragraphIndex: paragraphIndex.toString(),
        sentenceIndex: sentenceIndex?.toString() ?? '',
        totalSentences: totalSentences?.toString() ?? '',
        content: text || content,
        prevParagraph: loaderData?.paragraph?.content || '',
        intent: Intent.CREATE_TRANSLATION,
      },
      { replace: false, method: 'post' }
    );
  };

  useEffect(() => {
    if (actionData?.intent === Intent.UPDATE_OPENAI && actionData?.origin === origin.content) {
      setContent(prevTranslation);
      setLatestTranslation(actionData.translation);
      setPrevTranslation(actionData.translation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    if (refresh || isFirst) {
      submit(
        { intent: Intent.UPDATE_OPENAI, origin: origin.content, category: origin.category },
        { method: 'post', replace: false }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, isFirst]);

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_TRANSLATION) {
      const { finish, paragraphIndex } = actionData.payload as {
        finish: boolean;
        paragraphIndex: number;
      };
      if (finish && totalParagraphs == paragraphIndex) {
        const newLocation = location.pathname.replace('/staging', '');
        navigate(newLocation);
      }
    }
  }, [actionData, location.pathname, navigate, totalParagraphs]);

  useEffect(() => {
    const footnotesAfterCursor = footnotes.filter((footnote) => footnote.offset > cursorPos);
    const footnotesBeforeCursor = footnotes.filter((footnote) => footnote.offset < cursorPos);

    const newFootnotesAfterCursor = footnotesAfterCursor?.map((footnote) => {
      const length = content?.length - footnote.sentence.length;
      return {
        ...footnote,
        sentence: content,
        offset: length + footnote.offset,
      };
    });
    setFootnotes([...footnotesBeforeCursor, ...newFootnotesAfterCursor]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorPos, content]);

  const handleCursorChange = (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    setCursorPos((e.target as HTMLTextAreaElement)?.selectionStart);
  };

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
              isLoading={isSubmitting && isFirst}
              icon={<RepeatIcon />}
              onClick={() => {
                setRefresh((pre) => pre + 1);
              }}
              aria-label='refresh'
            />
            <OpenAIModal />
            <IconButton
              icon={<CopyIcon />}
              aria-label='copy'
              onClick={() => {
                setContent(latestTranslation || translation);
              }}
            />
          </ButtonGroup>
        </CardHeader>
        <CardBody>
          <Text fontFamily={fontFamilyTarget} fontSize={fontSize}>
            {latestTranslation || translation}
          </Text>
        </CardBody>
      </Card>
      {reference?.content
        ? JSON.parse(reference.content)?.map((reference: { name: string; content: string }) => (
            <Card key={reference.content} w='100%' background={'secondary.400'} borderRadius={12}>
              <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
                <Heading size='sm'>{reference.name}</Heading>
                <ButtonGroup variant='outline' spacing='6'>
                  <IconButton
                    icon={<CopyIcon />}
                    aria-label='copy'
                    onClick={() => {
                      setContent(reference.content);
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
                value={text || content}
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

type FootnoteModalProps = {
  cursorPos?: number;
  content: string;
  paragraphId: string;
  setFootnotes: React.Dispatch<React.SetStateAction<FN[]>>;
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
  const [searchResults, setSearchResults] = useState<(Paragraph | TGlossary)[]>([]);
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
      if (focusIndex < searchResults.length - 1) {
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
      setSearchResults([]);
    }
  }, [actionData, isOpenSearch]);

  const getContent = (index: number) => {
    const result = searchResults[index];
    if (result?.kind === 'PARAGRAPH') {
      return (result.content as unknown as string[])?.map((text) => (
        <Text mb={2} key={text} dangerouslySetInnerHTML={{ __html: text }} />
      ));
    }
    if (result?.kind === 'GLOSSARY') {
      return <GlossaryDetails glossary={result} />;
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
            {searchResults.length ? (
              <HStack w='100%' alignItems={'flex-start'}>
                <List flex='1' borderRight={'1px solid lightgray'}>
                  {searchResults.map((result, index) => {
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
