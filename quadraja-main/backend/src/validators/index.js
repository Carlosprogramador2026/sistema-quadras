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
    senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
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
  }),
};

export const atualizarQuadraSchema = {
  params: idParam,
  body: z.object({
    nome: z.string().min(2).optional(),
    ativa: z.boolean().optional(),
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
