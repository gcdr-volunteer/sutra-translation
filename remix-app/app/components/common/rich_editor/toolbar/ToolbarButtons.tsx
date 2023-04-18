import { MdCheck, MdFontDownload, MdFormatColorText, MdLineWeight } from 'react-icons/md';
import {
  ColorPickerToolbarDropdown,
  LineHeightToolbarDropdown,
  MARK_BG_COLOR,
  MARK_COLOR,
} from '@udecode/plate';
import type { TippyProps } from '@tippyjs/react';
import { AlignToolbarButtons } from '../align/AlignToolbarButtons';
import { BasicElementToolbarButtons } from '../basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from '../basic-marks/BasicMarkToolbarButtons';
import { IndentToolbarButtons } from '../indent/IndentToolbarButtons';

export const ToolbarButtons = () => {
  const colorTooltip: TippyProps = { content: 'Text Color' };
  const bgTooltip: TippyProps = { content: 'Background Color' };
  const lineHeightTooltip: TippyProps = { content: 'Line Height' };

  return (
    <>
      <BasicElementToolbarButtons />
      <IndentToolbarButtons />
      <BasicMarkToolbarButtons />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_COLOR}
        icon={<MdFormatColorText />}
        selectedIcon={<MdCheck />}
        tooltip={colorTooltip}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<MdFontDownload />}
        selectedIcon={<MdCheck />}
        tooltip={bgTooltip}
      />
      <LineHeightToolbarDropdown tooltip={lineHeightTooltip} icon={<MdLineWeight />} />
      <AlignToolbarButtons />
    </>
  );
};
