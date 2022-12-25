import { Lang } from './lang';
import { Team } from './team';
import { CommonMeta } from './user';

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
}
