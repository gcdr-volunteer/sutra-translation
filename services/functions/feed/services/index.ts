import { cleanHtml, parsePreface } from './avatamsaka';
import { parse } from 'node-html-parser';
import { getCachedHtml } from './utils';
const main = async () => {
  console.log(__dirname);
  const html = await getCachedHtml();
  const root = parse(html);
  const cleanedRoot = cleanHtml(root);
  parsePreface(cleanedRoot);
};
main();
