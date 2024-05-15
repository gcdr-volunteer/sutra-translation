import { json, type ActionFunctionArgs } from '@remix-run/node';
import { Intent } from '~/types/common';
import {
  handleSearchByTerm,
  handleSearchGlossary,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { match } from 'ts-pattern';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_OPENSEARCH) {
    const searchType = entryData?.type as 'reference' | 'glossary' | 'sutra' | 'all';
    const searchValue = entryData?.value as string;

    const payload = await match({ searchType, searchValue })
      .with({ searchType: 'glossary' }, async ({ searchValue }) => {
        console.log('searching glossary');
        return handleSearchGlossary({
          text: searchValue,
          filter: 'origin',
        });
      })
      .otherwise(async ({ searchValue }) => {
        console.log('searching term');
        return await handleSearchByTerm(searchValue);
      });
    return json({
      payload,
      intent: Intent.READ_OPENSEARCH,
    });
  }
  return json({});
};
