import { VStack } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';
import { getSutrasByLangAndVersion } from '~/models/sutra';
import { LangCode } from '~/types';

export const loader = async () => {
  const sutras = await getSutrasByLangAndVersion(LangCode.ZH, 'V1');
  const extractedSutras = sutras?.map((sutra) => ({
    ...sutra,
    slug: sutra.SK,
  }));
  return json({ data: extractedSutras });
};
export default function TripitakaRoute() {
  const { data } =
    useLoaderData<{
      data: { slug: string; title: string; category: string; translator: string }[];
    }>() || {};
  const sutraComp = data.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
