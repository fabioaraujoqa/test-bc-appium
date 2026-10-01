// Executar:  npm run test:bc            (Android emulador, perfil padrão)
//            npm run test:bc:celular    (Android físico, .env.bc.celular)
//            npm run test:bc:ios        (iOS simulador, .env.bc.simulador)
// Perfil:    DEVICE_PROFILE=emulador | celular | tablet | simulador  (ver docs/systems/operacao-bc.md)
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const allureReporter = require('@wdio/allure-reporter').default;
const { carregarEnvBc, identificarDispositivo } = require('./env.loader');
const { criarHooksDeEvidencias, deveTirarScreenshotFinal } = require('./video.hooks');

const raizProjeto = path.resolve(__dirname, '../..');
const env = carregarEnvBc(raizProjeto);
const ehIos = env.PLATFORM === 'ios';
const { rotulo: identificadorDispositivo, slug: slugDispositivo } = identificarDispositivo(env);

const ANDROID_PACKAGE = 'com.wdiodemoapp';
const IOS_BUNDLE_ID = 'org.wdiodemoapp';
const caminhoApp = path.join(raizProjeto, ehIos ? 'app/ios-app-wdio.app' : 'app/android-app-wdio.apk');
const dirSpecs = path.join(raizProjeto, 'tests/specs/bc');

// Subpasta por dispositivo: execuções em paralelo não sobrescrevem as evidências umas das outras
const evidencias = criarHooksDeEvidencias(
  path.join(raizProjeto, env.SCREENSHOT_DIR || 'screenshots', 'bc', slugDispositivo),
);

// Emulador: usa o UDID se ele já estiver no adb; senão o Appium sobe o AVD sozinho
function dispositivoAndroid() {
  const udid = env.ANDROID_UDID;
  if (env.DEVICE_PROFILE !== 'emulador' || !env.ANDROID_AVD) {
    return { 'appium:deviceName': udid, 'appium:udid': udid };
  }
  let conectados = '';
  try {
    conectados = execFileSync('adb', ['devices'], { encoding: 'utf8' });
  } catch {
    // adb fora do PATH: deixa o Appium resolver pelo AVD
  }
  if (udid && new RegExp(`^${udid}\\s+device$`, 'm').test(conectados)) {
    return { 'appium:deviceName': udid, 'appium:udid': udid };
  }
  return { 'appium:deviceName': env.ANDROID_AVD, 'appium:avd': env.ANDROID_AVD, 'appium:avdLaunchTimeout': 180000 };
}

const capabilityAndroid = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  // deviceName sozinho não garante o aparelho quando há mais de um no adb (emulador + celular):
  // o UiAutomator2 pode pegar "o único disponível". O udid fixa o alvo de verdade.
  ...dispositivoAndroid(),
  'appium:platformVersion': env.ANDROID_PLATFORM_VERSION || undefined,
  'appium:app': caminhoApp,
  'appium:appPackage': ANDROID_PACKAGE,
  'appium:appActivity': '.MainActivity',
  // Exclusivo por perfil, para rodar emulador e celular ao mesmo tempo
  'appium:systemPort': Number(env.SYSTEM_PORT || 8200),
};

const capabilityIos = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': env.IOS_DEVICE_NAME,
  'appium:udid': env.IOS_UDID || undefined,
  'appium:platformVersion': env.IOS_PLATFORM_VERSION || undefined,
  'appium:app': caminhoApp,
  'appium:bundleId': IOS_BUNDLE_ID,
  // Exclusivo por perfil, como o systemPort do Android
  'appium:wdaLocalPort': Number(env.WDA_LOCAL_PORT || 8100),
  // A primeira execução compila o WebDriverAgent no simulador e demora
  'appium:wdaLaunchTimeout': 300000,
  'appium:wdaConnectionTimeout': 300000,
};

exports.config = {
  runner: 'local',

  // Specs comuns às duas plataformas (smoke) + as da plataforma do perfil
  specs: [
    path.join(dirSpecs, '*.spec.js'),
    path.join(dirSpecs, ehIos ? 'ios' : 'android', '**/*.spec.js'),
  ],
  exclude: [],
  maxInstances: 1,

  capabilities: [{
    ...(ehIos ? capabilityIos : capabilityAndroid),
    // Mantém o app instalado entre sessões; o estado é limpo por reiniciarNaTelaInicial()
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 120,
  }],

  // Um processo Appium por perfil (porta própria): um Appium compartilhado por dois
  // aparelhos derruba a instrumentação do UiAutomator2 de um deles no paralelo
  hostname: '127.0.0.1',
  port: Number(env.APPIUM_PORT || 4723),
  path: '/',
  services: [['appium', {
    command: 'appium',
    args: { port: Number(env.APPIUM_PORT || 4723) },
    logPath: path.join(raizProjeto, env.TEST_RESULTS_DIR || 'test-results', slugDispositivo),
  }]],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: Number(env.MOCHA_TIMEOUT || 120000),
  },

  logLevel: env.LOG_LEVEL || 'warn',
  outputDir: path.join(raizProjeto, env.TEST_RESULTS_DIR || 'test-results', slugDispositivo),
  bail: 0,
  waitforTimeout: Number(env.WAIT_TIMEOUT || 10000),
  connectionRetryTimeout: Number(env.CONNECTION_RETRY_TIMEOUT || (ehIos ? 600000 : 120000)),
  connectionRetryCount: Number(env.CONNECTION_RETRY_COUNT || 3),

  reporters: [
    ['spec', { symbols: { passed: '[PASS]', failed: '[FAIL]' } }],
    ...(env.ALLURE_REPORTER === 'false' ? [] : [['allure', {
      outputDir: path.join(raizProjeto, 'allure-results'),
      disableWebdriverStepsReporting: true,
      // true: cada takeScreenshot() não vira anexo automático. O afterTest abaixo
      // anexa manualmente, sem duplicar o que evidenciar() já anexou.
      disableWebdriverScreenshotsReporting: true,
    }]]),
  ],

  onPrepare() {
    if (!fs.existsSync(caminhoApp)) {
      throw new Error(`App não encontrado em: ${caminhoApp}`);
    }
    console.log(`Rodando no dispositivo: ${identificadorDispositivo}`);
  },

  async before() {
    const BcBasePage = require('../pageobjects/bc/bc.base.page').default;
    await new BcBasePage().reiniciarNaTelaInicial();
  },

  async beforeTest() {
    // host: raia por aparelho na aba Timeline; suite: pasta por aparelho na aba Suites
    allureReporter.addLabel('host', identificadorDispositivo);
    allureReporter.addLabel('suite', identificadorDispositivo);
    await evidencias.iniciarGravacao();
  },

  async afterTest(test, context, { passed }) {
    await evidencias.finalizarGravacao(test, passed);

    if (!deveTirarScreenshotFinal()) return;
    try {
      const screenshot = await browser.takeScreenshot();
      await allureReporter.addAttachment('Screenshot final', Buffer.from(screenshot, 'base64'), 'image/png');
    } catch (erro) {
      // sessão pode já estar encerrada
    }
  },
};
