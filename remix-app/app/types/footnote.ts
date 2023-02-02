import type { CommonMeta } from './common';

export interface Footnote extends CommonMeta {
  paragraphId: string;
  offset: number;
  content: string;
  kind: 'FOOTNOTE';
}
