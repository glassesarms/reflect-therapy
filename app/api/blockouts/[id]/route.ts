import { NextResponse } from 'next/server';
import { deleteBlockout } from '../../../../lib/data';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteBlockout(params.id);
  return NextResponse.json({ ok: true });
}
