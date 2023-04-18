import React from 'react';
import type { TippyProps } from '@tippyjs/react';
import {
  BalloonToolbar,
  getPluginType,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MarkToolbarButton,
} from '@udecode/plate';
import type { BalloonToolbarProps, WithPartial } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined } from 'react-icons/md';

export const markTooltip: TippyProps = {
  arrow: true,
  delay: 0,
  duration: [200, 0],
  hideOnClick: false,
  offset: [0, 17],
  placement: 'top',
};

export const MarkBalloonToolbar = (props: WithPartial<BalloonToolbarProps, 'children'>) => {
  const { children, ...balloonToolbarProps } = props;

  const editor = useMyPlateEditorRef();

  const arrow = false;
  const theme = 'dark';

  const boldTooltip: TippyProps = { content: 'Bold (⌘+B)', ...markTooltip };
  const italicTooltip: TippyProps = { content: 'Italic (⌘+I)', ...markTooltip };
  const underlineTooltip: TippyProps = {
    content: 'Underline (⌘+U)',
    ...markTooltip,
  };

  return (
    <BalloonToolbar theme={theme} arrow={arrow} {...balloonToolbarProps}>
      <MarkToolbarButton
        type={getPluginType(editor, MARK_BOLD)}
        icon={<MdFormatBold />}
        tooltip={boldTooltip}
        actionHandler='onMouseDown'
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<MdFormatItalic />}
        tooltip={italicTooltip}
        actionHandler='onMouseDown'
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<MdFormatUnderlined />}
        tooltip={underlineTooltip}
        actionHandler='onMouseDown'
      />
      {children}
    </BalloonToolbar>
  );
};
