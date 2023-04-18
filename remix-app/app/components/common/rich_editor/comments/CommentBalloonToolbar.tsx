import React from 'react';
import type { TippyProps } from '@tippyjs/react';
import { PlateCommentToolbarButton } from '@udecode/plate';
import type { BalloonToolbarProps, WithPartial } from '@udecode/plate';
import { MarkBalloonToolbar, markTooltip } from '../balloon-toolbar/MarkBalloonToolbar';
import { MdChat } from 'react-icons/md';

export const CommentBalloonToolbar = (props: WithPartial<BalloonToolbarProps, 'children'>) => {
  const commentTooltip: TippyProps = {
    content: 'Comment (⌘+⇧+M)',
    ...markTooltip,
  };

  return (
    <MarkBalloonToolbar {...props}>
      <PlateCommentToolbarButton
        icon={<MdChat />}
        tooltip={commentTooltip}
        actionHandler='onMouseDown'
      />
    </MarkBalloonToolbar>
  );
};
