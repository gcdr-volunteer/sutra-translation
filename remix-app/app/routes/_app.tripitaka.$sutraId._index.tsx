import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { CreateType, Roll as TRoll } from '~/types';
import { json, redirect } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useRouteError } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { Warning } from '~/components/common/errors';
import { getRollByPrimaryKey, upsertRoll } from '~/models/roll';
import { Intent } from '~/types/common';
import { badRequest, created } from 'remix-utils';
import { handleGetAllRollsBySutraId } from '~/services/__app/reference/$sutraId';
import { assertAuthUser } from '../auth.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { sutraId } = params;
  if (!sutraId) {
    throw badRequest({ message: 'sutra id is not provided' });
  }
  const rolls = await handleGetAllRollsBySutraId(sutraId, user);
  return json({ data: rolls });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries()) as Pick<
    TRoll,
    'PK' | 'SK' | 'subtitle' | 'category' | 'title' | 'origin_rollId'
  > & { intent: string };
  if (entryData.intent === Intent.CREATE_ROLL_META) {
    const originRollMeta = await getRollByPrimaryKey({
      PK: entryData.PK ?? '',
      SK: entryData.SK ?? '',
    });
    if (originRollMeta) {
      const newRollMeta: CreateType<TRoll> = {
        ...originRollMeta,
        PK: entryData.PK?.replace(user.origin_lang, user.target_lang) ?? '',
        SK: entryData.SK?.replace(user.origin_lang, user.target_lang) ?? '',
        title: entryData.title,
        subtitle: entryData.subtitle,
        origin_rollId: entryData.origin_rollId,
        category: entryData.category,
        finish: false,
      };
      await upsertRoll(newRollMeta);
      return created({ payload: {}, intent: Intent.CREATE_ROLL_META });
    }
    // TODO: handle failed case
  }
  return json({});
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
        <Flex gap={8} flexWrap={'wrap'} justifyContent={'center'}>
          {rollsComp}
        </Flex>
      </Box>
    );
  } else {
    return <Box>We are processing rolls for this sutra</Box>;
  }
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <Warning content={error.data} />;
  }
}
