import { NextRequest, NextResponse } from 'next/server';
import { bookings } from '../../../lib/data';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const booking = bookings.find(b => b.id === id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const twilioClient = twilio(
    process.env.TWILIO_SID!,
    process.env.TWILIO_TOKEN!
  );

  const room = await twilioClient.video.v1.rooms.create({
    uniqueName: id,
    type: 'go',
  });

  booking.roomUrl = `https://video.twilio.com/v1/Rooms/${room.sid}`;
  return NextResponse.json({ url: booking.roomUrl });
}
