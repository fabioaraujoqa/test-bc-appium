# Operação da automação mobile (bc)

Como rodar a suíte do app **WebdriverIO Demo 2.2.0** em cada aparelho (Android emulador, Android físico e iOS simulador), como o relatório separa os aparelhos e onde ficam as evidências. Os seletores de cada tela estão em [`docs/mapeamento-elementos.md`](../mapeamento-elementos.md).

Stack: WebdriverIO 9 + Appium 3 (UiAutomator2 / XCUITest) + Mocha + Allure.

## Estrutura

```
config/
├── wdio.bc.conf.js            aparelhos locais: monta as capabilities pelo perfil
├── wdio.browserstack.conf.js  BrowserStack (Android ou iOS)
├── env.loader.js              lê o .env e as regras de cada perfil (PERFIS)
├── video.hooks.js             evidenciar(), screenshot final, vídeo de falha
└── appium-mcp.capabilities.json   usado só pelo MCP (.mcp.json)
tests/
├── pageobjects/               base.page.js (genérica), bc.base.page.js (do app) e uma page por tela
├── specs/
│   ├── smoke.spec.js          comum a Android e iOS
│   ├── android/               roda nos perfis Android
│   └── ios/                   roda no perfil simulador
└── utils/
scripts/test-bc-parallel.sh    vários aparelhos, em paralelo ou em sequência
app/                           android-app-wdio.apk e ios-app-wdio.app (fora do git)
```

## Configuração: `.env` único

| Arquivo | Versionado? | Conteúdo |
|---|---|---|
| `.env` | **Não** | Só o que é **segredo** (BrowserStack) ou **desta máquina** (UDIDs, AVD, simulador) |
| `.env.example` | Sim | As mesmas chaves, vazias e comentadas. Copie para `.env` numa máquina nova. |
| `config/env.loader.js` (`PERFIS`) | Sim | Regras fixas de cada perfil: plataforma e portas |

Regras do loader:

- Lê o `.env` sem executar nada no shell. **Variáveis do terminal têm precedência** sobre o `.env`.
- Chave vazia no `.env` é ignorada e vale o padrão do código (`Pixel_5`, `emulator-5554`, `iPhone 16`/`18.5`).
- Perfil físico (`celular`, `tablet`) sem UDID, ou com UDID de emulador, **falha logo** dizendo qual chave preencher.
- Perfil `emulador` com UDID que não começa com `emulator-` só gera um **aviso** no console.

## Perfis de dispositivo

O aparelho é escolhido pela variável `DEVICE_PROFILE` (padrão: `emulador`).

| Perfil | Plataforma | Chave do `.env` | Appium | Porta exclusiva |
|---|---|---|---|---|
| `emulador` (padrão) | Android | `EMULADOR_UDID` (padrão `emulator-5554`), `ANDROID_AVD` | 4723 | systemPort 8200 |
| `celular` | Android | `CELULAR_UDID` | 4724 | systemPort 8201 |
| `tablet` | Android | `TABLET_UDID` | 4726 | systemPort 8202 |
| `simulador` | iOS | `IOS_DEVICE_NAME`, `IOS_PLATFORM_VERSION`, `IOS_UDID` (opcional) | 4725 | wdaLocalPort 8100 |

Para rodar com outro aparelho sem editar o `.env`: `CELULAR_UDID=XXXX npm run test:bc:celular`.

### Por que `deviceName` **e** `udid`

Com emulador e celular no mesmo `adb`, `appium:deviceName` sozinho não garante o aparelho: o UiAutomator2 pode pegar "o único disponível". A config sempre manda `appium:udid` com o mesmo valor.

No perfil `emulador`, se o `emulator-5554` não estiver rodando, a config troca para `appium:avd` (`ANDROID_AVD`) e o Appium liga o emulador sozinho.

## Como rodar

