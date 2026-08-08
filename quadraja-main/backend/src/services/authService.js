import bcrypt from 'bcryptjs';
import { clienteRepository } from '../repositories/clienteRepository.js';
import { gestorRepository } from '../repositories/gestorRepository.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { Role } from '../utils/constants.js';

function semSenha(usuario) {
  const { senha, ...rest } = usuario;
  return rest;
}

// Hash "fantasma" usado quando o usuario nao existe, para que o bcrypt.compare
// sempre rode e o tempo de resposta nao denuncie (por timing) se o e-mail
// esta ou nao cadastrado.
const HASH_FANTASMA = bcrypt.hashSync('senha-fantasma-normaliza-tempo-de-resposta', 10);

function compararSenha(senha, hashArmazenado) {
  return bcrypt.compare(senha, hashArmazenado || HASH_FANTASMA);
}

export const authService = {
  async cadastrarCliente({ nome, telefone, email, senha }) {
    const hash = await bcrypt.hash(senha, 10);
    const cliente = await clienteRepository.criar({ nome, telefone, email, senha: hash });
    const token = signToken({ id: cliente.id, role: Role.CLIENTE, nome: cliente.nome });
    return { token, usuario: semSenha(cliente) };
  },

  async loginCliente({ email, senha }) {
    const cliente = await clienteRepository.buscarPorEmail(email);
    const senhaOk = await compararSenha(senha, cliente?.senha);
    if (!cliente || !senhaOk) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }
    const token = signToken({ id: cliente.id, role: Role.CLIENTE, nome: cliente.nome });
    return { token, usuario: semSenha(cliente) };
  },

  async loginGestor({ email, senha }) {
    const gestor = await gestorRepository.buscarPorEmail(email);
    const senhaOk = await compararSenha(senha, gestor?.senha);
    if (!gestor || !senhaOk) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }
    const token = signToken({ id: gestor.id, role: Role.GESTOR, nome: gestor.nome });
    return { token, usuario: semSenha(gestor) };
  },
};
