import { z } from 'zod';
import { isDataValida, isHoraValida } from '../utils/dates.js';

const dataSchema = z
  .string()
  .refine(isDataValida, { message: 'Data deve estar no formato YYYY-MM-DD.' });

const horaSchema = z
  .string()
  .refine(isHoraValida, { message: 'Hora deve estar no formato HH:mm.' });

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

// ---- Auth / Cliente ----
export const cadastroClienteSchema = {
  body: z.object({
    nome: z.string().min(2, 'Nome muito curto.'),
    telefone: z.string().min(8, 'Telefone invalido.'),
    email: z.string().email('E-mail invalido.'),
    senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres.'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('E-mail invalido.'),
    senha: z.string().min(1, 'Informe a senha.'),
  }),
};

// ---- Quadra ----
export const criarQuadraSchema = {
  body: z.object({
    nome: z.string().min(2, 'Nome da quadra muito curto.'),
    ativa: z.boolean().optional(),
    valorHora: z.coerce.number().nonnegative().optional(),
  }),
};

export const atualizarQuadraSchema = {
  params: idParam,
  body: z.object({
    nome: z.string().min(2).optional(),
    ativa: z.boolean().optional(),
    valorHora: z.coerce.number().nonnegative().optional(),
  }),
};

// ---- Disponibilidade ----
export const disponibilidadeSchema = {
  query: z.object({
    quadraId: z.coerce.number().int().positive(),
    data: dataSchema,
  }),
};

// ---- Reserva ----
export const criarReservaSchema = {
  body: z.object({
    quadraId: z.coerce.number().int().positive(),
    data: dataSchema,
    horaInicio: horaSchema,
    horaFim: horaSchema,
    cupomCodigo: z.string().min(1).optional(),
  }),
};

export const listarReservasSchema = {
  query: z.object({
    status: z.string().optional(),
    data: dataSchema.optional(),
    quadraId: z.coerce.number().int().positive().optional(),
  }),
};

export const reservaIdSchema = { params: idParam };

// ---- Lista de espera ----
export const entrarListaEsperaSchema = {
  body: z.object({
    quadraId: z.coerce.number().int().positive(),
    data: dataSchema,
    horaInicio: horaSchema,
    horaFim: horaSchema,
  }),
};

// ---- Participante ----
export const criarParticipanteSchema = {
  body: z.object({
    reservaId: z.coerce.number().int().positive(),
    nome: z.string().min(2, 'Nome muito curto.'),
    telefone: z.string().min(8, 'Telefone invalido.').optional(),
  }),
};

export const atualizarParticipanteSchema = {
  params: idParam,
  body: z.object({
    nome: z.string().min(2).optional(),
    telefone: z.string().min(8).optional(),
    confirmado: z.boolean().optional(),
    pago: z.boolean().optional(),
  }),
};

export const participanteIdSchema = { params: idParam };

// ---- Cupom ----
const cupomShape = z.object({
  codigo: z.string().min(3, 'Codigo muito curto.').max(20, 'Codigo muito longo.'),
  tipo: z.enum(['PERCENTUAL', 'FIXO'], { errorMap: () => ({ message: 'Tipo deve ser PERCENTUAL ou FIXO.' }) }),
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
  ativo: z.boolean().optional(),
  validoAte: dataSchema.optional(),
  usosMaximos: z.coerce.number().int().positive().optional(),
});

function refinarPercentual(val, ctx) {
  if (val.tipo === 'PERCENTUAL' && val.valor != null && val.valor > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Percentual nao pode passar de 100.', path: ['valor'] });
  }
}

export const criarCupomSchema = { body: cupomShape.superRefine(refinarPercentual) };

export const atualizarCupomSchema = {
  params: idParam,
  body: cupomShape.partial().superRefine(refinarPercentual),
};

export const validarCupomSchema = {
  body: z.object({
    codigo: z.string().min(1, 'Informe o codigo do cupom.'),
    quadraId: z.coerce.number().int().positive(),
  }),
};

// ---- Reserva recorrente ----
export const criarReservaRecorrenteSchema = {
  body: z.object({
    quadraId: z.coerce.number().int().positive(),
    diaSemana: z.coerce.number().int().min(0).max(6),
    horaInicio: horaSchema,
    horaFim: horaSchema,
  }),
};

export const recorrenteIdSchema = { params: idParam };
