import { listaEsperaRepository } from '../repositories/listaEsperaRepository.js';
import { reservaRepository } from '../repositories/reservaRepository.js';
import { quadraService } from './quadraService.js';
import { AppError } from '../utils/AppError.js';
import { STATUS_OCUPADOS } from '../utils/constants.js';
import { linkVagaLiberada } from '../utils/whatsapp.js';

export const listaEsperaService = {
  async entrar({ clienteId, quadraId, data, horaInicio, horaFim }) {
    await quadraService.buscarOuFalhar(quadraId);

    // So faz sentido entrar na fila se o horario estiver realmente ocupado.
    const ocupada = await reservaRepository.buscarPorSlot({
      quadraId,
      data,
      horaInicio,
      statusIn: STATUS_OCUPADOS,
    });
    if (!ocupada) {
      throw new AppError('Esse horario esta livre. Faca a reserva normalmente.', 409);
    }

    const jaInscrito = await listaEsperaRepository.jaInscrito({
      clienteId,
      quadraId,
      data,
      horaInicio,
    });
    if (jaInscrito) {
      throw new AppError('Voce ja esta na lista de espera desse horario.', 409);
    }

    const posicao = (await listaEsperaRepository.contarNoSlot({ quadraId, data, horaInicio })) + 1;

    return listaEsperaRepository.criar({
      clienteId,
      quadraId,
      data,
      horaInicio,
      horaFim,
      posicao,
    });
  },

  listar(filtros) {
    return listaEsperaRepository.listar(filtros);
  },

  // Chamado quando uma reserva confirmada e cancelada: notifica o 1o da fila.
  // Retorna { listaEspera, whatsappUrl } ou null se a fila estiver vazia.
  async notificarPrimeiroDaFila({ quadraId, data, horaInicio }) {
    const primeiro = await listaEsperaRepository.primeiroDaFila({ quadraId, data, horaInicio });
    if (!primeiro) return null;

    await listaEsperaRepository.marcarNotificado(primeiro.id);

    const whatsappUrl = linkVagaLiberada({
      cliente: primeiro.cliente,
      quadra: primeiro.quadra,
      data,
      horaInicio,
      horaFim: primeiro.horaFim,
    });

    return { listaEspera: primeiro, whatsappUrl };
  },
};
