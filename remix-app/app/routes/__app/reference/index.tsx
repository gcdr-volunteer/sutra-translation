import { VStack } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assertAuthUser } from '~/auth.server';
import { Sutra } from '~/components/common/sutra';
import { getSutraByPrimaryKey } from '~/models/sutra';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  const sutra = await getSutraByPrimaryKey({ PK: 'TRIPITAKA', SK: user?.working_sutra ?? '' });
  if (sutra) {
    return json({
      sutras: [
        {
          ...sutra,
          firstTime: false,
          slug: sutra?.SK ?? '',
        },
      ],
    });
  }
  return json({
    sutras: [],
  });
};
export default function ReferenceTripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
