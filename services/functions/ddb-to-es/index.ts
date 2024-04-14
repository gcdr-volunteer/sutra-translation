import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  makeBulkActions,
  createIndexIfNotExist,
  singleDelete,
  singleInsert,
  singleUpdate,
  IndexName,
} from './services/opensearch.services';
export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    await createIndexIfNotExist();
    if (event.Records.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bulkPayload: Record<IndexName, Record<string, any>[]> = {
        glossary: [],
        translation: [],
      };
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
                bulkPayload['translation'].push(newDoc);
                bulkPayload['translation'].push(doc);
              }
              if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
                const newDoc = {
                  index: {
                    _index: 'glossary',
                    _id: `${doc.PK}-${doc.SK}`,
                    _type: '_doc',
                  },
                };
                bulkPayload['glossary'].push(newDoc);
                bulkPayload['glossary'].push(doc);
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
                bulkPayload['translation'].push(newDoc);
              }
              if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
                const newDoc = {
                  delete: {
                    _index: 'glossary',
                    _id: `${doc.PK}-${doc.SK}`,
                  },
                };
                bulkPayload['glossary'].push(newDoc);
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
                bulkPayload['translation'].push(newDoc);
                bulkPayload['translation'].push({ doc });
              }

              if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
                const newDoc = {
                  update: {
                    _index: 'glossary',
                    _id: `${doc.PK}-${doc.SK}`,
                  },
                };
                bulkPayload['glossary'].push(newDoc);
                bulkPayload['glossary'].push({ doc });
              }
              return null;
            } catch (error) {
              console.log('ddb-to-es', 'cannot unmarshall', error);
              return null;
            }
          }
        }
      });
      console.log('ddb-to-es', 'bulk actions', bulkPayload);
      for (const [key, value] of Object.entries(bulkPayload)) {
        if (key === 'glossary' && value.length > 0) {
          const resp = await makeBulkActions(bulkPayload['glossary'], 'glossary');
          console.log('ddb-to-es', 'bulk actions response', resp);
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'bulk actions response', resp);
          }
        }
        if (key === 'translation' && value.length > 0) {
          const resp = await makeBulkActions(bulkPayload['translation'], 'translation');
          console.log('ddb-to-es', 'bulk actions response', resp);
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'bulk actions response', resp);
          }
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
          const resp = await singleInsert(doc, 'translation');
          if (resp.statusCode !== 201) {
            console.log('ddb-to-es', 'single insertion response', resp);
          }
        }
        if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
          console.info('ddb-to-es', 'single insertion', doc);
          const resp = await singleInsert(doc, 'glossary');
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
        if (doc.PK && doc.SK && ['PARAGRAPH', 'REFERENCE'].includes(doc.kind)) {
          console.log('ddb-to-es', 'single delete', doc);
          const resp = await singleDelete(`${doc.PK}-${doc.SK}`, 'translation');
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'single delete response', resp);
          }
        }
        if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
          console.log('ddb-to-es', 'single delete', doc);
          const resp = await singleDelete(`${doc.PK}-${doc.SK}`, 'glossary');
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
          const resp = await singleUpdate(doc, 'translation');
          if (resp.statusCode !== 200) {
            console.log('ddb-to-es', 'single update response', resp);
          }
        }
        if (doc.PK && doc.SK && ['GLOSSARY'].includes(doc.kind)) {
          console.log('ddb-to-es', 'single update', doc);
          const resp = await singleUpdate(doc, 'glossary');
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
