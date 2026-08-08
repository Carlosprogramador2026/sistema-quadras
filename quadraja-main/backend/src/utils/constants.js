// Status possiveis de uma Reserva (SQLite nao tem enum nativo).
export const StatusReserva = {
  PENDENTE: 'PENDENTE',
  CONFIRMADA: 'CONFIRMADA',
  CANCELADA: 'CANCELADA',
  EM_ESPERA: 'EM_ESPERA',
};

export const STATUS_VALUES = Object.values(StatusReserva);

// Um slot e considerado ocupado (bloqueia novas reservas no mesmo horario)
// quando ja existe reserva PENDENTE ou CONFIRMADA.
export const STATUS_OCUPADOS = [StatusReserva.PENDENTE, StatusReserva.CONFIRMADA];

// Horario de funcionamento da quadra e duracao de cada slot.
export const FUNCIONAMENTO = {
  horaAbertura: 8, // 08:00
  horaFechamento: 23, // 23:00 (ultimo slot inicia 22:00)
  duracaoMinutos: 60,
};

// Papeis de usuario para o JWT.
export const Role = {
  CLIENTE: 'CLIENTE',
  GESTOR: 'GESTOR',
};

// Tipos de desconto de um Cupom (SQLite nao tem enum nativo).
export const TipoCupom = {
  PERCENTUAL: 'PERCENTUAL',
  FIXO: 'FIXO',
};

// Quantas ocorrencias futuras sao materializadas ao criar uma reserva recorrente.
// Sem infra de cron/scheduler no projeto, essa e a "janela" garantida de uma vez.
export const OCORRENCIAS_RECORRENCIA = 8;
