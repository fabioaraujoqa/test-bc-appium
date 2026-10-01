const path = require("path");

exports.config = {

  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

   runner: "local",
  services: [
    ['browserstack', {
      testObservability: true,
      browserstackLocal: false 
    }]
  ],

  specs: [path.join(__dirname, "../specs/bc/android/**/*.js")],
  exclude: [],


  maxInstances: 1, 

  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Google Pixel 6',
    'appium:platformVersion': '12.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': 'bs://e586d6229a50e51976b786e7f140969bcc20c38e',
    'appium:autoGrantPermissions': true,

    'bstack:options': {
      projectName: "Projeto QA Mobile",
      buildName: "Build Android - 001",
      sessionName: "Teste Mobile Android com Appium",
      appiumVersion: "2.0.1" // ou o que BrowserStack recomenda
    }
  }],

  logLevel: "info",
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
};
