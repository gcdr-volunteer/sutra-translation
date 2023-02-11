import type { ChangeEvent } from 'react';
import type { ParagraphLoadData } from '../$rollId';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Paragraph, Glossary as TGlossary, Footnote, CreateType } from '~/types';
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
  CardFooter,
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
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon } from '@chakra-ui/icons';
import { useState, useRef, useEffect } from 'react';
import { json } from '@remix-run/node';
import { BiTable, BiSearch, BiNote, BiCheck } from 'react-icons/bi';
import { Warning } from '~/components/common/errors';
import { FormModal } from '~/components/common';
import {
  handleNewGlossary,
  handleNewTranslationParagraph,
  hanldeDeepLFetch,
  replaceWithGlossary,
  searchByTerm,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { Intent } from '~/types/common';
import { assertAuthUser } from '~/auth.server';
import { useDebounce, useKeyPress } from '~/hooks';
import { logger } from '~/utils';
import { BiLinkExternal } from 'react-icons/bi';
import { getParagraphsByRollId } from '~/models/paragraph';
import { upsertFootnote } from '~/models/footnote';

export const loader = async ({ params }: LoaderArgs) => {
  const { rollId } = params;
  const paragraphs = await getParagraphsByRollId(rollId?.replace('ZH', 'EN'));
  const paragraph = paragraphs.find((paragraph) => !paragraph.finish);
  return json({
    sentenceIndex: paragraph?.sentenceIndex ?? -1,
    paragraphIndex: paragraph?.paragraphIndex ?? -1,
    paragraph,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId, rollId } = params;
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_DEEPL) {
    const { intent, ...rest } = entryData;
    // Uncomment the following line when doing debug
    // return json({ data: {}, intent: Intent.READ_DEEPL });
    if (Object.keys(rest)?.length) {
      const origins = await replaceWithGlossary(rest as Record<string, string>);
      return await hanldeDeepLFetch({ origins });
    }
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
        translation: entryData?.translation as string,
      },
      // TODO: using frontend route props passing
      { sutraId, rollId }
    );
  }
  if (entryData?.intent === Intent.CREATE_GLOSSARY) {
    return await handleNewGlossary({
      origin: entryData?.origin as string,
      target: entryData?.target as string,
      note: entryData?.note as string,
      createdBy: user?.SK,
      creatorAlias: user?.username,
    });
  }
  if (entryData?.intent === Intent.READ_OPENSEARCH) {
    logger.log('action', 'value', entryData);
    if (entryData?.value) {
      return await searchByTerm(entryData.value as string);
    }
  }
  if (entryData?.intent === Intent.CREATE_FOOTNOTE) {
    // TODO: refactor the code here, this is just a stub
    const doc: CreateType<Footnote> = {
      PK: 'ddd',
      SK: 'xxx',
      paragraphId: 'xxxx',
      offset: 12,
      content: 'abc',
      kind: 'FOOTNOTE',
    };
    await upsertFootnote(doc);
  }
  return json({});
};

