import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import type { LoaderArgs } from '@remix-run/node';
import { getRollsBySutraId } from '~/models/roll';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  const targets = await getRollsBySutraId(sutraId ?? '');
  const rolls = targets
    .filter((target) => target.finish)
    .map((target) => ({ ...target, firstTime: false, slug: target.SK ?? '' }));
  return json({ rolls });
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
