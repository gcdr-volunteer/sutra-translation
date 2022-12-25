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
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon, SearchIcon } from '@chakra-ui/icons';
import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { BiTable, BiSearch, BiNote, BiCheck } from 'react-icons/bi';
import { Warning } from '~/components/common/errors';
import { FormModal } from '~/components/common';
import { ParagraphLoadData } from '.';
import {
  handleNewTranslationParagraph,
  hanldeDeepLFetch,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';

export const loader = async ({ params }: LoaderArgs) => {
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === 'deepl') {
    const { intent, ...rest } = entryData;
    // Uncomment the following line when doing debug
    // return json({ data: {}, intent: 'deepl' });
    return await hanldeDeepLFetch(Object.values(rest) as string[]);
  }
  if (entryData?.intent === 'translation') {
    // Uncomment the following line when doing debug
    // return json({ data: { index: entryData?.index }, intent: 'translation' });
    return await handleNewTranslationParagraph({
      index: entryData?.index as string,
      PK: entryData?.PK as string,
      SK: entryData?.SK as string,
      translation: entryData?.translation as string,
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
    intent: 'translation' | 'deepl';
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
      { intent: 'deepl' } as Record<number, string>
    );
    if (Object.keys(origins).length) {
      submit(origins, { method: 'post', replace: true });
    }
  }, []);

  useEffect(() => {
    if (actionData?.intent === 'deepl') {
      setTranslation(actionData.data as string[]);
    }
    if (actionData?.intent === 'translation') {
      const { index } = actionData.data as { index: number };
      const paragraphs = ref.current;
      paragraphs.splice(index, 1);
      translation.splice(index, 1);
      ref.current = paragraphs;
      setTranslation(translation);
    }
  }, [actionData?.intent]);
  const paragraphsComp = ref.current?.map((paragraph, index, arr) => (
    <Box key={index}>
      <TranlationWorkspace
        origin={paragraph}
        index={index}
        translation={translation.length ? translation[index] : 'loading....'}
        reference="Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur."
        isLastParagraph={ref.current?.length === 1}
      />
      {index !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
    </Box>
  ));
  if (ref.current?.length) {
    return <Box p={8}>{paragraphsComp}</Box>;
  } else {
    return <Warning content="Please select at least one paragraph from the roll" />;
  }
}

interface WorkSpaceProps {
  origin: ParagraphLoadData;
  index: number;
  translation: string;
  reference: string;
  isLastParagraph?: boolean;
}
function TranlationWorkspace({
  origin,
  translation,
  index,
  reference,
  isLastParagraph,
}: WorkSpaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const actionData = useActionData();
  const [content, setContent] = useState('');
  const [glossary, setGlossary] = useBoolean(false);
  const submit = useSubmit();
  const textAreaFormRef = useRef(null);
  const [note, setNote] = useState('');
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
    if (isLastParagraph) {
      const newLocation = location.pathname.replace('/staging', '');
      navigate(newLocation);
    }
  }, [actionData?.data]);

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
    <Flex gap={4} flexDir="row" justifyContent="space-between">
      <VStack flex={1} spacing={4}>
        <Card w="100%" background={'secondary.200'} borderRadius={12}>
          <CardHeader>
            <Heading size="sm">Origin</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{origin.content}</Text>
          </CardBody>
        </Card>
        <Card w="100%" background={'secondary.300'} borderRadius={12}>
          <CardHeader as={Flex} justifyContent="space-between" alignItems="center">
            <Heading size="sm">DeepL</Heading>
            <ButtonGroup variant="outline" spacing="6">
              <IconButton icon={<RepeatIcon />} aria-label="refresh" />
              <IconButton
                icon={<CopyIcon />}
                aria-label="copy"
                onClick={() => setContent(translation)}
              />
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{translation}</Text>
          </CardBody>
        </Card>
        <Card w="100%" background={'secondary.400'} borderRadius={12}>
          <CardHeader as={Flex} justifyContent="space-between" alignItems="center">
            <Heading size="sm">Reference</Heading>
            <ButtonGroup variant="outline" spacing="6">
              <IconButton
                icon={<CopyIcon />}
                aria-label="copy"
                onClick={() => setContent(reference)}
              />
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{reference}</Text>
          </CardBody>
        </Card>
      </VStack>
      <Flex flex={1} justifyContent="stretch" alignSelf={'stretch'}>
        <Card background={'secondary.500'} w="100%" borderRadius={12}>
          <CardHeader as={Flex} justifyContent="space-between" alignItems="center">
            <Heading size="sm">Workspace</Heading>
          </CardHeader>
          <CardBody as={Flex} flexDir={'column'}>
            <ButtonGroup colorScheme={'iconButton'} variant={'outline'} p={4} mb={2}>
              <Tooltip label="open glossary" openDelay={1000}>
                <IconButton
                  disabled={!Boolean(content)}
                  onClick={setGlossary.on}
                  icon={<BiTable />}
                  aria-label="glossary button"
                />
              </Tooltip>
              <Tooltip label="add footnote" openDelay={1000} closeDelay={1000}>
                <IconButton
                  disabled={!Boolean(content)}
                  onClick={onOpenFootnote}
                  icon={<BiNote />}
                  aria-label="footnote button"
                />
              </Tooltip>
              <Tooltip label="open searchbar" openDelay={1000}>
                <IconButton onClick={onOpenSearch} icon={<BiSearch />} aria-label="search button" />
              </Tooltip>
            </ButtonGroup>
            <FormModal
              value="save-footnote"
              header="Add footnote"
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
                    placeholder="glossary note"
                    onChange={(e) => {}}
                  />
                </Box>
              }
              isOpen={isOpenFootnote}
              onClose={onCloseFootnote}
            />
            <Modal isOpen={isOpenSearch} onClose={onCloseSearch} size="2xl">
              <ModalOverlay />
              <ModalContent>
                <HStack>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<SearchIcon color="gray.300" />}
                    />
                    <Input
                      _focus={{ outline: 'none' }}
                      variant={'filled'}
                      boxShadow="none"
                      size="lg"
                      type={'text'}
                      placeholder="Search"
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
            <Form method="post" ref={textAreaFormRef} style={{ height: '90%' }}>
              <Textarea
                flexGrow={1}
                name="translation"
                ref={textareaRef}
                height="100%"
                placeholder="Here is a sample placeholder"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Input name="PK" value={origin.PK} hidden readOnly />
              <Input name="SK" value={origin.SK} hidden readOnly />
              <Input name="index" value={index} hidden readOnly />
              <Input name="intent" value={'translation'} hidden readOnly />
            </Form>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              onClick={handleSubmitTranslation}
              colorScheme={'iconButton'}
              disabled={!Boolean(content)}
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
  return (
    <HStack mb={4}>
      <InputGroup _focus={{ outline: 'none' }}>
        <Input type="text" placeholder="origin" mr={4} />
        <Input type="text" placeholder="target" />
      </InputGroup>
      <ButtonGroup colorScheme={'iconButton'} variant={'outline'}>
        <IconButton onClick={onOpenNote} icon={<BiNote />} aria-label="glossary note" />
        <IconButton onClick={discardGlossary} icon={<BiCheck />} aria-label="submit glossary" />
      </ButtonGroup>
      <FormModal
        header="Add note to glossary"
        body={
          <Textarea _focus={{ outline: 'none' }} placeholder="glossary note" onChange={(e) => {}} />
        }
        value="save-glossary"
        isOpen={isOpenNote}
        onClose={onCloseNote}
      />
    </HStack>
  );
};
