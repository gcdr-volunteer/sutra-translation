import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { FeedParams } from '../index';
import { CreateType, LangCode, Paragraph } from '../../../../remix-app/app/types';
import {
  composeIdForReference,
  composeIdForTranslation,
} from '../../../../remix-app/app/models/utils';

type Mulu = {
  title: string;
  juan: number;
  type: string;
  isFolder?: boolean;
  children: Mulu[];
};
type CBeta = {
  results: [string];
  toc: {
    mulu: Mulu[];
  };
  work_info: {
    work: string;
    title: string;
    category: string;
    juan: number;
    cjk_chars: number;
    byline: string;
    time_dynasty: string;
    time_from: number;
    time_to: number;
    juan_start: number;
  };
};
const getJson = async ({ sutra, roll }: FeedParams): Promise<CBeta | undefined> => {
  const { data, status } = await axios.get<CBeta>(
    `http://cbdata.dila.edu.tw/v1.2/juans?work=${sutra}&juan=${roll}&work_info=1&toc=1`,
    { headers: { accept: 'application/json' } }
  );
  if (status === 200) {
    return data;
  }
  return undefined;
};

/**
 * Notice this is only for testing purpose, there is no need to save parsed html
 * because we save the parsed result to dynamodb
 */
const saveFile = (filename: string, content: string) => {
  return fs.writeFile(filename, content, { encoding: 'utf-8' }, (err) => {
    if (err) {
      console.error('write file error', err);
    }
    console.log('file saved');
  });
};

/**
 * This is a dev helper function
 */
const readFile = (filename: string): string => {
  return fs.readFileSync(filename, { encoding: 'utf-8' });
};

const getCachedJson = async (params: FeedParams): Promise<CBeta | undefined> => {
  const file = path.join(
    process.cwd(),
    'functions',
    'feed',
    'services',
    'build',
    `${params.sutra}-${params.roll}.json`
  );
  if (process.env.NODE_ENV !== 'test') {
    const json = await getJson(params);
    return json;
  }
  if (fs.existsSync(file)) {
    return JSON.parse(readFile(file));
  } else {
    const json = await getJson(params);
    if (json) {
      if (process.env.NODE_ENV === 'test') {
        // Notice this is only for local dev convenience
        saveFile(file, JSON.stringify(json));
      }
      return json;
    }
    return undefined;
  }
};

export const getCachedHtml = async (params: FeedParams): Promise<string | undefined> => {
  const file = path.join(
    process.cwd(),
    'functions',
    'feed',
    'services',
    'build',
    `${params.sutra}-${params.roll}.html`
  );
  const json = await getCachedJson(params);
  if (json) {
    if (process.env.NODE_ENV === 'test') {
      // Notice this is only for local dev convenience
      saveFile(file, json.results[0]);
    }
    return json.results[0];
  }
  return json;
};

export const getCachedSutraData = async (
  params: FeedParams
): Promise<CBeta['work_info'] | undefined> => {
  const json = await getCachedJson(params);
  if (json) {
    return json.work_info;
  }
  return undefined;
};

export const getCachedRollsData = async (param: FeedParams): Promise<CBeta['toc'] | undefined> => {
  const json = await getCachedJson(param);
  if (json) {
    return json.toc;
  }
  return undefined;
};

type Doc = {
  num: number;
  footnotes: {
    parentIndex: number;
    href?: string;
    position: number;
  }[];
  category: string;
  content: string;
  kind: 'PARAGRAPH';
};

export const paragraphComposer = ({
  preface,
  rolls,
  startId,
  sutra,
  roll,
}: {
  preface: Doc[];
  rolls: Doc[];
  startId: string;
  sutra: string;
  roll: string;
}): CreateType<Paragraph>[] => {
  return [...preface, ...rolls]
    .map((doc) => {
      // we want to remove footnotes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { footnotes, ...rest } = doc;
      return rest;
    })
    .map((doc) => {
      return {
        updatedBy: 'Admin',
        createdBy: 'Admin',
        PK: composeIdForTranslation({
          lang: LangCode.ZH,
          version: 'V1',
          id: startId,
          kind: 'ROLL',
        }),
        SK: composeIdForTranslation({
          lang: LangCode.ZH,
          version: 'V1',
          id: doc.num,
          kind: 'PARAGRAPH',
        }),
        sutra,
        roll,
        finish: true,
        ...doc,
      };
    });
};
export const footnotesComposer = ({
  preface,
  rolls,
  footnotes,
  rollId,
}: {
  preface: Doc[];
  rolls: Doc[];
  footnotes: Record<string, string>;
  rollId: string;
}) => {
  return [...preface, ...rolls]
    .filter((doc) => doc.footnotes.length)
    .map((doc) => doc?.footnotes)
    .reduce((acc, cur) => {
      acc = [...acc, ...cur];
      return acc;
    }, [] as { parentIndex: number; href: string; position: number }[])
    .filter((value, index, arr) => {
      return (
        index ===
        arr.findIndex(
          (ele) => ele.parentIndex === value.parentIndex && ele.position === value.position
        )
      );
    })
    .map((footnote) => {
      if (footnote.href) {
        return {
          PK: rollId,
          SK: composeIdForReference({
            kind: 'FOOTNOTE',
            id: footnote.parentIndex,
          }),
          paragraphId: composeIdForTranslation({
            kind: 'PARAGRAPH',
            version: 'V1',
            id: footnote.parentIndex,
            lang: LangCode.ZH,
          }),
          offset: footnote.position,
          content: footnotes[footnote.href],
        };
      }
    });
};
