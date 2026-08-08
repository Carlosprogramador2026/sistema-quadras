import { participanteRepository } from '../repositories/participanteRepository.js';
import { reservaService } from './reservaService.js';
import { AppError } from '../utils/AppError.js';
import { Role, StatusReserva } from '../utils/constants.js';

// Gestor sempre pode gerenciar; cliente so se for o dono da reserva.
function podeGerenciar(reserva, ator) {
  return ator.role === Role.GESTOR || reserva.clienteId === ator.id;
}

export const participanteService = {
  // So o cliente dono da reserva adiciona participantes (nao o gestor).
  async adicionar({ reservaId, nome, telefone, ator }) {
    const reserva = await reservaService.buscarOuFalhar(reservaId);
    if (reserva.clienteId !== ator.id) {
      throw new AppError('Voce nao pode gerenciar participantes desta reserva.', 403);
    }
    if (reserva.status === StatusReserva.CANCELADA) {
      throw new AppError('Nao e possivel adicionar participantes a uma reserva cancelada.', 409);
    }
    return participanteRepository.criar({ reservaId, nome, telefone });
  },

  async buscarOuFalhar(id) {
    const participante = await participanteRepository.buscarPorId(id);
    if (!participante) throw new AppError('Participante nao encontrado.', 404);
    return participante;
  },

  // Cliente dono OU gestor podem atualizar (confirmado/pago/nome/telefone).
  async atualizar({ id, dados, ator }) {
    const participante = await participanteService.buscarOuFalhar(id);
    if (!podeGerenciar(participante.reserva, ator)) {
      throw new AppError('Voce nao pode gerenciar participantes desta reserva.', 403);
    }
    return participanteRepository.atualizar(id, dados);
  },

  // So o cliente dono da reserva remove participantes.
  async remover({ id, ator }) {
    const participante = await participanteService.buscarOuFalhar(id);
    if (participante.reserva.clienteId !== ator.id) {
      throw new AppError('Voce nao pode gerenciar participantes desta reserva.', 403);
    }
    await participanteRepository.remover(id);
  },

  // Sorteia 2 times entre os participantes confirmados (cliente dono ou gestor).
  async sortear({ reservaId, ator }) {
    const reserva = await reservaService.buscarOuFalhar(reservaId);
    if (!podeGerenciar(reserva, ator)) {
      throw new AppError('Voce nao pode gerenciar participantes desta reserva.', 403);
    }

    const todos = await participanteRepository.listarPorReserva(reservaId);
    const confirmados = todos.filter((p) => p.confirmado);
    if (confirmados.length < 2) {
      throw new AppError(
        'E preciso ao menos 2 participantes confirmados para sortear os times.',
        409
      );
    }

    const embaralhados = [...confirmados].sort(() => Math.random() - 0.5);
    const meio = Math.ceil(embaralhados.length / 2);
    await Promise.all(
      embaralhados.map((p, i) => participanteRepository.atualizar(p.id, { time: i < meio ? 1 : 2 }))
    );

    return participanteRepository.listarPorReserva(reservaId);
  },
};
