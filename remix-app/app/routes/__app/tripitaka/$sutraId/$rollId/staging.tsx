import { useLocation } from '@remix-run/react';
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
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { RepeatIcon, CopyIcon, SearchIcon } from '@chakra-ui/icons';
import { useState, useRef } from 'react';
import { json } from '@remix-run/node';
import { BiTable, BiSearch, BiNote, BiCheck } from 'react-icons/bi';
import { Warning } from '~/components/common/errors';

export const loader = async () => {
  return json({});
};

interface stateType {
  paragraphs: {
    num: string;
    finish: boolean;
    content: string;
    comments: [];
  }[];
}
export default function StagingRoute() {
  const location = useLocation();
  const paragraphs = (location.state as stateType)?.paragraphs;
  const paragraphsComp = paragraphs?.map((paragraph, index, arr) => (
    <Box key={index}>
      <TranlationWorkspace
        origin={paragraph.content}
        translation="Mauris nisi lectus, bibendum id cursus auctor, aliquet sit amet ante. Pellentesque id libero urna. Cras egestas dolor sed fringilla imperdiet. Donec pellentesque lacus non libero euismod interdum. Sed placerat cursus nisl. Duis nec erat feugiat, accumsan quam et, ullamcorper purus. Integer ac molestie ex, eu egestas sapien. Duis maximus viverra urna a consectetur. Praesent rutrum tortor a euismod venenatis."
        reference="Quisque gravida quis sapien sit amet auctor. In hac habitasse platea dictumst. Pellentesque in viverra risus, et pharetra sapien. Sed facilisis orci rhoncus erat ultricies, nec tempor sapien accumsan. Vivamus vel lectus ut mi ornare consectetur eget non nisl. Mauris rutrum dui augue, a sollicitudin risus elementum facilisis. Sed blandit lectus quam, dictum congue turpis venenatis vel. Integer rhoncus luctus consectetur."
      />
      {index !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
    </Box>
  ));
  if (paragraphs?.length) {
    return <Box p={8}>{paragraphsComp}</Box>;
  } else {
    return <Warning content="Please select at least one paragraph from the roll" />;
  }
}

interface WorkSpaceProps {
  origin: string;
  translation: string;
  reference: string;
}
function TranlationWorkspace({ origin, translation, reference }: WorkSpaceProps) {
  const [content, setContent] = useState('');
  const [glossary, setGlossary] = useBoolean(false);
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
            <Text fontSize={'xl'}>{origin}</Text>
          </CardBody>
        </Card>
        <Card background={'secondary.300'} borderRadius={12}>
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
        <Card background={'secondary.400'} borderRadius={12}>
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
          <CardBody>
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
            <Modal isOpen={isOpenFootnote} onClose={onCloseFootnote} size="2xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Add footnote</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
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
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="iconButton" mr={3}>
                    Save
                  </Button>
                  <Button onClick={onCloseFootnote}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
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
              <HStack mb={4}>
                <InputGroup _focus={{ outline: 'none' }}>
                  <Input type="text" placeholder="origin" mr={4} />
                  <Input type="text" placeholder="target" />
                </InputGroup>
                <ButtonGroup colorScheme={'iconButton'} variant={'outline'}>
                  <IconButton onClick={onOpenNote} icon={<BiNote />} aria-label="glossary note" />
                  <IconButton
                    onClick={setGlossary.off}
                    icon={<BiCheck />}
                    aria-label="submit glossary"
                  />
                </ButtonGroup>
                <Modal initialFocusRef={initialRef} isOpen={isOpenNote} onClose={onCloseNote}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Add note to glossary</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <Textarea
                        _focus={{ outline: 'none' }}
                        placeholder="glossary note"
                        onChange={(e) => {}}
                      />
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme="iconButton" mr={3}>
                        Save
                      </Button>
                      <Button onClick={onCloseNote}>Cancel</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </HStack>
            ) : null}
            <Textarea
              ref={textareaRef}
              height={glossary ? '82%' : '90%'}
              placeholder="Here is a sample placeholder"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </CardBody>
          <Divider />
          <CardFooter>
            <Button colorScheme={'iconButton'}>Submit</Button>
          </CardFooter>
        </Card>
      </Flex>
    </Flex>
  );
}
