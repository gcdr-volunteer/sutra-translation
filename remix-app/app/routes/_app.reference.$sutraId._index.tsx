import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { AsStr, Roll as TRoll } from '~/types';
import { json, redirect } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { Box, Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Roll } from '~/components/common/roll';
import { Warning } from '~/components/common/errors';
import { Can } from '~/authorisation';
import { FiBook } from 'react-icons/fi';
import { FormModal } from '~/components/common';
import { Intent } from '~/types/common';
import { RollForm } from '~/components/roll_form';
import { assertAuthUser } from '~/auth.server';
import { badRequest } from 'remix-utils';
import {
  handleCreateNewRoll,
  handleGetAllRollsBySutraId,
} from '~/services/__app/reference/$sutraId';
import { useEffect } from 'react';

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { sutraId = '' } = params;

  const formData = await request.formData();
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
  const actionData = useActionData<{ intent: Intent }>();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_ROLL) {
      onClose();
    }
  }, [actionData, onClose]);
  const rollsComp = data?.map((roll) => <Roll key={roll.slug} {...roll} />);
  return (
    <Box p={10}>
      <Flex gap={8} flexWrap={'wrap'} justifyContent={'center'}>
        <Can I='Read' this='Management'>
          <Tooltip placement='left' label='Add a new roll'>
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

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <Warning content={error.data} />;
  }
}
