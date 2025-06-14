import { strict as assert } from 'assert';
import { bookings } from '../lib/data';
import { GET, POST } from '../app/api/bookings/[id]/transcript/route';
import { POST as START } from '../app/api/bookings/[id]/start-transcription/route';
import { NextRequest } from 'next/server';

describe('transcript API', () => {
  beforeEach(() => { bookings.length = 0; });

  it('sets and retrieves transcript', async () => {
    bookings.push({ id: '1', date: 'd', time: 't', name: 'A', email: 'e', notes: 'n' });
    const postReq = new NextRequest('http://test', { body: JSON.stringify({ transcript: 'hello world' }) });
    const postRes: any = await POST(postReq, { params: { id: '1' } });
    assert.equal(postRes.status, 200);

    const getRes: any = await GET(new NextRequest('http://test'), { params: { id: '1' } });
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.transcript, 'hello world');
  });

  it('appends transcript chunks', async () => {
    bookings.push({ id: '2', date: 'd', time: 't', name: 'B', email: 'b', notes: 'n' });
    await POST(new NextRequest('http://test', { body: JSON.stringify({ transcript: 'hello ' }) }), { params: { id: '2' } });
    await POST(new NextRequest('http://test', { body: JSON.stringify({ transcript: 'world', append: true }) }), { params: { id: '2' } });
    const res: any = await GET(new NextRequest('http://test'), { params: { id: '2' } });
    assert.equal(res.data.transcript, 'hello world');
  });

  it('returns empty transcript when none set', async () => {
    const res: any = await GET(new NextRequest('http://test'), { params: { id: 'x' } });
    assert.equal(res.status, 200);
    assert.equal(res.data.transcript, '');
  });

  it('starts meeting transcription', async () => {
    bookings.push({ id: '5', date: 'd', time: 't', name: 'D', email: 'd', notes: 'n', meetingId: 'MID' });
    const res: any = await START(new NextRequest('http://test'), { params: { id: '5' } });
    assert.equal(res.status, 200);
  });
});
