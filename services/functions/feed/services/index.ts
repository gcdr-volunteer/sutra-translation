import { cleanHtml, parsePreface } from './avatamsaka';
import { parse } from 'node-html-parser';
import { getCachedHtml } from './utils';
const main = async () => {
  const html = await getCachedHtml();
  const root = parse(html);
  const cleanedRoot = cleanHtml(root);
  parsePreface(cleanedRoot);
};
main();
