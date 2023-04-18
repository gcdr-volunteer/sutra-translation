import {
  Text,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
  useDisclosure,
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
  DrawerFooter,
} from '@chakra-ui/react';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import type { Comment } from '~/types';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import {
  createNewComment,
  getAllCommentsByParentId,
  getCommentByKey,
  updateComment,
} from '~/models/comment';
import { nanoid } from 'nanoid';
import { AppContext } from '~/routes/__app';
import { emitter, EVENTS, utcNow } from '~/utils';
import { getParagraphByPrimaryKey, updateParagraph } from '~/models/paragraph';
import { useMessage } from '~/hooks/useMessage';
import { Can } from '~/authorisation';
import { RTEditor } from '~/components/common/editor';

type CommentPayload = {
  PK: string;
  SK: string;
  paragraph: string;
  dialog: string;
  intent: Intent;
  json: string;
};
export const loader = async ({ params }: LoaderArgs) => {
  const { rollId, paragraphId, dialog } = params;
  const comments = (await getAllCommentsByParentId(dialog)) ?? [];
  const paragraph = await getParagraphByPrimaryKey({
    PK: rollId?.replace('ZH', 'EN') ?? '',
    SK: paragraphId?.replace('ZH', 'EN') ?? '',
  });
  return json({ comments, paragraph });
};

export const action = async ({ request, params }: ActionArgs) => {
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries()) as CommentPayload;
  if (entryData?.intent === Intent.CREATE_MESSAGE) {
    const rootComment = await getCommentByKey({ PK: entryData.PK, SK: entryData.SK });
    if (rootComment) {
      const comment: Comment = {
        ...rootComment,
        createdBy: user?.email,
        updatedBy: user?.email,
        creatorAlias: user?.username ?? '',
        comment: entryData.dialog.trim(),
        id: nanoid(),
        resolved: undefined, // there is no need to add resolved for sub-comments
      };
      if (!rootComment.resolved) {
        await createNewComment(comment);
        // Update root comment lastMessageTimeStamp
        await updateComment({
          PK: rootComment.PK ?? '',
          SK: rootComment.SK ?? '',
          latestMessage: utcNow(),
        });
        emitter.emit(EVENTS.MESSAGE, { id: rootComment.id, creatorAlias: user?.username });
      } else {
        return json({ paragraph: entryData.paragraph, resolved: true });
      }
    }
    return json({ paragraph: entryData.paragraph });
  }
  if (entryData?.intent === Intent.UPDATE_PARAGRAPH) {
    const { rollId = '', paragraphId = '' } = params;
    await updateParagraph({
      // TODO: user profile
      PK: rollId.replace('ZH', 'EN'),
      SK: paragraphId.replace('ZH', 'EN'),
      content: entryData.paragraph || '',
      json: entryData.json,
    });
    await updateComment({ SK: entryData.SK ?? '', PK: 'COMMENT', resolved: 1 });
  }
  return json({});
};

export default function DialogRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { comments } = loaderData;
  const actionData = useActionData<{ paragraph: string; resolved: boolean }>();
  const ref = useRef<HTMLButtonElement>(null);
  const submit = useSubmit();
  const transaction = useTransition();
  const navigate = useNavigate();
  const isSubmitting = Boolean(transaction.submission);
  const { onClose } = useDisclosure();
  const { paragraph } = {
    paragraph: actionData?.paragraph ?? loaderData.paragraph?.content,
  };
  const { modal } = useOutletContext<{ modal: boolean }>();
  const [toggle, setToggle] = useBoolean();
  const dialogInputRef = useRef<HTMLTextAreaElement>(null);
  const paragraphEditFormRef = useRef<HTMLFormElement>(null);
  const { currentUser } = useContext(AppContext);
  useMessage(currentUser);
  const toast = useToast();

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

  const dialogRef = useCallback(
    (node: HTMLDivElement) => {
      if (node || comments.length) {
        node?.scrollIntoView();
      }
    },
    [comments]
  );

  const handleDialog = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (dialogInputRef.current) {
      dialogInputRef.current.value = event.target.value;
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      dialogInputRef.current?.value.trim() && ref.current?.click();
      if (dialogInputRef.current) {
        dialogInputRef.current.value = '';
      }
    }
  };

  const handleClose = () => {
    onClose();
    navigate(-1);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };

  const handleUpdateParagraph = () => {
    submit(paragraphEditFormRef.current, { replace: true });
    navigate(-1);
  };

  return (
    <Drawer onClose={handleClose} isOpen={modal} size={'lg'}>
      <DrawerOverlay />
      <DrawerContent overflow={'scroll'}>
        <DrawerCloseButton />
        <DrawerHeader>Comment Workspace</DrawerHeader>
        <DrawerBody>
          <Box overflowY={'auto'} maxH={'30vh'}>
            {comments?.length
              ? comments.map((comment, index) => {
                  return (
                    <VStack
                      key={index}
                      align={
                        currentUser?.username === comment.creatorAlias ? 'flex-start' : 'flex-end'
                      }
                    >
                      <Text fontWeight={'bold'}>
                        {comment?.creatorAlias ?? comment?.createdBy}:
                      </Text>
                      <Text
                        as={'span'}
                        background={
                          currentUser?.username === comment.creatorAlias ? 'green.100' : 'blue.100'
                        }
                        borderRadius={8}
                        px={2}
                        py={1}
                      >
                        {comment?.comment}
                      </Text>
                    </VStack>
                  );
                })
              : null}
            <Box ref={dialogRef} />
          </Box>
          <Form method='post' onSubmit={handleSubmit}>
            <Textarea
              ref={dialogInputRef}
              // value={dialogInputRef.current?.value}
              onChange={handleDialog}
              onKeyUp={handleKeyUp}
              name='dialog'
              mt={8}
              placeholder='Click Enter to send your comment'
            />
            <Input readOnly hidden name='PK' value={comments?.[0].PK} />
            <Input readOnly hidden name='SK' value={comments?.[0].SK} />
            <Input readOnly hidden name='paragraph' value={paragraph} />
            <Button hidden type='submit' name='intent' value={Intent.CREATE_MESSAGE} ref={ref} />
            <Can I='Update' this='Paragraph'>
              <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='edit-paragraph' mb='0'>
                  Edit paragraph
                </FormLabel>
                <Switch id='edit-paragraph' onChange={setToggle.toggle} disabled={isSubmitting} />
              </FormControl>
            </Can>
          </Form>
          <Form method='post' ref={paragraphEditFormRef}>
            <Box>
              <RTEditor
                key={loaderData.paragraph?.json || '[]'}
                highlights={comments.map((comment) => ({ text: comment.content }))}
                readonly={!toggle}
                json={loaderData.paragraph?.json || '[]'}
              />
              <Input readOnly hidden name='SK' value={comments?.[0].SK} />
              <Input readOnly hidden name='intent' value={Intent.UPDATE_PARAGRAPH} />
            </Box>
          </Form>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleUpdateParagraph}>
            Submit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
