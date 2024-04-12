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
  origin_sutra_text?: string;
  /**
   * the alternative option
   */
  target_sutra_text?: string;
  /**
   * extra note for this glossary
   */
  sutra_name?: string;
  /**
   * example use cases
   */
  volume?: string;
  /**
   * related terms
   */
  cbeta_frequency?: string;
  /**
   * terms to avoid to use
   */
  glossary_author?: string;
  /**
   * terms to avoid to use
   */
  translation_date?: string;
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
