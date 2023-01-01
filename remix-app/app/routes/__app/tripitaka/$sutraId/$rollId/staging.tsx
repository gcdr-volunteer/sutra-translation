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
  InputLeftElement,
  Collapse,
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon, SearchIcon } from '@chakra-ui/icons';
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
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { logger } from '~/utils';
import { Intent } from '~/types/common';
import { assertAuthUser } from '~/auth.server';
import type { ChangeEvent } from 'react';
import type { ParagraphLoadData } from '.';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';

export const loader = async ({ params }: LoaderArgs) => {
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  logger.log('staging', 'entryData', entryData);
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
    return await handleNewTranslationParagraph({
      index: entryData?.index as string,
      PK: entryData?.PK as string,
      SK: entryData?.SK as string,
      translation: entryData?.translation as string,
    });
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
  const [glossary, setGlossary] = useBoolean(false);
  const submit = useSubmit();
  const textAreaFormRef = useRef(null);
  // const [note, setNote] = useState('');
  const { isOpen: isOpenNote, onOpen: onOpenNote, onClose: onCloseNote } = useDisclosure();
  const { isOpen: isOpenSearch, onOpen: onOpenSearch, onClose: onCloseSearch } = useDisclosure();
  const {
    isOpen: isOpenFootnote,
    onOpen: onOpenFootnote,
    onClose: onCloseFootnote,
  } = useDisclosure();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitTranslation = () => {
    submit(textAreaFormRef.current, { replace: true });
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

  const getCurrentCursorText = (): string | undefined => {
    const cursorPos = textareaRef.current?.selectionStart;
    if (cursorPos) {
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
                  disabled={!content}
                  onClick={setGlossary.on}
                  icon={<BiTable />}
                  aria-label='glossary button'
                />
              </Tooltip>
              <Tooltip label='add footnote' openDelay={1000} closeDelay={1000}>
                <IconButton
                  disabled={!content}
                  onClick={onOpenFootnote}
                  icon={<BiNote />}
                  aria-label='footnote button'
                />
              </Tooltip>
              <Tooltip label='open searchbar' openDelay={1000}>
                <IconButton onClick={onOpenSearch} icon={<BiSearch />} aria-label='search button' />
              </Tooltip>
            </ButtonGroup>
            <FormModal
              value='save-footnote'
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
                  <Textarea
                    _focus={{ outline: 'none' }}
                    placeholder='add your footnotes'
                    onChange={(e) => {}}
                  />
                </Box>
              }
              isOpen={isOpenFootnote}
              onClose={onCloseFootnote}
            />
            <Modal isOpen={isOpenSearch} onClose={onCloseSearch} size='2xl'>
              <ModalOverlay />
              <ModalContent>
                <HStack>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                      children={<SearchIcon color='gray.300' />}
                    />
                    <Input
                      _focus={{ outline: 'none' }}
                      variant={'filled'}
                      boxShadow='none'
                      size='lg'
                      type={'text'}
                      placeholder='Search'
                    />
                  </InputGroup>
                </HStack>
              </ModalContent>
            </Modal>
            {glossary ? (
              <Glossary
                discardGlossary={setGlossary.off}
                isOpenNote={isOpenNote}
                onCloseNote={onCloseNote}
                onOpenNote={onOpenNote}
              />
            ) : null}
            <Form method='post' ref={textAreaFormRef} style={{ height: '100%' }}>
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
type GlossaryProps = {
  discardGlossary: () => void;
  isOpenNote: boolean;
  onCloseNote: () => void;
  onOpenNote: () => void;
};
const Glossary = ({ onOpenNote, discardGlossary, isOpenNote, onCloseNote }: GlossaryProps) => {
  // const submit = useSubmit();
  const [origin, setOrigin] = useState('');
  const [target, setTarget] = useState('');

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
            <Textarea
              name='note'
              _focus={{ outline: 'none' }}
              placeholder='glossary note'
              onChange={(e) => {}}
            />
          </Box>
        }
        value='glossary'
        isOpen={isOpenNote}
        onClose={onCloseNote}
      />
    </HStack>
  );
};
