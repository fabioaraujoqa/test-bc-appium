/**
 * Página Base genérica: métodos comuns a qualquer app (Android e iOS).
 * O que é específico do app fica em tests/pageobjects/bc.base.page.js.
 */
class PaginaBase {
  obterElemento(localizador) {
    return $(localizador)
  }

  async clicar(elemento) {
    await elemento.waitForDisplayed({ timeout: 5000 })
    await elemento.click()
  }

  async definirValor(elemento, valor) {
    await elemento.waitForDisplayed({ timeout: 5000 })
    await elemento.clearValue()
    await elemento.setValue(valor)
  }

  async obterTexto(elemento) {
    await elemento.waitForDisplayed({ timeout: 5000 })
    return elemento.getText()
  }

  async estaExibido(elemento) {
    try {
      return await elemento.isDisplayed()
    } catch {
      return false
    }
  }

  async aguardarElemento(localizador, tempo = 5000) {
    const elemento = this.obterElemento(localizador)
    await elemento.waitForDisplayed({ timeout: tempo })
    return elemento
  }
}

export default PaginaBase
