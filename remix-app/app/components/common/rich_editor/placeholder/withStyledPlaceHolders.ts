import { ELEMENT_H1, ELEMENT_PARAGRAPH, withPlaceholders } from '@udecode/plate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withStyledPlaceHolders = (components: any) =>
  withPlaceholders(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
