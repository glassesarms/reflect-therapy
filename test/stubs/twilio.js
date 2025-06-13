module.exports = function() {
  return {
    video: {
      v1: {
        rooms: {
          create: async () => ({ sid: 'RM_TEST', url: 'https://video.twilio.com/v1/Rooms/RM_TEST' })
        }
      }
    }
  };
};
