import type { LoaderArgs } from '@remix-run/node';
import type { Roll as TRoll } from '~/types';
import { json } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { Warning } from '~/components/common/errors';
import { getRollsBySutraId } from '~/models/roll';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  const rolls = await getRollsBySutraId(sutraId ?? '');
  const targetRolls = await getRollsBySutraId(sutraId?.replace('ZH', 'EN') ?? '');
  const mapper = targetRolls.reduce((acc, cur) => {
    if (cur?.origin_rollId) {
      acc[cur.origin_rollId] = false;
      return acc;
    }
    return acc;
  }, {} as Record<string, boolean>);
  const extractedRolls = rolls.map((roll) => ({
    firstTime: mapper[roll.SK ?? ''] ?? true,
    slug: roll.SK,
    ...roll,
  }));
  return json({ data: extractedRolls });
};

export interface RollProps extends TRoll {
  slug: string;
  firstTime: boolean;
}
export default function SutraRoute() {
  const { data } = useLoaderData<{
    data: RollProps[];
  }>();
  const rollsComp = data?.map((roll) => <Roll key={roll.slug} {...roll} />);
  if (data?.length) {
    return (
      <Box p={10}>
        <Flex gap={8} flexWrap={'wrap'}>
          {rollsComp}
        </Flex>
      </Box>
    );
  } else {
    return <Box>We are processing rolls for this sutra</Box>;
  }
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return <Warning content={caught.data} />;
  }
}
