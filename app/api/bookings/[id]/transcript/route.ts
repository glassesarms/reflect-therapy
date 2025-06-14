import { NextRequest, NextResponse } from 'next/server';
import { appendTranscript, getTranscript, setTranscript } from '../../../../../lib/data';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const transcript = await getTranscript(params.id);
  if (!transcript) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ transcript });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { transcript, append } = await req.json();
  if (append) {
    await appendTranscript(params.id, transcript);
  } else {
    await setTranscript(params.id, transcript);
  }
  return NextResponse.json({ ok: true });
}
