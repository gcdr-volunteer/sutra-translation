import { json, LoaderArgs, Response } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { CloseIcon } from '@chakra-ui/icons';
import { Warning } from '~/components/common/errors';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  switch (sutraId) {
    case 'ZH-SUTRA-V1-0001':
      return json({
        rolls: [
          {
            title: '世主妙嚴品第一之一',
            slug: 'ZH-ROLL-V1-0001',
            roll_num: '第一卷',
            finish: true,
          },
          {
            title: '世主妙嚴品第一之二',
            slug: 'ZH-ROLL-V1-0002',
            roll_num: '第二卷',
            finish: true,
          },
        ],
      });
    case 'ZH-SUTRA-V1-0002':
      return json({
        rolls: [
          {
            title: '世主妙嚴品第一之一',
            slug: 'ZH-ROLL-V1-0001',
            roll_num: '第一卷',
            finish: true,
          },
          {
            title: '世主妙嚴品第一之二',
            slug: 'ZH-ROLL-V1-0002',
            roll_num: '第二卷',
            finish: true,
          },
        ],
      });
    case 'ZH-SUTRA-V1-0003':
      return json({
        rolls: [
          {
            title: '世主妙嚴品第一之一',
            slug: 'ZH-ROLL-V1-0001',
            roll_num: '第一卷',
            finish: true,
          },
          {
            title: '世主妙嚴品第一之二',
            slug: 'ZH-ROLL-V1-0002',
            roll_num: '第二卷',
            finish: true,
          },
        ],
      });
    default:
      throw new Response(
        'We could not find this sutra, please check if you have provided correct sutra id',
        { status: 400 }
      );
  }
};
export default function SutraSlug() {
  const { rolls } = useLoaderData<typeof loader>();
  const rollsComp = rolls.map((roll) => <Roll key={roll.slug} {...roll} />);
  if (rolls.length) {
    return (
      <Box p={10}>
        <Flex gap={8}>{rollsComp}</Flex>
      </Box>
    );
  } else {
    return <Box>No roll for this sutra</Box>;
  }
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return <Warning content={caught.data} />;
  }
}
