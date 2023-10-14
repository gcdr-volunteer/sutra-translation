import { VStack } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';
import { getSutrasByLangAndVersion } from '~/models/sutra';
import { LangCode } from '~/types';

export const loader = async () => {
  const sutras = await getSutrasByLangAndVersion(LangCode.EN, 'V1');
  return json({
    sutras: sutras.map((sutra) => ({ ...sutra, firstTime: false, slug: sutra.SK })),
  });
};
export default function TripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
