const path = require("path");
exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  hostname: 'hub.browserstack.com',
  port: 443,
  protocol: 'https',
  path: '/wd/hub',

  services: [
    [
      "browserstack",
      {
        testObservability: true,
        testObservabilityOptions: {
          projectName: "Testes Android Para BrowserStack",
          buildName: "Projeto BrowserStack - Aula",
        },
      },
    ],
  ],

  specs: [path.join(__dirname, "../specs/bc/android/**/*.js")],

  capabilities: [
    {
      platformName: "Android",
      "appium:deviceName": "Google Pixel 6",
      "appium:platformVersion": "12.0",
      "appium:automationName": "UiAutomator2",
      "appium:app": process.env.BROWSERSTACK_APP_ID,
    },
  ],
};
