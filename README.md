# Teste BC APP - Mobile
Appium + WebdriverIO + Allure Report

Suíte de testes automatizados mobile para o app [WebdriverIO Demo](https://github.com/webdriverio/native-demo-app), construída com WebdriverIO, Appium e Allure Report. O objetivo é validar as principais telas do app (login/cadastro, formulários, swipe, drag and drop, menu lateral e permissões) em Android (emulador, aparelho físico e BrowserStack) e iOS (simulador e BrowserStack).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 (mesma versão do CI)
- npm (instalado junto com o Node.js)
- JDK 11 ou superior e [Appium](https://appium.io/docs/en/latest/quickstart/install/) 3.x (`npm i -g appium`) com o driver `uiautomator2` (`appium driver install uiautomator2`) e, para iOS, o `xcuitest` (`appium driver install xcuitest`)
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
   | `LOGIN_EMAIL` / `LOGIN_SENHA` | Usuário de login usado nos specs de login (no CI, vem dos secrets) |
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

29 cenários, cobrindo 7 telas do app: Home, Login/Sign up, Forms, Menu lateral, Drag, Swipe e Permissions.

| Spec | Plataforma | Cenários |
|------|------------|----------|
| `smoke.spec.js` | Android e iOS | 3 |
| `android/login.spec.js` | Android | 6 (3 deles vêm da fixture) |
| `android/form.spec.js` | Android | 7 |
| `android/swipe.spec.js` | Android | 4 |
| `android/drag.spec.js` | Android | 2 |
| `android/menu.spec.js` | Android | 2 |
| `android/permissions.spec.js` | Android | 1 |
| `ios/form.spec.js` | iOS | 3 |
| `ios/login.spec.js` | iOS | 1 |

### Smoke — comum a Android e iOS (`smoke.spec.js`)

| Cenário |
|---------|
| Deve abrir no app e na tela inicial esperados |
| Deve exibir a barra inferior com todas as telas |
| Deve navegar para Login e Forms |

### Login / Sign up (`android/login.spec.js`)

| Cenário | Dados |
|---------|-------|
| Deve fazer login com sucesso | `.env` (`LOGIN_EMAIL` / `LOGIN_SENHA`) |
| Deve cadastrar com sucesso | fixture, `cadastro.valido` (e-mail único por execução) |
| Deve exibir as validações do cadastro com campos vazios | — |
| Não deve cadastrar com e-mail sem @ | fixture, `cadastroInvalido` |
| Não deve cadastrar com senha com menos de 8 caracteres | fixture, `cadastroInvalido` |
| Não deve cadastrar com confirmação diferente da senha | fixture, `cadastroInvalido` |

### Forms (`android/form.spec.js`)

| Cenário |
|---------|
| Deve preencher campo de texto e validar |
| Deve alternar para Off o switch |
| Deve alternar para On o switch |
| Seleciona um item no dropdown |
| Deve clicar no botão Ativo e depois em Ask Me later |
| Deve clicar no botão Ativo e depois em OK |
| Deve clicar no botão Ativo e depois em Cancel |

### Swipe (`android/swipe.spec.js`)

| Cenário |
|---------|
| Deve revelar o segundo card |
| Deve revelar o terceiro card |
| Deve revelar o quarto card |
| Deve voltar para o primeiro card |

### Drag and Drop (`android/drag.spec.js`)

| Cenário |
|---------|
| Deve arrastar a peça até o lugar certo |
| Deve montar o quebra-cabeça completo com dragAndDrop |

### Menu lateral (`android/menu.spec.js`)

| Cenário |
|---------|
| Deve listar todas as telas |
| Deve navegar para uma tela pelo menu |

### Permissions (`android/permissions.spec.js`)

| Cenário |
|---------|
| Deve exibir um switch para cada permissão (câmera, microfone, localização, fotos) |

### iOS (`ios/login.spec.js`, `ios/form.spec.js`)

| Cenário |
|---------|
| Deve fazer login com sucesso (`.env`) |
| Deve preencher campo de texto |
| Deve abrir o alerta do botão Active e fechar com OK |
| Deve abrir o alerta do botão Active e fechar com Ask me later |

> A cobertura de iOS é mínima de propósito (smoke + login + forms). Os seletores de cada tela, em Android e iOS, estão em [`docs/mapeamento-elementos.md`](docs/mapeamento-elementos.md).

## Estratégias utilizadas

### Elaboração dos cenários
Os cenários foram definidos com apoio do Copilot a partir da exploração manual do app (via Appium Inspector e MCP do Appium), cobrindo as 8 telas de navegação do app de demonstração. A implementação do código (page objects, specs, hooks de evidência) foi feita manualmente, com revisão do Copilot para consistência e cobertura.

### Dados de teste
Os specs não têm dados fixos. A origem de cada dado depende do que ele é:

| Dado | Onde fica | Por quê |
|------|-----------|---------|
| Usuário de **login** | `.env`: `LOGIN_EMAIL` / `LOGIN_SENHA` (no CI, secrets de mesmo nome) | É credencial: não vai para o git |
| **Cadastro** válido e inválidos | [`tests/fixtures/usuarios.json`](tests/fixtures/usuarios.json) | É massa de teste: versionada, junto com o resultado esperado |

Os specs leem os dois por [`tests/utils/usuarios.js`](tests/utils/usuarios.js):

```js
const { email, senha } = usuarioLogin();            // .env
const novo = usuariosCadastro.valido();             // fixture, e-mail único ({timestamp})
for (const caso of usuariosCadastro.invalidos) {}   // um teste por caso inválido
```

Cada item de `cadastroInvalido` traz a `descricao`, os dados e a mensagem de `erro` esperada, e vira um teste próprio (`Não deve cadastrar com <descricao>`). Para um cenário novo, basta acrescentar um item no JSON. Não há dependência de bibliotecas externas de geração de massa.

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

O workflow [`.github/workflows/mobile-tests.yml`](.github/workflows/mobile-tests.yml) roda no GitHub Actions:

| Gatilho | O que roda |
|---------|------------|
| Push na `main` | Smoke no emulador Android do GitHub; o relatório é publicado no GitHub Pages |
| Pull request | Smoke no emulador; o PR recebe um comentário com o link do relatório |
| Manual (*Actions → Run workflow*) | Escolha do **alvo** (`emulador`, `browserstack` ou `ambos`) e da **suíte** (`smoke`, `completa` ou um spec: `login`, `form`, `drag`...) |

O BrowserStack só roda no disparo manual, para não gastar os minutos da conta a cada commit. Se um alvo falhar antes de rodar qualquer teste (credencial ausente, emulador que não subiu), ele entra no relatório como **"Execução não iniciada"** (status *broken*), com o link do log, em vez de sumir e deixar o relatório 100% verde. O APK do emulador é baixado da [release oficial v2.2.0](https://github.com/webdriverio/native-demo-app/releases/tag/v2.2.0) do app (a pasta `app/` não é versionada).

### Secrets necessários (*Settings → Secrets and variables → Actions*)

| Secret | Uso |
|--------|-----|
| `LOGIN_EMAIL` / `LOGIN_SENHA` | Usuário de login dos specs |
| `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` | Credenciais do BrowserStack App Automate |
| `BROWSERSTACK_APP_ID` | `app_url` (`bs://...`) do `.apk` já enviado ao BrowserStack |

Para publicar o relatório, o GitHub Pages precisa estar com **Source: GitHub Actions** (*Settings → Pages*).

### Visualizar relatórios

- **Na `main`:** o Allure combinado (emulador + BrowserStack, separados por aparelho, com histórico de tendência) fica no GitHub Pages: `https://fabioaraujoqa.github.io/test-bc-appium/`.
- **Em PR ou execução manual:** baixe o artefato `allure-report` na página da execução.
- **BrowserStack:** o vídeo de cada sessão fica no painel da conta (o link do build aparece no log).
- **Localmente:** `npm run report:bc:open`, ou `npm run report:bc:arquivo` para um arquivo único.

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
│   ├── fixtures/
│   │   └── usuarios.json         # massa de cadastro (válida e inválida)
│   ├── pageobjects/              # base.page.js, bc.base.page.js e uma page por tela
│   ├── specs/
│   │   ├── smoke.spec.js         # comum a Android e iOS
│   │   ├── android/              # specs exclusivos do perfil Android
│   │   └── ios/                  # specs exclusivos do perfil iOS
│   └── utils/                    # usuarios.js (lê .env + fixture), swipe.js
├── scripts/
│   └── test-bc-parallel.sh       # roda vários aparelhos, em paralelo ou em sequência
├── docs/
│   ├── mapeamento-elementos.md   # seletores de cada tela (Android e iOS)
│   └── systems/
│       └── operacao-banco-carrefour.md  # como operar a suíte (perfis, relatório, evidências)
├── .github/
│   └── workflows/
│       └── mobile-tests.yml      # emulador (push/PR) + BrowserStack (manual) + Allure no Pages
├── .env.example                  # template do .env
├── wdio.conf.js
├── package.json
└── README.md
```
