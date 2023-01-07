import type { Credentials } from 'aws-sdk';
import type { Request } from 'aws4';
import { Client, Connection } from '@opensearch-project/opensearch';
import AWS from 'aws-sdk';
import aws4 from 'aws4';
import { logger } from '~/utils';

export const esClient = async () => {
  const createAwsConnector = (credentials: Credentials) => {
    class AmazonConnection extends Connection {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildRequestObject(params: any) {
        const request = super.buildRequestObject(params) as Request;
        request.service = 'es';
        request.region = process.env.REGION ?? 'ap-southeast-2';
        request.headers = request.headers || {};
        request.headers['host'] = request.hostname;

        return aws4.sign(request, credentials);
      }
    }
    return {
      Connection: AmazonConnection,
    };
  };

  const getCredentials = async (): Promise<Credentials> => {
    return new Promise((resolve, reject) => {
      AWS.config.getCredentials((err, credentials) => {
        if (err) {
          reject(err);
        } else {
          if (credentials) resolve(credentials as Credentials);
        }
      });
    });
  };
  const credentials = await getCredentials();
  return new Client({
    ...createAwsConnector(credentials),
    node: `https://${process.env.ES_URL}`,
  });
};

export const searchByTerm = async (term: string) => {
  try {
    // TODO: this is just a stub function, refine it when you picking the
    // real ticket
    const client = await esClient();
    const query = {
      query: {
        match: {
          content: {
            query: 'Vajrayana',
          },
        },
      },
    };

    const resp = await client.search({
      index: 'translation',
      body: query,
    });
    logger.log(searchByTerm.name, 'response', resp.body?.hits.hits);
  } catch (error) {
    console.log('error', error);
  }
};
