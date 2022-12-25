import { CommonMeta } from './user';

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
}
