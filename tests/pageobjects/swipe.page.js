import BcBasePage from './bc.base.page'
import { swipeNTimes } from '../utils/swipe'

class SwipePage extends BcBasePage {
  constructor() { super('Swipe') }

  // Títulos dos cards, na ordem do carrossel
  static CARDS = [
    'FULLY OPEN SOURCE',
    'GREAT COMMUNITY',
    'JS.FOUNDATION',
    'SUPPORT VIDEOS',
    'EXTENDABLE',
    'COMPATIBLE',
  ]

  // Seletores
  get tela()     { return $('~Swipe-screen') }
  // No Android o testID "Carousel" vira resource-id (não accessibility id)
  get carrossel() { return $(driver.isAndroid ? 'android=new UiSelector().resourceId("Carousel")' : '~Carousel') }

  card(titulo)   { return $(this.porTexto(titulo)) }

  // Métodos
  // O carrossel aparece um pouco depois da tela; espera antes de fazer o gesto
  async swipeNoCarrossel(direction, vezes) {
    await this.carrossel.waitForDisplayed()
    await swipeNTimes({ element: await this.carrossel, direction, times: vezes })
  }

  async proximoCard(vezes = 1) {
    await this.swipeNoCarrossel('left', vezes)
  }

  async cardAnterior(vezes = 1) {
    await this.swipeNoCarrossel('right', vezes)
  }

  // Trocar de aba não reinicia o carrossel; volta ao primeiro card para cada teste começar igual
  async voltarAoInicio() {
    await this.cardAnterior(SwipePage.CARDS.length - 1)
  }
}

export default new SwipePage()
