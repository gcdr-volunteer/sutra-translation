import { VStack } from '@chakra-ui/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Sutra } from '~/components/common/sutra';
import { getSutrasByLangAndVersion } from '~/models/sutra';
import { assertAuthUser } from '../auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const sutras = await getSutrasByLangAndVersion(user.origin_lang, 'V1');
  return json({
    sutras: sutras.map((sutra) => ({ ...sutra, firstTime: false, slug: sutra.SK })),
  });
};
export default function TripitakaRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return <VStack spacing={8}>{sutraComp}</VStack>;
}
