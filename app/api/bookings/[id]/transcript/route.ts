import { NextRequest, NextResponse } from 'next/server';
import { appendTranscript, getTranscript, setTranscript } from '../../../../../lib/data';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const transcript = await getTranscript(params.id);
  // If transcription hasn't started yet return an empty string rather than 404
  if (!transcript) {
    return NextResponse.json({ transcript: '' });
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
