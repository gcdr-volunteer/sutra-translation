import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Footnote, Roll } from '~/types';
import type { Comment, Message } from '~/types/comment';
import type { MutableRefObject } from 'react';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box, Heading, useToast } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';
import { getAllRootCommentsForRoll } from '~/models/comment';
import {
  handleNewComment,
  handleNewMessage,
  handleResolveComment,
} from '~/services/__app/tripitaka/$sutraId/$rollId';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest } from 'remix-utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { getFootnotesByPartitionKey } from '~/models/footnote';
import { Can } from '~/authorisation';
import { useSetTheme } from '~/hooks';
export const loader = async ({ params }: LoaderArgs) => {
  const { sutraId, rollId } = params;
  if (rollId) {
    const roll = await getRollByPrimaryKey({ PK: sutraId ?? '', SK: rollId });
    const originParagraphs = await getOriginParagraphsByRollId(rollId);
    const targetParagraphs = await getTargetParagraphsByRollId(rollId);
    const footnotes = await getFootnotesByPartitionKey(rollId.replace('ZH', 'EN'));
    // TODO: update language to match user's profile
    const rootComments = await getAllRootCommentsForRoll(rollId.replace('ZH', 'EN'));

    const origins = originParagraphs?.map(({ PK, SK, category, content, num, finish }) => ({
      PK,
      SK,
      category,
      content,
      num,
      finish,
    }));
    const targets = targetParagraphs?.map(({ category, content, num, SK, finish }) => {
      const comments = rootComments.filter(
        (comment) => comment?.paragraphId === SK && !comment?.resolved
      );
      comments.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (a.createdAt! < b.createdAt!) {
          return -1;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        } else if (a.createdAt! > b.createdAt!) {
          return 1;
        } else {
          return 0;
        }
      });

      return {
        comments,
        category,
        content,
        num,
        SK,
        finish,
      };
    });
    return json({
      footnotes,
      origins,
      targets,
      roll,
    });
  }

  return badRequest({ errors: { error: 'rollId is not provided' } });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { sutraId = '', rollId = '' } = params;
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_COMMENT) {
    const ping = entryData?.ping ? [entryData?.ping] : ['ALL'];
    const newComment = {
      ...entryData,
      ping,
      createdBy: user?.SK,
      updatedBy: user?.SK,
      creatorAlias: user?.username ?? '',
    };
    return await handleNewComment(newComment as unknown as Comment);
  }
  if (entryData?.intent === Intent.UPDATE_COMMENT) {
    const paragraphId = (entryData?.paragraphId as unknown as string) || '';
    const newComment = {
      rollId,
      paragraphId,
      commentId: entryData.commentId as string,
      before: entryData.before as string,
      after: entryData.after as string,
      createdBy: user?.email ?? '',
      updatedBy: user?.email ?? '',
    };
    return await handleResolveComment(newComment);
  }

  if (entryData?.intent === Intent.CREATE_MESSAGE) {
    const paragraphId = (entryData?.paragraphId as unknown as string) || '';
    const newMessage = {
      ...entryData,
      sutraId,
      rollId,
      paragraphId,
      createdBy: user?.email,
      updatedBy: user?.email,
    };
    return await handleNewMessage(newMessage as unknown as Message);
  }
  return json({});
};

export type ParagraphLoadData = {
  PK: string;
  SK: string;
  num: string;
  finish: boolean;
  content: string;
  comments: [];
  json: string;
};
export default function ParagraphRoute() {
  const { origins, targets, roll } = useLoaderData<{
    origins: ParagraphLoadData[];
    targets: ParagraphLoadData[];
    footnotes: Footnote[];
    roll?: Roll;
  }>();

  const { fontSize, fontFamilyOrigin, fontFamilyTarget } = useSetTheme();

  const toast = useToast();

  const navigate = useNavigate();
  const urlParams = useRef(new URLSearchParams());

  const location = useLocation();
  const refs = targets?.reduce((acc, cur) => {
    // TODO: (low) should have a better way to do this
    // eslint-disable-next-line react-hooks/rules-of-hooks
    acc[`#${cur.SK}`] = useRef<HTMLDivElement>(null);
    return acc;
  }, {} as Record<string, MutableRefObject<HTMLDivElement | null>>);

  useEffect(() => {
    if (location?.hash) {
      refs[location.hash].current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [location.hash, refs]);

  const handleNavigate = () => {
    const isMonotone = (arrays: string[]) => {
      const nums = arrays.map((element) => Number(element.slice(element.length - 4)));
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] + 1 < nums[i + 1]) {
          return false;
        }
      }
      return true;
    };
    let allowNavigate = true;
    if (targets.length) {
      const lastTarget = targets[targets.length - 1];
      const arrays = Array.from(urlParams.current.values());
      arrays.push(lastTarget.SK);
      arrays.sort();
      allowNavigate = isMonotone(arrays);
    }
    if (!targets.length) {
      if (!urlParams.current.toString().includes(origins?.[0].SK)) {
        allowNavigate = false;
      }
    }
    allowNavigate
      ? navigate(`staging?${urlParams.current.toString()}`, {
          replace: true,
        })
      : toast({
          title: 'Oops, you cannot progress',
          description: 'You have to edit paragraphs by order',
          status: 'warning',
        });
  };

  const paragraphsComp = origins?.map((origin, index) => {
    // TODO: handle out of order selection
    const target = targets[index];
    const ref = refs[`#${target?.SK}`];
    if (target && target?.finish) {
      return (
        <Box key={origin.SK} w='85%' ref={ref}>
          <ParagraphPair
            origin={origin}
            target={target}
            footnotes={[]}
            font={{ fontSize, fontFamilyOrigin, fontFamilyTarget }}
          />
        </Box>
      );
    }
    return (
      <ParagraphOrigin
        content={origin?.content}
        key={origin.SK}
        index={index}
        SK={origin.SK}
        urlParams={urlParams}
        font={{ fontSize, fontFamilyOrigin, fontFamilyTarget }}
      />
    );
  });
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
        {roll?.title ? (
          <Heading size={'lg'} fontFamily={fontFamilyOrigin}>
            {roll.title}
          </Heading>
        ) : null}
        {roll?.subtitle ? (
          <Heading size={'md'} fontFamily={fontFamilyOrigin}>
            {roll.subtitle}
          </Heading>
        ) : null}
        {paragraphsComp}
        <Can I='Create' this='Paragraph'>
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
            onClick={handleNavigate}
          />
        </Can>
      </Flex>
    );
  }
  return <div>Volunteers are working on this roll</div>;
}
