// Cobertura mínima de iOS: mostra que a configuração do simulador funciona.
// Obs.: o app de iOS em app/ é a versão 1.0.8 (o de Android é a 2.2.0).
import LoginPage from "../../../pageobjects/bc/login.page";
import Alert from "../../pageobjects/components/alert.component";

describe("iOS - Login", () => {
  it("Deve fazer login com sucesso", async () => {
    await LoginPage.open();
    await LoginPage.login("teste@exemplo.com", "12345678");
    await expect(Alert.btnOk).toBeDisplayed();
    await Alert.ok();
  });
});
