import type { CommonMeta } from './common';

export interface Paragraph extends CommonMeta {
  /**
   * The sequence number of current paragraph in entire roll
   */
  num: number;
  /**
   * The real content of the current paragraph
   */
  content: string;
  /**
   * this field can be used to distinguish verse and normal paragraph
   */
  category: string;
  /**
   * The name of the sutra which this paragraph belongs
   */
  sutra: string;
  /**
   * The name of the roll which this paragraph belongs to
   */
  roll: string;
  /**
   * The helper type
   */
  kind: 'PARAGRAPH';
}
