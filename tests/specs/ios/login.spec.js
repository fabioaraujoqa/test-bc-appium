// Cobertura mínima de iOS: mostra que a configuração do simulador funciona.
import LoginPage from "../../pageobjects/login.page";
import Alert from "../../pageobjects/components/alert.component";
import { usuarioLogin } from "../../utils/usuarios";

describe("iOS - Login", () => {
  it("Deve fazer login com sucesso", async () => {
    const { email, senha } = usuarioLogin();

    await LoginPage.open();
    await LoginPage.login(email, senha);
    await expect(Alert.btnOk).toBeDisplayed();
    await Alert.ok();
  });
});
