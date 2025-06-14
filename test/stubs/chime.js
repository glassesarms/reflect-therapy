class ChimeSDKMeetingsClient {
  async send(cmd) {
    if (cmd.constructor.name === 'CreateMeetingCommand') {
      return { Meeting: { MeetingId: 'MID' } };
    }
    if (cmd.constructor.name === 'CreateAttendeeCommand') {
      if (!this.count) this.count = 0;
      this.count += 1;
      return { Attendee: { AttendeeId: `AID${this.count}`, JoinToken: `TOKEN${this.count}` } };
    }
    if (cmd.constructor.name === 'GetMeetingCommand') {
      return {
        Meeting: {
          MeetingId: 'MID',
          MediaPlacement: {
            AudioHostUrl: 'AUDIO',
            SignalingUrl: 'SIGNAL',
            TurnControlUrl: 'TURN',
          },
        },
      };
    }
    return {};
  }
}
class CreateMeetingCommand { constructor() {} }
class CreateAttendeeCommand { constructor() {} }
class GetMeetingCommand { constructor() {} }
module.exports = { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, GetMeetingCommand };
