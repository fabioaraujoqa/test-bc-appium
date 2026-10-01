import FormPage from "../../pageobjects/form.page";
import Alert from "../../pageobjects/components/alert.component";

describe("Forms - componentes de formulário", () => {
  beforeEach(async () => {
    await FormPage.open();
  });

  it("Deve preencher o campo de texto e exibir o valor digitado", async () => {
    const texto = "Testes Banco Carrefour";
    await FormPage.preencherCampo(texto);
    await expect(FormPage.inputResult).toHaveText(expect.stringContaining(texto));
  });

  it("Deve alternar o switch para Off", async () => {
    await FormPage.alternarSwitch();
    await expect(FormPage.switchText).toHaveText("Click to turn the switch OFF");
  });

  it("Deve alternar o switch para On", async () => {
    await FormPage.alternarSwitch();
    await expect(FormPage.switchText).toHaveText("Click to turn the switch ON");
  });

  it("Deve selecionar um item no dropdown", async () => {
    const opcao = "webdriver.io is awesome";
    await FormPage.selectDropDown(opcao);
    await expect(FormPage.textDropDown).toHaveText(opcao);
  });

  it("Deve fechar o alerta do botão Active com Ask me later", async () => {
    await FormPage.btnActive.click();
    await expect(Alert.titulo).toHaveText("This button is");
    await expect(Alert.mensagem).toHaveText("This button is active");

    await FormPage.clickAskMeLater();
    await expect(Alert.titulo).not.toBeDisplayed();
  });

  it("Deve fechar o alerta do botão Active com OK", async () => {
    await FormPage.btnActive.click();
    await expect(Alert.titulo).toHaveText("This button is");
    await expect(Alert.mensagem).toHaveText("This button is active");

    await FormPage.clickOk();
    await expect(Alert.titulo).not.toBeDisplayed();
  });

  it("Deve fechar o alerta do botão Active com Cancel", async () => {
    await FormPage.btnActive.click();
    await expect(Alert.titulo).toHaveText("This button is");
    await expect(Alert.mensagem).toHaveText("This button is active");

    await FormPage.clickCancel();
    await expect(Alert.titulo).not.toBeDisplayed();
  });
});
