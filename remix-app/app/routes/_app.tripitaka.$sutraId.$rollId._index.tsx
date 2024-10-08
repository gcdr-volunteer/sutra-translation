import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { CreatedType, Footnote, Paragraph as TParagraph, Roll, Comment } from '~/types';
import type { Message } from '~/types/comment';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconButton, Flex, Box, Heading, Tooltip, RadioGroup } from '@chakra-ui/react';
import { useState } from 'react';
import { ParagraphOrigin, ParagraphPair } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';
import { fetchParagraphsByRollId } from '~/models/paragraph';
import type { ParagraphLoaderData, Paragraphs } from '~/models/paragraph';
import {
  handleNewComment,
  handleNewMessage,
  handleResolveComment,
} from '~/services/__app/tripitaka/$sutraId/$rollId';
import { assertAuthUser } from '~/auth.server';
import { Intent } from '~/types/common';
import { badRequest } from 'remix-utils';
import { getRollByPrimaryKey } from '~/models/roll';
import { Can } from '~/authorisation';
import { useScrollToParagraph, useSetTheme } from '~/hooks';
import { handleUpdateParagraph } from '../services/__app/tripitaka/$sutraId/$rollId/staging';
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { sutraId, rollId } = params;
  if (rollId) {
    const roll = await getRollByPrimaryKey({ PK: sutraId ?? '', SK: rollId });
    const paragraphs = await fetchParagraphsByRollId(rollId, user);
    return json({
      footnotes: [],
      paragraphs,
      roll,
    });
  }

  return badRequest({ errors: { error: 'rollId is not provided' } });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  const { sutraId = '', rollId = '' } = params;
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
    return await handleNewComment(newComment as unknown as Comment, user);
  }
  if (entryData?.intent === Intent.UPDATE_COMMENT_AND_PARAGRAPH) {
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
    return await handleResolveComment(newComment, user);
  }

  if (entryData?.intent === Intent.UPDATE_PARAGRAPH) {
    const { paragraphId, content } = entryData;
    const newParagraph = {
      rollId: rollId.replace(user.origin_lang, user.target_lang),
      paragraphId: (paragraphId as string).replace(user.origin_lang, user.target_lang),
      content: content as string,
      updatedBy: user?.email,
    };
    return handleUpdateParagraph(newParagraph);
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
    return await handleNewMessage(newMessage as unknown as Message, user);
  }
  return json({});
};

export default function ParagraphRoute() {
  const { paragraphs, roll } = useLoaderData<{
    paragraphs: Paragraphs;
    footnotes: Footnote[];
    roll?: Roll;
  }>();

  const { fontSize, fontFamilyOrigin, fontFamilyTarget } = useSetTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedParagraph, setSelectedParagraph] = useState('');

  const paragraphsComp = paragraphs?.map(({ origin, target }, index) => {
    // TODO: handle out of order selection
    if (target && target?.finish) {
      return <ParagraphWithComments key={target.SK} origin={origin} target={target} />;
    }
    return (
      <Flex key={index} w={'85%'} flexDir={'row'} alignItems={'flex-start'} my={2}>
        <RadioGroup onChange={setSelectedParagraph} value={selectedParagraph}>
          <ParagraphOrigin
            content={origin?.content}
            SK={origin.SK}
            index={index}
            selectedParagraph={selectedParagraph}
            font={{ fontSize, fontFamilyOrigin, fontFamilyTarget }}
          />
        </RadioGroup>
      </Flex>
    );
  });
  if (paragraphs?.length) {
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
          <Tooltip label='Click to translate' placement='left'>
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
                  navigate(`${location.pathname}/${selectedParagraph}`, {
                    replace: false,
                  });
                }
              }}
            />
          </Tooltip>
        </Can>
      </Flex>
    );
  }
  return <div>Volunteers are working on this roll</div>;
}

export const ParagraphWithComments = ({
  origin,
  target,
}: {
  origin: CreatedType<TParagraph>;
  target: Required<ParagraphLoaderData>['target'];
}) => {
  const { ref } = useScrollToParagraph(target?.SK);

  return (
    <Box key={origin.SK} w='85%' ref={ref}>
      <ParagraphPair origin={origin} target={target} footnotes={[]} />
    </Box>
  );
};
