import { dependsOn, StackContext, RemixSite, use, Topic } from '@serverless-stack/resources';
import { createUserTable, createReferenceTable, createTranslationTable } from './database';

export async function TableStack({ stack }: StackContext) {
  const userTable = await createUserTable(stack);
  const commentTable = await createReferenceTable(stack);
  const translationTable = await createTranslationTable(stack);
  return {
    userTable,
    commentTable,
    translationTable,
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
          handler: 'sutra.handler',
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
    },
  });
  site.attachPermissions([userTable, commentTable, translationTable, topic]);
  stack.addOutputs({
    URL: site.url,
  });
}
