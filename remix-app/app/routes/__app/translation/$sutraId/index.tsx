import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  switch (sutraId) {
    case 'EN-SUTRA-V1-0001':
      return json({
        rolls: [
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0001',
            roll_num: 'Roll one',
            finish: true,
          },
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0002',
            roll_num: 'Roll two',
            finish: true,
          },
        ],
      });
    case 'EN-SUTRA-V1-0002':
      return json({
        rolls: [
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0001',
            roll_num: 'Roll one',
            finish: true,
          },
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0002',
            roll_num: 'Roll two',
            finish: true,
          },
        ],
      });
    case 'EN-SUTRA-V1-0003':
      return json({
        rolls: [
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0001',
            roll_num: 'Roll one',
            finish: true,
          },
          {
            title: 'Chapter One: Wondrous Adornments of World-Rulers',
            subtitle: '',
            slug: 'EN-ROLL-V1-0002',
            roll_num: 'Roll two',
            finish: true,
          },
        ],
      });
    default:
      throw new Error('We dont support this yet');
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
