import { MutableRefObject, useState } from 'react';
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

export const Paragraph = ({
  content,
  comments,
  footnotes,
  toggle,
  background,
}: {
  content: string;
  comments: {
    content: string;
    comment: string;
  }[];
  footnotes: string[];
  toggle?: boolean;
  background?: string;
}) => {
  const highlights = comments?.map((comment) => comment.content);
  const argumentedContent = comments?.length ? (
    <Highlight query={highlights} styles={{ px: '1', py: '1', bg: 'orange.100' }}>
      {content}
    </Highlight>
  ) : (
    content
  );
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
        {argumentedContent}
      </Text>
    </Flex>
  );
};

export const ParagraphOrigin = ({
  content,
  comments,
  footnotes,
  index,
  checkedParagraphs,
}: {
  content: string;
  comments: {
    content: string;
    comment: string;
  }[];
  footnotes: string[];
  index: number;
  checkedParagraphs?: MutableRefObject<Set<number>>;
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
        <Paragraph content={content} comments={comments} footnotes={footnotes} toggle={toggle} />
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
}) => (
  <Flex w={'90%'} pl={4} flexDir={'row'} gap={8}>
    <Paragraph
      background="secondary.300"
      content={origin?.content}
      comments={origin?.comments}
      footnotes={footnotes}
    />
    <Paragraph
      background="secondary.200"
      content={target?.content}
      comments={target?.comments}
      footnotes={footnotes}
    />
  </Flex>
);
// export const Paragraph = ({
//   origin,
//   target,
//   index,
//   checkedParagraphs,
//   finish,
//   comments,
//   footnotes,
// }: {
//   origin: {
//     content: string;
//     num: string;
//     finish: boolean;
//   };
//   target: string;
//   index: number;
//   checkedParagraphs: MutableRefObject<Set<number>>;
//   finish: boolean;
//   comments: {
//     content: string;
//     comment: string;
//   }[];
//   footnotes: {
//     offset: number;
//     content: string;
//     num: number;
//     paragraphId: string;
//   }[];
// }) => {
//   const [toggle, setToggle] = useBoolean(false);
//   const [selectedText, setSelectedText] = useState<TextSelection>({});
//   if (toggle) {
//     checkedParagraphs.current.add(index);
//   } else {
//     checkedParagraphs.current.delete(index);
//   }
//   const { onOpen, onClose, isOpen } = useDisclosure();

//   const handleMouseUp = () => {
//     const selection = document.getSelection();
//     if (selection?.toString() !== '') {
//       const data = selection?.anchorNode?.nodeValue as string;
//       const { baseOffset, extentOffset } = (selection || {}) as {
//         baseOffset: number;
//         extentOffset: number;
//       };
//       const [start, end] =
//         baseOffset > extentOffset ? [extentOffset, baseOffset] : [baseOffset, extentOffset];
//       const selectedText = data?.slice(start, end);
//       selectedText.trim().length && onOpen();
//       setSelectedText((prev) => ({ ...prev, start, end, selectedText }));
//     }
//   };

//   const highlights = comments?.map((comment) => comment.content);
//   const argumentedTarget = comments?.length ? (
//     <Highlight key={index} query={highlights} styles={{ px: '1', py: '1', bg: 'orange.100' }}>
//       {target}
//     </Highlight>
//   ) : (
//     target
//   );

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
//   return (
//     <Flex w={finish ? '50%' : '90%'} flexDir={'row'} alignItems={'flex-start'}>
//       {finish ? (
//         <Flex
//           background={toggle ? 'primary.300' : 'inherit'}
//           pl={4}
//           borderRadius={toggle ? 12 : 0}
//           flexDir={'row'}
//           gap={8}
//         >
//           <Text fontSize={'xl'}>{textWithFootNote}</Text>
//         </Flex>
//       ) : Boolean(target) ? (
//         <Flex
//           background={toggle ? 'primary.300' : 'inherit'}
//           pl={4}
//           borderRadius={toggle ? 12 : 0}
//           flexDir={'row'}
//           gap={8}
//         >
//           <Text
//             flex={1}
//             color={toggle ? 'white' : 'inherit'}
//             lineHeight={1.8}
//             fontSize={'xl'}
//             fontFamily="Noto Sans TC"
//           >
//             {origin}
//           </Text>
//           <Text
//             flex={1}
//             color={toggle ? 'white' : 'inherit'}
//             lineHeight={1.8}
//             fontSize={'xl'}
//             fontFamily="Noto Sans TC"
//             onMouseUp={handleMouseUp}
//           >
//             {argumentedTarget}
//           </Text>
//           <FormModal
//             value="new_comment"
//             header="Add comment"
//             body={<Comment {...selectedText} users={['Master Sure', 'Master Lai']} />}
//             isOpen={isOpen}
//             onClose={onClose}
//           />
//         </Flex>
//       ) : (
//         <Checkbox borderColor={'primary.300'} onChange={setToggle.toggle}>
//           <Flex
//             background={toggle ? 'primary.300' : 'inherit'}
//             pl={4}
//             borderRadius={toggle ? 12 : 0}
//             flexDir={'row'}
//             gap={8}
//           >
//             <Text
//               flex={1}
//               color={toggle ? 'white' : 'inherit'}
//               lineHeight={1.8}
//               fontSize={'xl'}
//               fontFamily="Noto Sans TC"
//             >
//               {origin}
//             </Text>
//           </Flex>
//         </Checkbox>
//       )}
//     </Flex>
//   );
// };
