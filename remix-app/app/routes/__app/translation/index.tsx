import { VStack } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';
import { LangCode } from '~/types';

export const loader = async () => {
  const kind = 'SUTRA' as const;
  const origin_lang = LangCode.ZH;
  const lang = LangCode.EN;
  return json({
    sutras: [
      {
        PK: 'EN-SUTRA-V1-0003',
        SK: 'xxx',
        slug: 'EN-SUTRA-V1-0001',
        title: 'Avatamsaka',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
        firstTime: true,
        kind,
        roll_start: 1,
        origin_lang,
        lang,
        origin_sutraId: 'xxx',
        team: 'abc',
        finish: true,
      },
      {
        PK: 'EN-SUTRA-V1-0003',
        SK: 'xxx',
        slug: 'EN-SUTRA-V1-0002',
        title: 'The Lotus Sutra',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
        firstTime: true,
        kind,
        roll_start: 1,
        origin_lang,
        lang,
        origin_sutraId: 'xxx',
        team: 'abc',
        finish: true,
      },
      {
        PK: 'EN-SUTRA-V1-0003',
        SK: 'xxx',
        slug: 'EN-SUTRA-V1-0003',
        title: 'Diamond Sutra',
        category: 'Avatamsaka',
        roll_count: 80,
        num_chars: 593144,
        translator: 'Translated by Shikonanda, Tang Dynasty',
        dynasty: 'Tang',
        time_from: 695,
        time_to: 699,
        firstTime: true,
        kind,
        roll_start: 1,
        origin_lang,
        lang,
        origin_sutraId: 'xxx',
        team: 'abc',
        finish: true,
      },
    ],
  });
};
export default function TripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
