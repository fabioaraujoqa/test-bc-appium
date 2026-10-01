import MenuPage from "../../../pageobjects/bc/menu.page";
import FormPage from "../../../pageobjects/bc/form.page";

describe("Menu lateral", () => {
  afterEach(async () => {
    await MenuPage.fechar();
  });

  it("Deve listar todas as telas", async () => {
    await MenuPage.open();
    for (const tela of ["home", "webview", "login", "forms", "swipe", "drag", "permissions", "data-management"]) {
      await expect(MenuPage.item(tela)).toBeDisplayed();
    }
  });

  it("Deve navegar para uma tela pelo menu", async () => {
    await MenuPage.irPara("forms");
    await expect(FormPage.tela).toBeDisplayed();
  });
});
