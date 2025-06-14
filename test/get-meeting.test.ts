import { strict as assert } from 'assert';
import { GET } from '../app/api/meetings/[id]/route';
import { NextRequest } from 'next/server';

describe('get meeting API', () => {
  it('returns meeting info', async () => {
    const req = new NextRequest('http://test');
    const res: any = await GET(req, { params: { id: 'MID' } });
    assert.equal(res.status, 200);
    assert.deepEqual(res.data, {
      meeting: {
        MeetingId: 'MID',
        MediaPlacement: {
          AudioHostUrl: 'AUDIO',
          SignalingUrl: 'SIGNAL',
          TurnControlUrl: 'TURN',
        },
      },
    });
  });
});
