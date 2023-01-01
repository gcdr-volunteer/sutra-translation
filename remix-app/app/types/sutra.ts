import type { Lang } from './lang';
import type { Team } from './team';
import type { CommonMeta } from './common';

export interface Sutra extends CommonMeta {
  /**
   * The title of the sutra, like Avatamsaka
   */
  title: string;
  /**
   * The original language where this sutra translated from
   * there is one exceptional which is the most original sanskrit sutra
   * otherwise, it should all belongs to IOS language code
   */
  origin_lang: Lang['name'];
  /**
   * Total number of rolls this sutra contains
   */
  roll_count: number;
  /**
   * The name of the original translator
   */
  roll_start: number;
  /**
   * From what AC time to what AC time
   */
  translator: string;
  /**
   * The category which this sutra belongs to
   */
  category: string;
  /**
   * The language of the current sutra
   */
  lang: Lang['name'];
  /**
   * The original sutra Id where this sutra tranlate from, this field will
   * help to distinguish which version of the original sutra used to translate
   */
  origin_sutraId: string;
  /**
   * Which team is working on this sutra translation
   */
  team: Team['name'];
  /**
   * Which dynasty which translating this sutra
   */
  dynasty: string;
  /**
   * Total number of characters in this sutra
   */
  num_chars: number;
  /**
   * the start roll of this sutra, having this field is because some sutras
   * might missing rolls
   */
  time_from: number;
  /**
   * From what AC time to what AC time
   */
  time_to: number;
}
