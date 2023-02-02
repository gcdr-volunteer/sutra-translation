import type { HTMLElement } from 'node-html-parser';
import type { FeedParams } from '../../feed';
import { parse } from 'node-html-parser';
import { LangCode, Sutra, Roll } from '@remix-app/app/types';
import { composeIdForTranslation } from '@remix-app/app/models/utils';
import * as cn from 'chinese-numbering';
import {
  footnotesComposer,
  getCachedHtml,
  getCachedRollsData,
  getCachedSutraData,
  paragraphComposer,
} from './utils';
import { upsertParagraph } from '@remix-app/app/models/paragraph';
import { upsertSutra } from '@remix-app/app/models/sutra';
import { upsertRoll } from '@remix-app/app/models/roll';
import { upsertFootnote } from '@remix-app/app/models/footnote';

const cleanHtml = (root: HTMLElement) => {
  const lines = root.querySelectorAll('.lb');
  lines.forEach((line) => {
    line.remove();
  });
  return root;
};

const parsePreface = ({ root, startIndex = 0 }: { root: HTMLElement; startIndex: number }) => {
  const elements = root.querySelectorAll('.div-xu > p');
  const texts = elements.map((element, index) => {
    const rawText = element.rawText;
    const footnotes = element.querySelectorAll('.noteAnchor').map((footnote) => {
      const href = footnote.getAttribute('href');
      const position = rawText.indexOf(footnote.nextSibling.rawText);
      const result = { parentIndex: index, href, position };
      return result;
    });
    const kind = 'PARAGRAPH' as const;
    return {
      num: startIndex + index,
      footnotes,
      category: element.getAttribute('class')?.toUpperCase() ?? 'PREFACE',
      content: rawText,
      kind,
    };
  });

  return texts;
};

const parseRoll = ({ root, startIndex = 0 }: { root: HTMLElement; startIndex: number }) => {
  const title = root.querySelector('.juan');
  const translator = root.querySelector('.byline');
  const paragraphs = root.querySelectorAll('.div-pin p, div .lg-row');
  const mapper: Record<string, string> = {
    juan: 'HEAD1',
    byline: 'BYLINE',
  };
  const kind = 'PARAGRAPH' as const;
  const texts = [title, translator].map((paragraph, index) => ({
    num: index + startIndex,
    content: paragraph?.rawText ?? '',
    footnotes: [],
    category: mapper[paragraph?.getAttribute('class') ?? ''],
    kind,
  }));

  const currentHighestIndex = texts[texts.length - 1].num + 1;
  const rawTexts = paragraphs.map((element, index) => {
    const rawText = element.rawText;
    const footnotes = element.querySelectorAll('.noteAnchor').map((footnote) => {
      const href = footnote.getAttribute('href');
      const position = rawText.indexOf(footnote.nextSibling.rawText);
      const result = { parentIndex: index, href, position };
      return result;
    });

    return {
      num: index + currentHighestIndex,
      footnotes,
      category: element.getAttribute('class') === 'lg-row' ? 'VERSE' : 'NORMAL',
      content: rawText,
      kind,
    };
  });

  return [...texts, ...rawTexts];
};

const parseFootnotes = ({ root }: { root: HTMLElement }) => {
  const footnotes = root.querySelectorAll('.footnote');
  const result = footnotes.reduce((acc, cur) => {
    const id = cur.getAttribute('id') as string;
    if (id) {
      acc[`#${id}`] = cur.rawText;
      return acc;
    }
    return acc;
  }, {} as Record<string, string>);
  return result;
};

