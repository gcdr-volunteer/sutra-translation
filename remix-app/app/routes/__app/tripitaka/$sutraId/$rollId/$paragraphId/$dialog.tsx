import {
  Text,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
  ModalOverlay,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  ModalFooter,
  useBoolean,
  VStack,
  Highlight,
  Box,
} from '@chakra-ui/react';
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { useCallback, useContext, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import type { Comment } from '~/types';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { createNewComment, getAllCommentsByParentId, getCommentByKey } from '~/models/comment';
import { nanoid } from 'nanoid';
import { AppContext } from '~/routes/__app';
import { emitter, EVENTS } from '~/utils';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import { useMessage } from '~/hooks/useMessage';

type CommentPayload = {
  PK: string;
  SK: string;
  paragraph: string;
  dialog: string;
  intent: Intent;
};
export const loader = async ({ params }: LoaderArgs) => {
  const { rollId, paragraphId, dialog } = params;
  const comments = (await getAllCommentsByParentId(dialog)) ?? [];
  const paragraph = await getParagraphByPrimaryKey({
    PK: rollId?.replace('ZH', 'EN'),
    SK: paragraphId?.replace('ZH', 'EN'),
  });
  return json({ comments, paragraph });
};

export const action = async ({ request }: ActionArgs) => {
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
      await createNewComment(comment);
      await emitter.emit(EVENTS.MESSAGE, { id: rootComment.id, creatorAlias: user?.username });
    }
    return json({ paragraph: entryData.paragraph });
  }
  return json({});
};

export default function DialogRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { comments } = loaderData;
  const actionData = useActionData<{ paragraph: string }>();
  const ref = useRef<HTMLButtonElement>(null);
  const submit = useSubmit();
  const transaction = useTransition();
  const navigate = useNavigate();
  const isSubmitting = Boolean(transaction.submission);
  const { onClose } = useDisclosure();
  const { state } = useLocation();
  const { paragraph } = (state as { comment: Comment; paragraph: string }) || {
    paragraph: actionData?.paragraph ?? loaderData.paragraph?.content,
  };
  const { modal } = useOutletContext<{ modal: boolean }>();
  const [toggle, setToggle] = useBoolean();
  const [textareaHeight, setTextareaHeight] = useState(0);
  const dialogInputRef = useRef<HTMLTextAreaElement>(null);
  const { currentUser } = useContext(AppContext);
  useMessage(currentUser);

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

  const paragraphRef = useCallback((node: HTMLParagraphElement) => {
    if (node?.clientHeight) {
      setTextareaHeight(node.clientHeight);
    }
  }, []);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };

  return (
    <Modal size={'3xl'} isOpen={modal} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Comment</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
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
              placeholder='your message'
            />
            <Input readOnly hidden name='PK' value={comments?.[0].PK} />
            <Input readOnly hidden name='SK' value={comments?.[0].SK} />
            <Input readOnly hidden name='paragraph' value={paragraph} />
            <Button hidden type='submit' name='intent' value={Intent.CREATE_MESSAGE} ref={ref} />
            {/* <Input type='submit' readOnly hidden name="intent" value={'new_message'} /> */}
            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='edit-paragraph' mb='0'>
                Edit paragraph
              </FormLabel>
              <Switch id='edit-paragraph' onChange={setToggle.toggle} disabled={isSubmitting} />
            </FormControl>
          </Form>
          {!toggle ? (
            <Text ref={paragraphRef}>
              <Highlight
                query={comments?.[0]?.content}
                styles={{ px: '1', py: '1', bg: 'orange.100' }}
              >
                {paragraph}
              </Highlight>
            </Text>
          ) : (
            // <Text ref={paragraphRef}>{paragraph}</Text>
            <Textarea
              value={paragraph}
              onChange={() => {
                console.log();
              }}
              height={textareaHeight}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button disabled={!toggle} colorScheme='blue' mr={3}>
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
