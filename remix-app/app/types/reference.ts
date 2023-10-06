export interface Reference {
  /**
   * The name of the reference
   */
  name: string;
  /**
   * The content of the reference
   */
  content: string;
  /**
   * The sutraId of the reference (can be used for later search use)
   */
  sutraId: string;
  /**
   * The rollId of the reference (can be used for later search use)
   */
  rollId: string;
  /**
   *
   */
  order?: string;
  /**
   * The paragraphId (equal to PK) of the reference (can be used for later search use)
   */
  paragraphId: string;
  /**
   * sutra name (can be used for later search use)
   */
  sutra?: string;
  /**
   * roll name (can be used for later search use)
   */
  roll?: string;
  /**
   * The helper type
   */
  kind: 'REFERENCE';
}

export interface RefBook {
  bookname: string;
  team: string;
  sutraId: string;
  order: string;
  kind: 'REFBOOK';
}
