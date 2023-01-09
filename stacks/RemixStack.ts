import {
  dependsOn,
  StackContext,
  RemixSite,
  use,
  Topic,
  Function,
} from '@serverless-stack/resources';
import { createUserTable, createReferenceTable, createTranslationTable } from './database';
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice';
import { isProd } from '../utils';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RemovalPolicy } from 'aws-cdk-lib';

const ddb_to_es = (stack: StackContext['stack'], url: string) => {
  return new Function(stack, 'Function', {
    srcPath: 'services/functions/ddb-to-es',
    handler: 'index.handler',
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
          masterNodes: 3,
          dataNodes: 2,
          dataNodeInstanceType: 't3.medium.search',
          masterNodeInstanceType: 't3.small.search',
        },
        enforceHttps: true,
        ebs: {
          volumeSize: 20,
        },
        zoneAwareness: {
          availabilityZoneCount: 2,
        },
        logging: {
          slowSearchLogEnabled: true,
          appLogEnabled: true,
          slowIndexLogEnabled: true,
        },
      })
    : new Domain(stack, `${process.env.ENV}-Domain`, {
        version: EngineVersion.ELASTICSEARCH_7_10,
        capacity: {
          dataNodeInstanceType: 't3.small.search',
          masterNodeInstanceType: 't3.small.search',
        },
        removalPolicy: isProd() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
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
  const esAccess = new iam.PolicyStatement({
    actions: ['es:ESHttpPost', 'es:ESHttpPut', 'es:ESHttpDelete'],
    resources: ['*'],
  });
  esfunc.addToRolePolicy(esAccess);
  const userTable = await createUserTable(stack);
  const commentTable = await createReferenceTable(stack, esfunc);
  const translationTable = await createTranslationTable(stack, esfunc);
  return {
    userTable,
    commentTable,
    translationTable,
    esfunc,
  };
}

export async function SNSStack({ stack }: StackContext) {
  dependsOn(TableStack);
  const { translationTable } = use(TableStack);
  const topic = new Topic(stack, 'SUTRA', {
    subscribers: {
      subscriber: {
        function: {
          srcPath: 'services/functions/feed',
          handler: 'index.handler',
          environment: {
            TRANSLATION_TABLE: translationTable.tableName,
          },
          permissions: [translationTable],
        },
      },
    },
  });
  return { topic };
}

export async function RemixStack({ stack }: StackContext) {
  dependsOn(ESStack);
  dependsOn(TableStack);
  dependsOn(SNSStack);
  const { domain } = use(ESStack);
  const { translationTable, userTable, commentTable } = use(TableStack);
  const { topic } = use(SNSStack);
  const site = new RemixSite(stack, 'Site', {
    path: 'remix-app/',
    environment: {
      SESSION_SECRET: process.env.SESSION_SECRET ?? '',
      USER_TABLE: userTable.tableName,
      COMMENT_TABLE: commentTable.tableName,
      TRANSLATION_TABLE: translationTable.tableName,
      REGION: process.env.REGION ?? '',
      ENV: process.env.ENV ?? '',
      DEEPL_AUTHKEY: process.env.DEEPL_AUTHKEY ?? '',
      TOPIC_ARN: topic.topicArn,
      ES_URL: domain.domainEndpoint,
    },
  });
  const esAccess = new iam.PolicyStatement({
    actions: ['es:Search'],
    resources: ['*'],
  });
  site.attachPermissions([userTable, commentTable, translationTable, topic, esAccess]);
  stack.addOutputs({
    URL: site.url,
  });
}
