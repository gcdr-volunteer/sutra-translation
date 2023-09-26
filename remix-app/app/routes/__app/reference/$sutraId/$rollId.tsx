import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { CreateType, Paragraph, Roll, Reference, CreatedType } from '~/types';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { json, redirect } from '@remix-run/node';
import { Outlet, useActionData, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import {
  IconButton,
  Flex,
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Editable,
  EditablePreview,
  EditableTextarea,
  Divider,
  Tooltip,
  RadioGroup,
} from '@chakra-ui/react';
import { FiEdit, FiBook } from 'react-icons/fi';
import { getOriginParagraphsByRollId } from '~/models/paragraph';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest, created, serverError } from 'remix-utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { getTargetReferencesByRollId } from '~/models/reference';
import { OriginReference, ReferencePair } from '~/components/common/reference';
import { BiPlus } from 'react-icons/bi';
import {
  handleCreateBulkParagraph,
  handleGetLatestParagraphSK,
} from '~/services/__app/reference/$sutraId/$rollId';
import { composeIdForParagraph } from '~/models/utils';
import { utcNow, logger } from '~/utils';
import {
  handleCreateNewReference,
  handleUpdateReference,
} from '~/services/__app/reference/$sutraId/$rollId.staging';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { useTransitionState } from '../../../../hooks';
export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { rollId, sutraId } = params;
  if (!rollId || !sutraId) {
    throw badRequest({ message: 'roll id or sutra id cannot be empty' });
  }
  const roll = await getRollByPrimaryKey({ PK: sutraId ?? '', SK: rollId });
  const originParagraphs = await getOriginParagraphsByRollId(rollId);
  const targetReferences = await getTargetReferencesByRollId(rollId);
  // TODO: update language to match user's profile

  const targets = targetReferences
    .sort((a, b) => Number(new Date(a.createdAt || '')) - Number(new Date(b.createdAt || '')))
    .reduce((acc, cur) => {
      if (cur.paragraphId in acc) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        acc[cur.paragraphId].push(cur);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        acc[cur.paragraphId] = [cur];
      }
      return acc;
    }, {} as { [key: string]: CreatedType<Reference>[] });

  const origins = originParagraphs
    .sort((a, b) => {
      if (a.num !== b.num) {
        return a.num - b.num;
      }
      if (a.order && b.order) {
        return a?.order.localeCompare(b?.order);
      }
      return a.num - b.num;
    })
    ?.map(({ PK, SK, category, content, num, finish, order }) => ({
      PK,
      SK,
      order,
      category,
      content,
      num,
      finish,
    }));
  return json({
    origins,
    targets,
    roll,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  try {
    const user = await assertAuthUser(request);
    if (!user) {
      return redirect('/login');
    }
    const { rollId, sutraId } = params;
    if (!rollId || !sutraId) {
      throw badRequest({ message: 'roll id and sutra id must be provided' });
    }
    const formData = await request.formData();
    const entryData = Object.fromEntries(formData.entries());
    if (entryData?.intent === Intent.CREATE_BULK_PARAGRAPH) {
      const createParagraphs = JSON.parse(entryData.create as string) as {
        num: number;
        value: string;
        order?: string;
        SK?: string;
      }[];
      const orderTruth = createParagraphs.filter((p) => Boolean(p?.order));
      const latestSK = await handleGetLatestParagraphSK(rollId);

      const createdParagraph: CreateType<Paragraph>[] = createParagraphs
        ?.filter((paragraph) => paragraph.value)
        .map((paragraph, index) => {
          return {
            PK: rollId,
            SK:
              paragraph?.SK ??
              composeIdForParagraph({
                rollId,
                id: latestSK + index + 1,
              }),
            num: paragraph.num,
            order: `${orderTruth?.[0]?.order || paragraph.num}.${index}`,
            content: paragraph.value,
            category: 'NORMAL',
            sutra: sutraId,
            roll: rollId,
            finish: true,
            kind: 'PARAGRAPH',
            createdAt: utcNow(),
            updatedAt: utcNow(),
            updatedBy: user?.email,
            createdBy: user?.email,
          };
        });

      // max bulk insert is 25;
      const SEGMENT_SIZE = 25;
      for (let i = 0; i < createdParagraph.length; i += SEGMENT_SIZE) {
        const segment = createdParagraph.slice(i, i + SEGMENT_SIZE);
        await handleCreateBulkParagraph(segment);
      }
      return created({ data: {}, intent: Intent.CREATE_BULK_PARAGRAPH });
    }
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
    if (entryData?.intent === Intent.UPDATE_REFERENCE) {
      await handleUpdateReference({
        id: entryData?.id as string,
        content: entryData.content as string,
      });
      return json({ intent: Intent.UPDATE_REFERENCE });
    }
    return json({});
  } catch (error) {
    logger.error('reference.sutraId.rollId', 'error', error);
    if (error instanceof ConditionalCheckFailedException) {
      return badRequest({ message: 'you are using same key' });
    }
    return serverError({ message: 'internal server error' });
  }
};

export default function ReferenceRoute() {
  const { origins, targets, roll } = useLoaderData<{
    origins: CreatedType<Paragraph>[];
    targets: { [key: string]: CreatedType<Reference>[] };
    roll?: Roll;
  }>();

  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedParagraph, setSelectedParagraph] = useState('');

  const paragraphsComp = origins?.map((origin, index) => {
    if (origin) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const references = targets[origin.SK];
      if (references) {
        return (
          <Box key={index} w='85%'>
            <ReferencePair origin={origin} references={references} />
          </Box>
        );
      }
    }
    return (
      <Flex key={index} w={'85%'} flexDir={'row'} alignItems={'flex-start'} my={2}>
        <RadioGroup onChange={setSelectedParagraph} value={selectedParagraph}>
          <OriginReference
            selectedParagraph={selectedParagraph}
            SK={origin.SK}
            key={index}
            origin={origin.content}
          />
        </RadioGroup>
      </Flex>
    );
  });

  const selectedContent = useMemo(() => {
    return origins.find((origin) => origin.SK === selectedParagraph);
  }, [origins, selectedParagraph]);

  const startingIndex = useMemo(() => {
    const lastParagraph = origins[origins.length - 1];
    if (lastParagraph) {
      return parseInt(lastParagraph.SK.slice(lastParagraph.SK.length - 4)) + 1;
    } else {
      return 0;
    }
  }, [origins]);

  if (origins?.length) {
    return (
      <Flex
        w='100%'
        flexDir='column'
        justifyContent='flex-start'
        alignItems='center'
        gap={4}
        mt={10}
      >
        <Outlet context={{ modal: true }} />
        <Tooltip placement='left' label='Add a new paragraph'>
          <IconButton
            borderRadius={'50%'}
            w={12}
            h={12}
            pos={'fixed'}
            top={24}
            right={8}
            icon={<FiBook />}
            aria-label='add new paragraph'
            colorScheme={'iconButton'}
            onClick={() => onOpen()}
          />
        </Tooltip>
        {roll?.title ? <Heading size={'lg'}>{roll.title}</Heading> : null}
        {roll?.subtitle ? <Heading size={'md'}>{roll.subtitle}</Heading> : null}
        {paragraphsComp}
        <Tooltip placement='left' label='Add reference'>
          <IconButton
            borderRadius={'50%'}
            w={12}
            h={12}
            pos={'fixed'}
            bottom={8}
            right={8}
            icon={<FiEdit />}
            aria-label='edit roll'
            colorScheme={'iconButton'}
            onClick={() => {
              if (selectedParagraph) {
                navigate(`staging?p=${selectedParagraph}`, {
                  replace: true,
                });
              }
            }}
          />
        </Tooltip>
        <NewParagraphModal
          onClose={onClose}
          isOpen={isOpen}
          startingIndex={selectedContent ? selectedContent.num : startingIndex}
          selectedContent={selectedContent}
        />
      </Flex>
    );
  }
  return (
    <Flex w='100%' flexDir='column' justifyContent='flex-start' alignItems='center' gap={4}>
      {roll?.title ? <Heading size={'lg'}>{roll.title}</Heading> : null}
      {roll?.subtitle ? <Heading size={'md'}>{roll.subtitle}</Heading> : null}
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
      <NewParagraphModal onClose={onClose} isOpen={isOpen} startingIndex={1} />
    </Flex>
  );
}

