const path = require('node:path');

// Carrega o .env da raiz em process.env. Por padrão o dotenv NÃO sobrescreve o que já existe,
// então variáveis do terminal e dos secrets do CI têm precedência sobre o arquivo.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

/**
 * Regras fixas de cada perfil de dispositivo (versionadas aqui, não no .env).
 * Portas exclusivas por perfil permitem rodar os aparelhos ao mesmo tempo, cada um com seu Appium.
 * O que muda por máquina (UDID, AVD, simulador) e os segredos ficam no .env (ver .env.example).
 */
const PERFIS = {
  emulador:  { plataforma: 'android', appiumPort: 4723, systemPort: 8200, varUdid: 'EMULADOR_UDID', udidPadrao: 'emulator-5554' },
  celular:   { plataforma: 'android', appiumPort: 4724, systemPort: 8201, varUdid: 'CELULAR_UDID' },
  tablet:    { plataforma: 'android', appiumPort: 4726, systemPort: 8202, varUdid: 'TABLET_UDID' },
  simulador: { plataforma: 'ios',     appiumPort: 4725, wdaLocalPort: 8100 },
};

// Valores padrão do que pode mudar por máquina; o .env sobrepõe
const PADROES = {
  ANDROID_AVD: 'Pixel_5',
  IOS_DEVICE_NAME: 'iPhone 16',
  IOS_PLATFORM_VERSION: '18.5',
};

/**
 * Padrões do código + process.env (já com o .env). Chave vazia no .env não apaga o padrão.
 * Serve para qualquer config, inclusive a do BrowserStack.
 */
function carregarEnv() {
  const env = { ...PADROES };
  for (const [chave, valor] of Object.entries(process.env)) {
    if (valor) env[chave] = valor;
  }
  return env;
}

/**
 * Carrega o .env e resolve o aparelho do perfil DEVICE_PROFILE (padrão: emulador):
 * plataforma, portas e UDID (lido da variável do perfil, ex.: CELULAR_UDID).
 */
function carregarEnvDoPerfil() {
  const env = carregarEnv();
  const perfil = env.DEVICE_PROFILE || 'emulador';
  const regras = PERFIS[perfil];

  if (!regras) {
    throw new Error(`DEVICE_PROFILE="${perfil}" desconhecido. Use: ${Object.keys(PERFIS).join(' | ')}.`);
  }

  env.DEVICE_PROFILE = perfil;
  env.PLATFORM = regras.plataforma;
  env.APPIUM_PORT = String(regras.appiumPort);
  if (regras.systemPort) env.SYSTEM_PORT = String(regras.systemPort);
  if (regras.wdaLocalPort) env.WDA_LOCAL_PORT = String(regras.wdaLocalPort);
  if (regras.varUdid) env.ANDROID_UDID = env[regras.varUdid] || regras.udidPadrao || '';

  validarDispositivo(env, regras);
  return env;
}

// Falha cedo se um perfil físico não tiver UDID, e avisa se o UDID não combinar com o perfil
function validarDispositivo(env, regras) {
  const perfil = env.DEVICE_PROFILE;
  if (env.PLATFORM === 'ios') return;

  const udid = env.ANDROID_UDID;
  const ehEmulador = udid.startsWith('emulator-');

  if (perfil !== 'emulador' && (!udid || ehEmulador)) {
    throw new Error(
      `DEVICE_PROFILE=${perfil}, mas ${regras.varUdid} está vazio (ou é de emulador) no .env. ` +
      'Rode `adb devices` com o aparelho conectado e preencha.',
    );
  }

  if (perfil === 'emulador' && !ehEmulador) {
    console.warn(`⚠️  DEVICE_PROFILE=emulador, mas ${regras.varUdid}="${udid}" não parece um emulador (esperado "emulator-...").`);
  }
}

// "Android · celular (RQ8R709VAVR)" / "iOS · simulador (iPhone 16)"
function identificarDispositivo(env) {
  const plataforma = env.PLATFORM === 'ios' ? 'iOS' : 'Android';
  const id = env.PLATFORM === 'ios' ? env.IOS_DEVICE_NAME : env.ANDROID_UDID;
  const rotulo = `${plataforma} · ${env.DEVICE_PROFILE} (${id})`;
  const slug = `${env.PLATFORM}-${env.DEVICE_PROFILE}-${id}`.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase();
  return { rotulo, slug };
}

module.exports = { carregarEnv, carregarEnvDoPerfil, identificarDispositivo, PERFIS };
