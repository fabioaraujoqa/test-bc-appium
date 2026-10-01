import PermissionsPage from "../../../pageobjects/bc/permissions.page";

describe("Permissions", () => {
  beforeEach(async () => {
    await PermissionsPage.open();
  });

  it("Deve exibir um switch para cada permissão", async () => {
    for (const permissao of ["camera", "microphone", "location", "photos"]) {
      await expect(PermissionsPage.switch(permissao)).toBeDisplayed();
    }
  });
});
