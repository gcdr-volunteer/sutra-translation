import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';
import { getAllCommentsByParentId, getAllRootCommentsForRoll } from '~/models/comment';
import { handleNewComment } from '~/services/__app/tripitaka/$sutraId/$rollId';
import type { Comment } from '~/types/comment';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { MutableRefObject } from 'react';
import { badRequest } from 'remix-utils';
import { utcNow } from '~/utils';

export const loader = async ({ params }: LoaderArgs) => {
  const { rollId } = params;
  if (rollId) {
    const originParagraphs = await getOriginParagraphsByRollId(rollId);
    const targetParagraphs = await getTargetParagraphsByRollId(rollId);
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
    const targets = targetParagraphs?.map(({ category, content, num, SK, finish }) => {
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
      };
    });
    return json({
      footnotes: [],
      origins,
      targets,
      lastMessages,
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
};
export default function RollRoute() {
  const { origins, targets, footnotes } = useLoaderData<{
    origins: ParagraphLoadData[];
    targets: ParagraphLoadData[];
    footnotes: [];
  }>();

  const navigate = useNavigate();
  const checkedParagraphs = useRef(new Set<number>());

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

  const paragraphsComp = origins?.map((origin, index) => {
    // TODO: handle out of order selection
    const target = targets[index];
    const ref = refs[`#${target?.SK}`];
    if (target && target?.finish) {
      return (
        <Box key={origin.SK} w='85%' ref={ref}>
          <ParagraphPair origin={origin} target={target} footnotes={footnotes} />
        </Box>
      );
    }
    return (
      <ParagraphOrigin
        content={origin?.content}
        key={origin.SK}
        index={index}
        footnotes={footnotes}
        checkedParagraphs={checkedParagraphs}
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
            navigate(`staging`, {
              replace: true,
              state: {
                paragraphs: Array.from(checkedParagraphs.current)
                  .sort()
                  .map((index) => origins[index]),
              },
            });
          }}
        />
      </Flex>
    );
  }
  return <div>Roll</div>;
}
