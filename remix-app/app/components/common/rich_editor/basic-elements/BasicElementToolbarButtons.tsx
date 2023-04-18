import React from 'react';
import {
  BlockToolbarButton,
  CodeBlockToolbarButton,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  getPluginType,
  useEventPlateId,
} from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';
import {
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdLooks4,
  MdLooks5,
  MdOutlineCode,
} from 'react-icons/md';

const tooltip = (content: string) => ({
  content,
});
export const BasicElementToolbarButtons = () => {
  const editor = useMyPlateEditorRef(useEventPlateId());

  return (
    <>
      <BlockToolbarButton
        tooltip={tooltip('Heading 1')}
        type={getPluginType(editor, ELEMENT_H1)}
        icon={<MdLooksOne />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 2')}
        type={getPluginType(editor, ELEMENT_H2)}
        icon={<MdLooksTwo />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 3')}
        type={getPluginType(editor, ELEMENT_H3)}
        icon={<MdLooks3 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 4')}
        type={getPluginType(editor, ELEMENT_H4)}
        icon={<MdLooks4 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 5')}
        type={getPluginType(editor, ELEMENT_H5)}
        icon={<MdLooks5 />}
      />
      <CodeBlockToolbarButton icon={<MdOutlineCode />} />
    </>
  );
};