interface InputState {
  id: string;
  value: string;
  num: number;
  SK?: string;
  order?: string;
}

export const NewParagraphModal = ({
  onClose,
  isOpen,
  startingIndex,
  selectedContent,
}: {
  onClose: () => void;
  isOpen: boolean;
  startingIndex: number;
  selectedContent?: CreatedType<Paragraph>;
}) => {
  const [inputs, setInputs] = useState<InputState[]>([
    {
      id: Math.random().toString(),
      value: '',
      num: startingIndex,
      order: '',
    },
  ]);

  useEffect(() => {
    if (selectedContent) {
      setInputs([
        {
          id: Math.random().toString(),
          value: selectedContent?.content,
          num: selectedContent?.num,
          SK: selectedContent.SK,
          order: selectedContent?.order || selectedContent.num.toString(),
        },
      ]);
    }
  }, [selectedContent]);

  const actionData = useActionData<{ intent: Intent }>();

  const handleInputChange = (id: string, event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInputs((prevInputs) =>
      prevInputs.map((input) => (input.id === id ? { ...input, value: newValue } : input))
    );
  };

  const handleAddClick = () => {
    const newInput = {
      id: Math.random().toString(),
      value: '',
      num: selectedContent?.num || inputs[inputs.length - 1].num + 1,
    };
    setInputs([...inputs, newInput]);
  };

  const submit = useSubmit();
  const handleSubmit = () => {
    submit(
      {
        intent: Intent.CREATE_BULK_PARAGRAPH,
        create: JSON.stringify(inputs),
      },
      { method: 'post' }
    );
    setInputs([{ id: Math.random().toString(), value: '', num: startingIndex }]);
  };

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_BULK_PARAGRAPH) {
      onClose();
    }
  }, [actionData, onClose]);

  const { isLoading } = useTransitionState();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Paragraph</ModalHeader>
        <Divider />
        <ModalCloseButton />
        <ModalBody>
          {inputs.map(({ id, value }) => (
            <Editable key={id} placeholder='click to edit' value={value} mb={2}>
              <EditablePreview bg={'secondary.300'} p={2} display={'block'} />
              <EditableTextarea id={id} onChange={(e) => handleInputChange(id, e)} value={value} />
            </Editable>
          ))}
        </ModalBody>

        <ModalFooter>
          <IconButton
            icon={<BiPlus />}
            aria-label='add-new-paragraph'
            mr={'auto'}
            onClick={handleAddClick}
            disabled={isLoading}
          />
          <Button colorScheme='blue' mr={3} onClick={handleSubmit} disabled={isLoading}>
            Submit
          </Button>
          <Button variant='ghost' onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
