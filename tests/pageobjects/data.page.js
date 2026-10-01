import BcBasePage from './bc.base.page'
import MenuPage from './menu.page'

// Tela "Data management": só é acessível pelo menu lateral
class DataPage extends BcBasePage {
  get tela()       { return $('~DataManagement-screen') }
  get input()      { return $('~data-memory-input') }
  get valorAtual() { return $('~data-memory-readout') }
  get btnSalvar()  { return $('~button-data-memory-save') }
  get btnLimpar()  { return $('~button-data-memory-clear') }

  static VAZIO = '— empty —'

  async open() {
    await MenuPage.irPara('data-management')
    await this.tela.waitForDisplayed()
  }

  async salvarNaMemoria(valor) {
    await this.input.setValue(valor)
    await this.btnSalvar.click()
  }
}

export default new DataPage()
