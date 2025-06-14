import { NextRequest, NextResponse } from 'next/server';
import { getBooking, setRoomUrls } from '../../../lib/data';
import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
} from '@aws-sdk/client-chime-sdk-meetings';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (booking.adminUrl && booking.clientUrl) {
    return NextResponse.json({ adminUrl: booking.adminUrl, clientUrl: booking.clientUrl });
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

    const adminRes = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meetingRes.Meeting!.MeetingId!,
        ExternalUserId: `admin-${id}`,
      })
    );

    const clientRes = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meetingRes.Meeting!.MeetingId!,
        ExternalUserId: `client-${id}`,
      })
    );

    const adminUrl = `/room?meetingId=${encodeURIComponent(
      meetingRes.Meeting!.MeetingId!
    )}&attendeeId=${encodeURIComponent(adminRes.Attendee!.AttendeeId!)}&token=${encodeURIComponent(
      adminRes.Attendee!.JoinToken!
    )}`;

    const clientUrl = `/room?meetingId=${encodeURIComponent(
      meetingRes.Meeting!.MeetingId!
    )}&attendeeId=${encodeURIComponent(clientRes.Attendee!.AttendeeId!)}&token=${encodeURIComponent(
      clientRes.Attendee!.JoinToken!
    )}`;

    await setRoomUrls(id, adminUrl, clientUrl);
    return NextResponse.json({ adminUrl, clientUrl });
  } catch (err: any) {
    console.error('Chime create meeting failed', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to create meeting';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
