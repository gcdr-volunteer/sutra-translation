import { MutableRefObject, useContext, useState } from 'react';
import {
  Text,
  Flex,
  Checkbox,
  useBoolean,
  Tooltip,
  useDisclosure,
  Heading,
  useHighlight,
  Box,
} from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
import { Comment as TComment } from '~/types';
import { AppContext } from '~/routes/__app';
import { CommentDialog } from '~/routes/__app/tripitaka/$sutraId/$rollId/dialog';
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
  footnotes: string[];
  toggle?: boolean;
  background?: string;
}) => {
  const { currentUser } = useContext(AppContext);
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
    <Box as="span">
      {chunks?.map(({ match, text }) => {
        if (!match) return text;
        const currentComment = comments?.filter((comment) => comment.content.trim() === text)[0];
        return (
          <Box as={'span'} key={text} px="1" py="1" bg="orange.100">
            {text}
            <CommentDialog comment={currentComment} />
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
        value="new_comment"
        header="Add comment"
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
  footnotes,
  category,
}: {
  content: string;
  toggle?: boolean;
  background?: string;
  footnotes?: {
    num: number;
    offset: number;
    note: string;
  }[];
  category?: string;
}) => {
  const argumentedContent = footnotes?.length
    ? footnotes.map((footnote, index, arr) => {
        const { num, offset, note } = footnote;
        const nextOffset = arr[index + 1]?.offset ?? -1;
        return (
          <span key={num}>
            <Text as="span">{content.slice(0, offset)}</Text>
            <Tooltip label={note} aria-label="footnote tooltip">
              <span style={{ paddingLeft: 4, paddingRight: 4, color: 'blue' }}>[{num}]</span>
            </Tooltip>
            <Text as="span">{content.slice(offset, nextOffset)}</Text>
          </span>
        );
      })
    : content;
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      p={4}
      borderRadius={toggle || background ? 12 : 0}
      flexDir={'row'}
      w="100%"
    >
      {category?.startsWith('HEAD') ? (
        // TODO: this needs improvements
        <Heading as={category === 'HEAD1' ? 'h3' : 'h4'}>{argumentedContent}</Heading>
      ) : (
        <Text
          flex={1}
          color={toggle ? 'white' : 'inherit'}
          lineHeight={1.8}
          fontSize={'xl'}
          // fontFamily="Noto Serif HK"
        >
          {argumentedContent}
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
}: {
  content: string;
  footnotes: string[];
  index: number;
  checkedParagraphs?: MutableRefObject<Set<number>>;
  background?: string;
}) => {
  const [toggle, setToggle] = useBoolean(false);
  if (toggle) {
    checkedParagraphs?.current.add(index);
  } else {
    checkedParagraphs?.current.delete(index);
  }
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
      <Paragraph background="secondary.300" content={origin?.content} footnotes={[]} />
      <ParagraphTarget
        paragraphId={origin.SK}
        background="secondary.200"
        content={target?.content}
        comments={target?.comments}
        footnotes={footnotes}
      />
    </Flex>
  );
};
