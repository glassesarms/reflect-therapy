import { NextRequest, NextResponse } from 'next/server';
import { listBookings, createBooking, Booking } from '../../../lib/data';
import { randomUUID } from 'crypto';

export async function GET() {
  const items = await listBookings();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { date, time, notes } = await req.json();
  const iso = new Date(`${date}T${time}Z`).toISOString();
  const booking: Booking = {
    id: randomUUID(),
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
    notes,
  };
  await createBooking(booking);
  return NextResponse.json(booking);
}
