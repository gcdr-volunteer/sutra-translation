import React from 'react';
import {
  MdAlignHorizontalLeft,
  MdAlignHorizontalCenter,
  MdAlignHorizontalRight,
} from 'react-icons/md';
import { AlignToolbarButton } from '@udecode/plate';

const tooltip = (content: string) => ({
  content,
});

export const AlignToolbarButtons = () => {
  return (
    <>
      <AlignToolbarButton
        tooltip={tooltip('Align Left')}
        value='left'
        icon={<MdAlignHorizontalLeft />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Center')}
        value='center'
        icon={<MdAlignHorizontalCenter />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Right')}
        value='right'
        icon={<MdAlignHorizontalRight />}
      />
    </>
  );
};
