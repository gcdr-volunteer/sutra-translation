import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, Flex, Checkbox, useBoolean, useDisclosure, Heading } from '@chakra-ui/react';
import { FormModal } from '~/components/common';
import { Comment } from './comment';
import type { MutableRefObject } from 'react';
import type { Comment as TComment, CreatedType, Footnote } from '~/types';
import { Intent } from '~/types/common';
import { SText } from './textwithfootnotes';
import type { Node } from 'slate';
import { RTEditor } from './editor';
type TextSelection = {
  start?: number;
  end?: number;
  selectedText?: string;
};

export const ParagraphTarget = ({
  paragraphId,
  comments,
  footnotes,
  toggle,
  json,
  background,
}: {
  paragraphId: string;
  comments: TComment[];
  footnotes: Footnote[];
  json: string;
  toggle?: boolean;
  background?: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = useState<Node[]>([]);

  useEffect(() => {
    if (json) {
      setValue(JSON.parse(json));
    }
  }, [json]);

  const [selectedText, setSelectedText] = useState<TextSelection>({});
  const {
    onOpen: onNewCommentOpen,
    onClose: onNewCommentClose,
    isOpen: isNewCommentOpen,
  } = useDisclosure();

  const handleMouseUp = useCallback(() => {
    const selection = document.getSelection();
    if (selection?.toString() !== '') {
      const data = selection?.anchorNode?.nodeValue as string;
      const { baseOffset, extentOffset } = (selection || {}) as {
        baseOffset: number;
        extentOffset: number;
      };
      const [start, end] =
        baseOffset > extentOffset ? [extentOffset, baseOffset] : [baseOffset, extentOffset];
      const selectedText = data?.slice(start, end);
      selectedText.trim().length && onNewCommentOpen();
      setSelectedText((prev) => ({ ...prev, start, end, selectedText }));
    }
  }, [onNewCommentOpen]);
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      borderRadius={toggle || background ? 12 : 0}
      p={4}
      flexDir={'row'}
      gap={8}
      position={'relative'}
    >
      {json ? (
        <RTEditor
          key={json}
          highlights={comments.map((comment) => ({
            text: comment.content,
            router: `${paragraphId}/${comment.id}`,
            showIndicator: false,
          }))}
          json={json}
          readonly={true}
          onMouseUp={handleMouseUp}
        />
      ) : null}
      <FormModal
        value={Intent.CREATE_COMMENT}
        header='Add comment'
        body={<Comment paragraphId={paragraphId} {...selectedText} json={json} />}
        isOpen={isNewCommentOpen}
        onClose={onNewCommentClose}
      />
    </Flex>
  );
};

export const Paragraph = ({
  content,
  toggle,
  background,
  footnotes = [],
  category,
}: {
  content: string;
  toggle?: boolean;
  background?: string;
  footnotes?: CreatedType<Footnote>[];
  category?: string;
}) => {
  return (
    <Flex
      flex={1}
      background={toggle ? 'primary.300' : background ?? 'inherit'}
      p={4}
      borderRadius={toggle || background ? 12 : 0}
      flexDir={'row'}
      w='100%'
    >
      {category?.startsWith('HEAD') ? (
        // TODO: this needs improvements
        <Heading as={category === 'HEAD1' ? 'h3' : 'h4'} size={'md'}>
          <SText footnotes={footnotes} text={content} />
        </Heading>
      ) : (
        <Text
          fontFamily={
            category === 'PREFACE' ? 'monospace' : category === 'BYLINE' ? 'serif' : 'mono'
          }
          as={category === 'PREFACE' ? 'i' : category === 'BYLINE' ? 'cite' : undefined}
          flex={1}
          color={toggle ? 'white' : 'inherit'}
          lineHeight={1.8}
          fontSize={'xl'}
        >
          <SText footnotes={footnotes} text={content} />
        </Text>
      )}
    </Flex>
  );
};

export const ParagraphOrigin = ({
  content,
  footnotes,
  index,
  background,
  urlParams,
  SK,
}: {
  content: string;
  footnotes: string[];
  index: number;
  background?: string;
  urlParams: MutableRefObject<URLSearchParams>;
  SK?: string;
}) => {
  const [toggle, setToggle] = useBoolean(false);
  useMemo(() => {
    if (toggle) {
      const urls = urlParams.current.getAll('p');
      if (!urls.includes(SK ?? '')) {
        urlParams.current.append('p', SK ?? '');
      }
      const paramsArray = Array.from(urlParams.current.entries());
      paramsArray.sort((a, b) => a[1].localeCompare(b[1]));
      urlParams.current = new URLSearchParams(paramsArray);
    } else {
      const newParams = new URLSearchParams();
      for (const [key, value] of urlParams.current.entries()) {
        if (value !== SK) {
          newParams.append(key, value);
        }
      }
      urlParams.current = newParams;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);
  return (
    <Flex w={'85%'} flexDir={'row'} alignItems={'flex-start'}>
      <Checkbox ml={-6} borderColor={'primary.300'} onChange={setToggle.toggle}>
        <Paragraph content={content} toggle={toggle} background={background} />
      </Checkbox>
    </Flex>
  );
};

export const ParagraphPair = ({
  origin,
  target,
  footnotes,
}: {
  origin: {
    content: string;
    SK: string;
    comments: TComment[];
  };
  target: {
    content: string;
    comments: TComment[];
    json: string;
  };
  footnotes: string[];
}) => {
  return (
    <Flex flexDir={'row'} gap={4}>
      <Paragraph background='secondary.300' content={origin?.content} footnotes={[]} />
      <ParagraphTarget
        json={target.json}
        paragraphId={origin.SK}
        background='secondary.200'
        comments={target?.comments || []}
        footnotes={[]}
      />
    </Flex>
  );
};
