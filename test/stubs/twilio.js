function twilio() {
  return {
    video: {
      v1: {
        rooms: {
          create: async () => ({ sid: 'RM_TEST' })
        }
      }
    }
  };
}

twilio.jwt = {
  AccessToken: class {
    constructor() {}
    addGrant() {}
    toJwt() { return 'TOKEN'; }
    static VideoGrant = class { constructor(opts) { this.room = opts.room; } };
  }
};

module.exports = twilio;
