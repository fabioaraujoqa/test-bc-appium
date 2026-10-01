// Executar:  npm run bs-android  (smoke: npm run bs-android -- --spec tests/specs/smoke.spec.js)
//            npm run bs-ios (exige .ipa de aparelho real em BROWSERSTACK_APP_ID_IOS)
// Credenciais e app id: .env (ver .env.example) ou secrets do GitHub Actions.
const path = require('node:path');
const allureReporter = require('@wdio/allure-reporter').default;
const { carregarEnv } = require('./env.loader');
const { criarHooksDeEvidencias, deveTirarScreenshotFinal } = require('./video.hooks');

const raizProjeto = path.resolve(__dirname, '..');
const env = carregarEnv();
const ehIos = (env.BS_PLATFORM || 'android') === 'ios';

const appId = ehIos ? env.BROWSERSTACK_APP_ID_IOS : env.BROWSERSTACK_APP_ID;
const faltando = ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY'].filter((chave) => !env[chave]);
if (!appId) faltando.push(ehIos ? 'BROWSERSTACK_APP_ID_IOS' : 'BROWSERSTACK_APP_ID');
if (faltando.length) {
  throw new Error(`Faltam no .env (ou no ambiente): ${faltando.join(', ')}. Veja .env.example.`);
}

// Aparelho na nuvem; troque pelos da lista do App Automate se quiser
const aparelho = ehIos
  ? { nome: env.BS_DEVICE || 'iPhone 15', versao: env.BS_OS_VERSION || '17' }
  : { nome: env.BS_DEVICE || 'Google Pixel 6', versao: env.BS_OS_VERSION || '12.0' };

const identificadorDispositivo = `${ehIos ? 'iOS' : 'Android'} · browserstack (${aparelho.nome})`;
const slugDispositivo = `${ehIos ? 'ios' : 'android'}-browserstack-${aparelho.nome}`.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase();
const evidencias = criarHooksDeEvidencias(path.join(raizProjeto, 'screenshots', slugDispositivo));
const dirSpecs = path.join(raizProjeto, 'tests/specs');

exports.config = {
  user: env.BROWSERSTACK_USERNAME,
  key: env.BROWSERSTACK_ACCESS_KEY,
  hostname: 'hub.browserstack.com',

  services: [['browserstack', { browserstackLocal: false }]],

  specs: [
    path.join(dirSpecs, '*.spec.js'),
    path.join(dirSpecs, ehIos ? 'ios' : 'android', '**/*.spec.js'),
  ],
  maxInstances: 1,

  capabilities: [{
    platformName: ehIos ? 'iOS' : 'Android',
    'appium:automationName': ehIos ? 'XCUITest' : 'UiAutomator2',
    'appium:deviceName': aparelho.nome,
    'appium:platformVersion': aparelho.versao,
    'appium:app': appId,
    'appium:autoGrantPermissions': true,
    'bstack:options': {
      projectName: 'Banco Carrefour - App Demo',
      buildName: `${ehIos ? 'iOS' : 'Android'} - ${new Date().toISOString().slice(0, 10)}`,
      sessionName: 'Suíte WebdriverIO + Appium',
      // O padrão do BrowserStack é Appium 1.22, sem comandos que o WebdriverIO 9 usa
      // (ex.: getCurrentActivity). 3.2.0 = mesma versão do Appium local.
      appiumVersion: env.BS_APPIUM_VERSION || '3.2.0',
    },
  }],

  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 180000 },

  logLevel: env.LOG_LEVEL || 'warn',
  outputDir: path.join(raizProjeto, 'test-results', slugDispositivo),
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  reporters: [
    ['spec', { symbols: { passed: '[PASS]', failed: '[FAIL]' } }],
    ['allure', {
      outputDir: path.join(raizProjeto, 'allure-results'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: true,
    }],
  ],

  async beforeTest() {
    allureReporter.addLabel('host', identificadorDispositivo);
    allureReporter.addLabel('suite', identificadorDispositivo);
    // Sem startRecordingScreen: o BrowserStack não suporta, e já grava o vídeo da sessão no painel
  },

  async afterTest(test, context, { passed }) {
    await evidencias.finalizarGravacao(test, passed); // sem vídeo aqui: só salva o .png da falha

    if (!deveTirarScreenshotFinal()) return;
    try {
      const screenshot = await browser.takeScreenshot();
      await allureReporter.addAttachment('Screenshot final', Buffer.from(screenshot, 'base64'), 'image/png');
    } catch (erro) {
      // sessão pode já estar encerrada
    }
  },
};
