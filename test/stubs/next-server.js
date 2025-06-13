class NextResponse {
  constructor(data, init = {}) {
    this.data = data;
    this.status = init.status || 200;
    this.cookies = { last: null, set: (name, value, opts) => { this.cookies.last = { name, value, opts }; } };
  }
  static json(data, init = {}) {
    return new NextResponse(data, init);
  }
}
class NextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.body = init.body || '';
  }
  async json() {
    return JSON.parse(this.body || '{}');
  }
}
module.exports = { NextRequest, NextResponse };
