import dayjs from 'dayjs';
import { reservaRecorrenteRepository } from '../repositories/reservaRecorrenteRepository.js';
import { reservaRepository } from '../repositories/reservaRepository.js';
import { quadraService } from './quadraService.js';
import { reservaService } from './reservaService.js';
import { AppError } from '../utils/AppError.js';
import { STATUS_OCUPADOS, OCORRENCIAS_RECORRENCIA } from '../utils/constants.js';
import { proximasDatasDoDiaSemana } from '../utils/dates.js';
import { linkSolicitacaoRecorrente } from '../utils/whatsapp.js';

export const reservaRecorrenteService = {
  // Cria a recorrencia e materializa as proximas OCORRENCIAS_RECORRENCIA semanas
  // como reservas reais (reutiliza reservaService.criar, que ja cobre quadra
  // ativa/horario passado/conflito). Datas que nao emplacam viram "puladas",
  // sem abortar as demais.
  async criar({ clienteId, quadraId, diaSemana, horaInicio, horaFim }) {
    const quadra = await quadraService.buscarOuFalhar(quadraId);
    const recorrente = await reservaRecorrenteRepository.criar({
      clienteId,
      quadraId,
      diaSemana,
      horaInicio,
      horaFim,
      ativo: true,
    });

    const datas = proximasDatasDoDiaSemana(diaSemana, OCORRENCIAS_RECORRENCIA);
    const criadas = [];
    const puladas = [];
    let clienteInfo = null;

    for (const data of datas) {
      try {
        const { reserva } = await reservaService.criar({
          clienteId,
          quadraId,
          data,
          horaInicio,
          horaFim,
          reservaRecorrenteId: recorrente.id,
        });
        criadas.push(reserva);
        clienteInfo ??= reserva.cliente;
      } catch (err) {
        if (err instanceof AppError) {
          puladas.push({ data, motivo: err.message });
        } else {
          throw err;
        }
      }
    }

    if (criadas.length === 0) {
      await reservaRecorrenteRepository.atualizarAtivo(recorrente.id, false);
    }

    const whatsappUrl = criadas.length
      ? linkSolicitacaoRecorrente({
          cliente: clienteInfo,
          quadra,
          diaSemana,
          horaInicio,
          horaFim,
          quantidade: criadas.length,
        })
      : null;

    return {
      recorrente: { ...recorrente, ativo: criadas.length > 0 },
      criadas,
      puladas,
      whatsappUrl,
    };
  },

  listarDoCliente(clienteId) {
    return reservaRecorrenteRepository.listarDoCliente(clienteId);
  },

  async buscarOuFalhar(id) {
    const recorrente = await reservaRecorrenteRepository.buscarPorId(id);
    if (!recorrente) throw new AppError('Recorrencia nao encontrada.', 404);
    return recorrente;
  },

  // Desativa a recorrencia e cancela so as reservas futuras ainda ocupadas
  // (pendente/confirmada) vinculadas a ela — passadas ficam intocadas.
  async cancelar({ id, clienteId }) {
    const recorrente = await reservaRecorrenteService.buscarOuFalhar(id);
    if (recorrente.clienteId !== clienteId) {
      throw new AppError('Voce nao pode cancelar esta recorrencia.', 403);
    }
    if (!recorrente.ativo) {
      throw new AppError('Esta recorrencia ja esta cancelada.', 409);
    }

    await reservaRecorrenteRepository.atualizarAtivo(id, false);

    const futuras = await reservaRepository.listarPorRecorrente({
      reservaRecorrenteId: id,
      statusIn: STATUS_OCUPADOS,
      dataApartirDe: dayjs().format('YYYY-MM-DD'),
    });

    for (const r of futuras) {
      await reservaService.cancelar(r.id);
    }

    return { recorrente: { ...recorrente, ativo: false }, canceladas: futuras.length };
  },
};
