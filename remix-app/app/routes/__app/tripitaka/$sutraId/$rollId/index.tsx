import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box } from '@chakra-ui/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';
import { getAllCommentsForRoll } from '~/models/comment';
import {
  handleNewComment,
  handleResolveComment,
} from '~/services/__app/tripitaka/$sutraId/$rollId';
import { Comment } from '~/types/comment';
import { assertAuthUser } from '~/auth.server';
import { useEventSource } from 'remix-utils';
import { Intent } from '~/types/common';

export const loader = async ({ params }: LoaderArgs) => {
  const { rollId } = params;
  const originParagraphs = await getOriginParagraphsByRollId(rollId!);
  const targetParagraphs = await getTargetParagraphsByRollId(rollId!);
  // TODO: update language to match user's profile
  const targetComments = await getAllCommentsForRoll(rollId?.replace('ZH', 'EN')!);
  const origins = originParagraphs?.map(({ PK, SK, category, content, num }) => ({
    PK,
    SK,
    category,
    content,
    num,
  }));
  const targets = targetParagraphs?.map(({ category, content, num, SK }) => {
    const comments = targetComments.filter(
      (comment) => comment?.paragraphId === SK && !comment?.resolved
    );
    return {
      comments,
      category,
      content,
      num,
      SK,
    };
  });
  return json({
    data: {
      footnotes: [],
      origins,
      targets,
    },
  });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await assertAuthUser(request);
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.CREATE_COMMENT) {
    const newComment = {
      ...entryData,
      targets: [entryData?.targets],
      createdBy: user?.SK,
      updatedBy: user?.SK,
      creatorAlias: user?.username,
    };
    return await handleNewComment(newComment as unknown as Comment);
  }
  if (entryData?.intent === Intent.CREATE_MESSAGE) {
    if (entryData?.resolved && entryData?.SK) {
      return await handleResolveComment(entryData.SK as string);
    }
    return json({});
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
  const {
    data: { origins, targets, footnotes },
  } = useLoaderData<{
    data: {
      origins: ParagraphLoadData[];
      targets: ParagraphLoadData[];
      footnotes: [];
    };
  }>();
  // const time = useEventSource('/sse/time', { event: 'time' });
  const navigate = useNavigate();
  const checkedParagraphs = useRef(new Set<number>());

  const location = useLocation();
  const refs = targets?.reduce((acc, cur) => {
    acc[`#${cur.SK}`] = useRef<HTMLDivElement>(null);
    return acc;
  }, {} as Record<string, MutableRefObject<HTMLDivElement | null>>);

  useEffect(() => {
    if (location?.hash) {
      refs[location.hash].current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [location?.hash]);

  const paragraphsComp = origins?.map((origin, index) => {
    // TODO: handle out of order selection
    const target = targets[index];
    const ref = refs[`#${target?.SK}`];
    if (target) {
      return (
        <Box key={origin.SK} w="85%" ref={ref}>
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
        w="100%"
        flexDir="column"
        justifyContent="flex-start"
        alignItems="center"
        gap={4}
        mt={10}
      >
        {paragraphsComp}
        <IconButton
          borderRadius={'50%'}
          w={12}
          h={12}
          pos={'fixed'}
          bottom={8}
          right={8}
          icon={<FiEdit />}
          aria-label="edit roll"
          colorScheme={'iconButton'}
          onClick={() => {
            navigate(`staging`, {
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
