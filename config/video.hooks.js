const fs = require('node:fs');
const path = require('node:path');
const allureReporter = require('@wdio/allure-reporter').default;

// Marca se o teste atual já anexou uma evidência nomeada via `evidenciar()`,
// para o afterTest genérico não duplicar a mesma imagem com um screenshot final.
let evidenciaManualNesteTeste = false;

/**
 * Anexa uma captura de tela nomeada ao Allure no momento exato da chamada.
 * Use logo após a asserção-chave em testes que desfazem a ação antes de terminar
 * (fecham um alerta, voltam de uma tela): o screenshot final mostraria o estado já revertido.
 */
async function evidenciar(nome) {
  try {
    const screenshot = await browser.takeScreenshot();
    await allureReporter.addAttachment(nome, Buffer.from(screenshot, 'base64'), 'image/png');
    evidenciaManualNesteTeste = true;
  } catch (erro) {
    console.log(`Não foi possível anexar evidência "${nome}": ${erro.message}`);
  }
}

/**
 * Diz se o afterTest ainda precisa do screenshot final genérico, ou se `evidenciar()`
 * já cobriu o teste, e reseta o estado para o próximo teste.
 */
function deveTirarScreenshotFinal() {
  const jaTemEvidencia = evidenciaManualNesteTeste;
  evidenciaManualNesteTeste = false;
  return !jaTemEvidencia;
}

function nomeSeguro(titulo) {
  return titulo
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira acentos: "propósito" -> "proposito"
    .replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

/**
 * Hooks de gravação por teste. Diferente do Jasmine (projeto de referência), no Mocha
 * o afterTest do WDIO já recebe `passed` definitivo, então a evidência de falha fica aqui.
 * Só falhas geram arquivo: .mp4 + .png em <diretorio>/<titulo-do-teste>.
 */
function criarHooksDeEvidencias(diretorio) {
  return {
    async iniciarGravacao() {
      try {
        await browser.startRecordingScreen();
      } catch (erro) {
        console.log(`Gravação de tela não suportada nesta sessão: ${erro.message}`);
      }
    },

    async finalizarGravacao(test, passed) {
      let video = null;
      try {
        video = await browser.stopRecordingScreen();
      } catch (erro) {
        // gravação não iniciada ou sessão encerrada
      }

      if (passed) return;

      fs.mkdirSync(diretorio, { recursive: true });
      const nome = nomeSeguro(test.fullTitle?.() || test.title || 'teste-desconhecido');

      if (video) {
        fs.writeFileSync(path.join(diretorio, `${nome}.mp4`), Buffer.from(video, 'base64'));
        console.log(`🎥 Vídeo de falha salvo: ${path.join(diretorio, `${nome}.mp4`)}`);
      }

      try {
        await browser.saveScreenshot(path.join(diretorio, `${nome}.png`));
      } catch (erro) {
        // sessão pode já estar encerrada
      }
    },
  };
}

module.exports = { evidenciar, deveTirarScreenshotFinal, criarHooksDeEvidencias };
