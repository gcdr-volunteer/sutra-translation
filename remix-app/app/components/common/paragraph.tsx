import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Checkbox,
  useBoolean,
  useDisclosure,
  Mark,
  useToast,
} from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
import type { MutableRefObject } from 'react';
import type { CreatedType, Comment as TComment, Paragraph as TParagraph } from '~/types';
import { Intent } from '~/types/common';
import { MessageDialog } from '../comment_dialog';
import { AppContext } from '~/routes/__app';
import { Can } from '~/authorisation';
import { useActionData } from '@remix-run/react';
import type { ParagraphLoaderData } from '../../models/paragraph';
import { useHighlight, useSetTheme } from '../../hooks';
import { buildRegex } from '../../utils';

export const ParagraphTarget = ({
  paragraphId,
  comments,
  toggle,
  background,
  content,
  font,
}: {
  paragraphId: string;
  comments: TComment[];
  toggle?: boolean;
  background?: string;
  content: string;
  font: {
    fontSize: string;
    fontFamilyOrigin: string;
    fontFamilyTarget: string;
  };
}) => {
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      borderRadius={toggle || background ? 12 : 0}
      p={4}
      flexDir={'row'}
      gap={8}
      position={'relative'}
    >
      <TextWithComment font={font} text={content} comments={comments} paragraphId={paragraphId} />
    </Flex>
  );
};

export const TextWithComment = ({
  comments,
  text,
  paragraphId,
  font,
}: {
  comments: TComment[];
  text: string;
  paragraphId: string;
  font: {
    fontSize: string;
    fontFamilyOrigin: string;
    fontFamilyTarget: string;
  };
}) => {
  const {
    onOpen: onNewCommentOpen,
    onClose: onNewCommentClose,
    isOpen: isNewCommentOpen,
  } = useDisclosure();
  const [selectedText, setSelectedText] = useState<string>('');

  const parentRef = useRef<HTMLParagraphElement>(null);

  const toast = useToast();
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const parent = parentRef.current;
      if (parent) {
        const cleanedText = selection.toString().trim();
        setSelectedText(cleanedText);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedText?.length) {
      const regex = buildRegex([selectedText]);
      if (regex) {
        const matches = text.match(regex);
        if (matches && matches?.length >= 2) {
          toast({
            title: 'Select words failed',
            description: 'Please select more words',
            status: 'warning',
            duration: 2000,
            position: 'top',
          });
          return;
        } else {
          onNewCommentOpen();
        }
      }
    }
  }, [selectedText, onNewCommentOpen, toast, text]);

  const commentsNotResolved = useMemo(() => {
    return comments
      .filter((comment) => Boolean(comment.content))
      .filter((comment) => comment.id === comment.parentId)
      .filter((comment) => !comment?.resolved);
  }, [comments]);
  const chunks = useHighlight({
    text,
    query: commentsNotResolved.map((comment) => comment.content),
  });

  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_COMMENT) {
      onNewCommentClose();
    }
  }, [actionData, onNewCommentClose]);

  return (
    <Box>
      <Text
        key={text}
        fontFamily={font.fontFamilyTarget}
        fontSize={font.fontSize}
        onMouseUp={handleMouseUp}
        ref={parentRef}
      >
        {chunks.map(({ match, text: segment }) => {
          if (match) {
            return (
              <MessageWithHighlightComp
                key={segment}
                segment={segment}
                comments={comments}
                fullText={text}
                paragraphId={paragraphId}
              />
            );
          }
          return (
            <Text key={segment} as='span'>
              {segment}
            </Text>
          );
        })}
      </Text>
      <Can I='Create' this='Comment'>
        <FormModal
          value={Intent.CREATE_COMMENT}
          header='Add comment'
          body={<Comment paragraphId={paragraphId} selectedText={selectedText} />}
          isOpen={isNewCommentOpen}
          onClose={onNewCommentClose}
        />
      </Can>
    </Box>
  );
};

