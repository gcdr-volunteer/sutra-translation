export interface Reference {
  /**
   * The content of the reference
   */
  content: string;
  /**
   * The Id to find exact sutra
   */
  sutraId: string;
  /**
   * The Id to find exact roll
   */
  rollId: string;
  /**
   * Indicate if the reference of this paragraph finished, because a paragraph
   * can contain multiple sentences
   */
  finish: boolean;
  /**
   * current working sentence index
   */
  sentenceIndex?: number;
  /**
   * current working sentence index
   */
  paragraphIndex?: number;
  /**
   * current paragraph (the accumulated paragraph)
   */
  paragraph?: string;
  /**
   * current paragraph id
   */
  paragraphId: string;
  /**
   * The helper type
   */
  kind: 'REFERENCE';
}

export interface RefBook {
  bookname: string;
  team: string;
  sutraId: string;
}
