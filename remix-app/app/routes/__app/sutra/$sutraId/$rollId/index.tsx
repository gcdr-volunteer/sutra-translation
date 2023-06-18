import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Flex, Heading, Box } from '@chakra-ui/react';
import { Paragraph } from '~/components/common/paragraph';
import type { LoaderArgs } from '@remix-run/node';
import { getParagraphsByRollId } from '~/models/paragraph';
import { getFootnotesByRollId } from '~/models/footnote';
import { getRollByPrimaryKey } from '~/models/roll';
import { useSetTheme } from '~/hooks';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId = '', rollId = '' } = params;
  const roll = await getRollByPrimaryKey({ PK: sutraId, SK: rollId });
  const paragraphs = await getParagraphsByRollId(rollId);
  const footnotes = await getFootnotesByRollId(rollId ?? '');
  const sortedFootnotes = footnotes.sort((a, b) => {
    if (a.SK > b.SK) {
      return 1;
    }
    if (a.SK < b.SK) {
      return -1;
    }
    return 0;
  });

  return json({
    roll,
    footnotes: sortedFootnotes,
    paragraphs,
  });
};
export default function RollRoute() {
  const { paragraphs, footnotes, roll } = useLoaderData<typeof loader>();
  const font = useSetTheme();
  const paragraphsComp = paragraphs.map((paragraph, index) => (
    <Paragraph key={paragraph.num} content={paragraph.content} font={font} />
  ));
  if (paragraphs.length) {
    return (
      <Flex
        w='100%'
        flexDir='column'
        justifyContent='flex-start'
        alignItems='center'
        gap={4}
        mt={10}
      >
        <Heading size={'lg'}>{roll?.subtitle}</Heading>
        <Box background={'secondary.300'} borderRadius={32} p={12} w='70%'>
          {paragraphsComp}
        </Box>
        {footnotes.length ? (
          <Flex flexDir={'column'} justifyContent='flex-start' w='60%'>
            {footnotes.map((footnote) => {
              return (
                <Heading key={footnote.num} size={'md'}>
                  {footnote.num}.{footnote.content}
                </Heading>
              );
            })}
          </Flex>
        ) : null}
      </Flex>
    );
  }
  return <div>Volunteers are working on this roll</div>;
}
