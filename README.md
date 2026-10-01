# Teste BC APP - Mobile
Appium + WebdriverIO + Allure Report

Suíte de testes automatizados mobile para o app [WebdriverIO Demo](https://github.com/webdriverio/native-demo-app), construída com WebdriverIO, Appium e Allure Report. O objetivo é validar as principais telas do app (login/cadastro, formulários, drag and drop, menu lateral e permissões) em Android (emulador, aparelho físico e BrowserStack) e iOS (simulador).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 (mesma versão do CI)
- JDK 11 ou superior e [Appium](https://appium.io/docs/en/latest/quickstart/install/) 3.x (`npm i -g appium`) com o driver `uiautomator2` (`appium driver install uiautomator2`) e, para iOS, o `xcuitest` (`appium driver install xcuitest`)
- Android Studio com SDK e ao menos um AVD criado, e/ou um aparelho físico com depuração USB habilitada
- Xcode e um simulador iOS (opcional, só para a suíte de iOS no macOS)
- `ffmpeg` (opcional, para o vídeo de falha no iOS): `brew install ffmpeg`

Detalhes de operação (perfis, portas, aparelho físico, troubleshooting) em [`docs/systems/operacao-banco-carrefour.md`](docs/systems/operacao-banco-carrefour.md).

## Instalação e configuração

```bash
npm install
cp .env.example .env
```

Preencha o `.env` (ignorado pelo git). Só entra ali o que é **segredo** ou **muda por máquina**; as regras fixas de cada perfil (plataforma e portas) ficam em `config/env.loader.js`.

| Variável | Descrição |
|----------|-----------|
| `LOGIN_EMAIL` / `LOGIN_SENHA` | Usuário de login dos specs (no CI, vem dos secrets) |
| `DEVICE_PROFILE` | `emulador` (padrão), `celular`, `tablet` ou `simulador` |
| `ANDROID_AVD` / `EMULADOR_UDID` | AVD e UDID do emulador (padrão `Pixel_5` / `emulator-5554`) |
| `CELULAR_UDID` / `TABLET_UDID` | UDID do aparelho físico (`adb devices`), obrigatório nos perfis `celular`/`tablet` |
| `IOS_DEVICE_NAME` / `IOS_PLATFORM_VERSION` | Simulador iOS (padrão `iPhone 16` / `18.5`) |
| `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` / `BROWSERSTACK_APP_ID` | Credenciais e `app_url` (`bs://...`) do app no BrowserStack |

Qualquer chave também pode vir do terminal, que tem precedência: `CELULAR_UDID=xxx npm run test:celular`.

## Execução dos testes

```bash
npm run start:emulator             # sobe o AVD, se ainda não estiver rodando

npm run test:all                    # Android, emulador (perfil padrão)
npm run test:celular            # Android, aparelho físico
npm run test:ios                # iOS, simulador
npm run bs-android                 # Android, BrowserStack
npm run test:devices            # emulador + celular + simulador, em paralelo

npm run test:all -- --spec tests/specs/android/form.spec.js   # um spec só
```

| Comando | Descrição |
|---------|-----------|
| `test:smoke` | Só o smoke, comum a Android e iOS (outro aparelho: `DEVICE_PROFILE=celular npm run test:smoke`) |
| `test:devices -- --sequencial` | Os três aparelhos, um por vez |
| `report` | Gera e abre o relatório Allure |
| `report:arquivo` | Relatório em arquivo único (abre com dois cliques), com as evidências de falha, em `relatorios/<data_hora>/` |

## Cenários de teste

26 cenários, cobrindo 6 telas do app: Home, Login/Sign up, Forms, Menu lateral, Drag e Permissions.

| Spec | Plataforma | Cenários |
|------|------------|----------|
| `smoke.spec.js` | Android e iOS | Abre no app e na tela inicial esperados · Exibe a barra inferior com todas as telas · Navega para Login e Forms |
| `android/login.spec.js` | Android | Login com sucesso · Cadastro com sucesso · Validações do cadastro com campos vazios · 3 cadastros inválidos (fixture, ver abaixo) |
| `android/form.spec.js` | Android | Preenche o campo de texto · Alterna o switch para Off · Alterna para On · Seleciona item no dropdown · Fecha o alerta do botão Active com Ask me later / OK / Cancel |
| `android/drag.spec.js` | Android | Encaixa uma peça sem terminar o jogo · Monta o quebra-cabeça completo · Não aceita a peça na posição errada |
| `android/menu.spec.js` | Android | Lista todas as telas · Navega para uma tela pelo menu |
| `android/permissions.spec.js` | Android | Exibe um switch para cada permissão |
| `ios/login.spec.js`, `ios/form.spec.js` | iOS | Login com sucesso · Preenche o campo de texto · Fecha o alerta do botão Active com OK / Ask me later |

> A cobertura de iOS é mínima de propósito (smoke + login + forms). Os seletores de cada tela, em Android e iOS, estão em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md).

## Estratégias utilizadas

### Elaboração dos cenários
Os cenários foram definidos com apoio do Claude a partir da exploração manual do app (via Appium Inspector e MCP do Appium), cobrindo 6 telas do app de demonstração. A implementação do código (page objects, specs, hooks de evidência) foi feita manualmente, com revisão do Claude para consistência e cobertura.

### Dados de teste
Os specs não têm dados fixos:

| Dado | Onde fica | Por quê |
|------|-----------|---------|
| Usuário de **login** | `.env` (`LOGIN_EMAIL` / `LOGIN_SENHA`); no CI, secrets de mesmo nome | É credencial: não vai para o git |
| **Cadastro** válido e inválidos | [`tests/fixtures/usuarios.json`](tests/fixtures/usuarios.json) | É massa de teste: versionada, com o resultado esperado |

O helper [`tests/utils/usuarios.js`](tests/utils/usuarios.js) entrega os dois aos specs. O e-mail de cadastro válido é único por execução (`{timestamp}`), e cada item de `cadastroInvalido` (e-mail sem @, senha curta, confirmação diferente) vira um teste próprio que confere a mensagem de erro esperada. Para um cenário novo, basta acrescentar um item no JSON.

### Page Objects
Uma classe por tela em `tests/pageobjects/`, estendendo `base.page.js` (genérico) e `app.base.page.js` (do app: `reiniciarNaTelaInicial()` e `porTexto()`, que resolve o seletor certo para Android e iOS). Os alertas ficam em um componente próprio (`components/alert.component.js`).

### Perfis de dispositivo
`DEVICE_PROFILE` escolhe o aparelho sem editar código. Cada perfil tem sua porta de Appium e `systemPort`/`wdaLocalPort`, o que permite rodar vários aparelhos ao mesmo tempo (`scripts/test-parallel.sh`).

### Relatório e evidências
O Allure (`@wdio/allure-reporter`) traz, para cada teste:
- o rótulo do aparelho (`Android · emulador (emulator-5554)`, `iOS · simulador (iPhone 16)`, `Android · browserstack (Google Pixel 6)`) nas abas **Suites** e **Timeline**, para comparar a mesma suíte entre aparelhos;
- screenshot nomeado a cada `evidenciar()`, ou um screenshot final quando o teste não chama essa função;
- em falha, vídeo (`.mp4`) + screenshot (`.png`) em `screenshots/<aparelho>/`, separados por aparelho para execuções em paralelo não sobrescreverem evidências.

### Uso de Inteligência Artificial
Agente usado como copiloto: **Claude (Anthropic)**, pelo GitHub Copilot com o modelo Claude Sonnet e pelo Claude Code.

- Claude usado na exploração do app (Appium Inspector / MCP do Appium) para mapear telas e seletores, documentados em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md).
- Page objects e specs escritos manualmente, com revisão do Claude para consistência, duplicidade e cobertura dos cenários.
- Workflow do CI/CD com minha estratégia, mas com o apoio do Claude nas configurações.
- README atualizada constantemente com o apoio do Claude.

