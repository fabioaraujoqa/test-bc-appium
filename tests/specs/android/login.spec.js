import LoginPage from "../../../pageobjects/bc/login.page";
import Alert from "../../../pageobjects/bc/components/alert.component";

describe("Login / Sign up", () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it("Deve fazer login com sucesso", async () => {
    await LoginPage.abaLogin.click();
    await LoginPage.login("teste@exemplo.com", "12345678");
    await expect(Alert.titulo).toHaveText("Success");
    await expect(await LoginPage.msgAlerta()).toEqual("You are logged in!");
    await LoginPage.fecharAlerta();
  });

  it("Deve cadastrar com sucesso", async () => {
    await LoginPage.abaSignUp.click();
    await LoginPage.cadastrar("teste@exemplo.com", "12345678");
    await expect(Alert.titulo).toHaveText("Signed Up!");
    await expect(await LoginPage.msgAlerta()).toEqual("You successfully signed up!");
    await LoginPage.fecharAlerta();
  });

  it("Deve exibir as validações do cadastro com campos vazios", async () => {
    await LoginPage.abaSignUp.click();
    await LoginPage.limparCampos();
    await LoginPage.btnSignUp.click();
    await expect(LoginPage.erroEmail).toBeDisplayed();
    await expect(LoginPage.erroSenha).toBeDisplayed();
    await expect(LoginPage.erroRepetirSenha).toBeDisplayed();
  });
});
