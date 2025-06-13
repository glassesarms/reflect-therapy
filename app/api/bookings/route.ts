import { NextRequest, NextResponse } from 'next/server';
import { listBookings, createBooking, Booking } from '../../../lib/data';
import { randomUUID } from 'crypto';

export async function GET() {
  const items = await listBookings();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { date, time, notes } = await req.json();
  const booking: Booking = { id: randomUUID(), date, time, notes };
  await createBooking(booking);
  return NextResponse.json(booking);
}
