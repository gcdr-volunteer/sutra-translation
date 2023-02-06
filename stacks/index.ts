import { SNSStack, RemixStack, TableStack, ESStack } from './RemixStack';
import { App } from '@serverless-stack/resources';

export default async function (app: App) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services/functions',
    bundle: {
      format: 'esm',
    },
    memorySize: '128 MB',
    timeout: '10 minutes',
  });
  await app.stack(ESStack);
  await app.stack(TableStack);
  await app.stack(SNSStack);
  await app.stack(RemixStack);
}
