import {
  Text,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverFooter,
  PopoverBody,
  IconButton,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
} from '@chakra-ui/react';
import { AiFillMessage } from 'react-icons/ai';
import { Form, useSubmit, useTransition } from '@remix-run/react';
import { useRef, useState } from 'react';
import { Intent } from '~/types/common';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import type { Comment } from '~/types';

type CommentDialogProps = {
  comment: Comment;
};
export const CommentDialog = ({ comment }: CommentDialogProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const submit = useSubmit();
  const [dialog, setDialog] = useState('');
  const transaction = useTransition();
  const isSubmitting = Boolean(transaction.submission);

  const handleDialog = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDialog(event.target?.value);
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      ref.current?.click();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };

  const handleResolve = (e: ChangeEvent<HTMLInputElement>) => {
    submit(
      { resolved: '1', SK: comment?.SK!, intent: Intent.CREATE_MESSAGE },
      { method: 'post', replace: true }
    );
  };

  return (
    <Popover placement='left'>
      <PopoverTrigger>
        <IconButton
          color={'iconButton.500'}
          aria-label='start comments conversation'
          pos={'absolute'}
          right={24}
          icon={<AiFillMessage />}
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverHeader pt={4} fontWeight='bold' border='0'>
            Start Conversation
          </PopoverHeader>
          <PopoverArrow />
          <Form method='post' onSubmit={handleSubmit}>
            <PopoverBody>
              <Text fontWeight={'bold'}>{comment?.creatorAlias ?? comment?.createdBy}:</Text>
              <Text as={'span'} background={'green.100'} borderRadius={8} px={2} py={1}>
                {comment?.comment}
              </Text>
              <Textarea
                value={dialog}
                onChange={handleDialog}
                onKeyUp={handleKeyUp}
                name='dialog'
                mt={8}
                placeholder='your comment'
              />
              <Input readOnly hidden name='parentId' value={comment?.id} />
              <Button hidden type='submit' name='intent' value={Intent.CREATE_MESSAGE} ref={ref} />
              {/* <Input type='submit' readOnly hidden name="intent" value={'new_message'} /> */}
            </PopoverBody>
            <PopoverFooter>
              <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='resolve-comment' mb='0'>
                  Resolve Comment
                </FormLabel>
                <Switch id='resolve-comment' onChange={handleResolve} disabled={isSubmitting} />
              </FormControl>
            </PopoverFooter>
          </Form>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
