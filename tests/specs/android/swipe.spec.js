import SwipePage from "../../../pageobjects/bc/swipe.page";

describe("Swipe - Arrastar na tela", () => {
  beforeEach(async () => {
    await SwipePage.open();
    await SwipePage.voltarAoInicio();
  });

  it("Deve revelar o segundo card", async () => {
    await SwipePage.proximoCard();
    await expect(SwipePage.card("GREAT COMMUNITY")).toBeDisplayed();
  });

  it("Deve revelar o terceiro card", async () => {
    await SwipePage.proximoCard(2);
    await expect(SwipePage.card("JS.FOUNDATION")).toBeDisplayed();
  });

  it("Deve revelar o quarto card", async () => {
    await SwipePage.proximoCard(3);
    await expect(SwipePage.card("SUPPORT VIDEOS")).toBeDisplayed();
  });

  it("Deve voltar para o primeiro card", async () => {
    await SwipePage.proximoCard(2);
    await SwipePage.cardAnterior(2);
    await expect(SwipePage.card("FULLY OPEN SOURCE")).toBeDisplayed();
  });
});
