import { reservaRepository } from '../repositories/reservaRepository.js';
import { quadraService } from './quadraService.js';
import { gerarSlots, slotNoPassado } from '../utils/dates.js';
import { StatusReserva, STATUS_OCUPADOS } from '../utils/constants.js';

export const disponibilidadeService = {
  // Monta os slots do dia para uma quadra, marcando o status de cada um.
  async listar({ quadraId, data }) {
    const quadra = await quadraService.buscarOuFalhar(quadraId);

    const ocupadas = await reservaRepository.listarOcupadasDoDia({
      quadraId,
      data,
      statusIn: STATUS_OCUPADOS,
    });

    // Mapa horaInicio -> status da reserva que ocupa o slot.
    const mapaStatus = new Map();
    for (const r of ocupadas) {
      // CONFIRMADA tem prioridade visual sobre PENDENTE no mesmo slot.
      const atual = mapaStatus.get(r.horaInicio);
      if (atual !== StatusReserva.CONFIRMADA) {
        mapaStatus.set(r.horaInicio, r.status);
      }
    }

    const slots = gerarSlots().map((slot) => {
      const ocupadoStatus = mapaStatus.get(slot.horaInicio) ?? null;
      const passado = slotNoPassado(data, slot.horaInicio);
      const disponivel = !ocupadoStatus && !passado;
      return {
        ...slot,
        status: ocupadoStatus ?? (passado ? 'INDISPONIVEL' : 'LIVRE'),
        disponivel,
        passado,
      };
    });

    return { quadra, data, slots };
  },
};
