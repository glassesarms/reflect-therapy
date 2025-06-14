class ChimeSDKMeetingsClient {
  async send(cmd) {
    if (cmd.constructor.name === 'CreateMeetingCommand') {
      return { Meeting: { MeetingId: 'MID' } };
    }
    if (cmd.constructor.name === 'CreateAttendeeCommand') {
      return { Attendee: { AttendeeId: 'AID', JoinToken: 'TOKEN' } };
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
