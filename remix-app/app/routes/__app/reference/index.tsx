import { Center, IconButton, SimpleGrid, Tooltip, useDisclosure } from '@chakra-ui/react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { FiBook } from 'react-icons/fi';
import { assertAuthUser } from '~/auth.server';
import { FormModal } from '~/components/common';
import { Sutra } from '~/components/common/sutra';
import { SutraForm } from '~/components/sutra_form';
import { getAllSutraThatFinished, getSutraByPrimaryKey } from '~/models/sutra';
import { handleCreateNewSutra } from '~/services/__app/reference';
import { Intent } from '~/types/common';
import { logger } from '~/utils';
import type { AsStr, Sutra as TSutra } from '~/types';
import { RoleType } from '~/types';
import { Can } from '~/authorisation';
import { useEffect } from 'react';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  logger.info('reference', user);
  let sutra;
  if (user?.roles.includes(RoleType.Manager) || user?.roles.includes(RoleType.Admin)) {
    const allSutras = await getAllSutraThatFinished();
    const sutras = allSutras
      .filter((sutra) => sutra.lang === user.origin_lang)
      ?.map((sutra) => ({
        ...sutra,
        firstTime: false,
        slug: sutra.SK ?? '',
      }));
    return json({ sutras });
  } else {
    sutra = await getSutraByPrimaryKey({ PK: 'TRIPITAKA', SK: user?.working_sutra ?? '' });
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
  }
  logger.info('reference', sutra);
  return json({
    sutras: [],
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());

  if (entryData?.intent === Intent.CREATE_SUTRA) {
    entryData as AsStr<Partial<TSutra>>;
    return await handleCreateNewSutra({ sutra: entryData, user: user });
  }

  return json({});
};

export default function ReferenceRoute() {
  const { sutras } = useLoaderData<typeof loader>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_SUTRA) {
      onClose();
    }
  }, [actionData, onClose]);
  const sutraComp = sutras.map((sutra) => <Sutra key={sutra.slug} {...sutra} />);
  return (
    <Center h='100vh' alignItems={'flex-start'}>
      <SimpleGrid maxW={{ base: 'md', lg: 'lg', xl: 'xl' }} minW={'300px'} spacing={8} w='100%'>
        {sutraComp}
        <Can I='Read' this='Management'>
          <Tooltip label='Add a new sutra'>
            <IconButton
              borderRadius={'50%'}
              w={12}
              h={12}
              pos={'fixed'}
              top={24}
              right={8}
              icon={<FiBook />}
              aria-label='add new sutra'
              colorScheme={'iconButton'}
              onClick={() => onOpen()}
            />
          </Tooltip>
        </Can>

        <FormModal
          header='Add new sutra'
          isOpen={isOpen}
          onClose={onClose}
          value={Intent.CREATE_SUTRA}
          body={<SutraForm />}
        />
      </SimpleGrid>
    </Center>
  );
}
