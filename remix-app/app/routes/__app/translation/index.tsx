import { Box, Flex } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';

export const loader = async () => {
  return json({
    sutras: [
      {
        slug: 'EN-SUTRA-V1-0001',
        title: 'Avatamsaka',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'EN-SUTRA-V1-0002',
        title: 'The Lotus Sutra',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'EN-SUTRA-V1-0003',
        title: 'Diamond Sutra',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
      },
    ],
  });
};
export default function TripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return (
    <Box p={10}>
      <Flex gap={8}>{sutraComp}</Flex>
    </Box>
  );
}
