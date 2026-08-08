import { reservaRepository } from '../repositories/reservaRepository.js';
import { participanteRepository } from '../repositories/participanteRepository.js';
import { quadraService } from './quadraService.js';
import { listaEsperaService } from './listaEsperaService.js';
import { cupomService } from './cupomService.js';
import { AppError } from '../utils/AppError.js';
import { StatusReserva, STATUS_OCUPADOS, Role } from '../utils/constants.js';
import { slotNoPassado } from '../utils/dates.js';
import { linkSolicitacaoReserva } from '../utils/whatsapp.js';

export const reservaService = {
  // Cliente solicita uma reserva (entra como PENDENTE).
  // cupomCodigo e reservaRecorrenteId sao internos: nunca chegam pelo POST /reservas
  // publico (o Zod schema da rota nao declara reservaRecorrenteId), so via
  // reservaRecorrenteService ao materializar as ocorrencias de uma recorrencia.
  async criar({ clienteId, quadraId, data, horaInicio, horaFim, cupomCodigo, reservaRecorrenteId }) {
    const quadra = await quadraService.buscarOuFalhar(quadraId);
    if (!quadra.ativa) throw new AppError('Esta quadra nao esta disponivel.', 409);

    if (slotNoPassado(data, horaInicio)) {
      throw new AppError('Nao e possivel reservar um horario que ja passou.', 409);
    }

    const conflito = await reservaRepository.buscarPorSlot({
      quadraId,
      data,
      horaInicio,
      statusIn: STATUS_OCUPADOS,
    });
    if (conflito) {
      throw new AppError(
        'Esse horario ja esta ocupado. Entre na lista de espera.',
        409,
        { ocupado: true }
      );
    }

    let valor = quadra.valorHora;
    let cupomAplicado = null;
    if (cupomCodigo) {
      cupomAplicado = await cupomService.validar({ codigo: cupomCodigo, valorBase: valor });
      valor = cupomAplicado.valorFinal;
    }

    const reserva = await reservaRepository.criar({
      clienteId,
      quadraId,
      data,
      horaInicio,
      horaFim,
      status: StatusReserva.PENDENTE,
      valor,
      cupomId: cupomAplicado?.cupom.id ?? null,
      reservaRecorrenteId: reservaRecorrenteId ?? null,
    });

    if (cupomAplicado) await cupomService.incrementarUso(cupomAplicado.cupom.id);

    const whatsappUrl = linkSolicitacaoReserva({
      cliente: reserva.cliente,
      quadra: reserva.quadra,
      data,
      horaInicio,
      horaFim,
    });

    return { reserva, whatsappUrl };
  },

  listarParaGestor(filtros) {
    return reservaRepository.listar(filtros);
  },

  listarDoCliente(clienteId) {
    return reservaRepository.listar({ clienteId });
  },

  async resumoStatus() {
    const grupos = await reservaRepository.contarPorStatus();
    const resumo = { PENDENTE: 0, CONFIRMADA: 0, CANCELADA: 0, EM_ESPERA: 0 };
    for (const g of grupos) resumo[g.status] = g._count._all;
    return resumo;
  },

  async buscarOuFalhar(id) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw new AppError('Reserva nao encontrada.', 404);
    return reserva;
  },

  // Detalhe de uma reserva: dados + participantes + rateio do valor entre os confirmados.
  async detalhar(id, { clienteId, role }) {
    const reserva = await reservaService.buscarOuFalhar(id);
    if (role === Role.CLIENTE && reserva.clienteId !== clienteId) {
      throw new AppError('Voce nao pode ver esta reserva.', 403);
    }

    const participantes = await participanteRepository.listarPorReserva(id);
    const confirmados = participantes.filter((p) => p.confirmado);
    const valorPorPessoa = confirmados.length ? reserva.valor / confirmados.length : reserva.valor;

    return {
      reserva,
      participantes,
      rateio: { valorTotal: reserva.valor, confirmados: confirmados.length, valorPorPessoa },
    };
  },

  // Gestor confirma uma reserva pendente.
  async confirmar(id) {
    const reserva = await reservaService.buscarOuFalhar(id);
    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new AppError('Apenas reservas pendentes podem ser confirmadas.', 409);
    }

    const outraConfirmada = await reservaRepository.buscarPorSlot({
      quadraId: reserva.quadraId,
      data: reserva.data,
      horaInicio: reserva.horaInicio,
      statusIn: [StatusReserva.CONFIRMADA],
    });
    if (outraConfirmada && outraConfirmada.id !== reserva.id) {
      throw new AppError('Ja existe uma reserva confirmada nesse horario.', 409);
    }

    return reservaRepository.atualizarStatus(id, StatusReserva.CONFIRMADA);
  },

  // Gestor recusa uma reserva pendente.
  async recusar(id) {
    const reserva = await reservaService.buscarOuFalhar(id);
    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new AppError('Apenas reservas pendentes podem ser recusadas.', 409);
    }
    return reservaRepository.atualizarStatus(id, StatusReserva.CANCELADA);
  },

  // Gestor cancela uma reserva (pendente ou confirmada).
  // Ao cancelar, verifica a lista de espera do horario e notifica o 1o da fila.
  async cancelar(id) {
    const reserva = await reservaService.buscarOuFalhar(id);
    if (reserva.status === StatusReserva.CANCELADA) {
      throw new AppError('Esta reserva ja esta cancelada.', 409);
    }

    const ocupava = STATUS_OCUPADOS.includes(reserva.status);
    const cancelada = await reservaRepository.atualizarStatus(id, StatusReserva.CANCELADA);

    let esperaNotificada = null;
    if (ocupava) {
      esperaNotificada = await listaEsperaService.notificarPrimeiroDaFila({
        quadraId: reserva.quadraId,
        data: reserva.data,
        horaInicio: reserva.horaInicio,
      });
    }

    return { reserva: cancelada, esperaNotificada };
  },
};
