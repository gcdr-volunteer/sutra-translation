// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  IconButton,
  HStack,
  ListItem,
  OrderedList,
  UnorderedList,
  Heading,
  Text as CText,
} from '@chakra-ui/react';
import type { ReactElement } from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatStrikethrough,
  MdFormatUnderlined,
  MdLooksOne,
  MdLooksTwo,
} from 'react-icons/md';
import { useSlate } from 'slate-react';
import type { ReactEditor, RenderLeafProps, RenderElementProps } from 'slate-react';
import { Editor, Transforms, Element as SlateElement, Text } from 'slate';
import type { HistoryEditor } from 'slate-history';
import escapeHtml from 'escape-html';
import type { Node } from 'slate';
import { CommentBadge } from './commentbadge';

type EditorProps = Editor | ReactEditor | HistoryEditor;
const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const isBlockActive = (editor: EditorProps, format: string) => {
  const nodeGen = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  const node = nodeGen.next();
  while (!node.done) {
    return true;
  }
  return false;
};

const isMarkActive = (editor: EditorProps, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleBlock = (editor: EditorProps, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      LIST_TYPES.includes((!Editor.isEditor(n) && SlateElement.isElement(n) && n.type) as string),
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor: EditorProps, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const MarkButton = ({ format, icon }: { format: string; icon: ReactElement }) => {
  const editor = useSlate();
  return (
    <IconButton
      variant='outline'
      colorScheme='yellow'
      isActive={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      aria-label={format}
      icon={icon}
      borderWidth={0}
      fontSize={'20px'}
    />
  );
};

export const BlockButton = ({ format, icon }: { format: string; icon: ReactElement }) => {
  const editor = useSlate();
  return (
    <IconButton
      variant='outline'
      colorScheme='yellow'
      isActive={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      aria-label={format}
      icon={icon}
      borderWidth={0}
      fontSize={'20px'}
    />
  );
};

export const Toolbar = () => {
  return (
    <HStack borderWidth={'0 0 1px 0'} padding={'10px 5px'} spacing={'5px'} wrap={'wrap'}>
      <MarkButton format='bold' icon={<MdFormatBold />} />
      <MarkButton format='italic' icon={<MdFormatItalic />} />
      <MarkButton format='underline' icon={<MdFormatUnderlined />} />
      <MarkButton format='strike' icon={<MdFormatStrikethrough />} />
      <BlockButton format='heading-one' icon={<MdLooksOne />} />
      <BlockButton format='heading-two' icon={<MdLooksTwo />} />
      <BlockButton format='numbered-list' icon={<MdFormatListNumbered />} />
      <BlockButton format='bulleted-list' icon={<MdFormatListBulleted />} />
    </HStack>
  );
};

export const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'list-item':
      return <ListItem {...attributes}>{children}</ListItem>;
    case 'numbered-list':
      return <OrderedList {...attributes}>{children}</OrderedList>;
    case 'bulleted-list':
      return <UnorderedList {...attributes}>{children}</UnorderedList>;
    case 'heading-one':
      return (
        <Heading as='h3' size='xl' {...attributes}>
          {children}
        </Heading>
      );
    case 'heading-two':
      return (
        <Heading as='h4' size='lg' {...attributes}>
          {children}
        </Heading>
      );
    default:
      return (
        <CText lineHeight={1.8} fontSize={'xl'} {...attributes}>
          {children}
        </CText>
      );
  }
};

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.highlight) {
    children = (
      <>
        <span style={{ backgroundColor: 'yellow' }}>{children}</span>;
        {leaf.router ? (
          <CommentBadge router={leaf.router} showIndicator={leaf.showIndicator} />
        ) : null}
      </>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strike) {
    children = <del>{children}</del>;
  }

  return <span {...attributes}>{children}</span>;
};

export const serialize = (node: Node): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<i>${string}</i>`;
    }
    if (node.underline) {
      string = `<underline>${string}</underline>`;
    }
    if (node.strike) {
      string = `<del>${string}</del>`;
    }
    return string;
  }

  const children = node.children?.map((child) => serialize(child)).join('');
  switch (node.type) {
    case 'paragraph':
      return `<p style="font-size:1.5rem;line-height:1.5;display:inline">${children}</p>`;
    default:
      return children;
  }
};
