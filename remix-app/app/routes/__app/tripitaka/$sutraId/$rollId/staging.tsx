import { useActionData, useLocation, useSubmit, Form } from '@remix-run/react';
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
import { useState, useRef, useEffect } from 'react';
import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { BiTable, BiSearch, BiNote, BiCheck } from 'react-icons/bi';
import { Warning } from '~/components/common/errors';
import { translateZH2EN } from '~/clients/deepl';
import { FormModal } from '~/components/common';
import { ParagraphLoadData } from '.';
import { createNewParagraph, getParagraphByPrimaryKey } from '~/models/paragraph';
import { schemaValidator } from '~/utils/schema_validator';
import { newTranslationSchema } from '~/services/__app/tripitaka/$sutraId/$rollId/staging';

export const loader = async ({ params }: LoaderArgs) => {
  return json({});
};

const hanldeDeepLFetch = async (origins: string[]) => {
  try {
    const results = await translateZH2EN(origins);
    console.log(results);
    return json({ data: results });
  } catch (error) {
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

const handleNewTranslationParagraph = async (newTranslation: {
  PK: string;
  SK: string;
  translation: string;
}) => {
  try {
    const result = await schemaValidator({
      schema: newTranslationSchema(),
      obj: newTranslation,
    });
    const originParagraph = await getParagraphByPrimaryKey({
      PK: result.PK,
      SK: result.SK,
    });
    if (originParagraph) {
      const translatedParagraph = {
        ...originParagraph,
        content: result.translation,
        PK: result.PK?.replace('ZH', 'EN'),
        SK: result.SK?.replace('ZH', 'EN'),
      };
      await createNewParagraph(translatedParagraph);
      return json({});
    }
  } catch (errors) {
    console.log(errors);
    return json({ errors: { errors } });
  }
};
export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === 'deepl') {
    const { intent, ...rest } = entryData;
    return await hanldeDeepLFetch(Object.values(rest) as string[]);
  }
  if (entryData?.translation) {
    return await handleNewTranslationParagraph({
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
  const actionData = useActionData<{ data: string[] }>();
  const [translation, setTranslation] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.data) {
      setTranslation(actionData.data);
    }
  }, [actionData]);
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

  console.log(ref.current);
  const paragraphsComp = ref.current?.map((paragraph, index, arr) => (
    <Box key={index}>
      <TranlationWorkspace
        origin={paragraph}
        translation={translation.length ? translation[index] : 'loading....'}
        reference="Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur."
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
  translation: string;
  reference: string;
}
function TranlationWorkspace({ origin, translation, reference }: WorkSpaceProps) {
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
  const initialRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitTranslation = () => {
    submit(textAreaFormRef.current, { replace: true });
  };

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
            </Form>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button onClick={handleSubmitTranslation} colorScheme={'iconButton'}>
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