export const getMetaData = async (feed: FeedParams) => {
  const sutraMeta = await getCachedSutraData(feed);
  const rollsMeta = await getCachedRollsData(feed);
  if (sutraMeta && rollsMeta) {
    const kind = 'SUTRA';
    const sutra: Sutra = {
      PK: 'TRIPITAKA',
      SK: composeIdForTranslation({
        lang: LangCode.ZH,
        version: 'V1',
        kind: 'SUTRA',
        id: feed.roll,
      }),
      title: sutraMeta.title,
      category: sutraMeta.category,
      time_from: sutraMeta.time_from,
      time_to: sutraMeta.time_to,
      roll_start: sutraMeta.juan_start,
      origin_lang: LangCode.SS,
      translator: sutraMeta.byline,
      roll_count: sutraMeta.juan,
      lang: LangCode.ZH,
      origin_sutraId: '',
      dynasty: sutraMeta.time_dynasty,
      team: '',
      num_chars: sutraMeta.cjk_chars,
      kind,
    };

    const rolls = rollsMeta.mulu.reduce((pacc, pcur) => {
      if (pcur.isFolder) {
        const children = pcur.children.reduce((acc, cur) => {
          const kind = 'ROLL';
          const title = pcur.title.replace(/\d+\s+/u, '');
          const category = cur.type ?? '品';
          const roll: Roll = {
            PK: composeIdForTranslation({
              lang: LangCode.ZH,
              version: 'V1',
              kind: 'SUTRA',
              id: feed.roll,
            }),
            SK: composeIdForTranslation({
              lang: LangCode.ZH,
              version: 'V1',
              kind: 'ROLL',
              id: cur.juan,
            }),
            title: `${sutraMeta.title}第${cn.numberToChinese(cur.juan)}${category}`,
            subtitle: `${title}${cur.title}`,
            finish: true,
            category,
            num: cur.juan,
            kind,
            origin_rollId: '',
          };
          acc.push(roll);
          return acc;
        }, [] as Roll[]);
        pacc = [...pacc, ...children];
        return pacc;
      }
      const preface = '序';
      // Skip preface, cause preface will be together with chapter 1
      if (preface !== pcur.type) {
        const kind = 'ROLL';
        const subtitle = pcur.title.replace(/\d+\s+/u, '');
        const number = `第${cn.numberToChinese(pcur.juan)}`;
        const roll: Roll = {
          PK: composeIdForTranslation({
            lang: LangCode.ZH,
            version: 'V1',
            kind: 'SUTRA',
            id: feed.roll,
          }),
          SK: composeIdForTranslation({
            lang: LangCode.ZH,
            version: 'V1',
            kind: 'ROLL',
            id: pcur.juan,
          }),
          title: `${sutraMeta.title}${number}${pcur.type}`,
          subtitle,
          finish: true,
          category: pcur.type,
          num: pcur.juan,
          kind,
          origin_rollId: '',
        };
        pacc.push(roll);
        return pacc;
      }
      return pacc;
    }, [] as Roll[]);
    return {
      sutra,
      rolls,
    };
  }
};

export const getFeed = async (feed: FeedParams) => {
  const html = await getCachedHtml(feed);
  if (html) {
    const root = parse(html);
    const cleanedRoot = cleanHtml(root);
    const preface = parsePreface({ root: cleanedRoot, startIndex: 0 });
    const rolls = parseRoll({
      root: cleanedRoot,
      startIndex: preface.length ? preface[preface.length - 1].num + 1 : 0,
    });
    const notes = parseFootnotes({ root: cleanedRoot });

    const paragraphs = paragraphComposer({ rolls, preface, startId: feed.roll });
    const footnotes = footnotesComposer({
      preface,
      rolls,
      footnotes: notes,
      rollId: composeIdForTranslation({
        lang: LangCode.ZH,
        version: 'V1',
        kind: 'ROLL',
        id: feed.roll,
      }),
    });
    return {
      paragraphs,
      footnotes,
    };
  }
};

export const addAvatamsakaSutraFeed = async (params: FeedParams) => {
  // Only run metadata for first chapter, because it contains all the
  // metadata for rest of the chapters
  if (params.roll == '1') {
    const metaData = await getMetaData(params);
    if (metaData) {
      const { sutra, rolls } = metaData;
      await upsertSutra(sutra);
      await Promise.all(
        rolls.map((roll, index) => {
          const timer = 500 * index;
          return setTimeout(() => {
            return upsertRoll(roll);
          }, timer);
        })
      );
    }
  }
  const feed = await getFeed(params);
  if (feed) {
    const { paragraphs, footnotes } = feed;
    await Promise.all(
      paragraphs.map((paragraph, index) => {
        const timer = 500 * index;
        return setTimeout(() => {
          return upsertParagraph(paragraph);
        }, timer);
      })
    );
    await Promise.all(
      footnotes.map((footnote, index) => {
        const timer = 500 * index;
        return setTimeout(() => {
          if (footnote) {
            upsertFootnote(footnote);
          }
        }, timer);
      })
    );
  }
};
