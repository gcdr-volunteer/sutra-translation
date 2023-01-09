import type { ChangeEvent } from 'react';
import type { ParagraphLoadData } from '.';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Paragraph, Glossary as TGlossary } from '~/types';
import { useActionData, useLocation, useSubmit, Form, useNavigate } from '@remix-run/react';
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

export const loader = async ({ params }: LoaderArgs) => {
  // await esSearch();
  return json({});
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId, rollId } = params;
  console.log(sutraId, rollId);
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_DEEPL) {
    const { intent, ...rest } = entryData;
    // Uncomment the following line when doing debug
    // return json({ data: {}, intent: Intent.READ_DEEPL });
    if (Object.keys(rest)?.length) {
      const origins = await replaceWithGlossary(Object.values(rest) as string[]);
      return await hanldeDeepLFetch(origins);
    }
  }
  if (entryData?.intent === Intent.CREATE_TRANSLATION) {
    // Uncomment the following line when doing debug
    // return json({ data: { index: entryData?.index }, intent: Intent.CREATE_TRANSLATION });
    return await handleNewTranslationParagraph(
      {
        index: entryData?.index as string,
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
  return json({});
};

interface stateType {
  paragraphs: ParagraphLoadData[];
}
export default function StagingRoute() {
  const actionData = useActionData<{
    data: { index: number } | string[];
    intent: Intent;
  }>();
  const [translation, setTranslation] = useState<string[]>([]);

  const location = useLocation();
  const paragraphs = (location.state as stateType)?.paragraphs;
  const ref = useRef(paragraphs);
  const submit = useSubmit();
  useEffect(() => {
    const origins = paragraphs?.reduce(
      (acc, cur, index) => {
        acc[index] = cur.content;
        return acc;
      },
      { intent: Intent.READ_DEEPL } as Record<number, string>
    );
    if (origins && Object.keys(origins).length) {
      submit(origins, { method: 'post', replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (actionData?.intent === Intent.READ_DEEPL) {
      setTranslation(actionData.data as string[]);
    }
    if (actionData?.intent === Intent.CREATE_TRANSLATION) {
      const { index } = actionData.data as { index: number };
      ref.current[index].finish = true;
    }
  }, [actionData]);
  const paragraphsComp = ref.current?.map((paragraph, index, arr) => (
    <Collapse
      key={index}
      in={!paragraph?.finish}
      unmountOnExit={index !== arr.length - 1}
      animateOpacity={true}
    >
      <TranlationWorkspace
        origin={paragraph}
        index={index}
        translation={translation.length ? translation[index] : 'loading....'}
        reference='Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur.'
        totalParagraphs={ref?.current.length}
      />
      {index !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
    </Collapse>
  ));
  if (ref.current?.length) {
    return <Box p={16}>{paragraphsComp}</Box>;
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}

interface WorkSpaceProps {
  origin: ParagraphLoadData;
  index: number;
  translation: string;
  reference: string;
  totalParagraphs: number;
}
function TranlationWorkspace({
  origin,
  translation,
  index,
  reference,
  totalParagraphs,
}: WorkSpaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const actionData = useActionData();
  const [content, setContent] = useState('');
  const submit = useSubmit();
  const textareaFormRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [glossary, setGlossary] = useBoolean(false);

  const handleSubmitTranslation = () => {
    submit(textareaFormRef.current, { replace: true });
    setContent('');
  };

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_TRANSLATION) {
      const { index } = actionData.data as { index: number };
      if (index == totalParagraphs - 1) {
        const newLocation = location.pathname.replace('/staging', '');
        navigate(newLocation);
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
                placeholder='Here is a sample placeholder'
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Input name='PK' value={origin.PK} hidden readOnly />
              <Input name='SK' value={origin.SK} hidden readOnly />
              <Input name='index' value={index} hidden readOnly />
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
    data: { origin: string; target: string };
    errors: { error: string };
  }>();
  const toast = useToast();
  const [origin, setOrigin] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_GLOSSARY && actionData.data) {
      const { origin, target } = actionData.data;
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
              onChange={(e) => handleChange('origin', e)}
            />
            <Input
              type='text'
              name='target'
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
    if (!isOpenSearch) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpenSearch]);

  useEffect(() => {
    if (actionData?.intent === Intent.READ_OPENSEARCH) {
      setSearchResults(actionData.data);
    }
  }, [actionData]);

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
