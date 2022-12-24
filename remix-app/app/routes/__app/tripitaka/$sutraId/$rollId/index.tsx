import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { Text, IconButton, Flex, Checkbox, useBoolean } from '@chakra-ui/react';
import { useRef } from 'react';
import { Paragraph, ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { getOriginParagraphsByRollId, getTargetParagraphsByRollId } from '~/models/paragraph';

export const loader = async ({ params }: LoaderArgs) => {
  const { rollId } = params;
  const originParagraphs = await getOriginParagraphsByRollId(rollId!);
  const targetParagraphs = await getTargetParagraphsByRollId(rollId!);
  const origins = originParagraphs?.map(({ category, content, num }) => ({
    category,
    content,
    num,
  }));
  const targets = targetParagraphs?.map(({ category, content, num }) => ({
    category,
    content,
    num,
  }));
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
  return json({});
};
export default function RollRoute() {
  const {
    data: { origins, targets, footnotes },
  } = useLoaderData<{
    data: {
      origins: {
        num: string;
        finish: boolean;
        content: string;
        comments: [];
      }[];
      targets: {
        num: string;
        finish: boolean;
        content: string;
        comments: [];
      }[];
      footnotes: [];
    };
  }>();
  const navigate = useNavigate();
  const checkedParagraphs = useRef(new Set<number>());

  const paragraphsComp = origins?.map((origin, index) => {
    const target = targets[index];
    if (target) {
      return <ParagraphPair origin={origin} target={target} footnotes={footnotes} />;
    }
    return (
      <ParagraphOrigin
        content={origin?.content}
        comments={origin?.comments}
        key={origin.num}
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
