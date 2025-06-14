import { strict as assert } from 'assert';
import { bookings } from '../lib/data';
import { DELETE } from '../app/api/bookings/[id]/route';
import { NextRequest } from 'next/server';

describe('cancel booking API', () => {
  beforeEach(() => { bookings.length = 0; });

  it('marks booking as cancelled', async () => {
    bookings.push({ id: '1', date: 'd', time: 't', name: 'A', email: 'a', notes: 'n', status: 'booked' });
    const req = new NextRequest('http://test');
    const res: any = await DELETE(req, { params: { id: '1' } });
    assert.equal(res.status, 200);
    assert.equal(bookings[0].status, 'cancelled');
  });
});
