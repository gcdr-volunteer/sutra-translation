import type { Team } from './team';
import type { CommonMeta } from './common';

export interface Roll extends CommonMeta {
  /**
   * The title of the Roll, like Roll 1
   */
  title: string;
  /**
   * One roll might have mutliple subrolls, this subtitle is for this purpose
   */
  subtitle: string;
  /**
   * Num of the roll in the entire sutra
   */
  num: number;
  /**
   * Indicate if the translation of this roll finished
   */
  finish: boolean;
  /**
   * Which team is working on this sutra translation
   */
  team?: Team['name'];
  /**
   * type of this roll, it might be preface or a roll
   */
  category: string;
  /**
   * The original roll Id where this roll tranlate from, this field will
   * help to distinguish which version of the original roll used to translate
   */
  origin_rollId: string;
  /**
   * The helper type
   */
  kind: 'ROLL';
}
