import type { CommonMeta } from './common';

export interface Glossary extends CommonMeta {
  /**
   * the origin language piece of glossary
   */
  origin: string;
  /**
   * the target language piece of glossary
   */
  target: string;
  /**
   * Indicate the origin language of the glossary
   */
  origin_lang?: string;
  /**
   * Indicate the target language of the glossary
   */
  target_lang?: string;
  /**
   * the short form of the definition
   */
  short_definition?: string;
  /**
   * the alternative option
   */
  options?: string;
  /**
   * extra note for this glossary
   */
  note?: string;
  /**
   * example use cases
   */
  example_use?: string;
  /**
   * related terms
   */
  related_terms?: string;
  /**
   * terms to avoid to use
   */
  terms_to_avoid?: string;
  /**
   * extra note to discuss
   */
  discussion?: string;
  /**
   * The name of the creator, not email
   */
  creatorAlias?: string;
  /**
   * This is only for search purpose
   */
  content?: string;
  kind: 'GLOSSARY';
}
