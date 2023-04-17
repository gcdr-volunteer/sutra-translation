import React from 'react';
import { focusEditor, indent, outdent, ToolbarButton } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';
import { MdFormatIndentDecrease, MdFormatIndentIncrease } from 'react-icons/md';

const tooltip = (content: string) => ({
  content,
});

export const IndentToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        tooltip={tooltip('Outdent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          outdent(editor);

          focusEditor(editor);
        }}
        icon={<MdFormatIndentDecrease />}
      />
      <ToolbarButton
        tooltip={tooltip('Indent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          indent(editor);
          focusEditor(editor);
        }}
        icon={<MdFormatIndentIncrease />}
      />
    </>
  );
};
