import { json } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { Warning } from '~/components/common/errors';
import { getRollsBySutraId } from '~/models/roll';
import type { LoaderArgs } from '@remix-run/node';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  const rolls = await getRollsBySutraId(sutraId!);
  const extractedRolls = rolls?.map((roll) => ({
    slug: roll.SK,
    ...roll,
  }));
  return json({ data: extractedRolls });
};
export default function SutraSlug() {
  const { data } = useLoaderData<{
    data: { title: string; subtitle: string; finish: boolean; slug: string }[];
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
