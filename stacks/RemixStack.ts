import {
  dependsOn,
  StackContext,
  RemixSite,
  use,
  Topic,
  Function,
} from '@serverless-stack/resources';
import { createUserTable, createReferenceTable, createTranslationTable } from './database';
import * as iam from 'aws-cdk-lib/aws-iam';

const ddb_to_es = (stack: StackContext['stack']) => {
  return new Function(stack, 'Function', {
    srcPath: 'services/functions/ddb-to-es',
    handler: 'index.handler',
    timeout: '15 minutes',
    environment: {
      ES_URL: process.env.ES_URL ?? '',
      REGION: process.env.REGION ?? 'ap-southeast-2',
    },
  });
};

export async function TableStack({ stack }: StackContext) {
  const esfunc = ddb_to_es(stack);
  const esAccess = new iam.PolicyStatement({
    actions: ['aoss:*'],
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
  const { translationTable, commentTable } = use(TableStack);
  const topic = new Topic(stack, 'SUTRA', {
    subscribers: {
      subscriber: {
        function: {
          srcPath: 'services/functions/feed',
          handler: 'index.handler',
          environment: {
            TRANSLATION_TABLE: translationTable.tableName,
            COMMENT_TABLE: commentTable.tableName,
          },
          permissions: [translationTable, commentTable],
        },
      },
    },
  });
  return { topic };
}

export async function RemixStack({ stack }: StackContext) {
  dependsOn(TableStack);
  dependsOn(SNSStack);
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
      ES_URL: process.env.ES_URL ?? '',
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
