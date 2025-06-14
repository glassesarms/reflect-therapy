import { NextRequest, NextResponse } from 'next/server';
import { getBooking, setRoomUrl } from '../../../lib/data';
import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
} from '@aws-sdk/client-chime-sdk-meetings';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (booking.roomUrl) {
    return NextResponse.json({ url: booking.roomUrl });
  }

  const client = new ChimeSDKMeetingsClient({});
  try {
    const meetingRes = await client.send(
      new CreateMeetingCommand({
        ClientRequestToken: id,
        MediaRegion: process.env.AWS_REGION || 'us-east-1',
        ExternalMeetingId: id,
      })
    );

    const attendeeRes = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meetingRes.Meeting!.MeetingId!,
        ExternalUserId: `admin-${id}`,
      })
    );

    const joinUrl = `/room?meetingId=${encodeURIComponent(
      meetingRes.Meeting!.MeetingId!
    )}&attendeeId=${encodeURIComponent(attendeeRes.Attendee!.AttendeeId!)}&token=${encodeURIComponent(
      attendeeRes.Attendee!.JoinToken!
    )}`;
    await setRoomUrl(id, joinUrl);
    return NextResponse.json({ url: joinUrl });
  } catch (err: any) {
    console.error('Chime create meeting failed', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to create meeting';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
