import { dbBulkGetByKeys } from '../../models/external_services/dynamodb';
import { esClient } from '../../models/external_services/opensearch';
import { getGlossariesByTerm } from '../../models/glossary';
import type { Glossary } from '../../types';

export const handleGlossariesBySearchTerm = async ({
  term,
  page,
}: {
  term: string;
  page: string | undefined | null;
}) => {
  const { items, nextPage } = await getGlossariesByTerm({ term, nextPage: page });

  if (items.length) {
    return {
      items,
      nextPage,
    };
  }

  const client = await esClient();
  const body = {
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
    size: 10,
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
    return {
      items,
      nextPage: null,
    };
  }

  return {
    items: [],
    nextPage: null,
  };
};
