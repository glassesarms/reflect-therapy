class ChimeSDKMeetingsClient {
  async send(cmd) {
    if (cmd.constructor.name === 'CreateMeetingCommand') {
      return { Meeting: { MeetingId: 'MID' } };
    }
    if (cmd.constructor.name === 'CreateAttendeeCommand') {
      return { Attendee: { AttendeeId: 'AID', JoinToken: 'TOKEN' } };
    }
    return {};
  }
}
class CreateMeetingCommand { constructor() {} }
class CreateAttendeeCommand { constructor() {} }
module.exports = { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand };
