import { strict as assert } from 'assert';
import { POST } from '../app/api/create-room/route';
import { NextRequest } from 'next/server';
import { bookings } from '../lib/data';
import twilio from 'twilio';

describe('create-room API', () => {
  beforeEach(() => {
    bookings.length = 0;
    bookings.push({ id: '1', date: 'd', time: 't', notes: 'n' });
  });

  it('creates room for booking', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: '1' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.ok(res.data.url.includes('RM_TEST'));
  });

  it('returns 404 for missing booking', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: 'x' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 404);
  });
});
