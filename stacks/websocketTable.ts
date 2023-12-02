import { StackContext, Table } from 'sst/constructs';
export const WebsocketTable = ({ stack }: StackContext) => {
  const table = new Table(stack, 'Connections', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  return { table };
};
