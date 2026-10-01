import FormPage from '../../pageobjects/form.page'

describe('Form Components', () => {

  beforeEach(async () => {
    await FormPage.open()
  })

  it('Deve preencher campo de texto e validar', async () => {
    let texto = 'Testes'
    await FormPage.preencherCampo(texto)
    expect(await FormPage.inputResult.getText()).toContain(texto)
  })

  it('Deve alternar para Off o switch', async () => {
    await FormPage.alternarSwitch()
    expect(await FormPage.swithText.getText()).toEqual('Click to turn the switch OFF')
  })

    it('Deve alternar para On o switch', async () => {
    await FormPage.alternarSwitch()
    expect(await FormPage.swithText.getText()).toEqual('Click to turn the switch ON')
  })

  it('Seleciona um item no dropdown', async () => {
    let opcao = 'webdriver.io is awesome'
    await FormPage.selectDropDown(opcao)
    expect(await FormPage.textDropDown.getText()).toEqual(opcao)
  })


  it('Deve clicar no botão Ativo e depois em Ask Me later', async () => {
    await FormPage.btnActive.click()
    await FormPage.clickAskMeLater()
    await browser.pause(2000)
  })

  it('Deve clicar no botão Ativo e depois em OK', async () => {
    await FormPage.btnActive.click()
    await FormPage.clickOk()
    await browser.pause(2000)
  })

  it('Deve clicar no botão Ativo e depois em Cancel', async () => {
    await FormPage.btnActive.click()
    await FormPage.clickCancel()
    await browser.pause(2000)
  })
})
