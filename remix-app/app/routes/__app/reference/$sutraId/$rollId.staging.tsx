import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { Box, Text, Divider, Collapse, Highlight, Alert, AlertIcon } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { json } from '@remix-run/node';
import { Warning } from '~/components/common/errors';
import { Intent } from '~/types/common';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import { handleCreateNewReference } from '~/services/__app/reference/$sutraId/$rollId.staging';
import { getRefBookBySutraId } from '~/models/reference';
import { ReferencePair } from '~/components/common/reference';
import { useParagraphIds } from '~/hooks';

export const loader = async ({ params, request }: LoaderArgs) => {
  const { rollId, sutraId } = params;
  const url = new URL(request.url);
  const ps = [...new Set(url.searchParams.getAll('p'))];

  const paragraphs = await Promise.all(
    ps.map((p) => getParagraphByPrimaryKey({ PK: rollId ?? '', SK: p }))
  );

  const refBooks = await getRefBookBySutraId(sutraId ?? '');

  return json({
    sentenceIndex: -1,
    paragraphIndex: -1,
    reference: refBooks.map((reference) => ({
      name: reference.bookname,
      content: ['click to edit'],
    })),
    paragraphs,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId = '', rollId = '' } = params;
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_REFERENCE) {
    return await handleCreateNewReference({
      paragraphIndex: entryData?.paragraphIndex as string,
      sentenceIndex: entryData?.sentenceIndex as string,
      totalSentences: entryData?.totalSentences as string,
      paragraphId: entryData?.paragraphId as string,
      content: entryData?.content as string,
      finish: Boolean(entryData?.finish) || false,
      sutraId,
      rollId,
    });
  }
  return json({});
};

export default function ReferenceStagingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    payload:
      | { paragraphIndex: number; sentenceIndex: number; finish: boolean }
      | Record<string, string>;
    intent: Intent;
    type: 'paragraph' | 'sentence';
  }>();
  const paragraphIds = useParagraphIds();

  const ref = useRef(loaderData.paragraphs);

  const [workingSentenceIndex, setWorkingSentenceIndex] = useState(0);

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_REFERENCE) {
      setWorkingSentenceIndex((prev) => prev + 1);
    }
  }, [actionData]);

  const paragraphsComp = loaderData?.paragraphs?.map((paragraph, i, arr) => {
    const sentences = paragraph?.content.trim().split(/(?<=。|！|？|；|：)/g) || [];
    if (sentences?.length >= 2) {
      return (
        <Box key={i}>
          <Collapse in={workingSentenceIndex < sentences.length} unmountOnExit={true}>
            <Alert mb={4} status='warning'>
              <AlertIcon />
              Before you click other page, please make sure you have finished all the reference
            </Alert>
            {workingSentenceIndex < sentences.length ? (
              <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
                <Text size={'lg'} fontSize='1.5rem' lineHeight={1.5}>
                  <Highlight
                    query={sentences[workingSentenceIndex]}
                    styles={{ px: '1', py: '1', bg: 'orange.100', whiteSpace: 'wrap' }}
                  >
                    {paragraph?.content ?? ''}
                  </Highlight>
                </Text>
              </Box>
            ) : null}
          </Collapse>
          {sentences?.map((sentence, j, arr) => {
            if (paragraph) {
              return (
                <Collapse
                  key={j}
                  in={workingSentenceIndex === arr.length || workingSentenceIndex <= j}
                  animateOpacity={true}
                  unmountOnExit={true}
                >
                  <ReferencePair
                    finish={workingSentenceIndex === sentences.length}
                    paragraphId={paragraphIds[i]}
                    sentenceIndex={loaderData.sentenceIndex}
                    paragraphIndex={loaderData.paragraphIndex}
                    origin={sentence ?? 'click to edit'}
                    references={loaderData.reference}
                    totalParagraphs={ref?.current.length - 1}
                  />
                  {j !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
                </Collapse>
              );
            }
            return null;
          })}
        </Box>
      );
    }
    return (
      <Collapse
        key={i}
        in={Boolean(workingSentenceIndex - 1)}
        unmountOnExit={i !== arr.length - 1}
        animateOpacity={true}
      >
        <Alert mb={4} status='warning'>
          <AlertIcon />
          Before you click other page, please make sure you have finished all the reference
        </Alert>
        <ReferencePair
          sentenceIndex={loaderData.sentenceIndex}
          paragraphIndex={loaderData.paragraphIndex}
          totalSentences={0}
          paragraphId={paragraphIds[0]}
          origin={paragraph?.content ?? 'click to edit'}
          references={loaderData.reference}
          totalParagraphs={ref?.current.length - 1}
          finish={Boolean(workingSentenceIndex)}
        />
        {i !== arr.length - 1 ? <Divider mt={4} mb={4} /> : null}
      </Collapse>
    );
  });
  if (loaderData?.paragraphs?.length) {
    return <Box px={16}>{paragraphsComp}</Box>;
  } else {
    return <Warning content='Please select at least one paragraph from the roll' />;
  }
}
