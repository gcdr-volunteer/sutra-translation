import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Text,
  Flex,
  Checkbox,
  useBoolean,
  useDisclosure,
  Heading,
  useHighlight,
  Box,
  Avatar,
  AvatarBadge,
} from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
import type { MutableRefObject } from 'react';
import type { Comment as TComment, CreatedType, Footnote } from '~/types';
import { Intent } from '~/types/common';
import { Link, useLoaderData } from '@remix-run/react';
import { AiFillMessage } from 'react-icons/ai';
import { AppContext } from '~/routes/__app';
import { useEventSource } from 'remix-utils';
import { SText } from './textwithfootnotes';
type TextSelection = {
  start?: number;
  end?: number;
  selectedText?: string;
};

export const ParagraphTarget = ({
  paragraphId,
  content,
  comments,
  footnotes,
  toggle,
  background,
}: {
  paragraphId: string;
  content: string;
  comments: TComment[];
  footnotes: Footnote[];
  toggle?: boolean;
  background?: string;
}) => {
  const [selectedText, setSelectedText] = useState<TextSelection>({});
  const {
    onOpen: onNewCommentOpen,
    onClose: onNewCommentClose,
    isOpen: isNewCommentOpen,
  } = useDisclosure();
  const query = comments?.map((comment) => comment.content);
  const chunks = useHighlight({
    text: content,
    query: query,
  });
  const argumentedContent = comments?.length ? (
    <Box as='span'>
      {chunks?.map(({ match, text }) => {
        if (!match) return text;
        const currentComment = comments?.filter((comment) => comment.content.trim() === text)[0];
        return (
          <Box as={'span'} key={text} px='1' py='1' bg='orange.100'>
            {text}
            <CommentBadges
              paragraphId={paragraphId}
              content={content}
              rootComment={currentComment}
            />
          </Box>
        );
      })}
    </Box>
  ) : (
    content
  );
  const handleMouseUp = () => {
    const selection = document.getSelection();
    if (selection?.toString() !== '') {
      const data = selection?.anchorNode?.nodeValue as string;
      const { baseOffset, extentOffset } = (selection || {}) as {
        baseOffset: number;
        extentOffset: number;
      };
      const [start, end] =
        baseOffset > extentOffset ? [extentOffset, baseOffset] : [baseOffset, extentOffset];
      const selectedText = data?.slice(start, end);
      selectedText.trim().length && onNewCommentOpen();
      setSelectedText((prev) => ({ ...prev, start, end, selectedText }));
    }
  };
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      p={4}
      borderRadius={toggle || background ? 12 : 0}
      flexDir={'row'}
      gap={8}
    >
      <Text
        textAlign={'left'}
        flex={1}
        color={toggle ? 'white' : 'inherit'}
        lineHeight={1.8}
        fontSize={'xl'}
        onMouseUp={handleMouseUp}
      >
        {argumentedContent}
      </Text>
      <FormModal
        value={Intent.CREATE_COMMENT}
        header='Add comment'
        body={<Comment paragraphId={paragraphId} {...selectedText} />}
        isOpen={isNewCommentOpen}
        onClose={onNewCommentClose}
      />
    </Flex>
  );
};

export const Paragraph = ({
  content,
  toggle,
  background,
  footnotes = [],
  category,
}: {
  content: string;
  toggle?: boolean;
  background?: string;
  footnotes?: CreatedType<Footnote>[];
  category?: string;
}) => {
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      p={4}
      borderRadius={toggle || background ? 12 : 0}
      flexDir={'row'}
      w='100%'
    >
      {category?.startsWith('HEAD') ? (
        // TODO: this needs improvements
        <Heading as={category === 'HEAD1' ? 'h3' : 'h4'} size={'md'}>
          <SText footnotes={footnotes} text={content} />
        </Heading>
      ) : (
        <Text
          fontFamily={
            category === 'PREFACE' ? 'monospace' : category === 'BYLINE' ? 'serif' : 'mono'
          }
          as={category === 'PREFACE' ? 'i' : category === 'BYLINE' ? 'cite' : undefined}
          flex={1}
          color={toggle ? 'white' : 'inherit'}
          lineHeight={1.8}
          fontSize={'xl'}
        >
          <SText footnotes={footnotes} text={content} />
        </Text>
      )}
    </Flex>
  );
};

export const ParagraphOrigin = ({
  content,
  footnotes,
  index,
  checkedParagraphs,
  background,
  params,
  SK,
}: {
  content: string;
  footnotes: string[];
  index: number;
  checkedParagraphs?: MutableRefObject<Set<number>>;
  background?: string;
  params?: URLSearchParams;
  SK?: string;
}) => {
  const [toggle, setToggle] = useBoolean(false);
  useMemo(() => {
    if (toggle) {
      checkedParagraphs?.current.add(index);
      params?.append('p', SK ?? '');
    } else {
      checkedParagraphs?.current.delete(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);
  return (
    <Flex w={'85%'} flexDir={'row'} alignItems={'flex-start'}>
      <Checkbox ml={-6} borderColor={'primary.300'} onChange={setToggle.toggle}>
        <Paragraph content={content} toggle={toggle} background={background} />
      </Checkbox>
    </Flex>
  );
};

export const ParagraphPair = ({
  origin,
  target,
  footnotes,
}: {
  origin: {
    content: string;
    SK: string;
    comments: TComment[];
  };
  target: {
    content: string;
    comments: TComment[];
  };
  footnotes: string[];
}) => {
  return (
    <Flex flexDir={'row'} gap={4}>
      <Paragraph background='secondary.300' content={origin?.content} footnotes={[]} />
      <ParagraphTarget
        paragraphId={origin.SK}
        background='secondary.200'
        content={target?.content}
        comments={target?.comments || []}
        footnotes={[]}
      />
    </Flex>
  );
};

type CommentBadgesProps = {
  paragraphId: string;
  content: string;
  rootComment: TComment;
};
const CommentBadges = (props: CommentBadgesProps) => {
  const { lastMessages } = useLoaderData<{ lastMessages: TComment[] }>();
  const { paragraphId, content, rootComment } = props;
  const lastMessage = lastMessages.find((message) => message.parentId === rootComment?.id);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const { currentUser } = useContext(AppContext);
  const message = useEventSource('/chat/subscribe', { event: 'new-message' });

  useEffect(() => {
    if (message) {
      const msgObj = JSON.parse(message) as { id: string; username: string };
      if (msgObj.username !== currentUser?.username && msgObj.id === rootComment?.id) {
        setNotifications((prev) => ({ ...prev, [msgObj.id]: true }));
      } else {
        setNotifications((prev) => ({ ...prev, [msgObj.id]: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  useEffect(() => {
    if (rootComment) {
      if (lastMessage?.createdBy !== currentUser?.SK) {
        setNotifications((prev) => ({ ...prev, [rootComment.id]: true }));
      } else if (lastMessage?.id === rootComment?.id) {
        setNotifications((prev) => ({ ...prev, [rootComment.id]: false }));
      } else {
        setNotifications((prev) => ({ ...prev, [rootComment.id]: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootComment]);

  return (
    <Link
      to={`${paragraphId}/${rootComment?.id}`}
      state={{ comment: rootComment, paragraph: content }}
    >
      <Avatar
        borderRadius={10}
        bg={'primary.300'}
        pos={'absolute'}
        right={'5vw'}
        icon={<AiFillMessage />}
      >
        {notifications[rootComment?.id] ? <AvatarBadge boxSize='1.25em' bg='green.500' /> : null}
      </Avatar>
    </Link>
  );
};
