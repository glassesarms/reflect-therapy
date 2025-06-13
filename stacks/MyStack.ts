import { StackContext, NextjsSite, Table } from 'sst/constructs';

export function MyStack({ stack }: StackContext) {
  const table = new Table(stack, 'Bookings', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const site = new NextjsSite(stack, 'Site', {
    path: '.',
    bind: [table],
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
