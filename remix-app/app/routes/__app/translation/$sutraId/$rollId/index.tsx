import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Text, Flex, Box, VStack } from '@chakra-ui/react';
import { Paragraph } from '~/components/common/paragraph';

export const loader = async ({ params }: LoaderArgs) => {
  return json({
    footnotes: [
      {
        paragraphId: '0002',
        offset: 10,
        num: 1,
        note: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0003',
        offset: 80,
        num: 2,
        note: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0003',
        offset: 20,
        num: 3,
        note: 'Donec non. :Praesent malesuada. Curabitur rutrum.',
      },
      {
        paragraphId: '0004',
        offset: 140,
        num: 4,
        note: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0004',
        offset: 20,
        num: 5,
        note: 'Donec non. :Praesent malesuada. Curabitur rutrum.',
      },
    ],
    paragraphs: [
      {
        finish: true,
        num: '0001',
        category: 'HEAD1',
        content: 'Aliquam commodo fringilla neque',
      },
      {
        finish: true,
        num: '0002',
        category: 'NORMAL',
        content:
          'Nam et pharetra ex. Quisque faucibus sed erat ut auctor. Nulla molestie maximus purus sit amet ornare. Duis vitae ex sollicitudin, tincidunt mi sit amet, mattis nunc. Proin interdum ipsum nec eros consequat mattis. Proin odio mauris, iaculis id diam sit amet, tristique pulvinar turpis. Curabitur eu cursus risus, quis placerat dolor. Vivamus erat massa, sodales sit amet risus et, pellentesque mattis ex.',
      },
      {
        finish: true,
        num: '0003',
        category: 'NORMAL',
        content:
          'Pellentesque finibus eget augue et semper. Vivamus cursus mauris ac ligula pulvinar, non viverra metus imperdiet. Sed interdum ipsum id gravida lacinia. Curabitur vel diam ut ex blandit elementum. Donec euismod interdum sollicitudin. Maecenas sit amet aliquet urna. Vestibulum elementum faucibus condimentum.',
      },
      {
        finish: true,
        num: '0004',
        category: 'NORMAL',
        content:
          'Pellentesque finibus eget augue et semper. Vivamus cursus mauris ac ligula pulvinar, non viverra metus imperdiet. Sed interdum ipsum id gravida lacinia. Curabitur vel diam ut ex blandit elementum. Donec euismod interdum sollicitudin. Maecenas sit amet aliquet urna. Vestibulum elementum faucibus condimentum.',
      },
    ],
  });
};
export default function RollRoute() {
  const { paragraphs, footnotes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const paragraphsComp = paragraphs.map((paragraph, index) => (
    <Paragraph
      key={paragraph.num}
      content={paragraph.content}
      category={paragraph.category}
      footnotes={footnotes.filter(({ paragraphId }) => paragraphId === paragraph.num)}
    />
  ));
  if (paragraphs.length) {
    return (
      <Flex
        w="100%"
        flexDir="column"
        justifyContent="flex-start"
        alignItems="center"
        gap={4}
        mt={10}
      >
        <VStack background={'secondary.300'} borderRadius={16} spacing={4} w="60%">
          {paragraphsComp}
        </VStack>
        {footnotes.length ? (
          <Flex flexDir={'column'} justifyContent="flex-start" w="60%">
            {footnotes.map((footnote) => {
              return (
                <Text key={footnote.num} fontSize={'lg'}>
                  [{footnote.num}]{footnote.note}
                </Text>
              );
            })}
          </Flex>
        ) : null}
      </Flex>
    );
  }
  return <div>Roll</div>;
}
