# Mapeamento de elementos – app WebdriverIO Demo 2.2.0 (Android e iOS)

Android: mapeado em 01/10/2026 no emulador `Pixel_5` (Android 11), com o `app/android-app-wdio.apk` (versionName **2.2.0**). iOS: veja a [seção iOS](#ios).

Para usar no WebdriverIO:

| Estratégia | Como escrever no `$()` |
|---|---|
| accessibility id (content-desc) | `$('~input-email')` |
| resource-id | `$('id=android:id/button1')` |
| resource-id sem pacote | `$('android=new UiSelector().resourceId("Carousel")')` |
| texto | `$('android=new UiSelector().text("LOGIN")')` |

> Prefira **accessibility id**. Use texto só quando o elemento não tiver id. Os ícones são caracteres de fonte: não use como seletor.
> Nos page objects, `this.porTexto('...')` (de `test/pageobjects/page.js`) monta o seletor de texto certo para Android e iOS.

---

## Barra inferior (todas as telas)

| Elemento | Seletor | Rótulo |
|---|---|---|
| Home | `~Home` | Home |
| Webview | `~Webview` | Web |
| Login | `~Login` | Login |
| Forms | `~Forms` | Forms |
| Swipe | `~Swipe` | Swipe |
| Drag | `~Drag` | Drag |
| Menu lateral | `~Menu` | Menu |

---

## Menu lateral (`~Menu`)

| Elemento | Seletor |
|---|---|
| Painel | `~tab-side-menu-panel` |
| Item de cada tela | `~side-menu-item-<tela>` |
| Estrela (favoritar) | `~side-menu-star-<tela>` |

`<tela>`: `home`, `webview`, `login`, `forms`, `swipe`, `drag`, `permissions`, `data-management`.

> O painel cobre a barra inferior. Feche com `driver.back()`.
> **Permissions** e **Data management** só são acessíveis por aqui.

---

## Home

| Elemento | Seletor |
|---|---|
| Tela | `~Home-screen` |
| Título | texto `WEBDRIVER` |
| Subtítulo | texto `Demo app for the appium-boilerplate` |

---

## Login / Sign up

| Elemento | Seletor |
|---|---|
| Tela | `~Login-screen` |
| Aba Login | `~button-login-container` |
| Aba Sign up | `~button-sign-up-container` |
| E-mail | `~input-email` |
| Senha | `~input-password` |
| Confirmar senha (só Sign up) | `~input-repeat-password` |
| Botão LOGIN | `~button-LOGIN` |
| Botão SIGN UP | `~button-SIGN UP` |

### Validações (Sign up com campos vazios)

| Mensagem (texto) |
|---|
| `Please enter a valid email address` |
| `Please enter at least 8 characters` |
| `Please enter the same password` |

### Alertas

| Ação | Título | Mensagem |
|---|---|---|
| Login válido | `Success` | `You are logged in!` |
| Cadastro válido | `Signed Up!` | `You successfully signed up!` |

> Os campos **mantêm o texto** ao trocar de tela ou de aba. Limpe antes de testar validações.

---

## Forms

| Elemento | Seletor | Obs. |
|---|---|---|
| Tela | `~Forms-screen` | |
| Campo de texto | `~text-input` | |
| Resultado digitado | `~input-text-result` | |
| Switch | `~switch` | |
| Texto do switch | `~switch-text` | Inicial: `Click to turn the switch ON` |
| Dropdown (abrir) | `~Dropdown` | |
| Valor do dropdown | `android=new UiSelector().resourceId("text_input")` | Inicial: `Select an item...` |
| Botão Active | `~button-Active` | Abre alerta. Em tela pequena, precisa rolar até ele. |
| Botão Inactive | `~button-Inactive` | |

### Opções do dropdown

| Elemento | Seletor |
|---|---|
| Lista | `id=com.wdiodemoapp:id/select_dialog_listview` |
| Opções (texto) | `webdriver.io is awesome`, `Appium is awesome`, `This app is awesome` |

### Alerta do botão Active

Título `This button is`, mensagem `This button is active`, botões ASK ME LATER, CANCEL e OK. Os seletores estão em [Alertas](#alertas-android).

---

## Alertas (Android)

No app 2.2.0, o alerta é um **diálogo do próprio app**, não do sistema.
**`driver.acceptAlert()` / `dismissAlert()` não funcionam.** Clique nos botões:

| Elemento | Seletor |
|---|---|
| Título | `id=com.wdiodemoapp:id/alert_title` |
| Mensagem | `id=android:id/message` |
| OK | `id=android:id/button1` |
| CANCEL | `id=android:id/button2` |
| ASK ME LATER | `id=android:id/button3` |

No código: `test/pageobjects/components/alert.component.js`.

---

## Swipe

| Elemento | Seletor |
|---|---|
| Tela | `~Swipe-screen` |
| Carrossel | `android=new UiSelector().resourceId("Carousel")` (**resource-id**, não accessibility id) |
| Card | `~card` |
| Slide N | resource-id `__CAROUSEL_ITEM_N__` (N = 0 a 5) |

| # | Swipes à esquerda | Título |
|---|---|---|
| 0 | 0 | FULLY OPEN SOURCE |
| 1 | 1 | GREAT COMMUNITY |
| 2 | 2 | JS.FOUNDATION |
| 3 | 3 | SUPPORT VIDEOS |
| 4 | 4 | EXTENDABLE |
| 5 | 5 | COMPATIBLE |

> Trocar de aba **não** reinicia o carrossel.
> O texto "swipe vertical to find what I'm hiding" não revelou nenhum elemento na rolagem testada.

---

## Drag

| Elemento | Seletor |
|---|---|
| Tela | `~Drag-drop-screen` |
| Reiniciar | `~renew` |
| Alvos | `~drop-<pos>` |
| Peças | `~drag-<pos>` |
| Mensagem final | texto `Congratulations` |

`<pos>`: `l1 c1 r1 / l2 c2 r2 / l3 c3 r3` (l/c/r = esquerda/centro/direita, número = linha).

> As peças aparecem embaralhadas. Cada uma tem o id da sua posição final.

---

## Permissions (pelo menu lateral)

| Elemento | Seletor |
|---|---|
| Tela | `~Permissions-screen` |
| Switch Camera | `~permission-switch-camera` |
| Switch Microphone | `~permission-switch-microphone` |
| Switch Location | `~permission-switch-location` |
| Switch Photo library | `~permission-switch-photos` |

---

## Data management (pelo menu lateral)

| Elemento | Seletor |
|---|---|
| Tela | `~DataManagement-screen` |
| Campo (memória) | `~data-memory-input` |
| Valor atual | `~data-memory-readout` (vazio: `— empty —`) |
| Salvar | `~button-data-memory-save` |
| Limpar | `~button-data-memory-clear` |

> Há uma seção "2. Persisted key-value (AsyncStorage tier)" mais abaixo, ainda não mapeada.

---

## Webview

| Contexto | Nome |
|---|---|
| Nativo | `NATIVE_APP` |
| Web | `WEBVIEW_com.wdiodemoapp` |

Ao abrir, aparece `LOADING...`. A página carregada é o **webdriver.io ao vivo**, e o conteúdo pode mudar. Elementos vistos pelo contexto nativo:

| Elemento | Seletor |
|---|---|
| Busca | texto `Search (Ctrl+K)`. Em tela estreita (celular) vira só ícone, sem o texto. |
| Menu do site | texto `Toggle navigation bar` |
| Logo | `~WebdriverIO`: o mais estável, sempre no topo (usado para esperar o carregamento) |
| Get Started | `~Get Started`. Em tela pequena fica abaixo da área visível. |

> ⚠️ **Pendente (Android):** no contexto `WEBVIEW_com.wdiodemoapp`, os seletores CSS não foram encontrados (mapeado no app anterior). Provável incompatibilidade do chromedriver. No iOS funciona, veja a seção iOS.

---

## iOS

Mapeado via **appium-mcp** em 01/10/2026 no simulador **iPhone 16 / iOS 18.5**, com o `app/ios-app-wdio.app` (versão **2.2.0**, bundle `org.wdiodemoapp`).

**Todos os accessibility ids das tabelas acima funcionam igual no iOS**: barra inferior, menu lateral, Login, Forms, Swipe, Drag, Permissions e Data. As diferenças estão abaixo.

| Caso | Android | iOS |
|---|---|---|
| Seletor por texto | `android=new UiSelector().text("...")` | `-ios predicate string:label == "..."` |
| Carrossel | resource-id `Carousel` | `~Carousel` (accessibility id) |
| Valor do dropdown | resource-id `text_input` | `~text_input` |
| Título do alerta | `id=com.wdiodemoapp:id/alert_title` | `-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]` |
| Mensagem do alerta | `id=android:id/message` | `-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[2]` |
| Botões do alerta | `id=android:id/button1/2/3` | `~OK`, `~Cancel`, `~Ask me later` |
| `acceptAlert()` / `getAlertText()` | não funcionam (diálogo do app) | funcionam (alerta do sistema) |
| Fechar teclado | `hideKeyboard()` | `hideKeyboard()` **falha**. Toque na tecla de confirmação, que muda por campo (`Done` no Login, `return` no Forms), às vezes 2x. |
| Fechar menu lateral | `driver.back()` | Toque fora do painel (lado esquerdo) |
| Contexto web | `WEBVIEW_com.wdiodemoapp` (CSS não funcionou) | `WEBVIEW_<pid>.1` (muda a cada execução). CSS **funciona** (`.DocSearch-Button`, `.navbar__brand`). |
| Webview nativo | `Search (Ctrl+K)` só em tela larga | `Search (Ctrl+K)` **não aparece**. `~Get Started` existe. |

### Dropdown no iOS (roleta)

1. Toque em `~dropdown-chevron`. O toque em `~Dropdown` ou `~text_input` **não abre**.
2. `$('-ios class chain:**/XCUIElementTypePickerWheel').setValue('Appium is awesome')`
3. Toque em `~done_button`.
4. O valor fica em `~text_input` (atributo `value`).

### Cuidados no iOS

- **Elementos fora da tela existem na árvore.** Os 6 cards do carrossel são encontrados mesmo sem swipe. Valide com `toBeDisplayed()` (atributo `visible`), não com `toExist()`.
- **Tempo de carregamento:** os containers das telas do menu lateral (`~Permissions-screen`, `~DataManagement-screen`) demoram um pouco para aparecer. O `open()` dos page objects espera por eles.

---

## Como atualizar este mapeamento

1. Abra o emulador: `npm run start:emulator`.
2. Peça ao Claude Code para mapear a tela pelo **appium-mcp** (configurado em `.mcp.json`).
3. Ferramentas úteis do MCP: `generate_locators`, `appium_get_page_source` e `appium_find_element`.
4. Encerre a sessão do MCP antes de rodar os testes (`npm run test:bc` e variantes).
