import { json, type ActionFunctionArgs } from '@remix-run/node';
import { Intent } from '~/types/common';
import {
  handleSearchByTerm,
  handleSearchGlossary,
} from '~/services/__app/tripitaka/$sutraId/$rollId/staging';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  if (entryData?.intent === Intent.READ_OPENSEARCH) {
    if (entryData?.value) {
      if (entryData?.glossary_only === 'true') {
        const payload = await handleSearchGlossary({
          text: entryData?.value as string,
          filter: 'origin',
        });
        return json({
          payload,
          intent: Intent.READ_OPENSEARCH,
        });
      }
      const payload = await handleSearchByTerm(entryData.value as string);
      return json({
        payload,
        intent: Intent.READ_OPENSEARCH,
      });
    }
  }
  return json({});
};
