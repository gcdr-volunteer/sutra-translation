import { MutableRefObject, useRef, useState } from 'react';
import {
  Text,
  Flex,
  Checkbox,
  useBoolean,
  Tooltip,
  useDisclosure,
  Highlight,
} from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
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
  comments: {
    content: string;
    comment: string;
  }[];
  footnotes: string[];
  toggle?: boolean;
  background?: string;
}) => {
  const [selectedText, setSelectedText] = useState<TextSelection>({});
  const { onOpen, onClose, isOpen } = useDisclosure();
  const highlights = comments?.map((comment) => comment.content);
  const argumentedContent = comments?.length ? (
    <Highlight
      query={highlights}
      styles={{ px: '1', py: '1', bg: 'orange.100', userSelect: 'none' }}
    >
      {content}
    </Highlight>
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
      selectedText.trim().length && onOpen();
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
        fontFamily="Noto Sans TC"
        onMouseUp={handleMouseUp}
      >
        {argumentedContent}
      </Text>
      <FormModal
        value="new_comment"
        header="Add comment"
        body={
          <Comment
            paragraphId={paragraphId}
            {...selectedText}
            users={['Master Sure', 'Master Lai']}
          />
        }
        isOpen={isOpen}
        onClose={onClose}
      />
    </Flex>
  );
};

export const Paragraph = ({
  content,
  toggle,
  background,
  footnotes,
}: {
  content: string;
  toggle?: boolean;
  background?: string;
  footnotes?: string[];
}) => {
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
        fontFamily="Noto Sans TC"
      >
        {content}
      </Text>
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
    <Flex w={'90%'} flexDir={'row'} alignItems={'flex-start'}>
      <Checkbox borderColor={'primary.300'} onChange={setToggle.toggle}>
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
    comments: {
      content: string;
      comment: string;
    }[];
  };
  target: {
    content: string;
    comments: {
      content: string;
      comment: string;
    }[];
  };
  footnotes: string[];
}) => {
  return (
    <Flex pl={4} flexDir={'row'} gap={8}>
      <Paragraph background="secondary.300" content={origin?.content} footnotes={footnotes} />
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
//   const textWithFootNote = footnotes.length
//     ? footnotes.map((footnote, index, arr) => {
//         const { num, offset, content } = footnote;
//         const nextOffset = arr[index + 1]?.offset ?? -1;
//         return (
//           <span key={num}>
//             <Text as="span">{origin.slice(0, offset)}</Text>
//             <Tooltip label={content} aria-label="footnote tooltip">
//               <span style={{ paddingLeft: 4, paddingRight: 4, color: 'blue' }}>[{num}]</span>
//             </Tooltip>
//             <Text as="span">{origin.slice(offset, nextOffset)}</Text>
//           </span>
//         );
//       })
//     : origin;
