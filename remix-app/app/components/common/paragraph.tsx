import type { MutableRefObject } from 'react';
import { Text, Flex, Checkbox, useBoolean, Tooltip, Box } from '@chakra-ui/react';
export const Paragraph = ({
  origin,
  target,
  index,
  disabled,
  checkedParagraphs,
  finish,
  footnotes,
}: {
  origin: string;
  target: string;
  index: number;
  disabled: boolean;
  checkedParagraphs: MutableRefObject<Set<number>>;
  finish: boolean;
  footnotes: {
    offset: number;
    content: string;
    num: number;
    paragraphId: string;
  }[];
}) => {
  const [toggle, setToggle] = useBoolean(false);
  if (toggle) {
    checkedParagraphs.current.add(index);
  } else {
    checkedParagraphs.current.delete(index);
  }

  const textWithFootNote = footnotes.length
    ? footnotes.map((footnote, index, arr) => {
        const { num, offset, content } = footnote;
        const nextOffset = arr[index + 1]?.offset ?? -1;
        return (
          <span key={num}>
            <Text as="span">{origin.slice(0, offset)}</Text>
            <Tooltip label={content} aria-label="footnote tooltip">
              <span style={{ paddingLeft: 4, paddingRight: 4, color: 'blue' }}>[{num}]</span>
            </Tooltip>
            <Text as="span">{origin.slice(offset, nextOffset)}</Text>
          </span>
        );
      })
    : origin;
  return (
    <Flex w={finish ? '50%' : '90%'} flexDir={'row'} alignItems={'flex-start'}>
      {finish ? (
        <Flex
          background={toggle ? 'primary.300' : 'inherit'}
          pl={4}
          borderRadius={toggle ? 12 : 0}
          flexDir={'row'}
          gap={8}
        >
          <Text fontSize={'xl'}>{textWithFootNote}</Text>
        </Flex>
      ) : (
        <Checkbox borderColor={'primary.300'} onChange={setToggle.toggle} disabled={disabled}>
          <Flex
            background={toggle ? 'primary.300' : 'inherit'}
            pl={4}
            borderRadius={toggle ? 12 : 0}
            flexDir={'row'}
            gap={8}
          >
            <Text
              flex={1}
              color={toggle ? 'white' : 'inherit'}
              lineHeight={1.8}
              fontSize={'xl'}
              fontFamily="Noto Sans TC"
            >
              {origin}
            </Text>
            {target ? (
              <Text
                flex={1}
                color={toggle ? 'white' : 'inherit'}
                lineHeight={1.8}
                fontSize={'xl'}
                fontFamily="Noto Sans TC"
              >
                {target}
              </Text>
            ) : null}
          </Flex>
        </Checkbox>
      )}
    </Flex>
  );
};
