// Uso (CI): node scripts/allure-sem-resultados.js "<rótulo do alvo>"
// Se a execução falhou antes de gerar qualquer resultado (ex.: credencial ausente, emulador
// que não subiu), grava um teste "broken" no Allure. Sem isso o relatório mostraria só os
// alvos que rodaram e ficaria 100% verde, escondendo que um alvo nem executou.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const rotulo = process.argv[2] || 'alvo desconhecido';
const dir = path.resolve(__dirname, '..', 'allure-results');
fs.mkdirSync(dir, { recursive: true });

const temResultado = fs.readdirSync(dir).some((arquivo) => arquivo.endsWith('-result.json'));
if (temResultado) {
  console.log(`${rotulo}: já há resultados no Allure, nada a registrar.`);
  process.exit(0);
}

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const logUrl = GITHUB_RUN_ID ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` : '(log do job)';
const agora = Date.now();
const uuid = crypto.randomUUID();

const resultado = {
  uuid,
  historyId: crypto.createHash('md5').update(`execucao-nao-iniciada-${rotulo}`).digest('hex'),
  name: `Execução não iniciada: ${rotulo}`,
  fullName: `Execução não iniciada: ${rotulo}`,
  status: 'broken',
  statusDetails: {
    message: `A execução em "${rotulo}" falhou antes de rodar qualquer teste (configuração, credenciais ou aparelho).`,
    trace: `Veja o log do job: ${logUrl}`,
  },
  stage: 'finished',
  start: agora,
  stop: agora,
  labels: [
    { name: 'parentSuite', value: 'Execução' },
    { name: 'suite', value: rotulo },
    { name: 'host', value: rotulo },
  ],
};

fs.writeFileSync(path.join(dir, `${uuid}-result.json`), JSON.stringify(resultado, null, 2));
console.log(`${rotulo}: registrado no Allure como "broken" (nenhum teste rodou).`);
