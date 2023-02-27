import type { Footnote } from '~/types';
import { Box, Text, Tooltip } from '@chakra-ui/react';

type STextProps = {
  footnotes: Footnote[];
  text: string;
};
export const SText = ({ footnotes, text }: STextProps) => {
  if (footnotes?.length) {
    return (
      <Box>
        {footnotes.map((footnote, index, arr) => {
          const { offset, content } = footnote;
          const prevOffset = index === 0 ? index : arr[index - 1]?.offset;
          return (
            <Text as='span' key={index}>
              <Text as='span'>{text.slice(prevOffset, offset)}</Text>
              <Tooltip label={content} aria-label='footnote tooltip'>
                <Text as='sup' style={{ color: 'blue' }}>
                  [{footnote.num}]
                </Text>
              </Tooltip>
              {index === arr.length - 1 ? (
                <Text as='span'>{text.slice(offset, text.length)}</Text>
              ) : null}
            </Text>
          );
        })}
      </Box>
    );
  }
  return <Text>{text}</Text>;
};
