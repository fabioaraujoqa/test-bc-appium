import BcBasePage from './bc.base.page'

// A Webview carrega o site webdriver.io ao vivo: o conteúdo pode mudar a qualquer momento.
// Só o topo da página é confiável: em tela pequena (celular 720x1480) "Get Started" fica fora
// da área visível e o botão de busca vira só um ícone, sem o texto "Search (Ctrl+K)".
class WebviewPage extends BcBasePage {
  constructor() { super('Webview') }

  get carregando() { return $(this.porTexto('LOADING...')) }
  get logo()       { return $('~WebdriverIO') }

  async esperarCarregar() {
    await this.carregando.waitForDisplayed({ reverse: true, timeout: 30000 })
    await this.logo.waitForDisplayed({ timeout: 30000 })
  }

  async contextoWeb() {
    const contextos = await driver.getContexts()
    return contextos.find((c) => String(c).startsWith('WEBVIEW'))
  }
}

export default new WebviewPage()
