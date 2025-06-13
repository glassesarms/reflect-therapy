import { StackContext, NextjsSite, Table } from 'sst/constructs';

export function MyStack({ stack }: StackContext) {
  const table = new Table(stack, 'Bookings', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  new NextjsSite(stack, 'Site', {
    path: '.',
    bind: [table],
  });
}
