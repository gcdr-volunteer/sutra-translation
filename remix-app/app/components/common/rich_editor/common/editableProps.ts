import type { TEditableProps } from '@udecode/plate';
import type { MyValue } from '../typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
