import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { bulkInsert, createIndexIfNotExist, singleInsert } from './services/opensearch.services';
export const handler = async (event: DynamoDBStreamEvent) => {
  await createIndexIfNotExist();
  try {
    if (event.Records.length > 1) {
      const docs = event.Records.map((Record) => {
        if (Record.eventName === 'INSERT') {
          if (Record.dynamodb?.NewImage) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const doc = unmarshall(Record.dynamodb.NewImage);
              return doc;
            } catch (error) {
              console.log('ddb-to-es', 'cannot unmarshall', error);
              return null;
            }
          }
        }
      });
      console.log('ddb-to-es', 'bulk insertion', docs);
      await bulkInsert(docs);
    }
    if (event.Records.length === 1) {
      const record = event.Records[0];
      if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.NewImage);
        console.log('ddb-to-es', 'insertion', doc);
        await singleInsert(doc);
      }
    }
  } catch (error) {
    console.error('ddb-to-es', 'error', error);
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'ok',
  };
};
