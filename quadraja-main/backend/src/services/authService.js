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

export const authService = {
  async cadastrarCliente({ nome, telefone, email, senha }) {
    const hash = await bcrypt.hash(senha, 10);
    const cliente = await clienteRepository.criar({ nome, telefone, email, senha: hash });
    const token = signToken({ id: cliente.id, role: Role.CLIENTE, nome: cliente.nome });
    return { token, usuario: semSenha(cliente) };
  },

  async loginCliente({ email, senha }) {
    const cliente = await clienteRepository.buscarPorEmail(email);
    if (!cliente || !(await bcrypt.compare(senha, cliente.senha))) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }
    const token = signToken({ id: cliente.id, role: Role.CLIENTE, nome: cliente.nome });
    return { token, usuario: semSenha(cliente) };
  },

  async loginGestor({ email, senha }) {
    const gestor = await gestorRepository.buscarPorEmail(email);
    if (!gestor || !(await bcrypt.compare(senha, gestor.senha))) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }
    const token = signToken({ id: gestor.id, role: Role.GESTOR, nome: gestor.nome });
    return { token, usuario: semSenha(gestor) };
  },
};
