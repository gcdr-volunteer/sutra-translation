import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Paragraph, CreatedType } from '~/types';
import {
  useActionData,
  useLocation,
  useSubmit,
  Form,
  useNavigate,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  ButtonGroup,
  Textarea,
  Divider,
  Button,
  Input,
  Collapse,
  Highlight,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { json } from '@remix-run/node';
import { Warning } from '~/components/common/errors';
import { Intent } from '~/types/common';
import { getParagraphByPrimaryKey } from '~/models/paragraph';
import { handleCreateNewReference } from '~/services/__app/reference/$sutraId/$rollId.staging';
import { getTargetReferencesByRollId } from '~/models/reference';

export const loader = async ({ params, request }: LoaderArgs) => {
  const { rollId } = params;
  const url = new URL(request.url);
  const ps = [...new Set(url.searchParams.getAll('p'))];

  const paragraphs = await Promise.all(
    ps.map((p) => getParagraphByPrimaryKey({ PK: rollId ?? '', SK: p }))
  );
  const paras = paragraphs.map((p) => p?.SK ?? '');
  const references = await getTargetReferencesByRollId(rollId ?? '');
  const reference = references
    .sort((a, b) => {
      if (a.SK && b.SK) {
        if (a.SK > b.SK) {
          return -1;
        }
        if (a.SK < b.SK) {
          return 1;
        }
        return 0;
      }
      return 0;
    })
    .filter((ref) => paras.includes(ref?.paragraphId ?? ''))
    .find((ref) => !ref.finish);
  return json({
    sentenceIndex: reference?.sentenceIndex ?? -1,
    paragraphIndex: reference?.paragraphIndex ?? -1,
    reference,
    paragraphs,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId, rollId } = params;
  // const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_REFERENCE) {
    return await handleCreateNewReference(
      {
        paragraphIndex: entryData?.paragraphIndex as string,
        sentenceIndex: entryData?.sentenceIndex as string,
        totalSentences: entryData?.totalSentences as string,
        paragraph: entryData?.paragraph as string,
        PK: entryData?.PK as string,
        SK: entryData?.PK as string,
        content: entryData?.content as string,
      },
      // TODO: using frontend route props passing
      { sutraId, rollId }
    );
  }
  return json({});
};

export default function StagingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    payload: { paragraphIndex: number; sentenceIndex: number } | Record<string, string>;
    intent: Intent;
    type: 'paragraph' | 'sentence';
  }>();
  const [sentenceFinish, setSentenceFinish] = useState<Record<string, boolean>>({});
  const [paragraphFinish, setParagraphFinish] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (loaderData) {
      const { sentenceIndex, paragraphIndex } = loaderData;
      const sentenceFinish: Record<string, boolean> = {};
      for (let i = 0; i <= paragraphIndex; i++) {
        for (let j = 0; j <= sentenceIndex; j++) {
          sentenceFinish[`${i}.${j}`] = true;
        }
      }
      setSentenceFinish((prev) => ({ ...prev, ...sentenceFinish }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_TRANSLATION) {
      const { paragraphIndex = 0, finish } = actionData.payload as {
        paragraphIndex: number;
        sentenceIndex: number;
        finish: boolean;
      };
      if (actionData) {
        setParagraphFinish((prev) => ({ ...prev, [paragraphIndex]: finish }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const paragraphsComp = loaderData?.paragraphs?.map((paragraph, i, arr) => {
    const sentences = paragraph?.content.trim().split(/(?<=。|！|？|；)/g) || [];
    // const paragraphIndex = actionData?.data?.paragraphIndex ?? 0;
    if (sentences?.length >= 2) {
      return (
        // collapse only when paragraph finish and all sentences finish
        <Box key={i}>
          <Collapse in={!paragraphFinish[i]} unmountOnExit={true}>
            <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
              <Text size={'lg'} fontSize='1.5rem' lineHeight={1.5}>
                <Highlight
                  query={
                    sentences[loaderData.paragraphIndex >= i ? loaderData.sentenceIndex + 1 : 0]
                  }
                  styles={{ px: '1', py: '1', bg: 'orange.100', whiteSpace: 'wrap' }}
                >
                  {paragraph?.content ?? ''}
                </Highlight>
              </Text>
            </Box>
            {loaderData?.reference?.paragraph ? (
              <Box mt={4} w='100%' p={4} background={'primary.300'} borderRadius={16} mb={4}>
                <Text size={'lg'} fontSize='1.5rem' lineHeight={1.5}>
                  {loaderData?.reference?.paragraph}
                </Text>
              </Box>
            ) : null}
          </Collapse>
          {sentences?.map((sentence, j, arr) => {
            if (j >= loaderData.sentenceIndex && paragraph) {
              const newParagraph = { ...paragraph, content: sentence };
              return (
                <Collapse
                  key={j}
                  in={paragraphFinish[i] === true ? false : !sentenceFinish[`${i}.${j}`]}
                  animateOpacity={true}
                  unmountOnExit={true}
                >
                  <TranlationWorkspace
                    origin={newParagraph}
                    paragraphIndex={i}
                    sentenceIndex={j}
                    totalSentences={sentences.length - 1}
                    totalParagraphs={loaderData?.paragraphs?.length - 1}
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
        in={!paragraphFinish[i]}
        unmountOnExit={i !== arr.length - 1}
        animateOpacity={true}
      >
        <TranlationWorkspace
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          origin={paragraph!}
          paragraphIndex={i}
          totalParagraphs={loaderData?.paragraphs?.length - 1}
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

interface WorkSpaceProps {
  origin: CreatedType<Paragraph>;
  paragraphIndex: number;
  totalParagraphs: number;
  sentenceIndex?: number;
  totalSentences?: number;
}
function TranlationWorkspace({
  origin,
  paragraphIndex,
  totalParagraphs,
  sentenceIndex,
  totalSentences,
}: WorkSpaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [content, setContent] = useState('');
  const submit = useSubmit();
  const textareaFormRef = useRef(null);
  const transaction = useTransition();
  const isSubmitting = Boolean(transaction.submission);

  const handleSubmitTranslation = () => {
    setContent('');
    submit(textareaFormRef.current, { replace: true });
  };

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_REFERENCE) {
      const { finish, paragraphIndex } = actionData.payload as {
        finish: boolean;
        paragraphIndex: number;
      };
      if (finish && totalParagraphs == paragraphIndex) {
        const newLocation = location.pathname.replace('/staging', '');
        navigate(newLocation);
      }
      if (!finish) {
        window.scrollTo({
          top: 0,
          left: 0,
        });
      }
    }
  }, [actionData, location.pathname, navigate, totalParagraphs]);
  // TODO: refactor this code to sub components
  return (
    <Flex gap={4} flexDir='row' justifyContent='space-between'>
      <VStack flex={1} spacing={4}>
        <Card w='100%' h='100%' background={'secondary.200'} borderRadius={12}>
          <CardHeader>
            <Heading size='sm'>Origin</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize={'xl'}>{origin?.content}</Text>
          </CardBody>
        </Card>
      </VStack>
      <Flex flex={1} justifyContent='stretch' alignSelf={'stretch'}>
        <Card background={'secondary.500'} w='100%' borderRadius={12}>
          <CardHeader as={Flex} justifyContent='space-between' alignItems='center'>
            <Heading size='sm'>Workspace</Heading>
          </CardHeader>
          <CardBody as={Flex} flexDir={'column'}>
            <ButtonGroup colorScheme={'iconButton'} variant={'outline'} p={4} mb={2}>
              <Button
                marginLeft={'auto'}
                onClick={handleSubmitTranslation}
                colorScheme={'iconButton'}
                disabled={isSubmitting}
              >
                Submit
              </Button>
            </ButtonGroup>
            <Form method='post' ref={textareaFormRef} style={{ height: '100%' }}>
              {content ? (
                <Text bg={'primary.300'} p={2} borderRadius={4} mb={4}>
                  {content}
                </Text>
              ) : null}
              <Textarea
                height={'20vh'}
                name='content'
                placeholder='Edit your paragraph'
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Input name='PK' value={origin.SK} hidden readOnly />
              <Input name='paragraphIndex' value={paragraphIndex} hidden readOnly />
              <Input name='sentenceIndex' value={sentenceIndex} hidden readOnly />
              <Input name='totalSentences' value={totalSentences} hidden readOnly />
              <Input
                name='paragraph'
                value={`${loaderData?.reference?.paragraph ?? ''}`}
                hidden
                readOnly
              />
              <Input name='intent' value={Intent.CREATE_REFERENCE} hidden readOnly />
            </Form>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  );
}
