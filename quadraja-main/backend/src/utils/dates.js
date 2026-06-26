import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { FUNCIONAMENTO } from './constants.js';

dayjs.extend(customParseFormat);

const FORMATO_DATA = 'YYYY-MM-DD';
const FORMATO_HORA = 'HH:mm';

export function isDataValida(data) {
  return dayjs(data, FORMATO_DATA, true).isValid();
}

export function isHoraValida(hora) {
  return dayjs(hora, FORMATO_HORA, true).isValid();
}

// Gera os slots de horario do dia conforme o funcionamento da quadra.
// Retorna [{ horaInicio: "08:00", horaFim: "09:00" }, ...].
export function gerarSlots() {
  const { horaAbertura, horaFechamento, duracaoMinutos } = FUNCIONAMENTO;
  const slots = [];
  const base = dayjs().hour(horaAbertura).minute(0).second(0);
  const limite = dayjs().hour(horaFechamento).minute(0).second(0);

  let atual = base;
  while (atual.add(duracaoMinutos, 'minute').isAfter(limite) === false) {
    const fim = atual.add(duracaoMinutos, 'minute');
    slots.push({
      horaInicio: atual.format(FORMATO_HORA),
      horaFim: fim.format(FORMATO_HORA),
    });
    atual = fim;
  }
  return slots;
}

// Verifica se um par (data, horaInicio) ja passou em relacao a agora.
export function slotNoPassado(data, horaInicio) {
  const inicio = dayjs(`${data} ${horaInicio}`, `${FORMATO_DATA} ${FORMATO_HORA}`, true);
  return inicio.isValid() && inicio.isBefore(dayjs());
}
