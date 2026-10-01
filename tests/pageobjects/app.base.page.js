import PaginaBase from './base.page'

export const ANDROID_PACKAGE = 'com.wdiodemoapp'
export const ANDROID_ACTIVITY = '.MainActivity'
export const IOS_BUNDLE_ID = 'org.wdiodemoapp'

/**
 * Base dos page objects do app (Android e iOS).
 * Cada tela informa o accessibility id do seu item no menu inferior (ex.: "Forms")
 * e pode definir `get tela()` com o container da tela, que o open() espera aparecer.
 */
export default class AppBasePage extends PaginaBase {
  constructor(menu) {
    super()
    this.menu = menu
  }

  get appId() {
    return driver.isAndroid ? ANDROID_PACKAGE : IOS_BUNDLE_ID
  }

  get telaInicial() {
    return this.obterElemento('~Home-screen')
  }

  // Fecha e reabre o app: com noReset o app guarda estado (texto digitado, carrossel) entre testes
  async reiniciarNaTelaInicial() {
    await driver.terminateApp(this.appId)
    await driver.activateApp(this.appId)
    if (driver.isAndroid) await this.aguardarActivity(ANDROID_ACTIVITY)
    await this.telaInicial.waitForDisplayed({ timeout: 20000 })

    // Fecha um alerta que tenha ficado aberto de uma execução anterior
    const botaoOk = this.obterElemento(driver.isAndroid ? 'id=android:id/button1' : '~OK')
    if (await botaoOk.isExisting()) await botaoOk.click()
  }

  async aguardarActivity(activity, tempo = 10000) {
    await driver.waitUntil(
      async () => (await driver.getCurrentActivity()) === activity,
      { timeout: tempo, timeoutMsg: `Activity esperada não foi aberta: ${activity}` },
    )
  }

  async open() {
    const item = $(`~${this.menu}`)
    await item.waitForDisplayed({ timeout: 10000 })
    await item.click()
    if (this.tela) await this.tela.waitForDisplayed({ timeout: 10000 })
  }

  // No iOS o teclado continua aberto depois de digitar e cobre a barra inferior.
  // O hideKeyboard não funciona no iOS neste app: toca na tecla de confirmação, que muda conforme o campo
  // ("Done" no login, "return" no Forms). O 1º toque pode só passar para o próximo campo.
  async fecharTeclado() {
    if (driver.isAndroid) {
      if (await driver.isKeyboardShown()) await driver.hideKeyboard()
      return
    }
    const done = $('-ios class chain:**/XCUIElementTypeKeyboard/**/XCUIElementTypeButton[`name IN {"Done", "done", "Return", "return", "Go", "Next"}`]')
    for (let i = 0; i < 3 && await driver.isKeyboardShown(); i++) {
      await done.click()
    }
  }

  // Seletor por texto visível, para elementos sem accessibility id
  porTexto(texto) {
    return driver.isAndroid
      ? `android=new UiSelector().text("${texto}")`
      : `-ios predicate string:label == "${texto}"`
  }

  // Em telas pequenas o elemento pode estar abaixo da área visível.
  // No Android o UiScrollable rola até ele; no iOS o XCUITest acha elementos fora da tela.
  rolarAte(accessibilityId) {
    return driver.isAndroid
      ? `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${accessibilityId}"))`
      : `~${accessibilityId}`
  }
}
