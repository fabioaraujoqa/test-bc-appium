import WebviewPage from "../../../pageobjects/bc/webview.page";

// O site carregado é o webdriver.io ao vivo; os testes checam só o que é estável
describe("Webview", () => {
  beforeEach(async () => {
    await WebviewPage.open();
    await WebviewPage.esperarCarregar();
  });

  it("Deve carregar o site do WebdriverIO", async () => {
    await expect(WebviewPage.logo).toBeDisplayed();
  });

  it("Deve disponibilizar o contexto web", async () => {
    await expect(await WebviewPage.contextoWeb()).toBeDefined();
  });
});
