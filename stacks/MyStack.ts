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
    environment: {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
      TWILIO_SID: process.env.TWILIO_SID!,
      TWILIO_TOKEN: process.env.TWILIO_TOKEN!,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