| Objetivo | Comando |
|---|---|
| Suíte completa no emulador | `npm run test:bc` |
| Suíte completa no celular | `npm run test:bc:celular` |
| Suíte do iOS | `npm run test:bc:ios` |
| Smoke (emulador / celular / iOS) | `npm run test:bc:smoke` / `test:bc:smoke:celular` / `test:bc:smoke:ios` |
| Smoke nos 3 aparelhos, um por vez | `npm run test:bc:smoke:devices` |
| Suíte nos 3 aparelhos, um por vez | `npm run test:bc:devices` |
| Suíte nos 3 aparelhos **em paralelo** | `npm run test:bc:devices:parallel` |
| Gerar / abrir relatório | `npm run report:bc:generate` / `report:bc:open` / `report:bc` |
| Rodar e já abrir o relatório | qualquer comando acima + `:report` (ex.: `test:bc:smoke:report`) |
| Guardar o relatório (arquivo único) | `npm run report:bc:arquivo` → `relatorios/<data_hora>/index.html`, que abre com dois cliques. As evidências de falha vão junto, se houver. `relatorios/` fica fora do git. |

Escolher aparelhos ou specs no script:

```bash
DEVICES="emulador celular" npm run test:bc:devices:parallel
./scripts/test-bc-parallel.sh --spec tests/specs/smoke.spec.js
BC_AVD=Medium_Phone npm run test:bc:devices:parallel
```

### O que o script de vários aparelhos faz

1. Confere cada aparelho de `DEVICES` (padrão: `emulador celular simulador`):
   - **físico:** precisa estar em `adb devices`; o script acorda a tela;
   - **emulador:** sobe o AVD se não houver nenhum rodando;
   - **simulador:** precisa existir em `xcrun simctl`.
2. Limpa `allure-results` (preservando o histórico) e roda um `wdio` por aparelho, cada um com **seu próprio Appium** na porta do perfil. Logs separados em `test-results/logs/<perfil>.log`.
3. Gera **um** relatório Allure combinado e sai com código **diferente de 0 se qualquer aparelho falhar**.

**Por que um Appium por aparelho:** um único processo Appium atendendo dois aparelhos Android derruba a instrumentação do UiAutomator2 de um deles no meio da execução, mesmo com `systemPort` diferente (visto no projeto de referência). O serviço `@wdio/appium-service` sobe o Appium na porta de cada perfil, então não é preciso abrir o Appium à mão.

## Relatório separado por aparelho

`wdio.bc.conf.js` marca cada teste com o rótulo do aparelho: `"<Plataforma> · <perfil> (<id>)"`, por exemplo:

- `Android · emulador (emulator-5554)`
- `Android · celular (RQ8R709VAVR)`
- `iOS · simulador (iPhone 16)`

Esse rótulo vai em dois labels do Allure:

- **`host`**: a aba **Timeline** mostra uma raia por aparelho.
- **`suite`**: a aba **Suites** separa os testes de cada aparelho dentro do describe (`Smoke - app abre e navega > Android · celular (RQ8R709VAVR) > ...`).

Não use `parentSuite` para isso: o `@wdio/allure-reporter` já preenche esse label com o texto do `describe()`, e um segundo valor duplica todos os testes no relatório.

## Evidências

| Situação | O que é gerado | Onde |
|---|---|---|
| Teste chama `evidenciar('nome')` | Screenshot nomeado, no momento da chamada | Allure |
| Teste **não** chama `evidenciar()` | Um "Screenshot final" | Allure |
| Teste **falha** | `.mp4` da gravação do teste + `.png` | `screenshots/bc/<slug-do-aparelho>/<titulo-do-teste>.*` |

- O slug do aparelho (ex.: `android-celular-rq8r709vavr`) separa as pastas, para execuções em paralelo não sobrescreverem as evidências umas das outras.
- `disableWebdriverStepsReporting` e `disableWebdriverScreenshotsReporting` estão ligados: sem isso, cada `takeScreenshot()` virava um anexo automático e duplicava as imagens.
- **Regra prática:** todo teste que fecha um alerta, volta de tela ou desfaz uma ação antes de terminar deve chamar `evidenciar('o que está sendo provado')` logo após a asserção principal.

```js
import { evidenciar } from "../../config/video.hooks";
await evidenciar("Tela de Login");
```

**Diferença em relação ao projeto de referência (Jasmine):** lá, a evidência de falha precisava de um reporter do Jasmine, porque o `afterTest` recebia o status errado. Aqui é Mocha, e o `afterTest` do WebdriverIO já recebe o `passed` definitivo, então a gravação começa no `beforeTest` e termina no `afterTest`.

