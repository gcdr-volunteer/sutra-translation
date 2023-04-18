import type { CommonMeta } from './common';

export enum Priority {
  High,
  Medium,
  Low,
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
  resolved?: 0 | 1;
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
  /**
   * The alias to the creator, this can be used during comment conversation
   */
  creatorAlias: string;
  /**
   * The id is used to make comment update to date by Server Send Event
   * technology
   */
  id: string;
  /**
   * This id provide the information that which comment belongs to
   */
  parentId: string;
  /**
   * this timestamp is used to compare if there is updated message
   */
  latestMessage?: string;
  /**
   * json
   */
  json: string;
  /**
   * The helper type
   */
  kind: 'COMMENT';
}
