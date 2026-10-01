import DragPage from "../../pageobjects/drag.page";
//Referencia: https://webdriver.io/docs/api/mobile/dragAndDrop/
describe("Drag and Drop - quebra-cabeça", () => {
  beforeEach(async () => {
    await DragPage.open();
    await DragPage.btnRenew.click(); // embaralha de novo e deixa todas as peças fora da grade
  });

  it("Deve arrastar uma peça até o lugar certo sem terminar o jogo", async () => {
    await DragPage.arrastar("l1");
    await expect(DragPage.peca("l1")).not.toExist();
    await expect(DragPage.mensagemFim).not.toBeDisplayed()
  });

  it("Deve montar o quebra-cabeça completo com dragAndDrop", async () => {
    await DragPage.montarQuebraCabeca();
    await expect(DragPage.mensagemFim).toBeDisplayed();
  });

  it("Não deve aceitar a peça na posição errada", async () => {
    await DragPage.peca('l1').dragAndDrop(await DragPage.alvo('c1'))
    await expect(DragPage.peca('l1')).toBeDisplayed()
  })
});
