module.exports = function () {
  return {
    autoDetect: true,
    testFramework: {
      configFile: './jest.config.wallaby.js',
    },
    debug: true,
  };
};
