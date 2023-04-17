import React from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatStrikethrough,
  MdFormatUnderlined,
} from 'react-icons/md';
import {
  getPluginType,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MarkToolbarButton,
} from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton
        tooltip={tooltip('Bold (⌘+B)')}
        type={getPluginType(editor, MARK_BOLD)}
        icon={<MdFormatBold />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Italic (⌘+I)')}
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<MdFormatItalic />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Underline (⌘+U)')}
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<MdFormatUnderlined />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Strikethrough (⌘+⇧+M)')}
        type={getPluginType(editor, MARK_STRIKETHROUGH)}
        icon={<MdFormatStrikethrough />}
      />
    </>
  );
};
