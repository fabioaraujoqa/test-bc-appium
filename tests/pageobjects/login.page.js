import BcBasePage from './bc.base.page'
import Alert from './components/alert.component'

class LoginPage extends BcBasePage {
  constructor() { super('Login') }

  // Seletores
  get tela()         { return $('~Login-screen') }
  get abaLogin()     { return $('~button-login-container') }
  get abaSignUp()    { return $('~button-sign-up-container') }
  get email()        { return $('~input-email') }
  get senha()        { return $('~input-password') }
  get repetirSenha() { return $('~input-repeat-password') }
  get btnLogin()     { return $('~button-LOGIN') }
  get btnSignUp()    { return $('~button-SIGN UP') }

  // Mensagens de validação
  get erroEmail()    { return $(this.porTexto('Please enter a valid email address')) }
  get erroSenha()    { return $(this.porTexto('Please enter at least 8 characters')) }
  get erroRepetirSenha() { return $(this.porTexto('Please enter the same password')) }

  mensagemDeErro(texto) { return $(this.porTexto(texto)) }

  // Métodos
  async login(email, senha) {
    await this.email.setValue(email)
    await this.senha.setValue(senha)
    await this.fecharTeclado()
    await this.btnLogin.click()
  }

  // O app mantém o que foi digitado ao trocar de tela; limpa para cada teste começar do zero
  async limparCampos() {
    for (const campo of [this.email, this.senha]) await campo.clearValue()
    if (await this.repetirSenha.isExisting()) await this.repetirSenha.clearValue()
  }

  // confirmacao diferente da senha serve para testar a validação "Please enter the same password"
  async cadastrar(email, senha, confirmacao = senha) {
    await this.email.setValue(email)
    await this.senha.setValue(senha)
    await this.repetirSenha.setValue(confirmacao)
    await this.fecharTeclado()
    await this.btnSignUp.click()
  }

  async msgAlerta() {
    return Alert.textoMensagem()
  }

  async fecharAlerta() {
    await Alert.ok()
  }
}

export default new LoginPage()
