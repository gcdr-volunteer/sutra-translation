import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { AsStr, Roll as TRoll } from '~/types';
import { json } from '@remix-run/node';
import { useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Box, Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { Warning } from '~/components/common/errors';
import { getRollsBySutraId } from '~/models/roll';
import { Can } from '~/authorisation';
import { FiBook } from 'react-icons/fi';
import { FormModal } from '~/components/common';
import { Intent } from '~/types/common';
import { RollForm } from '~/components/roll_form';
import { assertAuthUser } from '~/auth.server';
import { unauthorized } from 'remix-utils';
import { handleCreateNewRoll } from '~/services/__app/reference/$sutraId';
import { useEffect } from 'react';

export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId } = params;
  const rolls = await getRollsBySutraId(sutraId ?? '');
  const targetRolls = await getRollsBySutraId(sutraId?.replace('ZH', 'EN') ?? '');
  const mapper = targetRolls.reduce((acc, cur) => {
    if (cur?.origin_rollId) {
      acc[cur.origin_rollId] = false;
      return acc;
    }
    return acc;
  }, {} as Record<string, boolean>);
  const extractedRolls = rolls.map((roll) => ({
    firstTime: mapper[roll.SK ?? ''] ?? true,
    slug: roll.SK,
    ...roll,
  }));
  return json({ data: extractedRolls });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId = '' } = params;

  const formData = await request.formData();
  const user = await assertAuthUser(request);
  if (!user) {
    return unauthorized({ message: 'you should login first' });
  }
  const entryData = Object.fromEntries(formData.entries());

  if (entryData?.intent === Intent.CREATE_ROLL) {
    const newRoll = { ...entryData, PK: sutraId } as AsStr<Partial<TRoll>>;
    return await handleCreateNewRoll({ roll: newRoll, user: user });
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_ROLL) {
      onClose();
    }
  }, [actionData, onClose]);
  const rollsComp = data?.map((roll) => <Roll key={roll.slug} {...roll} />);
  return (
    <Box p={10}>
      <Flex gap={8} flexWrap={'wrap'}>
        <Can I='Read' this='Management'>
          <Tooltip label='Add a new roll'>
            <IconButton
              borderRadius={'50%'}
              w={12}
              h={12}
              pos={'fixed'}
              top={24}
              right={8}
              icon={<FiBook />}
              aria-label='edit roll'
              colorScheme={'iconButton'}
              onClick={() => onOpen()}
            />
          </Tooltip>
        </Can>
        {rollsComp}
        <FormModal
          header='Add new roll'
          isOpen={isOpen}
          onClose={onClose}
          value={Intent.CREATE_ROLL}
          body={<RollForm />}
        />
      </Flex>
    </Box>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return <Warning content={caught.data} />;
  }
}
