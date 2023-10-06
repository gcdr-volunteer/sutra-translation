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
              if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
                const newDoc = {
                  index: {
                    _index: 'translation',
                    _id: `${doc.PK}-${doc.SK}`,
                    _type: '_doc',
                  },
                };
                bulkActions.push(newDoc);
                bulkActions.push(doc);
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
              if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
                const newDoc = {
                  delete: {
                    _index: 'translation',
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
        if (Record.eventName === 'MODIFY') {
          if (Record.dynamodb?.OldImage) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const doc = unmarshall(Record.dynamodb.NewImage);
              if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
                const newDoc = {
                  update: {
                    _index: 'translation',
                    _id: `${doc.PK}-${doc.SK}`,
                  },
                };
                bulkActions.push(newDoc);
                bulkActions.push({ doc });
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
        console.log('ddb-to-es', 'bulk actions', bulkActions);
        const resp = await makeBulkActions(bulkActions);
        console.log('ddb-to-es', 'bulk actions response', resp);
        if (resp.statusCode !== 200) {
          console.log('ddb-to-es', 'bulk actions response', resp);
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
        if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
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
        if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
          console.log('ddb-to-es', 'single update', doc);
          const resp = await singleUpdate(doc);
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'single update response', resp);
          }
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
