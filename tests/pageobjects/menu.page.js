import BcBasePage from './bc.base.page'

// Menu lateral, aberto pelo item "Menu" da barra inferior
class MenuPage extends BcBasePage {
  constructor() { super('Menu') }

  get tela() { return $('~tab-side-menu-panel') }

  item(tela)     { return $(`~side-menu-item-${tela}`) }
  estrela(tela)  { return $(`~side-menu-star-${tela}`) }

  // O painel cobre a barra inferior. Android: "voltar" do sistema; iOS: toque fora do painel (à esquerda)
  async fechar() {
    if (!(await this.tela.isDisplayed())) return
    if (driver.isAndroid) {
      await driver.back()
    } else {
      await driver.action('pointer').move({ x: 30, y: 400 }).down().up().perform()
    }
    await this.tela.waitForDisplayed({ reverse: true })
  }

  async irPara(tela) {
    await this.open()
    await this.item(tela).click()
  }
}

export default new MenuPage()
