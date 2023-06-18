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
  Highlight,
  Divider,
  ButtonGroup,
  HStack,
} from '@chakra-ui/react';
import { useActionData, useSubmit, useTransition } from '@remix-run/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { Comment } from '~/types';
import { Intent } from '~/types/common';
import { AppContext } from '~/routes/__app';
import { useMessage } from '~/hooks/useMessage';
import { Can } from '~/authorisation';
import { useSetTheme } from '~/hooks';
import { HighlightWithinTextareaCC } from 'react-highlight-within-textarea';

type CommentDialogPayload = {
  onClose: () => void;
  isOpen: boolean;
  fullText: string;
  highlightedText: string;
  comments: Comment[];
  paragraphId: string;
};

export const CommentDialog = (props: CommentDialogPayload) => {
  const { comments, fullText, highlightedText, isOpen, onClose, paragraphId } = props;
  const actionData = useActionData<{ paragraph: string; resolved: boolean }>();
  const submit = useSubmit();
  const transaction = useTransition();
  const isSubmitting = Boolean(transaction.submission);
  const [toggle, setToggle] = useBoolean();
  const { currentUser } = useContext(AppContext);
  useMessage(currentUser);
  const toast = useToast();

  const getRootMessage = () => {
    return comments.find((comment) => comment.id === comment.parentId) || { id: '' };
  };

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
      if (node || comments.length) {
        node?.scrollIntoView();
      }
    },
    [comments]
  );

  const [message, setMessage] = useState('');
  const handleCreateNewMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      submit(
        {
          intent: Intent.CREATE_MESSAGE,
          paragraphId: paragraphId,
          parentId: getRootMessage().id,
          creatorAlias: currentUser?.username || '',
          comment: message?.trim(),
        },
        { method: 'post', replace: true }
      );
      setMessage('');
    }
  };

  const [text, setText] = useState('');
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
        intent: Intent.UPDATE_COMMENT,
        after: text || fullText,
        paragraphId,
        commentId: getRootMessage().id,
        before: fullText,
      },
      { method: 'post', replace: true }
    );
    onClose();
  };

  const { fontSize, fontFamilyTarget } = useSetTheme();

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
          <HStack>
            <VStack flex={2} alignItems={'start'}>
              {toggle ? (
                <VStack>
                  <Box onMouseUp={(e) => e.stopPropagation()}>
                    <HighlightWithinTextareaCC
                      value={text || fullText}
                      highlight={[
                        {
                          highlight: highlightedText,
                        },
                      ]}
                      onChange={setText}
                    />
                  </Box>
                  <ButtonGroup justifyContent='center' size='sm'>
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
                </VStack>
              ) : (
                <Box
                  bg={'secondary.200'}
                  p={4}
                  borderRadius={12}
                  fontFamily={fontFamilyTarget}
                  fontSize={fontSize}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <Highlight
                    query={highlightedText}
                    styles={{ p: '1', rounded: 'md', bg: 'yellow.200' }}
                  >
                    {fullText}
                  </Highlight>
                </Box>
              )}
              {!toggle ? (
                <Can I='Update' this='Paragraph'>
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel htmlFor='edit-paragraph' mb='0' p={4}>
                      Edit paragraph
                    </FormLabel>
                    <Switch
                      id='edit-paragraph'
                      onChange={setToggle.toggle}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </Can>
              ) : null}
            </VStack>
            <Divider orientation='vertical' maxH={'40vh'} minH={'20vh'} />
            <VStack flex={1} flexDir={'column'} maxH={'40vh'}>
              <Box flex={1} overflowY={'scroll'} w={'100%'}>
                {comments?.map((comment, index) => (
                  <Conversation key={index} comment={comment} />
                ))}
                <Box ref={conversationRef} />
              </Box>
              <Can I='Update' this='Comment'>
                <Divider />
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleCreateNewMessage}
                  placeholder='you can press Enter to send your comment'
                />
              </Can>
            </VStack>
          </HStack>
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