export const MessageWithHighlightComp = ({
  segment,
  comments,
  fullText,
  paragraphId,
}: {
  segment: string;
  comments: TComment[];
  fullText: string;
  paragraphId: string;
}) => {
  const { currentUser } = useContext(AppContext);
  const hasNewMessage = useMemo(() => {
    return currentUser?.username !== comments[comments.length - 1]?.creatorAlias;
  }, [currentUser, comments]);

  const { onOpen, onClose, isOpen } = useDisclosure();
  return (
    <Mark onClick={onOpen}>
      <NewMessageIndicator hasNewMessage={hasNewMessage}>
        <HighlightedText highlightedText={segment} />
      </NewMessageIndicator>
      <MessageDialog
        content={segment}
        paragraphId={paragraphId}
        isOpen={isOpen}
        messages={comments.filter((comment) => comment.content === segment)}
        fullText={fullText}
        onClose={onClose}
      />
    </Mark>
  );
};

export const HighlightedText = ({ highlightedText }: { highlightedText: string }) => {
  return (
    <Mark p='1' rounded={'md'} bg={'yellow.200'} cursor={'pointer'} whiteSpace={'normal'}>
      {highlightedText}
    </Mark>
  );
};

const NewMessageIndicator = ({
  children,
  hasNewMessage,
}: React.PropsWithChildren<{ hasNewMessage: boolean }>) => {
  if (hasNewMessage) {
    return (
      <Mark pos={'relative'}>
        {children}
        <Mark
          pos={'absolute'}
          top='0'
          left='0'
          bg='tomato'
          h='1rem'
          w='1rem'
          borderRadius={'50%'}
          transform='translate(-50%, -50%)'
          border='0.1em solid papayawhip'
        />
      </Mark>
    );
  } else {
    return <Mark>{children}</Mark>;
  }
};

export const Paragraph = ({
  content,
  toggle,
  background,
  font,
}: {
  content: string;
  toggle?: boolean;
  background?: string;
  font: {
    fontSize: string;
    fontFamilyOrigin: string;
    fontFamilyTarget: string;
  };
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
      <Text fontFamily={font.fontFamilyOrigin} fontSize={font.fontSize}>
        {content}
      </Text>
    </Flex>
  );
};

export const ParagraphOrigin = ({
  content,
  index,
  background,
  urlParams,
  SK,
  font,
}: {
  content: string;
  index: number;
  background?: string;
  urlParams: MutableRefObject<URLSearchParams>;
  SK?: string;
  font: {
    fontSize: string;
    fontFamilyOrigin: string;
    fontFamilyTarget: string;
  };
}) => {
  const [toggle, setToggle] = useBoolean(false);
  useMemo(() => {
    if (toggle) {
      const urls = urlParams.current.getAll('p');
      if (!urls.includes(SK ?? '')) {
        urlParams.current.append('p', SK ?? '');
      }
      const paramsArray = Array.from(urlParams.current.entries());
      paramsArray.sort((a, b) => a[1].localeCompare(b[1]));
      urlParams.current = new URLSearchParams(paramsArray);
    } else {
      const newParams = new URLSearchParams();
      for (const [key, value] of urlParams.current.entries()) {
        if (value !== SK) {
          newParams.append(key, value);
        }
      }
      urlParams.current = newParams;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);
  return (
    <Flex w={'85%'} flexDir={'row'} alignItems={'flex-start'}>
      <Checkbox ml={-6} borderColor={'primary.300'} onChange={setToggle.toggle}>
        <Paragraph font={font} content={content} toggle={toggle} background={background} />
      </Checkbox>
    </Flex>
  );
};

export const ParagraphPair = ({
  origin,
  target,
}: {
  origin: CreatedType<TParagraph>;
  target: Required<ParagraphLoaderData>['target'];
  footnotes: string[];
}) => {
  const font = useSetTheme();
  const commentsInThisParagraph = useMemo(() => {
    if (target.comments) {
      return target.comments.filter((comment) => comment.paragraphId === target.SK);
    } else {
      return [];
    }
  }, [target.comments, target.SK]);
  return (
    <Flex flexDir={{ sm: 'column', md: 'column', lg: 'column', xl: 'row' }} gap={4}>
      <Paragraph font={font} background='secondary.300' content={origin?.content} />
      <ParagraphTarget
        font={font}
        content={target.content}
        paragraphId={origin.SK}
        background='secondary.200'
        comments={commentsInThisParagraph}
      />
    </Flex>
  );
};
