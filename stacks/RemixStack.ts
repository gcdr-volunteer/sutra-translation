import { dependsOn, StackContext, RemixSite, use, Topic, Function } from 'sst/constructs';
import {
  createUserTable,
  createReferenceTable,
  createTranslationTable,
  createHistoryTable,
} from './database';
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice';
import { isProd } from '../utils';
import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { WebsocketStack } from './websocket';

const ddb_to_es = (stack: StackContext['stack'], url: string) => {
  return new Function(stack, 'Function', {
    permissions: ['es'],
    handler: 'services/functions/ddb-to-es/index.handler',
    timeout: '15 minutes',
    environment: {
      ES_URL: url,
      REGION: process.env.REGION ?? 'ap-southeast-2',
    },
  });
};

export async function ESStack({ stack }: StackContext) {
  const domain = isProd()
    ? new Domain(stack, 'Domain', {
        version: EngineVersion.ELASTICSEARCH_7_10,
        capacity: {
          dataNodes: 1,
          masterNodes: 0,
          dataNodeInstanceType: 't3.medium.search',
        },
        enforceHttps: true,
        ebs: {
          volumeSize: 20,
        },
        logging: {
          slowSearchLogEnabled: true,
          appLogEnabled: true,
          slowIndexLogEnabled: true,
        },
        removalPolicy: RemovalPolicy.RETAIN,
      })
    : new Domain(stack, `${process.env.ENV}-Domain`, {
        version: EngineVersion.ELASTICSEARCH_7_10,
        capacity: {
          dataNodes: 1,
          masterNodes: 0,
          dataNodeInstanceType: 't3.small.search',
        },
        removalPolicy: RemovalPolicy.DESTROY,
      });
  stack.addOutputs({
    ES_URL: domain.domainEndpoint,
  });
  return { domain };
}

export async function TableStack({ stack }: StackContext) {
  dependsOn(ESStack);
  const { domain } = use(ESStack);
  const esfunc = ddb_to_es(stack, domain.domainEndpoint);
  const userTable = await createUserTable(stack);
  const referenceTable = await createReferenceTable(stack, esfunc);
  const translationTable = await createTranslationTable(stack, esfunc);
  const historyTable = await createHistoryTable(stack);
  return {
    userTable,
    referenceTable,
    translationTable,
    historyTable,
    esfunc,
  };
}

export async function SNSStack({ stack }: StackContext) {
  dependsOn(TableStack);
  const { translationTable, referenceTable } = use(TableStack);
  const topic = new Topic(stack, 'SUTRA', {
    subscribers: {
      subscriber: {
        function: {
          handler: 'services/functions/feed/index.handler',
          environment: {
            TRANSLATION_TABLE: translationTable.tableName,
            REFERENCE_TABLE: referenceTable.tableName,
          },
          permissions: [translationTable, referenceTable],
        },
      },
    },
  });
  return { topic };
}

export async function RemixStack({ stack }: StackContext) {
  dependsOn(ESStack);
  const { domain } = use(ESStack);
  dependsOn(WebsocketStack);
  dependsOn(TableStack);
  dependsOn(SNSStack);
  const { translationTable, userTable, referenceTable, historyTable } = use(TableStack);
  const { topic } = use(SNSStack);
  const { websocket } = use(WebsocketStack);
  const site = new RemixSite(stack, 'Site', {
    permissions: ['ses', 'es'],
    path: 'remix-app/',
    timeout: '60 seconds',
    nodejs: {
      format: 'cjs',
    },
    customDomain: process.env.ENV === 'prod' ? 'btts-kumarajiva.org' : undefined,
    environment: {
      SESSION_SECRET: process.env.SESSION_SECRET ?? '',
      USER_TABLE: userTable.tableName,
      REFERENCE_TABLE: referenceTable.tableName,
      TRANSLATION_TABLE: translationTable.tableName,
      HISTORY_TABLE: historyTable.tableName,
      REGION: process.env.REGION ?? '',
      ENV: process.env.ENV ?? '',
      DEEPL_AUTHKEY: process.env.DEEPL_AUTHKEY ?? '',
      TOPIC_ARN: topic.topicArn,
      ES_URL: domain.domainEndpoint,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
      WEBSOCKET_URL: websocket.url,
    },
    runtime: 'nodejs16.x',
    cdk: {
      bucket: {
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
        accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      },
    },
  });
  site.attachPermissions([userTable, referenceTable, translationTable, historyTable, topic]);
  stack.addOutputs({
    URL: site.url || 'localhost',
    Site: site.customDomainUrl || 'localhost',
  });
}
