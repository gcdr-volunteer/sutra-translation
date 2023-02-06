import type { CommonMeta } from './common';
export enum LangCode {
  ZH = 'ZH',
  EN = 'EN',
  SS = 'sanskrit',
}
export interface Lang extends CommonMeta {
  /**
   * https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
   * The language code
   */
  name: LangCode;
  /**
   * The language alias of the code
   */
  alias: string;
  /**
   * The helper type
   */
  kind: 'LANG';
}
