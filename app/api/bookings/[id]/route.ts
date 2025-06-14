import { NextResponse } from 'next/server';
import { cancelBooking } from '../../../../lib/data';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await cancelBooking(params.id);
  return NextResponse.json({ ok: true });
}
