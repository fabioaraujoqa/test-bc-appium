import BcBasePage from './bc.base.page'
import Alert from './components/alert.component'

class FormPage extends BcBasePage {
  constructor() { super('Forms') }

  // Seletores
  get tela()         { return $('~Forms-screen') }
  get input ()        { return $('~text-input') }
  get inputResult ()  { return $('~input-text-result') }
  get switchElement ()       { return $('~switch') }
  get switchText ()    { return $('~switch-text') }
  get dropDown ()     { return $('~Dropdown') }
  get textDropDown () { return $(driver.isAndroid ? 'android=new UiSelector().resourceId("text_input")' : '~text_input') }
  get btnActive ()    { return $(this.rolarAte('button-Active')) }
  get btnInactive ()  { return $(this.rolarAte('button-Inactive')) }

  // Métodos
  async preencherCampo(texto) {
    await this.input.setValue(texto)
    await this.fecharTeclado()
  }

  async alternarSwitch() {
    await this.switchElement.click()
  }

  // Android: lista nativa. iOS: roleta (PickerWheel) que só abre tocando na seta
  async selectDropDown (opcao) {
    if (driver.isAndroid) {
      await this.dropDown.click()
      await $(this.porTexto(opcao)).click()
      return
    }
    await $('~dropdown-chevron').click()
    await $('-ios class chain:**/XCUIElementTypePickerWheel').setValue(opcao)
    await $('~done_button').click()
  }

  async clickActiveButton() {
    await this.btnActive.click()
  }

  async clickAskMeLater() {
    await Alert.askMeLater()
  }

  async clickCancel() {
    await Alert.cancel()
  }

  async clickOk() {
    await Alert.ok()
  }
}

export default new FormPage()
