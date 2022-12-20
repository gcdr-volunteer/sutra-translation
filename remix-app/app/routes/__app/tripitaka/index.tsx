import { Box, Flex, VStack } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';

export const loader = async () => {
  return json({
    sutras: [
      {
        slug: 'ZH-SUTRA-V1-0001',
        title: '大方廣佛華嚴經',
        category: '華嚴部類',
        roll_count: 80,
        num_chars: 593144,
        translator: '唐 實叉難陀譯',
        dynasty: '唐',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'ZH-SUTRA-V1-0002',
        title: '妙法蓮華經',
        category: '華嚴部類',
        roll_count: 80,
        num_chars: 593144,
        translator: '唐 實叉難陀譯',
        dynasty: '唐',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'ZH-SUTRA-V1-0003',
        title: '金剛般若波羅蜜經',
        category: '華嚴部類',
        roll_count: 80,
        num_chars: 593144,
        translator: '唐 實叉難陀譯',
        dynasty: '唐',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'ZH-SUTRA-V1-0004',
        title: '般若波羅蜜多心經',
        category: '華嚴部類',
        roll_count: 80,
        num_chars: 593144,
        translator: '唐 實叉難陀譯',
        dynasty: '唐',
        time_from: 695,
        time_to: 699,
      },
      {
        slug: 'ZH-SUTRA-V1-0005',
        title: '佛說阿彌陀經',
        category: '華嚴部類',
        roll_count: 80,
        num_chars: 593144,
        translator: '唐 實叉難陀譯',
        dynasty: '唐',
        time_from: 695,
        time_to: 699,
      },
    ],
  });
};
export default function TripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
