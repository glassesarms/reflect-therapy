import { NextResponse } from 'next/server';
import {
  ChimeSDKMeetingsClient,
  GetMeetingCommand,
} from '@aws-sdk/client-chime-sdk-meetings';

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const client = new ChimeSDKMeetingsClient({});
  try {
    const res = await client.send(new GetMeetingCommand({ MeetingId: params.id }));
    if (!res.Meeting) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ meeting: res.Meeting });
  } catch (err: any) {
    console.error('Chime get meeting failed', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to get meeting';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
