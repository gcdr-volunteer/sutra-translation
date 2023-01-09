import type { HTMLElement } from 'node-html-parser';

export const cleanHtml = (root: HTMLElement) => {
  const lines = root.querySelectorAll('.lb');
  lines.forEach((line) => {
    line.remove();
  });
  return root;
};

export const parsePreface = (root: HTMLElement) => {
  const elements = root.querySelectorAll('.div-xu > p');
  const texts = elements.map((element) => element.rawText);
  console.log(texts);
  return texts;
};
