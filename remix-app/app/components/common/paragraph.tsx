import { useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Checkbox,
  useBoolean,
  useDisclosure,
  useHighlight,
  Mark,
  useToast,
} from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
import type { MutableRefObject } from 'react';
import type { Comment as TComment } from '~/types';
import { Intent } from '~/types/common';
import { CommentDialog } from '../comment_dialog';
import { AppContext } from '~/routes/__app';
import { Can } from '~/authorisation';
type TextSelection = {
  start?: number;
  end?: number;
  selectedText?: string;
};

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
  const [selectedText, setSelectedText] = useState<TextSelection>({});

  const toast = useToast();

  const handleMouseUp = useCallback(() => {
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
      const cleanedText = selectedText.trim();
      if (selectedText.split(/\s+/).length < 5) {
        toast({
          title: 'Highlighter',
          description: 'You have select at least 5 words to make it less confuse',
          position: 'top',
          status: 'warning',
        });
        return;
      }
      cleanedText.length && onNewCommentOpen();
      setSelectedText((prev) => ({ ...prev, start, end, selectedText }));
    }
  }, [onNewCommentOpen, toast]);

  const chunks = useHighlight({
    text,
    query: comments
      .filter((comment) => comment.id === comment.parentId)
      .map((comment) => comment.content),
  });

  return (
    <Box>
      <Text
        key={text}
        fontFamily={font.fontFamilyTarget}
        fontSize={font.fontSize}
        onMouseUp={handleMouseUp}
      >
        {chunks.map(({ match, text: normalText }) => {
          if (!match) return <Text as='span'>{normalText}</Text>;
          const rootComment = comments.find((comment) => comment.content === normalText) || {
            id: '',
          };
          return (
            <HighlightedText
              paragraphId={paragraphId}
              key={text}
              fullText={text}
              highlightedText={normalText}
              comments={comments.filter((comment) => comment.parentId === rootComment.id)}
            />
          );
        })}
      </Text>
      <Can I='Create' this='Comment'>
        <FormModal
          value={Intent.CREATE_COMMENT}
          header='Add comment'
          body={<Comment paragraphId={paragraphId} {...selectedText} />}
          isOpen={isNewCommentOpen}
          onClose={onNewCommentClose}
        />
      </Can>
    </Box>
  );
};

export const HighlightedText = ({
  fullText,
  highlightedText,
  comments,
  paragraphId,
}: {
  fullText: string;
  highlightedText: string;
  comments: TComment[];
  paragraphId: string;
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { currentUser } = useContext(AppContext);
  const hasNewMessage = () => {
    return currentUser?.username !== comments[comments.length - 1].creatorAlias;
  };

  return (
    <Mark>
      <Mark
        p='1'
        rounded={'md'}
        bg={'yellow.200'}
        cursor={'pointer'}
        onClick={onOpen}
        position={'relative'}
      >
        {highlightedText}
        {hasNewMessage() ? (
          <Mark
            pos={'absolute'}
            top='0'
            right='0'
            bg='tomato'
            h='1rem'
            w='1rem'
            borderRadius={'50%'}
            transform='translate(50%, -50%)'
            border='0.1em solid papayawhip'
          />
        ) : null}
      </Mark>
      <CommentDialog
        paragraphId={paragraphId}
        highlightedText={highlightedText}
        isOpen={isOpen}
        comments={comments}
        fullText={fullText}
        onClose={onClose}
      />
    </Mark>
  );
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
  font,
}: {
  origin: {
    content: string;
    SK: string;
  };
  target: {
    content: string;
    comments: TComment[];
  };
  footnotes: string[];
  font: {
    fontSize: string;
    fontFamilyOrigin: string;
    fontFamilyTarget: string;
  };
}) => {
  return (
    <Flex flexDir={'row'} gap={4}>
      <Paragraph font={font} background='secondary.300' content={origin?.content} />
      <ParagraphTarget
        font={font}
        content={target.content}
        paragraphId={origin.SK}
        background='secondary.200'
        comments={
          target?.comments?.filter(
            (comment) => comment.paragraphId === origin.SK.replace('ZH', 'EN')
          ) || []
        }
      />
    </Flex>
  );
};
