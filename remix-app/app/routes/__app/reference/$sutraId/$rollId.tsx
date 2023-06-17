import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { CreateType, Paragraph, Roll } from '~/types';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { json } from '@remix-run/node';
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
} from '@chakra-ui/react';
import { useRef } from 'react';
import { FiEdit, FiBook } from 'react-icons/fi';
import { getOriginParagraphsByRollId } from '~/models/paragraph';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest } from 'remix-utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { getTargetReferencesByRollId } from '~/models/reference';
import { OriginReference, ReferencePair } from '~/components/common/reference';
import { BiPlus } from 'react-icons/bi';
import { handleCreateBulkParagraph } from '~/services/__app/reference/$sutraId/$rollId';
import { composeIdForParagraph } from '~/models/utils';
import { utcNow } from '~/utils';
import { handleCreateNewReference } from '~/services/__app/reference/$sutraId/$rollId.staging';
export const loader = async ({ params }: LoaderArgs) => {
  const { rollId, sutraId } = params;
  if (rollId) {
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
          const objList = acc[cur.paragraphId];
          const contents = JSON.parse(cur.content);
          contents?.map((content: { name: unknown; content: unknown }) => {
            return objList?.forEach((obj: { name: unknown; content: unknown[] }) => {
              if (obj.name === content.name) {
                obj.content.push(content.content);
              }
            });
          });
        } else {
          // create new object is no id found
          const content = JSON.parse(cur.content);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const newContent = content.map((c) => ({
            name: c.name,
            content: [c.content],
          }));
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          acc[cur.paragraphId] = newContent;
        }
        return acc;
      }, {});
    const origins = originParagraphs?.map(({ PK, SK, category, content, num, finish }) => ({
      PK,
      SK,
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
  }

  return badRequest({ errors: { error: 'rollId is not provided' } });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { rollId = '', sutraId = '' } = params;
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_BULK_PARAGRAPH) {
    const sutra = entryData.sutra as string;
    const roll = entryData.roll as string;
    const rawParagraphs = JSON.parse(entryData.paragraphs as string) as {
      num: number;
      value: string;
    }[];
    const paragraphs: CreateType<Paragraph>[] = rawParagraphs?.map((paragraph) => ({
      PK: rollId,
      SK: composeIdForParagraph({ rollId, id: paragraph.num }),
      num: paragraph.num,
      content: paragraph.value,
      category: 'NORMAL',
      sutra,
      roll,
      finish: true,
      kind: 'PARAGRAPH',
      createdAt: utcNow(),
      updatedAt: utcNow(),
      updatedBy: user?.email,
      createdBy: user?.email,
    }));
    return await handleCreateBulkParagraph(paragraphs);
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
  return json({});
};

export type ParagraphLoadData = {
  PK: string;
  SK: string;
  num: string;
  finish: boolean;
  content: string;
  json: string;
  comments: [];
  paragraph?: string;
};
export default function ReferenceRoute() {
  const { origins, targets, roll } = useLoaderData<{
    origins: ParagraphLoadData[];
    targets: ParagraphLoadData[];
    roll?: Roll;
  }>();

  const navigate = useNavigate();
  const urlParams = useRef<URLSearchParams>(new URLSearchParams());

  const { isOpen, onOpen, onClose } = useDisclosure();

  const paragraphsComp = origins?.map((origin, index) => {
    if (origin) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const target = targets[origin.SK];
      if (target) {
        return (
          <Box key={origin.SK} w='85%'>
            <ReferencePair
              paragraphId={origin.SK}
              finish={false}
              origin={origin.content}
              references={target}
            />
          </Box>
        );
      }
    }
    return (
      <OriginReference
        urlParams={urlParams}
        SK={origin.SK}
        key={origin.content}
        origin={origin.content}
      />
    );
  });

  const getStartingIndex = () => {
    const lastParagraph = origins[origins.length - 1];
    return parseInt(lastParagraph.SK.slice(lastParagraph.SK.length - 4)) + 1;
  };
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
        {roll?.title ? <Heading size={'lg'}>{roll.title}</Heading> : null}
        {roll?.subtitle ? <Heading size={'md'}>{roll.subtitle}</Heading> : null}
        {paragraphsComp}
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
            navigate(`staging?${urlParams.current.toString()}`, {
              replace: true,
            });
          }}
        />
        <NewParagraphModal onClose={onClose} isOpen={isOpen} startingIndex={getStartingIndex()} />
      </Flex>
    );
  }
  return (
    <Flex w='100%' flexDir='column' justifyContent='flex-start' alignItems='center' gap={4} mt={10}>
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
}

export const NewParagraphModal = ({
  onClose,
  isOpen,
  startingIndex,
}: {
  onClose: () => void;
  isOpen: boolean;
  startingIndex: number;
}) => {
  const [inputs, setInputs] = useState<InputState[]>([
    { id: Math.random().toString(36).substring(7), value: 'click to edit', num: startingIndex },
  ]);

  const actionData = useActionData<{ intent: Intent }>();

  const handleInputChange = (id: string, event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInputs((prevInputs) =>
      prevInputs.map((input) => (input.id === id ? { ...input, value: newValue } : input))
    );
  };

  const handleAddClick = () => {
    const newInput = {
      id: Math.random().toString(36).substring(7),
      value: 'click to edit',
      num: inputs[inputs.length - 1].num + 1,
    };
    setInputs([...inputs, newInput]);
  };

  const submit = useSubmit();
  const handleSubmit = () => {
    submit(
      {
        intent: Intent.CREATE_BULK_PARAGRAPH,
        paragraphs: JSON.stringify(inputs),
        sutra: '',
        roll: '',
      },
      { method: 'post' }
    );
  };

  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_BULK_PARAGRAPH) {
      onClose();
    }
  }, [actionData, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Paragraph</ModalHeader>
        <Divider />
        <ModalCloseButton />
        <ModalBody>
          {inputs.map(({ id, value }) => (
            <Editable key={id} defaultValue={'click to edit'} mb={2}>
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
          />
          <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
