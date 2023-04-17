import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Footnote, Roll } from '~/types';
import type { Comment } from '~/types/comment';
import type { MutableRefObject } from 'react';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box, Heading, useToast } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';
import { getAllCommentsByParentId, getAllRootCommentsForRoll } from '~/models/comment';
import { handleNewComment } from '~/services/__app/tripitaka/$sutraId/$rollId';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest } from 'remix-utils';
import { utcNow } from '~/utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { getFootnotesByPartitionKey } from '~/models/footnote';
import { Can } from '~/authorisation';
export const loader = async ({ params }: LoaderArgs) => {
  const { rollId, sutraId } = params;
  if (rollId) {
    const roll = await getRollByPrimaryKey({ PK: sutraId ?? '', SK: rollId });
    const originParagraphs = await getOriginParagraphsByRollId(rollId);
    const targetParagraphs = await getTargetParagraphsByRollId(rollId);
    const footnotes = await getFootnotesByPartitionKey(rollId.replace('ZH', 'EN'));
    // TODO: update language to match user's profile
    const rootComments = await getAllRootCommentsForRoll(rollId.replace('ZH', 'EN'));

    const lastMessages = await Promise.all(
      rootComments.map(async (comment) => {
        const comments = await getAllCommentsByParentId(comment.id);
        return comments.at(-1);
      })
    );

    const origins = originParagraphs?.map(({ PK, SK, category, content, num, finish }) => ({
      PK,
      SK,
      category,
      content,
      num,
      finish,
    }));
    const targets = targetParagraphs?.map(({ category, content, num, SK, finish, json }) => {
      const comments = rootComments.filter(
        (comment) => comment?.paragraphId === SK && !comment?.resolved
      );
      return {
        comments,
        category,
        content,
        num,
        SK,
        finish,
        json,
      };
    });
    return json({
      footnotes,
      origins,
      targets,
      lastMessages,
      roll,
    });
  }

  return badRequest({ errors: { error: 'rollId is not provided' } });
};

export const action = async ({ request }: ActionArgs) => {
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
      lastMessage: utcNow(),
    };
    return await handleNewComment(newComment as unknown as Comment);
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
        if (nums[i] + 1 !== nums[i + 1]) {
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
          <ParagraphPair origin={origin} target={target} footnotes={[]} />
        </Box>
      );
    }
    return (
      <ParagraphOrigin
        content={origin?.content}
        key={origin.SK}
        index={index}
        SK={origin.SK}
        footnotes={[]}
        urlParams={urlParams}
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
        {roll?.title ? <Heading size={'lg'}>{roll.title}</Heading> : null}
        {roll?.subtitle ? <Heading size={'md'}>{roll.subtitle}</Heading> : null}
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
  return <div>Roll</div>;
}
