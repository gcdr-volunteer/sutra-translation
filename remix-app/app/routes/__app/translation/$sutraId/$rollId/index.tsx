import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { Text, IconButton, Flex, Checkbox, useBoolean } from '@chakra-ui/react';
import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { FiEdit } from 'react-icons/fi';
import { Paragraph } from '~/components/common/paragraph';

export const loader = async ({ params }: LoaderArgs) => {
  return json({
    footnotes: [
      {
        paragraphId: '0001',
        offset: 10,
        num: 1,
        content: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0001',
        offset: 80,
        num: 2,
        content: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0001',
        offset: 140,
        num: 3,
        content: 'Etiam porttitor. Class aptent. Nulla facilisi.',
      },
      {
        paragraphId: '0002',
        offset: 20,
        num: 4,
        content: 'Donec non. :Praesent malesuada. Curabitur rutrum.',
      },
      {
        paragraphId: '0003',
        offset: 20,
        num: 5,
        content: 'Donec non. :Praesent malesuada. Curabitur rutrum.',
      },
    ],
    paragraphs: [
      {
        finish: true,
        num: '0001',
        content:
          'Aliquam commodo fringilla neque, sit amet condimentum risus commodo in. Quisque porta mi arcu, eget condimentum nunc mollis ac. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed ut cursus nulla. Curabitur ut nunc in est sollicitudin feugiat non at odio. Nullam in accumsan purus, non congue risus. Suspendisse hendrerit non eros ac mattis. Maecenas ornare pellentesque augue non venenatis. Sed tincidunt blandit nibh vel rhoncus. Etiam vitae sagittis risus. Praesent in nisl urna. Suspendisse pharetra eros ut diam malesuada gravida. Aliquam ornare scelerisque enim, sit amet ultricies urna consectetur non. Maecenas in odio malesuada, sagittis erat a, suscipit eros. Proin sodales rhoncus metus, sed placerat ipsum consequat a. Nam quis accumsan arcu. Quisque egestas fringilla lectus, interdum vehicula quam porta ac. Integer magna ligula, porta quis elementum eget, ornare ac purus. Duis lobortis euismod neque sed pellentesque.',
      },
      {
        finish: true,
        num: '0002',
        content:
          'Nam et pharetra ex. Quisque faucibus sed erat ut auctor. Nulla molestie maximus purus sit amet ornare. Duis vitae ex sollicitudin, tincidunt mi sit amet, mattis nunc. Proin interdum ipsum nec eros consequat mattis. Proin odio mauris, iaculis id diam sit amet, tristique pulvinar turpis. Curabitur eu cursus risus, quis placerat dolor. Vivamus erat massa, sodales sit amet risus et, pellentesque mattis ex.',
      },
      {
        finish: true,
        num: '0003',
        content:
          'Pellentesque finibus eget augue et semper. Vivamus cursus mauris ac ligula pulvinar, non viverra metus imperdiet. Sed interdum ipsum id gravida lacinia. Curabitur vel diam ut ex blandit elementum. Donec euismod interdum sollicitudin. Maecenas sit amet aliquet urna. Vestibulum elementum faucibus condimentum.',
      },
    ],
  });
};
export default function RollRoute() {
  const { paragraphs, footnotes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const checkedParagraphs = useRef(new Set<number>());
  const paragraphsComp = paragraphs.map((paragraph, index) => (
    <Paragraph
      key={paragraph.num}
      origin={paragraph.content}
      comments={[]}
      target={''}
      index={index}
      checkedParagraphs={checkedParagraphs}
      finish={paragraph.finish}
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
        {paragraphsComp}
        {footnotes.length ? (
          <Flex flexDir={'column'} justifyContent="flex-start" w="48%">
            {footnotes.map((footnote) => {
              return (
                <Text key={footnote.num} fontSize={'lg'}>
                  [{footnote.num}]{footnote.content}
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
