import {
  Text,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Button,
  useBoolean,
  VStack,
  Box,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Divider,
  ButtonGroup,
  Flex,
} from '@chakra-ui/react';
import { useActionData, useSubmit } from '@remix-run/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Comment } from '~/types';
import { Intent } from '~/types/common';
import { AppContext } from '~/routes/__app';
import { useMessage } from '~/hooks/useMessage';
import { Can } from '~/authorisation';
import { HighlightWithinTextareaCC } from 'react-highlight-within-textarea';
import { useTransitionState } from '../hooks';

type CommentDialogPayload = {
  onClose: () => void;
  isOpen: boolean;
  fullText: string;
  messages: Comment[];
  paragraphId: string;
  content: string;
};

export const MessageDialog = (props: CommentDialogPayload) => {
  const { messages, fullText, isOpen, onClose, paragraphId, content } = props;
  const actionData = useActionData<{ paragraph: string; resolved: boolean }>();
  const submit = useSubmit();
  const { isLoading } = useTransitionState();
  const [toggle, setToggle] = useBoolean(false);
  const { currentUser } = useContext(AppContext);
  useMessage(currentUser);
  const toast = useToast();

  const rootComment = useMemo(() => {
    return messages.find((message) => message.id === message.parentId) || { id: '', SK: '' };
  }, [messages]);

  const highlightedText = useMemo(() => {
    console.log({ content, messages });
    return messages
      .filter((message) => Boolean(message.content))
      .filter((message) => message.content === content)
      .map((comment) => comment.content);
  }, [messages, content]);

  useEffect(() => {
    if (actionData?.resolved) {
      toast({
        title: 'Comment has been resolved',
        description: 'Please close current modal',
        status: 'warning',
        duration: 3000,
        position: 'top',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const conversationRef = useCallback(
    (node: HTMLDivElement) => {
      if (node || messages.length) {
        node?.scrollIntoView();
      }
    },
    [messages]
  );

  const [message, setMessage] = useState('');
  const handleCreateNewMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      submit(
        {
          intent: Intent.CREATE_MESSAGE,
          paragraphId: paragraphId,
          parentId: rootComment.id,
          creatorAlias: currentUser?.username || '',
          comment: message?.trim(),
          content: content,
        },
        { method: 'post', replace: true }
      );
      setMessage('');
    }
  };

  const [text, setText] = useState(fullText);
  const handleUpdateParagraph = () => {
    if (!text) {
      toast({
        title: 'Update paragraph',
        description: 'You have to modify at least one place in order to update paragraph',
        status: 'warning',
        duration: 3000,
        position: 'top',
      });
      return;
    }
    submit(
      {
        intent: Intent.UPDATE_COMMENT_AND_PARAGRAPH,
        after: text || fullText,
        paragraphId,
        commentId: rootComment.SK || '',
        before: fullText,
      },
      { method: 'post', replace: true }
    );
    onClose();
  };

  return (
    <Drawer
      onClose={onClose}
      placement='bottom'
      isOpen={isOpen}
      size={'md'}
      blockScrollOnMount={false}
      colorScheme='whiteAlpha'
    >
      <DrawerOverlay />
      <DrawerContent overflow={'scroll'}>
        <DrawerCloseButton />
        <DrawerHeader>Comment Workspace</DrawerHeader>
        <DrawerBody>
          <Flex direction={'row'} gap={4} alignItems={'stretch'}>
            <Flex flex={2} direction={'column'}>
              <Box flexGrow={1} w='100%' onMouseUp={(e) => e.stopPropagation()}>
                <HighlightWithinTextareaCC
                  value={text}
                  highlight={highlightedText}
                  onChange={setText}
                  readOnly={!toggle}
                />
              </Box>
              {toggle ? (
                <ButtonGroup justifyContent='left' size='sm'>
                  <Button
                    colorScheme='iconButton'
                    onClick={handleUpdateParagraph}
                    aria-label='submit'
                  >
                    Resolve
                  </Button>
                  <Button aria-label='cancel' onClick={() => setToggle.off()}>
                    Cancel
                  </Button>
                </ButtonGroup>
              ) : null}
              {!toggle ? (
                <Can I='Update' this='Paragraph'>
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel htmlFor='edit-paragraph'>Edit paragraph</FormLabel>
                    <Switch id='edit-paragraph' onChange={setToggle.toggle} disabled={isLoading} />
                  </FormControl>
                </Can>
              ) : null}
            </Flex>
            <Box border='1px' borderColor='gray.200' />
            <Flex flex={1} direction={'column'}>
              <Box flexGrow={1} overflowY={'scroll'} minH={'30vh'}>
                {messages.map((comment, index) => (
                  <Conversation key={index} comment={comment} />
                ))}
                <Box ref={conversationRef} />
              </Box>
              <Can I='Update' this='Comment'>
                <Box>
                  <Divider my={4} />
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleCreateNewMessage}
                    placeholder='you can press Enter to send your comment'
                  />
                </Box>
              </Can>
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

const Conversation = (props: { comment: Comment }) => {
  const { comment } = props;
  const { currentUser } = useContext(AppContext);
  return (
    <VStack
      w='100%'
      align={currentUser?.username === comment?.creatorAlias ? 'flex-start' : 'flex-end'}
      pr={4}
    >
      <Text fontWeight={'bold'}>{comment?.creatorAlias ?? comment?.createdBy}:</Text>
      <Text
        as={'span'}
        background={currentUser?.username === comment?.creatorAlias ? 'green.100' : 'blue.100'}
        borderRadius={8}
        px={2}
        py={1}
      >
        {comment?.comment}
      </Text>
    </VStack>
  );
};
