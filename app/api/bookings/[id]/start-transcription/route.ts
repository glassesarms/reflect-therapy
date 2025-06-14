import { NextResponse } from 'next/server';
import { getBooking } from '../../../../../lib/data';
import {
  ChimeSDKMeetingsClient,
  StartMeetingTranscriptionCommand,
} from '@aws-sdk/client-chime-sdk-meetings';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);
  if (!booking || !booking.meetingId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const client = new ChimeSDKMeetingsClient({});
  try {
    await client.send(
      new StartMeetingTranscriptionCommand({
        MeetingId: booking.meetingId,
        TranscriptionConfiguration: {
          EngineTranscribeSettings: {
            LanguageCode: 'en-US',
            Region: (process.env.AWS_REGION || 'us-east-1') as any,
          },
        },
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Start transcription failed', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to start transcription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
