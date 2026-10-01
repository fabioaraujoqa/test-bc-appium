import DataPage from "../../../pageobjects/bc/data.page";

describe("Data management - memória", () => {
  beforeEach(async () => {
    await DataPage.open();
  });

  it("Deve salvar um valor na memória", async () => {
    await DataPage.salvarNaMemoria("valor de teste");
    await expect(DataPage.valorAtual).toHaveText("valor de teste");
  });

  it("Deve limpar o valor salvo", async () => {
    await DataPage.salvarNaMemoria("valor de teste");
    await DataPage.btnLimpar.click();
    await expect(DataPage.valorAtual).toHaveText("— empty —");
  });
});
