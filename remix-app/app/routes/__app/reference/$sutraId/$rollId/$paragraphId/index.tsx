import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useActionData, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { Box, Collapse } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { json, redirect } from '@remix-run/node';
import { Warning } from '~/components/common/errors';
import { Intent } from '~/types/common';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import {
  handleCreateNewReference,
  handleGetAllRefBooks,
  handleGetSutraAndRoll,
} from '~/services/__app/reference/$sutraId/$rollId.staging';
import { ReferencePairForStaging } from '~/components/common/reference';
import { badRequest, created } from 'remix-utils';
import { assertAuthUser } from '../../../../../../auth.server';
import { logger } from '~/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { rollId, sutraId, paragraphId } = params;
  if (!rollId) {
    throw badRequest({ message: 'roll id cannot be empty' });
  }
  if (!paragraphId) {
    throw badRequest({ message: 'paragraph id cannot be empty' });
  }
  if (!sutraId) {
    throw badRequest({ message: 'sutra id cannot be empty' });
  }
  const paragraph = await getParagraphByPrimaryKey({ PK: rollId, SK: paragraphId });

  const metadata = await handleGetSutraAndRoll({ sutraId, rollId });

  const references = await handleGetAllRefBooks(sutraId);

  return json({
    metadata,
    references,
    paragraph,
  });
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { paragraphId = '', rollId = '', sutraId = '' } = params;
  if (!paragraphId) {
    throw badRequest('paragraphId cannot be empty');
  }
  if (!sutraId) {
    throw badRequest('sutraId cannot be empty');
  }
  if (!rollId) {
    throw badRequest('rollId cannot be empty');
  }
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_REFERENCE) {
    logger.log(Intent.CREATE_REFERENCE, entryData);
    await handleCreateNewReference({
      newReference: { sutraId, paragraphId, rollId, ...entryData, createdBy: user.username },
      user,
    });
    return created({
      payload: {},
      intent: Intent.CREATE_REFERENCE,
    });
  }
  return json({});
};

export default function ParagraphRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    payload:
      | { paragraphIndex: number; sentenceIndex: number; finish: boolean }
      | Record<string, string>;
    intent: Intent;
    type: 'paragraph' | 'sentence';
  }>();
  const [collapse, setCollapse] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_REFERENCE) {
      setCollapse(false);
      navigate(-1);
    }
  }, [actionData, navigate, location]);

  if (loaderData?.paragraph) {
    return (
      <Box key={loaderData.paragraph.content}>
        <Collapse in={collapse} animateOpacity={true} unmountOnExit={true}>
          <ReferencePairForStaging
            sutra={loaderData?.metadata?.sutra?.title}
            roll={loaderData?.metadata?.roll?.title}
            origin={loaderData.paragraph.content || 'click to edit'}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            references={loaderData.references}
          />
        </Collapse>
      </Box>
    );
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}
