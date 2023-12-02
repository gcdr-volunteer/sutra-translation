import { StackContext, WebSocketApi, use } from 'sst/constructs';
import { WebsocketTable } from './websocketTable';
import { TableStack } from './RemixStack';

export const WebsocketStack = ({ stack }: StackContext) => {
  const { table } = use(WebsocketTable);
  const { referenceTable } = use(TableStack);

  const websocket = new WebSocketApi(stack, 'websocket', {
    defaults: {
      function: {
        timeout: '15 minutes',
        bind: [table, referenceTable],
        environment: {
          WEBSOCKET_TABLE_NAME: table.tableName,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
          REFERENCE_TABLE: referenceTable.tableName,
        },
      },
    },
    routes: {
      $connect: 'services/functions/websocket/connect.main',
      $disconnect: 'services/functions/websocket/disconnect.main',
      sendmessage: 'services/functions/websocket/sendMessage.main',
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    WebSocketApiEndpoint: websocket.url,
  });
  return {
    websocket,
  };
};
