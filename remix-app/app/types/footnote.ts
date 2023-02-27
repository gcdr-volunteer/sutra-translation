export interface Footnote {
  /**
   * the paragraph that the footnote belongs to
   */
  paragraphId: string;
  /**
   * the offset of the footnote sits in the paragraph
   */
  offset: number;
  /**
   * the content of the footnote
   */
  content: string;
  /**
   * num indicates which footnote in the entire roll
   */
  num: number;
  kind: 'FOOTNOTE';
}
