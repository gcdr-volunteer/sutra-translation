/* eslint-disable @typescript-eslint/no-unused-vars */
import { Can } from '~/authorisation';
import type { ChangeEvent } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { Paragraph, CreatedType, Reference } from '~/types';
import {
  useActionData,
  useSubmit,
  Form,
  useNavigate,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import {
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
  useToast,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
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
import { BiTable, BiNote, BiCheck, BiGlasses } from 'react-icons/bi';
import { Warning } from '~/components/common/errors';
import { FormModal } from '~/components/common';
import {
  handleChatGPT,
  handleCreateNewGlossary,
  handleNewTranslationParagraph,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { Intent } from '~/types/common';
import { assertAuthUser } from '~/auth.server';
import { useGPTTranslation, useSetTheme, useTransitionState } from '~/hooks';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import { handleGetReferencesByPK } from '~/models/reference';
import { GlossaryForm } from '~/components/common/glossary_form';
import { useModalErrors } from '~/hooks/useError';
import { badRequest, created } from 'remix-utils';
import { handleGetAllRefBooks } from '~/services/__app/reference/$sutraId/$rollId.staging';
import { EVENTS, emitter } from '~/utils/event_emitter';

export const loader = async ({ params }: LoaderFunctionArgs) => {
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
    env: {
      WEBSOCKET_URL: process.env.WEBSOCKET_URL || '',
    },
    references: references.sort((a, b) => {
      const indexA = sortedBooks.indexOf(a.name);
      const indexB = sortedBooks.indexOf(b.name);
      return indexA - indexB;
    }),
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
      await emitter.emit(EVENTS.TRANSLATION, content);
      return json({ payload: {}, intent: Intent.READ_OPENAI });
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
  return json({});
};

export default function ParagraphStagingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState(true);
  const { references, paragraph } = loaderData;
  const actionData = useActionData<{ intent: Intent; payload: { finish: boolean } }>();

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
        <TranlationWorkspace
          origin={paragraph}
          references={references}
          socketio={loaderData.env.WEBSOCKET_URL}
        />
      </Collapse>
    );
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}

interface WorkSpaceProps {
  origin: CreatedType<Paragraph>;
  references: CreatedType<Reference>[];
  socketio: string;
}
function TranlationWorkspace({ origin, references, socketio }: WorkSpaceProps) {
  const { content, category } = origin;
  const actionData = useActionData<{
    intent: Intent;
    payload: { translation: string };
    errors: { finish: boolean };
  }>();
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

  const { translation, sendMessage, isReady } = useGPTTranslation({ socketio: socketio });

  useEffect(() => {
    if (refresh && isReady) {
      setOpenaiTranslation('');
      sendMessage({ action: 'sendmessage', data: content });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, isReady]);

  useEffect(() => {
    setOpenaiTranslation(translation);
  }, [translation]);

  useEffect(() => {
    if (isReady) {
      sendMessage({ action: 'sendmessage', data: content });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

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

  const actionData = useActionData<{ intent: Intent; payload: string }>();

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
