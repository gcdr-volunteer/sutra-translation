import { Configuration, OpenAIApi } from 'openai';
import { logger } from '~/utils';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = () => new OpenAIApi(configuration);

export const translate = async (
  text: string,
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
  const postfix = ' in buddhism English style';
  const prompt = `${prefix} ${text.trim()} ${postfix}`;
  logger.log(translate.name, 'prompt', prompt);
  try {
    const completion = await openai().createCompletion({
      model: 'text-davinci-001',
      prompt,
      temperature: 0.5,
      top_p: 1,
      best_of: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 256,
    });
    const result = completion?.data?.choices[0].text?.trim().replace(/^,/, '') ?? '';
    logger.log(translate.name, 'completetion result', result);
    return result;
  } catch (error) {
    console.log(error);
    return 'not avaiable';
  }
};
