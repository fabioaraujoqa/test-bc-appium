import DragPage from "../../pageobjects/drag.page";
//Referencia: https://webdriver.io/docs/api/mobile/dragAndDrop/
describe("Testes na tela DragDrop", () => {
  beforeEach(async () => {
    await DragPage.open();
    await DragPage.btnRenew.click(); // embaralha de novo e deixa todas as peças fora da grade
  });

  it("Deve arrastar a peça até o lugar certo", async () => {
    await DragPage.arrastar("l1");
    await expect(DragPage.peca("l1")).not.toExist();
  });

  it("Deve montar o quebra-cabeça completo com dragAndDrop", async () => {
    await DragPage.montarQuebraCabeca();
    await expect(DragPage.mensagemFim).toBeDisplayed();
  });
});
