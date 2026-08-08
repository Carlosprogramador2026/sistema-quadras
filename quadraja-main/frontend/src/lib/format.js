import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';

dayjs.locale('pt-br');

export { dayjs };

export const hoje = () => dayjs().format('YYYY-MM-DD');

export function formatarDataLonga(data) {
  return dayjs(data).format('ddd, DD [de] MMM');
}

export function formatarDataCurta(data) {
  return dayjs(data).format('DD/MM/YYYY');
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor) {
  return formatadorMoeda.format(valor || 0);
}

export const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

// Metadados visuais de cada status de reserva.
export const STATUS_META = {
  PENDENTE: { label: 'Pendente', badge: 'amber' },
  CONFIRMADA: { label: 'Confirmada', badge: 'green' },
  CANCELADA: { label: 'Cancelada', badge: 'gray' },
  EM_ESPERA: { label: 'Em espera', badge: 'blue' },
};

export function statusMeta(status) {
  return STATUS_META[status] || { label: status, badge: 'gray' };
}
