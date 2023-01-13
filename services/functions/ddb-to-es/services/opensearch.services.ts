import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
const client = new Client({
  ...AwsSigv4Signer({
    region: process.env.REGION ?? 'ap-southeast-2',
    getCredentials: () => {
      // Any other method to acquire a new Credentials object can be used.
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: `https://${process.env.ES_URL}`,
});
const index_name = 'translation';
export const createIndexIfNotExist = async () => {
  try {
    const settings = {
      settings: {
        index: {
          number_of_shards: 4,
          number_of_replicas: 3,
        },
      },
    };
    const isIndexExist = await client.indices.exists({ index: index_name });
    if (!isIndexExist) {
      await client.indices.create({
        index: index_name,
        body: settings,
      });
    }
  } catch (error) {
    console.log('ddb-to-es', 'error', error);
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeBulkActions = async (docs: Record<string, any>[]) => {
  return await client.bulk({
    method: 'POST',
    refresh: true,
    index: index_name,
    body: docs,
  });
};

export const singleInsert = async (doc: Record<string, unknown>) => {
  return await client.index({
    id: `${doc?.PK}-${doc?.SK}`,
    index: index_name,
    body: doc,
  });
};

export const singleUpdate = async (doc: Record<string, unknown>) => {
  return await client.update({
    id: `${doc?.PK}-${doc?.SK}`,
    body: { doc: doc },
    index: index_name,
  });
};

export const singleDelete = async (id: string) => {
  return await client.delete({
    id,
    index: index_name,
  });
};
