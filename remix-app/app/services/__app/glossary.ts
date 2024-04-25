import { dbBulkGetByKeys } from '../../models/external_services/dynamodb';
import { esClient } from '../../models/external_services/opensearch';
import type { Glossary } from '../../types';

export const handleGlossariesBySearchTerm = async ({
  term,
  page,
}: {
  term: string;
  page: string | undefined | null;
}) => {
  const pageNumber = page ? parseInt(page, 10) : 1;
  const size = 25;
  const from = size * (pageNumber - 1);
  const client = await esClient();
  const body = {
    from,
    size,
    query: {
      match: {
        content: {
          query: term.trim(),
          fuzziness: 'AUTO',
        },
      },
    },
  };

  const resp = await client.search({
    index: 'glossary',
    body,
  });

  if (resp.body.hits.hits.length) {
    const glossaryKeys = resp.body.hits.hits.map(
      (hit: { _source: { PK: string; SK: string } }) => ({
        PK: hit._source.PK,
        SK: hit._source.SK,
      })
    );
    const items = await dbBulkGetByKeys<Glossary>({
      tableName: process.env.REFERENCE_TABLE,
      keys: glossaryKeys,
    });
    const sortedItems = [];
    for (const key of glossaryKeys) {
      const item = items.find((item) => item.PK === key.PK && item.SK === key.SK);
      if (item) {
        sortedItems.push(item);
      }
    }
    return {
      items: sortedItems,
      nextPage: sortedItems.length >= 25 ? pageNumber + 1 : null,
    };
  }

  return {
    items: [],
    nextPage: null,
  };
};
