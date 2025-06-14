import { strict as assert } from 'assert';
import { bookings } from '../lib/data';
import { GET, POST } from '../app/api/bookings/route';
import { NextRequest } from 'next/server';

describe('bookings API', () => {
  beforeEach(() => { bookings.length = 0; });

  it('creates a booking', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ date: '2025-01-01', time: '10:00', name: 'A', email: 'a@b.com', notes: 'hi' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(bookings.length, 1);
    assert.equal(res.data.date, '2025-01-01');
  });

  it('lists bookings', async () => {
    bookings.push({ id: '1', date: 'd', time: 't', name: 'A', email: 'a', notes: 'n' });
    const res: any = await GET();
    assert.deepEqual(res.data, bookings);
  });
});