**Falha em hook** (`before`/`beforeEach`) não passa pelo `afterTest`, então não gera vídeo. O erro fica no log do perfil e no Allure.

A gravação usa `startRecordingScreen`. No iOS ela exige `ffmpeg` instalado (`brew install ffmpeg`); sem ele, o teste roda normalmente e só a gravação é pulada, com aviso no log.

## Aparelho físico

- **Tela apagada ou bloqueada** faz o app não abrir a tempo (`~Home-screen still not displayed`). O script de vários aparelhos acorda a tela antes de rodar. Rodando `test:bc:celular` direto, deixe a tela ligada e desbloqueada. Bloqueio com senha ou PIN não é destravado automaticamente.
- **Tela pequena** (ex.: SM-A013M, 720x1480): elementos abaixo da área visível não existem para o UiAutomator2. Os page objects rolam até os botões do Forms (`rolarAte`), e a Webview usa só o logo do topo.
- **Play Protect** pode recusar a instalação feita pelo `adb` (`INSTALL_FAILED_VERIFICATION_FAILURE`). Desative "Verificar apps com o Play Protect" e "Verificar apps por USB" enquanto testa.

## `noReset` e versão do app

A config local usa `appium:noReset: true`: **se o app já estiver instalado, o Appium não reinstala**, mesmo trocando o arquivo em `app/`. O estado entre testes é limpo por `reiniciarNaTelaInicial()` (fecha e reabre o app).

Depois de trocar o app em `app/`, desinstale dos aparelhos:

```bash
adb -s <udid> uninstall com.wdiodemoapp                      # Android
xcrun simctl uninstall "iPhone 16" org.wdiodemoapp           # iOS
```

Para conferir a versão instalada:

```bash
adb -s <udid> shell dumpsys package com.wdiodemoapp | grep versionName
```

## iOS

- A primeira sessão compila o WebDriverAgent e pode levar alguns minutos (o `connectionRetryTimeout` do iOS já é de 10 minutos). Avisos de `xcodebuild exited with code 65` nessa primeira tentativa são normais: o WebdriverIO tenta de novo.
- A cobertura de iOS é mínima de propósito (smoke + login + forms). Os page objects já tratam as diferenças do iOS (teclado, alertas, dropdown, menu). Veja a seção iOS do mapeamento.

## BrowserStack

Config: `config/wdio.browserstack.conf.js`. Credenciais e app id vêm do `.env` (ou dos secrets do GitHub Actions no CI).

| Objetivo | Comando |
|---|---|
| Smoke Android | `npm run bs-android:smoke` |
| Suíte Android (smoke + `specs/android`) | `npm run bs-android` |
| iOS | `npm run bs-ios` (precisa de `.ipa` de aparelho real em `BROWSERSTACK_APP_ID_IOS`; o `.app` de simulador não roda lá) |

1. **Credenciais:** App Automate → *Access Key* → `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY` no `.env`.
2. **Upload do app** (o `app_url` `bs://...` vai em `BROWSERSTACK_APP_ID`):
   ```bash
   curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
     -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
     -F "file=@app/android-app-wdio.apk" -F "custom_id=wdio-demo-android"
   ```
3. **Aparelho:** padrão Google Pixel 6 / Android 12 (iOS: iPhone 15 / 17). Troque com `BS_DEVICE` e `BS_OS_VERSION`.
4. **Relatório:** os testes recebem o rótulo `Android · browserstack (Google Pixel 6)` e entram no mesmo Allure dos aparelhos locais. O vídeo de cada sessão fica no painel do BrowserStack (o link do build aparece no fim do log).

**Versão do Appium:** o padrão do BrowserStack é **Appium 1.22**, que não tem comandos que o WebdriverIO 9 usa (ex.: `getCurrentActivity`, erro `Unknown mobile command`). A config fixa `appiumVersion: 3.2.0` em `bstack:options`, a mesma versão do Appium local. Troque com `BS_APPIUM_VERSION`.

**Gravação de tela:** `startRecordingScreen` não é suportado no BrowserStack, então a config não grava. Em falha, salva só o `.png` (o vídeo está no painel).

**Trial:** a conta de teste tem limite de minutos e de execuções em paralelo. Valide com o smoke antes de rodar a suíte inteira.
