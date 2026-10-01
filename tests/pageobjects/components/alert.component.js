/**
 * Alerta do app (ex.: "Success" do login, "This button is" do Forms).
 * No Android (app 2.2.0) é um diálogo do próprio app, não um alerta do sistema:
 * driver.acceptAlert()/dismissAlert() NÃO funcionam, é preciso clicar nos botões.
 * No iOS é alerta do sistema; botões têm accessibility id (OK, Cancel, Ask me later).
 */
class Alert {
  get titulo()        { return $(driver.isAndroid ? 'id=com.wdiodemoapp:id/alert_title' : '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]') }
  get mensagem()      { return $(driver.isAndroid ? 'id=android:id/message' : '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[2]') }
  get btnOk()         { return $(driver.isAndroid ? 'id=android:id/button1' : '~OK') }
  get btnCancel()     { return $(driver.isAndroid ? 'id=android:id/button2' : '~Cancel') }
  get btnAskMeLater() { return $(driver.isAndroid ? 'id=android:id/button3' : '~Ask me later') }

  async textoMensagem() {
    await this.mensagem.waitForDisplayed()
    return this.mensagem.getText()
  }

  // Esperar o botão evita clicar antes do alerta abrir (aparelhos lentos)
  async clicar(botao) {
    await botao.waitForDisplayed()
    await botao.click()
  }

  async ok()         { await this.clicar(this.btnOk) }
  async cancel()     { await this.clicar(this.btnCancel) }
  async askMeLater() { await this.clicar(this.btnAskMeLater) }
}

export default new Alert()
