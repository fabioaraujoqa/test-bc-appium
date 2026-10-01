// Smoke comum a Android e iOS: valida que o app abre e que a navegação básica funciona.
// Roda em qualquer perfil: npm run test:bc:smoke | test:bc:smoke:celular | test:bc:smoke:ios
import BcBasePage, { ANDROID_PACKAGE, ANDROID_ACTIVITY, IOS_BUNDLE_ID } from "../pageobjects/bc.base.page";
import LoginPage from "../pageobjects/login.page";
import FormPage from "../pageobjects/form.page";
import { evidenciar } from "../../config/video.hooks";

const app = new BcBasePage();

describe("Smoke - app abre e navega", () => {
  beforeEach(async () => {
    await app.reiniciarNaTelaInicial();
  });

  it("Deve abrir no app e na tela inicial esperados", async () => {
    if (driver.isAndroid) {
      await expect(await driver.getCurrentPackage()).toBe(ANDROID_PACKAGE);
      await expect(await driver.getCurrentActivity()).toBe(ANDROID_ACTIVITY);
    } else {
      // 4 = app rodando em primeiro plano
      await expect(await driver.queryAppState(IOS_BUNDLE_ID)).toBe(4);
    }
    await expect(app.telaInicial).toBeDisplayed();
    await expect($(app.porTexto("WEBDRIVER"))).toBeDisplayed();
  });

  it("Deve exibir a barra inferior com todas as telas", async () => {
    for (const aba of ["Home", "Webview", "Login", "Forms", "Swipe", "Drag", "Menu"]) {
      await expect($(`~${aba}`)).toBeDisplayed();
    }
  });

  it("Deve navegar para Login e Forms", async () => {
    await LoginPage.open();
    await expect(LoginPage.btnLogin).toBeDisplayed();
    await evidenciar("Tela de Login");

    await FormPage.open();
    await expect(FormPage.input).toBeDisplayed();
  });
});
