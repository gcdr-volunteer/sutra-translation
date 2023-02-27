import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { Footnote, Roll } from '~/types';
import type { Comment } from '~/types/comment';
import type { MutableRefObject } from 'react';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box, Heading } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId } from '~/models/paragraph';
import { handleNewComment } from '~/services/__app/tripitaka/$sutraId/$rollId';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest } from 'remix-utils';
import { utcNow } from '~/utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { getTargetReferencesByRollId } from '~/models/reference';
export const loader = async ({ params }: LoaderArgs) => {
  const { rollId, sutraId } = params;
  if (rollId) {
    const roll = await getRollByPrimaryKey({ PK: sutraId ?? '', SK: rollId });
    const originParagraphs = await getOriginParagraphsByRollId(rollId);
    const targetReferences = await getTargetReferencesByRollId(rollId);
    // TODO: update language to match user's profile

    const origins = originParagraphs?.map(({ PK, SK, category, content, num, finish }) => ({
      PK,
      SK,
      category,
      content,
      num,
      finish,
    }));
    const targets = targetReferences
      ?.sort((a, b) => {
        if (a.SK && b.SK) {
          if (a.SK > b.SK) {
            return 1;
          }
          if (a.SK < b.SK) {
            return -1;
          }
          return 0;
        }
        return 0;
      })
      .filter(({ finish }) => finish)
      .map(({ content, SK, finish, paragraph }) => {
        return {
          content: paragraph ?? content,
          SK,
          finish,
        };
      });
    return json({
      origins,
      targets,
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
  paragraph?: string;
};
export default function ParagraphRoute() {
  const { origins, targets, roll } = useLoaderData<{
    origins: ParagraphLoadData[];
    targets: ParagraphLoadData[];
    footnotes: Footnote[];
    roll?: Roll;
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

  const params = new URLSearchParams();

  const paragraphsComp = origins?.map((origin, index) => {
    // TODO: handle out of order selection
    const target = targets[index];
    if (target && target?.finish) {
      return (
        <Box key={origin.SK} w='85%'>
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
        params={params}
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
            navigate(`staging?${params.toString()}`, {
              replace: true,
            });
          }}
        />
      </Flex>
    );
  }
  return <div>Roll</div>;
}
