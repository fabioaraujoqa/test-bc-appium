const fs = require('node:fs');
const path = require('node:path');

// Perfis conhecidos e a plataforma de cada um. "emulador" é o padrão (.env.bc sem overlay).
const PERFIS = {
  emulador: 'android',
  celular: 'android',
  tablet: 'android',
  simulador: 'ios',
};

/**
 * Carrega um arquivo no formato dotenv sem executar seu conteúdo no shell.
 * Não mistura process.env: quem chama decide a precedência.
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
    }

    variaveis[chave] = valor;
  }
  return variaveis;
}

/**
 * Carrega .env.bc (perfil padrão = emulador Android) e, quando DEVICE_PROFILE
 * não for "emulador", sobrepõe com .env.bc.<DEVICE_PROFILE>. Chaves vazias no
 * overlay são ignoradas, para não apagar o valor padrão. process.env tem
 * precedência sobre os dois arquivos.
 */
function carregarEnvBc(raizProjeto) {
  const perfil = process.env.DEVICE_PROFILE || lerArquivoEnv(path.join(raizProjeto, '.env.bc')).DEVICE_PROFILE || 'emulador';

  if (!PERFIS[perfil]) {
    throw new Error(`DEVICE_PROFILE="${perfil}" desconhecido. Use: ${Object.keys(PERFIS).join(' | ')}.`);
  }

  const mesclado = lerArquivoEnv(path.join(raizProjeto, '.env.bc'));

  if (perfil !== 'emulador') {
    const arquivoOverlay = `.env.bc.${perfil}`;
    const caminhoOverlay = path.join(raizProjeto, arquivoOverlay);
    if (!fs.existsSync(caminhoOverlay)) {
      throw new Error(
        `DEVICE_PROFILE=${perfil}, mas ${arquivoOverlay} não existe. ` +
        `Copie as chaves do perfil em .env.bc.example para ${arquivoOverlay} e preencha.`,
      );
    }
    for (const [chave, valor] of Object.entries(lerArquivoEnv(caminhoOverlay))) {
      if (valor) mesclado[chave] = valor;
    }
  }

  for (const [chave, valor] of Object.entries(process.env)) {
    if (valor !== undefined) mesclado[chave] = valor;
  }

  mesclado.DEVICE_PROFILE = perfil;
  mesclado.PLATFORM = PERFIS[perfil];

  validarDispositivo(mesclado);
  return mesclado;
}

// Falha cedo se um perfil físico não tiver UDID, e avisa se o UDID não combinar com o perfil
function validarDispositivo(env) {
  const perfil = env.DEVICE_PROFILE;

  if (env.PLATFORM === 'ios') {
    if (!env.IOS_DEVICE_NAME) {
      throw new Error(`DEVICE_PROFILE=${perfil}, mas IOS_DEVICE_NAME está vazio em .env.bc.${perfil}.`);
    }
    return;
  }

  const udid = env.ANDROID_UDID || '';
  const ehEmulador = udid.startsWith('emulator-');

  if (perfil !== 'emulador' && (!udid || ehEmulador)) {
    throw new Error(
      `DEVICE_PROFILE=${perfil}, mas .env.bc.${perfil} não tem ANDROID_UDID de um aparelho físico. ` +
      'Rode `adb devices` com o aparelho conectado e preencha o arquivo.',
    );
  }

  if (perfil === 'emulador' && udid && !ehEmulador) {
    console.warn(`⚠️  DEVICE_PROFILE=emulador, mas ANDROID_UDID="${udid}" não parece um emulador (esperado "emulator-...").`);
  }
}

// "Android · celular (RQ8R709VAVR)" / "iOS · simulador (iPhone 16)"
function identificarDispositivo(env) {
  const plataforma = env.PLATFORM === 'ios' ? 'iOS' : 'Android';
  const id = env.PLATFORM === 'ios' ? env.IOS_DEVICE_NAME : (env.ANDROID_UDID || `avd:${env.ANDROID_AVD}`);
  const rotulo = `${plataforma} · ${env.DEVICE_PROFILE} (${id})`;
  const slug = `${env.PLATFORM}-${env.DEVICE_PROFILE}-${id}`.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase();
  return { rotulo, slug };
}

module.exports = { lerArquivoEnv, carregarEnvBc, identificarDispositivo, PERFIS };
