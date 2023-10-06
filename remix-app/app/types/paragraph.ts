export interface Paragraph {
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
   * Indicate if the translation has finished
   */
  finish: boolean;
  /**
   * the original paragraph partition key
   */
  originPK: string;
  /**
   * the original paragraph sort key
   */
  originSK: string;
  /**
   * the order to sort the paragraph when insert new paragraph in the middle
   */
  order?: string;
  /**
   * The helper type
   */
  kind: 'PARAGRAPH';
}
