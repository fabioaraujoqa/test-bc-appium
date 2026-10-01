import path from 'node:path'
import { carregarEnv } from '../../config/env.loader'
import fixture from '../fixtures/usuarios.json'

const env = carregarEnv(path.resolve(__dirname, '../..'))

/**
 * Usuário de login: credencial, vem do .env (local) ou dos secrets do GitHub (CI).
 */
export function usuarioLogin() {
  const { LOGIN_EMAIL: email, LOGIN_SENHA: senha } = env
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
