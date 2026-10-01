import AppBasePage from './app.base.page'
import MenuPage from './menu.page'

// Tela "Permissions": só é acessível pelo menu lateral
class PermissionsPage extends AppBasePage {
  get tela() { return $('~Permissions-screen') }

  // camera, microphone, location, photos
  switch(permissao) { return $(`~permission-switch-${permissao}`) }

  async open() {
    await MenuPage.irPara('permissions')
    await this.tela.waitForDisplayed()
  }
}

export default new PermissionsPage()
