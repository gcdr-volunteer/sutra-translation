import { OpenAI, APIConnectionTimeoutError } from 'openai';
import { logger } from '~/utils';
import type { AxiosError } from 'axios';

export const openai = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30 * 1000 /* 30 seconds */,
    maxRetries: 0,
  });

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
  try {
    const completion = await openai().chat.completions.create(
      {
        model: 'gpt-4-0613',
        messages: [
          {
            role: 'system',
            content: 'You are a professional Chinese to English translator',
          },
          ...glossary,
          {
            role: 'user',
            content: `${input.text}`,
          },
        ],
      },
      {
        timeout: 20 * 1000 /* 15 seconds timeout*/,
        maxRetries: 1,
      }
    );
    const message = completion?.choices?.[0]?.message?.content;
    if (message) {
      const result = message.trim().replace(/^,/, '').replace(/^"|"$/g, '') ?? '';
      logger.log(translate.name, 'completetion result', result);
      return result;
    }
    return '';
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNABORTED' && axiosError?.message?.includes('timeout')) {
      logger.warn(translate.name, 'openai server timeout');
      return 'openai server timeout, please refresh or edit by yourself';
    }
    if (error instanceof APIConnectionTimeoutError) {
      logger.warn(translate.name, 'openai server timeout');
      return 'openai server timeout, please refresh or edit by yourself';
    }
    if (axiosError.response) {
      logger.error(translate.name, 'response', axiosError.response);
      return axiosError.response?.statusText;
    }
    logger.error(translate.name, error);
    return 'not available';
  }
};

export const baseGPT = async ({
  text,
  randomness = 0.4,
}: {
  text: string;
  randomness?: number;
}) => {
  try {
    const completion = await openai().chat.completions.create(
      {
        model: 'gpt-4-0613',
        messages: [
          {
            role: 'user',
            content: `${text}`,
          },
        ],
        temperature: randomness,
      },
      { timeout: 15 * 1000 /* 10 seconds timeout*/ }
    );
    const message = completion?.choices?.[0]?.message?.content;

    return message || 'not available';
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNABORTED' && axiosError?.message?.includes('timeout')) {
      logger.warn(translate.name, 'openai server timeout');
      return 'openai server timeout, please retry after a while';
    }
    if (axiosError.response) {
      logger.error(translate.name, 'response', axiosError.response);
      return axiosError.response?.statusText;
    }
    return 'not available';
  }
};
