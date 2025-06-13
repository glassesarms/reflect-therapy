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
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
      TWILIO_API_KEY: process.env.TWILIO_API_KEY!,
      TWILIO_API_SECRET: process.env.TWILIO_API_SECRET!,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
