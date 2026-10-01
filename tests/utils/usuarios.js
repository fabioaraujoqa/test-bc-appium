import fixture from '../fixtures/usuarios.json'

/**
 * Usuário de login: credencial, vem do .env (carregado pelo dotenv na config) ou dos secrets do CI.
 */
export function usuarioLogin() {
  const { LOGIN_EMAIL: email, LOGIN_SENHA: senha } = process.env
  if (!email || !senha) {
    throw new Error('LOGIN_EMAIL e LOGIN_SENHA não definidos. Preencha o .env (veja .env.example) ou os secrets do CI.')
  }
  return { email, senha }
}

// "{timestamp}" no e-mail da fixture vira um valor único por execução
function comEmailUnico(usuario) {
  return { ...usuario, email: usuario.email.replace('{timestamp}', Date.now()) }
}

/**
 * Massa de cadastro da fixture tests/fixtures/usuarios.json.
 */
export const usuariosCadastro = {
  valido: () => comEmailUnico(fixture.cadastro.valido),
  invalidos: fixture.cadastroInvalido,
}
