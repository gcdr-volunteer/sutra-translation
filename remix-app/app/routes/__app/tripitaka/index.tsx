import type { SutraProps } from '~/components/common/sutra';
import type { CreatedType, CreateType, Sutra as TSutra } from '~/types';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { RoleType, LangCode } from '~/types';
import { Center, SimpleGrid } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';
import { getSutraByPrimaryKey, getSutrasByLangAndVersion, upsertSutra } from '~/models/sutra';
import { Intent } from '~/types/common';
import { created } from 'remix-utils';
import { assertAuthUser } from '~/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  // TODO: use user profile, instead of hard code here
  const user = await assertAuthUser(request);
  const sutras = await getSutrasByLangAndVersion(LangCode.ZH, 'V1');
  const targetSutras = await getSutrasByLangAndVersion(LangCode.EN, 'V1');
  const mapper = targetSutras.reduce((acc, cur) => {
    if (cur?.origin_sutraId) {
      acc[cur.origin_sutraId] = false;
      return acc;
    }
    return acc;
  }, {} as Record<string, boolean>);
  const extractedSutras = sutras
    ?.filter((sutra) => {
      if (user?.roles.includes(RoleType.Admin)) {
        return true;
      }
      return sutra.SK === user?.working_sutra;
    })
    .map((sutra) => ({
      firstTime: mapper[sutra.SK ?? ''] ?? true,
      ...sutra,
      slug: sutra.SK,
    }));
  return json({ data: extractedSutras });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries()) as Pick<
    CreatedType<TSutra>,
    'PK' | 'SK' | 'dynasty' | 'category' | 'translator' | 'title' | 'origin_sutraId'
  > & { intent: string };
  if (entryData.intent === Intent.CREATE_SUTRA_META) {
    const originSutraMeta = await getSutraByPrimaryKey({
      PK: entryData.PK ?? '',
      SK: entryData.SK ?? '',
    });
    if (originSutraMeta) {
      const newSutraMeta: CreateType<TSutra> = {
        ...originSutraMeta,
        // TODO: using user profile
        PK: originSutraMeta.PK ?? '',
        origin_lang: LangCode.ZH,
        lang: LangCode.EN,
        title: entryData.title,
        translator: entryData.translator,
        category: entryData.category,
        dynasty: entryData.dynasty,
        origin_sutraId: entryData.origin_sutraId,
        SK: entryData.SK?.replace('ZH', 'EN') ?? '',
        team: user?.team ?? '',
        finish: false,
      };
      await upsertSutra(newSutraMeta);
      return created({ data: {}, intent: Intent.CREATE_SUTRA_META });
    }
    // TODO: handle failed case
  }
  return json({});
};
export default function TripitakaRoute() {
  const { data } =
    useLoaderData<{
      data: SutraProps[];
    }>() || {};
  const sutraComp = data.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return (
    <Center h='100vh' alignItems={'flex-start'}>
      <SimpleGrid
        columns={1}
        maxW={{ base: 'md', lg: 'lg', xl: 'xl' }}
        minW={'300px'}
        w='100%'
        spacing={8}
      >
        {sutraComp}
      </SimpleGrid>
    </Center>
  );
}
