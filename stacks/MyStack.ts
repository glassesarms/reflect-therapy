import { StackContext, NextjsSite, Table } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export function MyStack({ stack }: StackContext) {
  const table = new Table(stack, 'Bookings', {
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
    bind: [table, blockouts],
    environment: {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
      BLOCKOUTS_TABLE_NAME: blockouts.tableName,
      EMAIL_FROM: process.env.EMAIL_FROM!,
    },
  });

  // Allow the site to create Amazon Chime meetings
  site.attachPermissions(["chime:*"]);

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
