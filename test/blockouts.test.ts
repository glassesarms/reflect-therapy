import { strict as assert } from 'assert';
import { blockouts } from '../lib/data';
import { GET, POST } from '../app/api/blockouts/route';
import { DELETE } from '../app/api/blockouts/[id]/route';
import { NextRequest } from 'next/server';

describe('blockouts API', () => {
  beforeEach(() => { blockouts.length = 0; });

  it('creates a blockout', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ date: '2025-01-01', time: '10:00', reason: 'busy' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(blockouts.length, 1);
  });

  it('lists blockouts', async () => {
    blockouts.push({ id: '1', date: 'd', time: 't' });
    const res: any = await GET();
    assert.deepEqual(res.data, blockouts);
  });

  it('deletes a blockout', async () => {
    blockouts.push({ id: '2', date: 'd', time: 't' });
    const req = new NextRequest('http://test');
    const res: any = await DELETE(req, { params: { id: '2' } });
    assert.equal(res.status, 200);
    assert.equal(blockouts.length, 0);
  });
});
