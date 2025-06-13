import { NextRequest, NextResponse } from 'next/server';
import { getBooking, setRoomUrl } from '../../../lib/data';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (booking.roomUrl) {
    return NextResponse.json({ url: booking.roomUrl });
  }


  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN
  );

  try {
    const room = await twilioClient.video.v1.rooms.create({
      uniqueName: id,
      type: 'go',
    });

    const roomUrl = room.url;
    await setRoomUrl(id, roomUrl);
    return NextResponse.json({ url: roomUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