## CI/CD Pipeline

O workflow [`.github/workflows/mobile-tests.yml`](.github/workflows/mobile-tests.yml) roda no GitHub Actions:

| Gatilho | O que roda |
|---------|------------|
| Push na `main` | Smoke no emulador Android do GitHub; relatório publicado no GitHub Pages |
| Pull request | Smoke no emulador; o PR recebe um comentário com o link do relatório |
| Manual (*Actions → Run workflow*) | Escolha do **alvo** (`emulador`, `browserstack` ou `ambos`) e da **suíte** (`smoke`, `completa` ou um spec) |

- O BrowserStack só roda no disparo manual, para não gastar os minutos da conta a cada commit.
- Se um alvo falhar antes de rodar qualquer teste (credencial ausente, emulador que não subiu), ele entra no relatório como **"Execução não iniciada"** (*broken*), em vez de sumir e deixar o relatório 100% verde.
- O APK do emulador vem da [release oficial v2.2.0](https://github.com/webdriverio/native-demo-app/releases/tag/v2.2.0) do app (a pasta `app/` não é versionada).

**Secrets** (*Settings → Secrets and variables → Actions*): `LOGIN_EMAIL`, `LOGIN_SENHA`, `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY` e `BROWSERSTACK_APP_ID`. Para publicar o relatório, o GitHub Pages precisa estar com **Source: GitHub Actions**.

### Visualizar relatórios

- **Allure (última execução na `main`):** [fabioaraujoqa.github.io/test-bc-appium](https://fabioaraujoqa.github.io/test-bc-appium/), combinado e separado por aparelho, com histórico de tendência.
- **BrowserStack:** [última execução pública no App Automate](https://app-automate.browserstack.com/projects/Banco+Carrefour+-+App+Demo/builds/Android/3?tab=tests&testListView=spec&public_token=8c0b78bc1777d4ddf28fc454c83da22d8f38e887c6f70754faa668cc41a48151), com vídeo e logs de cada sessão.
- **PR ou execução manual:** artefato `allure-report` na página da execução.
- **Local:** `npm run report`, ou `npm run report:arquivo` para um arquivo único.

## Estrutura do projeto

```
.
├── app/                          # android-app-wdio.apk e ios-app-wdio.app (fora do git)
├── config/
│   ├── wdio.conf.js           # aparelhos locais: monta as capabilities pelo perfil
│   ├── wdio.browserstack.conf.js # BrowserStack
│   ├── env.loader.js             # lê o .env e as regras de cada perfil
│   └── video.hooks.js            # evidenciar(), screenshot final, vídeo de falha
├── tests/
│   ├── fixtures/usuarios.json    # massa de cadastro (válida e inválida)
│   ├── pageobjects/              # base.page.js, app.base.page.js, components/ e uma page por tela
│   ├── specs/
│   │   ├── smoke.spec.js         # comum a Android e iOS
│   │   ├── android/
│   │   └── ios/
│   └── utils/usuarios.js         # lê .env + fixture
├── scripts/                      # execução em vários aparelhos e apoio ao CI
├── docs/
│   ├── mapeamento-elementos.md   # seletores de cada tela (Android e iOS)
│   └── systems/operacao-banco-carrefour.md  # como operar a suíte
├── .github/workflows/mobile-tests.yml
└── .env.example                  # template do .env
```
