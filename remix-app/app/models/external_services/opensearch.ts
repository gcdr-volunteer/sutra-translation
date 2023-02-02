import type { Credentials } from 'aws-sdk';
import type { Request } from 'aws4';
import { Client, Connection } from '@opensearch-project/opensearch';
import AWS from 'aws-sdk';
import aws4 from 'aws4';
import crypto from 'crypto';

export const esClient = async () => {
  const createAwsConnector = (credentials: Credentials) => {
    class AmazonConnection extends Connection {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildRequestObject(params: any) {
        const request = super.buildRequestObject(params) as Request;
        request.service = 'aoss';
        request.region = process.env.REGION ?? 'ap-southeast-2';
        request.headers = request.headers || {};
        request.headers['host'] = request.hostname;

        const signed = aws4.sign(request, credentials);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        signed.headers['x-amz-content-sha256'] = crypto
          .createHash('sha256')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .update(request.body || '', 'utf8')
          .digest('hex');
        return signed;
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
    node: process.env.ES_URL,
  });
};