interface stateType {
  paragraphs: ParagraphLoadData[];
}
export default function StagingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    payload: { paragraphIndex: number; sentenceIndex: number } | Record<string, string>;
    intent: Intent;
    type: 'paragraph' | 'sentence';
  }>();
  const [translation, setTranslation] = useState<Record<string, string>>({});
  const [sentenceFinish, setSentenceFinish] = useState<Record<string, boolean>>({});
  const [paragraphFinish, setParagraphFinish] = useState<Record<string, boolean>>({});

  const location = useLocation();
  const paragraphs = (location.state as stateType)?.paragraphs;
  const ref = useRef(paragraphs);
  const submit = useSubmit();
  useEffect(() => {
    const origins = paragraphs?.reduce(
      (acc, cur, i) => {
        const sentences = cur.content.split(/(?<=。|！|？)/g);
        if (sentences.length > 1) {
          sentences.reduce(
            (accu, curr, j) => {
              acc[`${i}.${j}`] = curr;
              return accu;
            },
            { acc }
          );
        } else {
          acc[`${i}`] = cur.content;
        }
        return acc;
      },
      { intent: Intent.READ_DEEPL } as Record<string, string>
    );
    const paragraphFinish = paragraphs?.reduce((acc, _, index) => {
      acc[index] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setParagraphFinish(paragraphFinish);
    if (origins && Object.keys(origins).length) {
      submit(origins, { method: 'post', replace: true });
    }
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
    if (actionData?.intent === Intent.READ_DEEPL) {
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

  const paragraphsComp = ref.current?.map((paragraph, i, arr) => {
    const sentences = paragraph.content.split(/(?<=。|！|？)/g);
    // const paragraphIndex = actionData?.data?.paragraphIndex ?? 0;
    if (sentences.length > 2) {
      return (
        // collapse only when paragraph finish and all sentences finish
        <Box key={i}>
          <Collapse in={!paragraphFinish[i]} unmountOnExit={true}>
            <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
              <Text size={'lg'} fontSize='1.5rem' lineHeight={1.5}>
                <Highlight
                  query={
                    sentences[loaderData.paragraphIndex >= i ? loaderData.sentenceIndex + 1 : 0]
                  }
                  styles={{ px: '1', py: '1', bg: 'orange.100', whiteSpace: 'wrap' }}
                >
                  {paragraph.content}
                </Highlight>
              </Text>
            </Box>
            {loaderData?.paragraph?.content ? (
              <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
                <Text size={'lg'} fontSize='1.5rem' lineHeight={1.5}>
                  {loaderData?.paragraph?.content}
                </Text>
              </Box>
            ) : null}
          </Collapse>
          {sentences.map((sentence, j, arr) => {
            if (j >= loaderData.sentenceIndex) {
              const para = { ...paragraph, content: sentence };
              return (
                <Collapse
                  key={j}
                  in={paragraphFinish[i] === true ? false : !sentenceFinish[`${i}.${j}`]}
                  animateOpacity={true}
                  unmountOnExit={true}
                >
                  <TranlationWorkspace
                    origin={para}
                    paragraphIndex={i}
                    sentenceIndex={j}
                    totalSentences={sentences.length - 1}
                    translation={
                      Object.keys(translation).length ? translation[`${i}.${j}`] : 'loading....'
                    }
                    reference='Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur.'
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
          origin={paragraph}
          paragraphIndex={i}
          translation={Object.keys(translation).length ? translation[`${i}`] : 'loading....'}
          reference='Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur.'
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

interface WorkSpaceProps {
  origin: ParagraphLoadData;
  paragraphIndex: number;
  translation: string;
  reference: string;
  totalParagraphs: number;
  sentenceIndex?: number;
  totalSentences?: number;
}
function TranlationWorkspace({
  origin,
  translation,
  paragraphIndex,
  reference,
  totalParagraphs,
  sentenceIndex,
  totalSentences,
}: WorkSpaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [content, setContent] = useState('');
  const submit = useSubmit();
  const textareaFormRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [glossary, setGlossary] = useBoolean(false);

  const handleSubmitTranslation = () => {
    if (textareaRef?.current) {
      textareaRef.current.value = `${loaderData?.paragraph?.content ?? ''} ${content}`;
    }
    submit(textareaFormRef.current, { replace: true });
    setContent('');
  };

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
      if (!finish) {
        window.scrollTo({
          top: 0,
          left: 0,
        });
      }
    }
  }, [actionData, location.pathname, navigate, totalParagraphs]);

  // TODO: refactor this code to sub components
  return (
    <Flex gap={4} flexDir='row' justifyContent='space-between'>
      <VStack flex={1} spacing={4}>
        <Card w='100%' background={'secondary.200'} borderRadius={12}>
          <CardHeader>
            <Heading size='sm'>Origin</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{origin.content}</Text>
          </CardBody>
        </Card>
        <Card w='100%' background={'secondary.300'} borderRadius={12}>
          <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
            <Heading size='sm'>DeepL</Heading>
            <ButtonGroup variant='outline' spacing='6'>
              <IconButton icon={<RepeatIcon />} aria-label='refresh' />
              <IconButton
                icon={<CopyIcon />}
                aria-label='copy'
                onClick={() => setContent(translation)}
              />
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{translation}</Text>
          </CardBody>
        </Card>
        <Card w='100%' background={'secondary.400'} borderRadius={12}>
          <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
            <Heading size='sm'>Reference</Heading>
            <ButtonGroup variant='outline' spacing='6'>
              <IconButton
                icon={<CopyIcon />}
                aria-label='copy'
                onClick={() => setContent(reference)}
              />
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{reference}</Text>
          </CardBody>
        </Card>
      </VStack>
      <Flex flex={1} justifyContent='stretch' alignSelf={'stretch'}>
        <Card background={'secondary.500'} w='100%' borderRadius={12}>
          <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
            <Heading size='sm'>Workspace</Heading>
          </CardHeader>
          <CardBody as={Flex} flexDir={'column'}>
            <ButtonGroup colorScheme={'iconButton'} variant={'outline'} p={4} mb={2}>
              <Tooltip label='open glossary' openDelay={1000}>
                <IconButton
                  onClick={setGlossary.on}
                  icon={<BiTable />}
                  aria-label='glossary button'
                />
              </Tooltip>
              <FootnoteModal content={content} cursorPos={textareaRef.current?.selectionStart} />
              <SearchModal />
            </ButtonGroup>
            {glossary ? <GlossaryModal /> : null}
            <Form method='post' ref={textareaFormRef} style={{ height: '100%' }}>
              <Textarea
                flexGrow={1}
                name='translation'
                ref={textareaRef}
                height='100%'
                placeholder='Edit your paragraph'
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Input name='PK' value={origin.PK} hidden readOnly />
              <Input name='SK' value={origin.SK} hidden readOnly />
              <Input name='paragraphIndex' value={paragraphIndex} hidden readOnly />
              <Input name='sentenceIndex' value={sentenceIndex} hidden readOnly />
              <Input name='totalSentences' value={totalSentences} hidden readOnly />
              <Input name='intent' value={Intent.CREATE_TRANSLATION} hidden readOnly />
            </Form>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              onClick={handleSubmitTranslation}
              colorScheme={'iconButton'}
              disabled={!content}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </Flex>
    </Flex>
  );
}
const GlossaryModal = () => {
  const { isOpen: isOpenNote, onOpen: onOpenNote, onClose: onCloseNote } = useDisclosure();
  const actionData = useActionData<{
    intent: Intent;
    payload: { origin: string; target: string };
    errors: { error: string };
  }>();
  const toast = useToast();
  const [origin, setOrigin] = useState('');
  const [target, setTarget] = useState('');

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
    }
    if (actionData?.intent === Intent.CREATE_GLOSSARY && actionData.errors) {
      const { error } = actionData.errors;
      setOrigin('');
      setTarget('');
      toast({
        title: 'Glossary creation failed',
        description: `${error}, we already have this glossary stored`,
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
        body={
          <Box>
            <Text>
              Source: <Tag>{origin}</Tag>
            </Text>
            <Input name='origin' readOnly hidden value={origin} />
            <Text>
              Target: <Tag>{target}</Tag>
            </Text>
            <Input name='target' readOnly hidden value={target} />
            <Textarea name='note' _focus={{ outline: 'none' }} placeholder='glossary note' />
          </Box>
        }
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
};
const FootnoteModal = (props: FootnoteModalProps) => {
  const {
    isOpen: isOpenFootnote,
    onOpen: onOpenFootnote,
    onClose: onCloseFootnote,
  } = useDisclosure();
  const getCurrentCursorText = (): string | undefined => {
    const { cursorPos = -1, content } = props;
    if (cursorPos >= 0) {
      const textBeforeCursor = content.slice(0, cursorPos - 1);
      const textAfterCursor = content.slice(cursorPos + 1);
      const indexBeforeCursor = textBeforeCursor.lastIndexOf(' ');
      const indexAfterCursor = textAfterCursor.indexOf(' ');
      const wordsCursorSitting = content.slice(
        indexBeforeCursor >= 0 ? indexBeforeCursor : 0,
        indexAfterCursor >= 0 ? indexAfterCursor + cursorPos : -1
      );
      return wordsCursorSitting;
    }
    return 'You forget to put your cursor in text';
  };
  return (
    <>
      <Tooltip label='add footnote' openDelay={1000} closeDelay={1000}>
        <IconButton
          disabled={!props.content}
          onClick={onOpenFootnote}
          icon={<BiNote />}
          aria-label='footnote button'
        />
      </Tooltip>
      <FormModal
        value={Intent.CREATE_FOOTNOTE}
        header='Add footnote'
        body={
          <Box>
            <Text>
              Your cursor is between
              <Tag>{getCurrentCursorText()}</Tag>
            </Text>
            <Text mb={8}>
              Make sure put your cursor at the correct location where you want to put footnote
            </Text>
            <Textarea _focus={{ outline: 'none' }} placeholder='add your footnotes' />
          </Box>
        }
        isOpen={isOpenFootnote}
        onClose={onCloseFootnote}
      />
    </>
  );
};

const SearchModal = () => {
  const { isOpen: isOpenSearch, onOpen: onOpenSearch, onClose: onCloseSearch } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Paragraph | TGlossary)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const submit = useSubmit();
  const actionData = useActionData();

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    if (debouncedSearchTerm.length > 3) {
      submit(
        { intent: Intent.READ_OPENSEARCH, value: debouncedSearchTerm },
        { method: 'post', replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);
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
    if (result.kind === 'PARAGRAPH') {
      return result.content;
    }
    if (result.kind === 'GLOSSARY') {
      return `${result.origin}-${result.target}`;
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
            {searchResults.length ? (
              <HStack w='100%' alignItems={'flex-start'}>
                <List flex='1' borderRight={'1px solid lightgray'}>
                  {searchResults.map((result, index) => {
                    if (result.kind === 'PARAGRAPH') {
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
                                {result.roll}
                              </Text>
                            </Box>
                            <BiLinkExternal />
                          </HStack>
                        </ListItem>
                      );
                    }
                    if (result.kind === 'GLOSSARY') {
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
                <Box flex='1' h='100%'>
                  <Text fontSize={'sm'}>{focusIndex >= 0 ? getContent(focusIndex) : ''}</Text>
                </Box>
              </HStack>
            ) : null}
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};
