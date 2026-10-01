import BcBasePage from './bc.base.page'

// Posições da grade 3x3: l/c/r = esquerda/centro/direita, 1-3 = linha
const POSICOES = ['l1', 'c1', 'r1', 'l2', 'c2', 'r2', 'l3', 'c3', 'r3']

class DragPage extends BcBasePage {
  constructor() { super('Drag') }

  // Seletores
  get tela()        { return $('~Drag-drop-screen') }
  get btnRenew()    { return $('~renew') }
  get mensagemFim() { return $(this.porTexto('Congratulations')) }

  peca(posicao)     { return $(`~drag-${posicao}`) }
  alvo(posicao)     { return $(`~drop-${posicao}`) }

  // Métodos
  async arrastar(posicao) {
    await this.peca(posicao).dragAndDrop(await this.alvo(posicao))
    await browser.pause(300) // espera a animação de encaixe
  }

  // As peças aparecem embaralhadas, mas cada uma tem o id da sua posição final
  async montarQuebraCabeca() {
    for (const posicao of POSICOES) {
      await this.arrastar(posicao)
    }
  }
}

export default new DragPage()
