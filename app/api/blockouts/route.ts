import { NextRequest, NextResponse } from 'next/server';
import { listBlockouts, createBlockout, Blockout } from '../../../lib/data';
import { randomUUID } from 'crypto';

export async function GET() {
  const items = await listBlockouts();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { date, time, reason } = await req.json();
  const blockout: Blockout = {
    id: randomUUID(),
    date,
    time,
    reason,
  };
  await createBlockout(blockout);
  return NextResponse.json(blockout);
}
