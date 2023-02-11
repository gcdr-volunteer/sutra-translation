import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  makeBulkActions,
  createIndexIfNotExist,
  singleDelete,
  singleInsert,
  singleUpdate,
} from './services/opensearch.services';
export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    await createIndexIfNotExist();
    if (event.Records.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bulkActions: Record<string, any>[] = [];
      event.Records.forEach((Record) => {
        if (Record.eventName === 'INSERT') {
          if (Record.dynamodb?.NewImage) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const doc = unmarshall(Record.dynamodb.NewImage);
              if (doc.PK && doc.SK && doc.kind !== 'COMMENT' && !doc.PK.startsWith('ZH')) {
                const newDoc = {
                  index: {
                    index: 'translation',
                    id: `${doc.PK}-${doc.SK}`,
                    ...doc,
                  },
                };
                bulkActions.push(newDoc);
              }
              return null;
            } catch (error) {
              console.log('ddb-to-es', 'cannot unmarshall', error);
              return null;
            }
          }
        }
        if (Record.eventName === 'REMOVE') {
          if (Record.dynamodb?.OldImage) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const doc = unmarshall(Record.dynamodb.OldImage);
              if (doc.PK && doc.SK && doc.kind !== 'COMMENT' && !doc.PK.startsWith('ZH')) {
                const newDoc = {
                  delete: {
                    _id: `${doc.PK}-${doc.SK}`,
                  },
                };
                bulkActions.push(newDoc);
              }
              return null;
            } catch (error) {
              console.log('ddb-to-es', 'cannot unmarshall', error);
              return null;
            }
          }
        }
      });
      if (bulkActions.length) {
        console.log('ddb-to-es', 'bulk deletion', bulkActions);
        const resp = await makeBulkActions(bulkActions);
        if (resp.statusCode !== 200) {
          console.log('ddb-to-es', 'bulk deletion response', resp);
        }
      }
    }
    if (event.Records.length === 1) {
      const record = event.Records[0];
      if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
        console.log('single action insertion');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.NewImage);
        if (
          doc.PK &&
          doc.SK &&
          ['PARAGRAPH', 'GLOSSARY'].includes(doc.kind) &&
          !doc.PK.startsWith('ZH')
        ) {
          console.info('ddb-to-es', 'single insertion', doc);
          const resp = await singleInsert(doc);
          if (resp.statusCode !== 201) {
            console.log('ddb-to-es', 'single insertion response', resp);
          }
        }
      }
      if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage) {
        console.info('single action deletion');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.OldImage);
        if (doc.PK && doc.SK) {
          console.log('ddb-to-es', 'single delete', doc);
          const resp = await singleDelete(`${doc.PK}-${doc.SK}`);
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'single delete response', resp);
          }
        }
      }
      if (record.eventName === 'MODIFY' && record.dynamodb?.NewImage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const doc = unmarshall(record.dynamodb.NewImage);
        if (
          doc.PK &&
          doc.SK &&
          ['PARAGRAPH', 'GLOSSARY'].includes(doc.kind) &&
          !doc.PK.startsWith('ZH')
        ) {
          console.log('ddb-to-es', 'single update', doc);
          const resp = await singleUpdate(doc);
          console.log('ddb-to-es', 'single update result', resp);
        }
      }
    }
  } catch (error) {
    // console.error('ddb-to-es', 'error', error);
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'ok',
  };
};
