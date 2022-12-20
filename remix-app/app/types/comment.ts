import { CommonMeta } from './user';

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}
export interface Comment extends CommonMeta {
  /**
   * The Id to find exact sutra
   */
  sutraId: string;
  /**
   * The Id to find exact roll
   */
  rollId: string;
  /**
   * The Id to find exact paragraph
   */
  paragraphId: string;
  /**
   * The start index of the selected text
   */
  start: number;
  /**
   * The end index of the selected text
   */
  end: number;
  /**
   * The selected string
   */
  content: string;
  /**
   * The number that indicates if this comment resolved or not
   */
  resolved: 0 | 1;
  /**
   * The priority level of the comment
   */
  priority: Priority;
  /**
   * The user which the comment creator pinged
   */
  ping?: string[];
  /**
   * The content of the comment
   */
  comment: string;
  /**
   * The path where the comment belongs to
   */
  path: string;
}
