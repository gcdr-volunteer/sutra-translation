import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

type CBeta = {
  results: [string];
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
  };
};
const getHtml = async (): Promise<string> => {
  const { data, status } = await axios.get<CBeta>(
    'http://cbdata.dila.edu.tw/v1.2/juans?work=T0279&juan=1&work_info=1&toc=1',
    { headers: { accept: 'application/json' } }
  );
  if (status === 200) {
    return data.results[0];
  }
  return '';
};

/**
 * Notice this is only for testing purpose, there is no need to save parsed html
 * because we save the parsed result to dynamodb
 */
const saveHtml = (filename: string, content: string) => {
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
const readHtml = (filename: string): string => {
  return fs.readFileSync(filename, { encoding: 'utf-8' });
};

export const getCachedHtml = async (): Promise<string> => {
  const file = path.join(process.cwd(), 'functions', 'feed', 'services', 'build', 'index.html');
  if (process.env.ENV === 'prod') {
    return await getHtml();
  }
  if (fs.existsSync(file)) {
    return readHtml(file);
  } else {
    const html = await getHtml();
    saveHtml(file, html);
    return html;
  }
};
