import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
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
  let glossary = [] as { role: 'system' | 'assistant' | 'user'; content: string }[];
  if (Object.entries(glossaries).length) {
    glossary = Object.entries(glossaries).reduce<
      { role: 'user' | 'assistant' | 'system'; content: string }[]
    >((acc, [key, value]) => {
      return [
        ...acc,
        {
          role: 'user',
          content: key,
        },
        {
          role: 'assistant',
          content: value,
        },
      ];
    }, []);
  }
  const messages = [
    {
      role: 'system',
      content: 'You are a professional Chinese to English translator',
    },
    ...glossary,
    {
      role: 'user',
      content: `${input.text}`,
    },
  ] as ChatCompletionRequestMessage[];
  logger.log(translate.name, 'prompt', messages);
  try {
    const completion = await openai().createChatCompletion(
      {
        model: 'gpt-4-0613',
        messages,
      },
      { timeout: 10 * 1000 /* 10 seconds timeout*/ }
    );
    const result =
      completion?.data?.choices[0].message?.content
        .trim()
        .replace(/^,/, '')
        .replace(/^"|"$/g, '') ?? '';
    logger.log(translate.name, 'completetion result', result);
    return result;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNABORTED' && axiosError?.message?.includes('timeout')) {
      logger.warn(translate.name, 'openai server timeout');
      return 'openai server timeout, please refresh or edit by yourself';
    }
    if (axiosError.response) {
      logger.error(translate.name, 'response', axiosError.response);
      return axiosError.response?.statusText;
    }
    return 'not available';
  }
};
