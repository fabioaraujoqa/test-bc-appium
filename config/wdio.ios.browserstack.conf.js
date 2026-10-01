const path = require("path");
exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  services: [
    [
      "browserstack",
      {
        testObservability: true,
        testObservabilityOptions: {
          projectName: "Testes iOS Para BrowserStack",
          buildName: "Projeto BrowserStack - Aula iOS",
        },
      },
    ],
  ],

  specs: [path.join(__dirname, "../specs/bc/ios/**/*.js")],

  capabilities: [
    {
      platformName: "iOS",
      "appium:deviceName": "iPhone 13",
      "appium:platformVersion": "15.0",
      "appium:automationName": "XCUITest",
      "appium:app": process.env.BROWSERSTACK_APP_ID,
    },
  ],
};
