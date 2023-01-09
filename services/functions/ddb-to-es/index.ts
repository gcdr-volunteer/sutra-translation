import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  bulkInsert,
  createIndexIfNotExist,
  singleDelete,
  singleInsert,
} from './services/opensearch.services';
export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    await createIndexIfNotExist();
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
      const resp = await bulkInsert(docs);
      console.log('ddb-to-es', 'bulk insertion response', resp);
    }
    if (event.Records.length === 1) {
      const record = event.Records[0];
      if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.NewImage);
        if (doc.PK && doc.SK && doc.kind !== 'COMMENT') {
          console.log('ddb-to-es', 'single insertion', doc);
          const resp = await singleInsert(doc);
          console.log('ddb-to-es', 'single insertion response', resp);
        }
      }
      if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.OldImage);
        if (doc.PK && doc.SK && doc.kind !== 'COMMENT') {
          console.log('ddb-to-es', 'single delete', doc);
          const resp = await singleDelete(`${doc.PK}-${doc.SK}`);
          console.log('ddb-to-es', 'single delete response', resp);
        }
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
