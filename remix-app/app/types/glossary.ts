import type { CommonMeta } from './common';

export interface Glossary extends CommonMeta {
  origin: string;
  target: string;
  origin_lang?: string;
  target_lang?: string;
  note?: string;
  creatorAlias?: string;
  kind: 'GLOSSARY';
}
