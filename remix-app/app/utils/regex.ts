import type { Paragraph } from '../types';

export const emailRegex = new RegExp(
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
export const splitParagraph = (paragraph: Paragraph | null): string[] => {
  return paragraph?.content.trim().split(/(?<=。|！|？|；|：)/g) || [];
};

const escapeRegexp = (term: string): string =>
  term.replace(/[|\\{}()[\]^$+*?.-]/gm, (char: string) => `\\${char}`);

export function buildRegex(query: string[]) {
  const _query = query.filter((text) => text.length !== 0).map((text) => escapeRegexp(text.trim()));
  if (!_query.length) {
    return null;
  }

  return new RegExp(`(${_query.join('|')})`, 'ig');
}
