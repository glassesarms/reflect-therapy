module.exports = function() {
  return {
    video: {
      v1: {
        rooms: {
          create: async () => ({ sid: 'RM_TEST' })
        }
      }
    }
  };
};
