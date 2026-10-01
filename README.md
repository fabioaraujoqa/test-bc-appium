# Teste BC APP - Mobile
Appium + WebdriverIO + Allure Report

Suíte de testes automatizados mobile para o app [WebdriverIO Demo](https://github.com/webdriverio/native-demo-app), construída com WebdriverIO, Appium e Allure Report. O objetivo é validar as principais telas do app (login/cadastro, formulários, swipe, drag and drop, menu, permissões, webview e gerenciamento de dados) em Android (emulador, aparelho físico e BrowserStack) e iOS (simulador e BrowserStack).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm (instalado junto com o Node.js)
- JDK 11 e [Appium](https://appium.io/docs/en/2.2/quickstart/install/) 2.x (`npm i --location=global appium`) com o driver `uiautomator2` instalado (`appium driver install uiautomator2`)
- Android Studio com SDK e ao menos um AVD criado (para rodar no emulador) e/ou um aparelho físico com depuração USB habilitada
- Xcode e um simulador iOS (opcional, só para rodar a suíte de iOS no macOS)
- `ffmpeg` (opcional, só para gravação de vídeo de falha no iOS): `brew install ffmpeg`

Guia detalhado de instalação do ambiente (Appium, Android SDK, variáveis `JAVA_HOME`/`ANDROID_HOME`) em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md) e [`docs/systems/operacao-banco-carrefour.md`](docs/systems/operacao-banco-carrefour.md).

## Instalação e Configuração

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo de variáveis de ambiente local a partir do template:
   ```bash
   cp .env.example .env
   ```

3. Preencha o `.env` (lido pelo Appium/WebdriverIO, ignorado pelo git). Só entra ali o que é **segredo** (BrowserStack) ou que **muda por máquina** (UDIDs, AVD, simulador); as regras fixas de cada perfil ficam em `config/env.loader.js`:

   | Variável | Descrição |
   |----------|-----------|
   | `DEVICE_PROFILE` | Perfil do aparelho: `emulador` (padrão), `celular`, `tablet` ou `simulador` |
   | `ANDROID_AVD` / `EMULADOR_UDID` | AVD e UDID do emulador (padrão `Pixel_5` / `emulator-5554`) |
   | `CELULAR_UDID` / `TABLET_UDID` | UDID do aparelho físico (`adb devices`), obrigatório para os perfis `celular`/`tablet` |
   | `IOS_DEVICE_NAME` / `IOS_PLATFORM_VERSION` / `IOS_UDID` | Simulador iOS (`xcrun simctl list devices available`) |
   | `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` | Credenciais do BrowserStack App Automate |
   | `BROWSERSTACK_APP_ID` / `BROWSERSTACK_APP_ID_IOS` | `app_url` (`bs://...`) do `.apk`/`.ipa` já enviado ao BrowserStack |
   | `LOG_LEVEL` / `ALLURE_REPORTER` | Ajustes opcionais (padrões: `warn` e `true`) |

   Qualquer chave também pode vir do terminal, que tem precedência sobre o `.env`: `CELULAR_UDID=xxx npm run test:bc:celular`.

## Execução dos testes

### Opção 1: aparelho local (emulador, celular ou simulador)

**Subir o emulador (se ainda não estiver rodando):**
```bash
npm run start:emulator
```

**Rodar a suíte:**
```bash
npm run test:bc              # Android, emulador (perfil padrão)
npm run test:bc:celular      # Android, aparelho físico
npm run test:bc:ios          # iOS, simulador
```

### Opção 2: BrowserStack (sem aparelho local)

```bash
npm run bs-android           # Android
npm run bs-ios               # iOS (precisa de .ipa de aparelho real)
```

### Opção 3: vários aparelhos de uma vez

```bash
npm run test:bc:devices            # emulador, celular e simulador, em sequência
npm run test:bc:devices:parallel   # os mesmos três, em paralelo
```

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start:emulator` | Sobe o AVD Android (`Pixel_5` por padrão, ou `$AVD`) |
| `npm run list:emulators` | Lista os AVDs disponíveis |
| `npm run test:bc` | Roda a suíte completa no perfil padrão (emulador) |
| `npm run test:bc:celular` / `test:bc:ios` | Roda a suíte completa no celular físico / simulador iOS |
| `npm run test:bc:smoke` | Roda só o smoke (`tests/specs/smoke.spec.js`), comum a Android e iOS |
| `npm run test:bc:smoke:celular` / `test:bc:smoke:ios` | Smoke no celular físico / simulador iOS |
| `npm run test:bc:devices` / `test:bc:devices:parallel` | Suíte completa em emulador + celular + simulador, em sequência ou em paralelo |
| `npm run test:bc:smoke:devices` | Smoke nos três aparelhos, em sequência |
| `npm run bs-android` / `bs-android:smoke` / `bs-ios` | Suíte completa / smoke no BrowserStack |
| `npm run report:bc:generate` / `report:bc:open` / `report:bc` | Gera / abre / gera e abre o relatório Allure |
| `npm run report:bc:arquivo` | Gera o relatório em arquivo único, com evidências de falha, em `relatorios/<data_hora>/` |
| `npm run test:bc:report` (e variações `:smoke`/`:devices`) | Roda a suíte e já abre o relatório ao final |

## Cenários de teste

24 cenários no total, cobrindo as 8 telas do app, em Android (emulador, celular físico, BrowserStack) e iOS (simulador, BrowserStack).

### Smoke — comum a Android e iOS (`smoke.spec.js`)

| Cenário |
|---------|
| Deve abrir no app e na tela inicial esperados |
| Deve exibir a barra inferior com todas as telas |
| Deve navegar para Login e Forms |

### Login / Sign up (`android/login.spec.js`, `ios/login.spec.js`)

| Cenário |
|---------|
| Deve fazer login com sucesso |
| Deve cadastrar com sucesso |
| Deve exibir as validações do cadastro com campos vazios |

### Forms (`android/form.spec.js`, `ios/form.spec.js`)

| Cenário |
|---------|
| Deve preencher campo de texto e validar |
| Deve alternar o switch entre On e Off |
| Deve selecionar um item no dropdown |
| Deve abrir o alerta do botão Ativo e fechar com Ask Me later / OK / Cancel |

### Menu lateral (`android/menu.spec.js`)

| Cenário |
|---------|
| Deve listar todas as telas no menu |
| Deve navegar para uma tela pelo menu |

### Data management (`android/data.spec.js`)

| Cenário |
|---------|
| Deve salvar um valor na memória |
| Deve limpar o valor salvo |

### Drag and Drop (`android/drag.spec.js`)

| Cenário |
|---------|
| Deve arrastar a peça até o lugar certo |
| Deve montar o quebra-cabeça completo |

### Swipe (`android/swipe.spec.js`)

| Cenário |
|---------|
| Deve revelar o segundo, terceiro e quarto card |
| Deve voltar para o primeiro card |

### Permissions (`android/permissions.spec.js`)

| Cenário |
|---------|
| Deve exibir um switch para cada permissão (câmera, microfone, localização, fotos) |

### Webview (`android/webview.spec.js`)

| Cenário |
|---------|
| Deve carregar o site do WebdriverIO |
| Deve disponibilizar o contexto web |

> A cobertura de iOS é mínima de propósito (smoke + login + forms); os demais specs rodam só em Android. Os seletores de cada tela, em Android e iOS, estão documentados em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md).

## Estratégias utilizadas

### Elaboração dos cenários
Os cenários foram definidos com apoio do Copilot a partir da exploração manual do app (via Appium Inspector e MCP do Appium), cobrindo as 8 telas de navegação do app de demonstração. A implementação do código (page objects, specs, hooks de evidência) foi feita manualmente, com revisão do Copilot para consistência e cobertura.

### Dados de teste
Não há dependência de bibliotecas externas de geração de massa. Os dados usados nos formulários (email, senha, texto) são fixos nos próprios specs, já que o app de demonstração não persiste cadastro entre execuções.

### Page Objects
Definidos em `tests/pageobjects/`, com uma classe por tela (`login.page.js`, `form.page.js`, `menu.page.js`, etc.) estendendo `base.page.js` (genérico) e `bc.base.page.js` (específico do app, com `reiniciarNaTelaInicial()` e o helper `porTexto()` que resolve o seletor certo para Android e iOS).

### Perfis de dispositivo
A variável `DEVICE_PROFILE` (`emulador` | `celular` | `tablet` | `simulador`) escolhe o aparelho sem precisar editar código; cada perfil tem sua própria porta de Appium e `systemPort`/`wdaLocalPort`, o que permite rodar vários aparelhos ao mesmo tempo (`scripts/test-bc-parallel.sh`). Detalhes em [`docs/systems/operacao-banco-carrefour.md`](docs/systems/operacao-banco-carrefour.md).

### Relatório e evidências
Resultados vão para `allure-results` via `@wdio/allure-reporter`. Para cada teste, o relatório traz:
- o rótulo do aparelho (`Android · emulador (emulator-5554)`, `iOS · simulador (iPhone 16)`...) nas abas **Timeline** e **Suites**, permitindo comparar a mesma suíte entre aparelhos diferentes
- screenshot nomeado a cada chamada de `evidenciar()`, e um screenshot final quando o teste não chama essa função
- vídeo (`.mp4`) + screenshot (`.png`) de qualquer teste que falhe, salvos em `screenshots/bc/<aparelho>/`, separados por aparelho para não sobrescrever evidências em execuções paralelas

```bash
npm run report:bc:generate   # gera o relatório a partir dos resultados
npm run report:bc:open       # abre o relatório no navegador
npm run report:bc:arquivo    # gera um relatório em arquivo único, com as evidências de falha, em relatorios/<data_hora>/
```

### Uso de Inteligência Artificial
- Copilot usado na exploração do app (Appium Inspector / MCP do Appium) para mapear telas e seletores, documentados em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md).
- Page objects e specs escritos manualmente, com revisão do Copilot para consistência, duplicidade e cobertura dos cenários.
- Workflow do CI/CD com minha estratégia, mas com o apoio do Copilot nas configurações.
- README atualizada constantemente com o apoio do Copilot.

## CI/CD Pipeline

O projeto usa GitHub Actions ([`.github/workflows/cy.yml`](.github/workflows/cy.yml)) para instalar dependências e rodar a suíte Android no BrowserStack a cada push e pull request, com upload dos logs (`logs/`) em caso de falha.

As credenciais do BrowserStack ficam em **Settings → Secrets**: `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY` e `BROWSERSTACK_APP_ID` (app_url do `.apk` já enviado ao App Automate).

### Visualizar relatórios

Os resultados do BrowserStack App Automate (incluindo o vídeo de cada sessão) ficam disponíveis no painel da conta, com o link do build no log do workflow. Localmente, o relatório Allure é gerado em `allure-report/` e pode ser aberto com `npm run report:bc:open`.

## Estrutura do projeto

```
.
├── app/                          # android-app-wdio.apk e ios-app-wdio.app (fora do git)
├── config/
│   ├── wdio.bc.conf.js           # aparelhos locais: monta as capabilities pelo perfil
│   ├── wdio.browserstack.conf.js # BrowserStack (Android ou iOS)
│   ├── env.loader.js             # lê o .env e as regras de cada perfil
│   ├── video.hooks.js            # evidenciar(), screenshot final, vídeo de falha
│   └── appium-mcp.capabilities.json  # usado só pelo MCP (.mcp.json)
├── tests/
│   ├── pageobjects/              # base.page.js, bc.base.page.js e uma page por tela
│   ├── specs/
│   │   ├── smoke.spec.js         # comum a Android e iOS
│   │   ├── android/              # specs exclusivos do perfil Android
│   │   └── ios/                  # specs exclusivos do perfil iOS
│   └── utils/
├── scripts/
│   └── test-bc-parallel.sh       # roda vários aparelhos, em paralelo ou em sequência
├── docs/
│   ├── mapeamento-elementos.md   # seletores de cada tela (Android e iOS)
│   └── systems/
│       └── operacao-banco-carrefour.md  # como operar a suíte (perfis, relatório, evidências)
├── .github/
│   └── workflows/
│       └── cy.yml                # workflow do GitHub Actions
├── .env.example                  # template do .env
├── wdio.conf.js
├── package.json
└── README.md
```
