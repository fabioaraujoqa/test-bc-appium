import FormPage from "../../../pageobjects/bc/form.page";

describe("iOS - Forms", () => {
  beforeEach(async () => {
    await FormPage.open();
  });

  it("Deve preencher campo de texto", async () => {
    await FormPage.preencherCampo("Testes");
    await expect(FormPage.inputResult).toHaveText(expect.stringContaining("Testes"));
  });

  it("Deve abrir o alerta do botão Active e fechar com OK", async () => {
    await FormPage.clickActiveButton();
    await FormPage.clickOk();
  });

  it("Deve abrir o alerta do botão Active e fechar com Ask me later", async () => {
    await FormPage.clickActiveButton();
    await FormPage.clickAskMeLater();
  });
});
