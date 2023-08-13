import { useMemo } from 'react';
import { buildRegex } from '../utils/regex';

type Chunk = {
  text: string;
  match: boolean;
};

type HighlightOptions = {
  text: string;
  query: string | string[];
};

function highlightWords({ text, query }: HighlightOptions): Chunk[] {
  const regex = buildRegex(Array.isArray(query) ? query : [query]);
  if (!regex) {
    return [{ text, match: false }];
  }
  const result = text.split(regex).filter(Boolean);
  return result.map((str) => ({ text: str, match: regex.test(str) }));
}

export type UseHighlightProps = HighlightOptions;

export function useHighlight(props: UseHighlightProps) {
  const { text, query } = props;
  return useMemo(() => highlightWords({ text, query }), [text, query]);
}
