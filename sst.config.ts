import { SSTConfig } from 'sst';
import {
  RemixStack,
  TableStack,
  // ESStack,
  SNSStack,
  WebsocketTable,
  WebsocketStack,
} from './stacks';

export default {
  config() {
    return {
      name: 'sutra-translation',
      region: 'ap-southeast-2',
    };
  },
  async stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
      nodejs: {
        format: 'cjs',
      },
    });
    // await app.stack(ESStack);
    await app.stack(TableStack);
    await app.stack(SNSStack);
    await app.stack(WebsocketTable);
    await app.stack(WebsocketStack);
    await app.stack(RemixStack);
  },
} satisfies SSTConfig;
