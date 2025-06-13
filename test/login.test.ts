import { strict as assert } from 'assert';
import { POST } from '../app/api/login/route';
import { NextRequest } from 'next/server';

describe('login API', () => {
  before(() => { process.env.ADMIN_PASSWORD = 'secret'; });

  it('accepts correct password', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ password: 'secret' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 200);
    assert.equal(res.data.ok, true);
    assert.equal(res.cookies.last.name, 'auth');
  });

  it('rejects wrong password', async () => {
    const req = new NextRequest('http://test', { body: JSON.stringify({ password: 'bad' }) });
    const res: any = await POST(req);
    assert.equal(res.status, 401);
    assert.equal(res.data.ok, false);
  });
});
