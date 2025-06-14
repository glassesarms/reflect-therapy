import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '../../../lib/data';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const ses = new SESClient({});
const sns = new SNSClient({});

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const booking = await getBooking(id);
  if (!booking || !booking.roomUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const baseUrl = process.env.SITE_URL || req.nextUrl.origin;
    if (booking.email) {
      await ses.send(
        new SendEmailCommand({
          Destination: { ToAddresses: [booking.email] },
          Message: {
            Body: { Text: { Data: `Join your session at ${baseUrl}${booking.roomUrl}` } },
            Subject: { Data: 'Your session link' },
          },
          Source: process.env.EMAIL_FROM!,
        })
      );
    }
    if (booking.phone) {
      await sns.send(
        new PublishCommand({
          PhoneNumber: booking.phone,
          Message: `Join your session at ${baseUrl}${booking.roomUrl}`,
        })
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Send link failed', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to send link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
