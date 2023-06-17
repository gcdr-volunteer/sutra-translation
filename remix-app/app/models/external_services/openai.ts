import { Configuration, OpenAIApi } from 'openai';
import { logger } from '~/utils';
import type { AxiosError } from 'axios';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = () => new OpenAIApi(configuration);

export const translate = async (
  input: {
    text: string;
    category?: string;
  },
  glossaries: Record<string, string>
): Promise<string> => {
  let glossary = '';
  if (Object.entries(glossaries).length) {
    glossary = Object.entries(glossaries).reduce((acc, [key, value], index, arr) => {
      acc += `${key}:${value}${index === arr.length - 1 ? '' : ';'}`;
      return acc;
    }, '');
  }
  const prefix = glossary ? `Using this glossary '${glossary}' to translate` : 'Please translate';
  const postfix = input?.category === 'VERSE' ? ' like a verse' : '';
  const prompt = `${prefix} following text into English in Buddhist sutra style \n${input.text.trim()}\n ${postfix}`;
  logger.log(translate.name, 'prompt', prompt);
  try {
    const completion = await openai().createChatCompletion({
      model: 'gpt-3.5-turbo-16k-0613',
      messages: [
        {
          role: 'system',
          content:
            'You are a Chinese-English translator, remember you cannot contain any Chinese in translated text',
        },
        {
          role: 'user',
          content: `${prompt}`,
        },
      ],
    });
    const result =
      completion?.data?.choices[0].message?.content
        .trim()
        .replace(/^,/, '')
        .replace(/^"|"$/g, '') ?? '';
    logger.log(translate.name, 'completetion result', result);
    return result;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return axiosError.response?.statusText;
    }
    return 'not available';
  }
};
