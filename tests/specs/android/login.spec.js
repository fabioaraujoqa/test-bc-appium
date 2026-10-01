import LoginPage from "../../pageobjects/login.page";
import Alert from "../../pageobjects/components/alert.component";
import { usuarioLogin, usuariosCadastro } from "../../utils/usuarios";
import { evidenciar } from "../../../config/video.hooks";

describe("Login / Sign up", () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it("Deve fazer login com sucesso", async () => {
    const { email, senha } = usuarioLogin();

    await LoginPage.abaLogin.click();
    await LoginPage.login(email, senha);

    await expect(Alert.titulo).toHaveText("Success");
    await expect(await LoginPage.msgAlerta()).toEqual("You are logged in!");
    await evidenciar("Alerta de login com sucesso");
    await LoginPage.fecharAlerta();
  });

  it("Deve cadastrar com sucesso", async () => {
    const { email, senha } = usuariosCadastro.valido();

    await LoginPage.abaSignUp.click();
    await LoginPage.cadastrar(email, senha);

    await expect(Alert.titulo).toHaveText("Signed Up!");
    await expect(await LoginPage.msgAlerta()).toEqual("You successfully signed up!");
    await evidenciar("Alerta de cadastro com sucesso");
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

  // Um teste por caso de tests/fixtures/usuarios.json (cadastroInvalido)
  for (const caso of usuariosCadastro.invalidos) {
    it(`Não deve cadastrar com ${caso.descricao}`, async () => {
      await LoginPage.abaSignUp.click();
      await LoginPage.limparCampos();
      await LoginPage.cadastrar(caso.email, caso.senha, caso.confirmacao);

      await expect(LoginPage.mensagemDeErro(caso.erro)).toBeDisplayed();
    });
  }
});
