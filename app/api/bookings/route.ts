import { NextRequest, NextResponse } from 'next/server';
import { bookings, Booking } from '../../../lib/data';
import { randomUUID } from 'crypto';

export async function GET() {
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const { date, time, notes } = await req.json();
  const booking: Booking = { id: randomUUID(), date, time, notes };
  bookings.push(booking);
  return NextResponse.json(booking);
}
