import { strict as assert } from 'assert';
import { POST } from '../app/api/create-room/route';
import { NextRequest } from 'next/server';
import { bookings } from '../lib/data';

describe('create-room API', () => {
  beforeEach(() => {
    bookings.length = 0;
  });

  it('creates room for booking', async () => {
    const now = new Date(Date.now() + 5 * 60 * 1000);
    bookings.push({ id: '1', date: now.toISOString().slice(0,10), time: now.toISOString().slice(11,16), name: 'A', email: 'a', notes: 'n' });
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: '1' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(
      res.data.adminUrl,
      '/room?meetingId=MID&attendeeId=AID1&token=TOKEN1'
    );
    assert.equal(
      res.data.clientUrl,
      '/room?meetingId=MID&attendeeId=AID2&token=TOKEN2'
    );
  });

  it('returns 404 for missing booking', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: 'x' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 404);
  });

  it('creates room even if too early', async () => {
    bookings.push({ id: '2', date: '2099-01-01', time: '10:00', name: 'B', email: 'b', notes: 'n' });
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: '2' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(
      res.data.adminUrl,
      '/room?meetingId=MID&attendeeId=AID1&token=TOKEN1'
    );
    assert.equal(
      res.data.clientUrl,
      '/room?meetingId=MID&attendeeId=AID2&token=TOKEN2'
    );
  });

  it('returns existing room url', async () => {
    const now = new Date();
    bookings.push({ id: '3', date: now.toISOString().slice(0,10), time: now.toISOString().slice(11,16), name: 'C', email: 'c', notes: 'n', adminUrl: 'foo', clientUrl: 'bar' });
    const req = new NextRequest('http://test', { body: JSON.stringify({ id: '3' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(res.data.adminUrl, 'foo');
    assert.equal(res.data.clientUrl, 'bar');
  });
});
