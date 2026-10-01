const fs = require('node:fs');
const path = require('node:path');

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
 * Carrega um arquivo no formato dotenv sem executar seu conteúdo no shell.
 */
function lerArquivoEnv(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) return {};

  const variaveis = {};
  for (const linhaOriginal of fs.readFileSync(caminhoArquivo, 'utf8').split(/\r?\n/)) {
    const linha = linhaOriginal.trim();
    if (!linha || linha.startsWith('#')) continue;

    const separador = linha.indexOf('=');
    if (separador <= 0) continue;

    const chave = linha.slice(0, separador).trim();
    let valor = linha.slice(separador + 1).trim();

    const aspas = valor[0];
    if ((aspas === '"' || aspas === "'") && valor.endsWith(aspas)) {
      valor = valor.slice(1, -1);
    } else {
      // comentário no fim da linha: CHAVE=valor   # explicação
      valor = valor.replace(/\s+#.*$/, '');
    }

    variaveis[chave] = valor;
  }
  return variaveis;
}

/**
 * Lê o .env da raiz (chaves vazias são ignoradas) com process.env por cima.
 * Serve para qualquer config, inclusive as do BrowserStack.
 */
function carregarEnv(raizProjeto) {
  const env = { ...PADROES };
  for (const [chave, valor] of Object.entries(lerArquivoEnv(path.join(raizProjeto, '.env')))) {
    if (valor) env[chave] = valor;
  }
  for (const [chave, valor] of Object.entries(process.env)) {
    if (valor) env[chave] = valor;
  }
  return env;
}

/**
 * Carrega o .env e resolve o aparelho do perfil DEVICE_PROFILE (padrão: emulador):
 * plataforma, portas e UDID (lido da variável do perfil, ex.: CELULAR_UDID).
 */
function carregarEnvBc(raizProjeto) {
  const env = carregarEnv(raizProjeto);
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

module.exports = { lerArquivoEnv, carregarEnv, carregarEnvBc, identificarDispositivo, PERFIS };
