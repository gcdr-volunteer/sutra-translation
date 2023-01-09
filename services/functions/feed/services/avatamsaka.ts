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
  const texts = elements.map((element, index) => {
    const rawText = element.rawText;
    element.querySelectorAll('.noteAnchor').forEach((footnote) => {
      const href = footnote.getAttribute('href');
      const position = rawText.indexOf(footnote.nextSibling.rawText);
      return { parentIndex: index, href, position };
    });

    return {
      category: element.getAttribute('class')?.toUpperCase() ?? 'PREFACE',
      content: rawText.split(/(?<=。|！|？)/g),
    };
  });

  console.log(texts);
  return texts;
};
