import { StackContext, NextjsSite, Table } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export function MyStack({ stack }: StackContext) {
  const bookings = new Table(stack, 'Bookings', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const blockouts = new Table(stack, 'Blockouts', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const site = new NextjsSite(stack, 'Site', {
    path: '.',
    bind: [bookings, blockouts],
    environment: {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
      BLOCKOUTS_TABLE_NAME: blockouts.tableName,
      BOOKINGS_TABLE_NAME: bookings.tableName,
      EMAIL_FROM: process.env.EMAIL_FROM!,
    },
  });

  // Allow the site to create Amazon Chime meetings and send emails/SMS
  site.attachPermissions([
    "chime:*",
    "ses:SendEmail",
    "sns:Publish",
  ]);

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
