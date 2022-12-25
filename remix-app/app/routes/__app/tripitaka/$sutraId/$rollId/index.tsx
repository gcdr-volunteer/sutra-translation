import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, useEditable, Box, Container } from '@chakra-ui/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';
import { getAllCommentsForRoll } from '~/models/comment';
import { logger } from '~/utils';
import { handleNewComment } from '~/services/__app/tripitaka/$sutraId/$rollId';
import { Comment } from '~/types/comment';
import { Element } from 'react-scroll';

export const loader = async ({ params }: LoaderArgs) => {
  const { rollId } = params;
  const originParagraphs = await getOriginParagraphsByRollId(rollId!);
  const targetParagraphs = await getTargetParagraphsByRollId(rollId!);
  const targetComments = await getAllCommentsForRoll(rollId?.replace('ZH', 'EN')!);
  const origins = originParagraphs?.map(({ PK, SK, category, content, num }) => ({
    PK,
    SK,
    category,
    content,
    num,
  }));
  const targets = targetParagraphs?.map(({ category, content, num, SK }) => {
    const comments = targetComments.filter((comment) => comment?.paragraphId === SK);
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
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === 'new_comment') {
    const newComment = {
      ...entryData,
      targets: [entryData?.targets],
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
  const {
    data: { origins, targets, footnotes },
  } = useLoaderData<{
    data: {
      origins: ParagraphLoadData[];
      targets: ParagraphLoadData[];
      footnotes: [];
    };
  }>();
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
    const target = targets[index];
    const ref = refs[`#${target?.SK}`];
    if (target) {
      return (
        <Box w="90%" ref={ref}>
          <ParagraphPair key={origin.SK} origin={origin} target={target} footnotes={footnotes} />
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
