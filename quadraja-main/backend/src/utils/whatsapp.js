// Geracao de links wa.me pre-preenchidos (forma gratuita, sem API).
// O `numero` deve conter apenas digitos (DDI + DDD + numero), ex: 5511999998888.

const GESTOR_WHATSAPP = process.env.GESTOR_WHATSAPP || '';

function limparNumero(numero) {
  return String(numero || '').replace(/\D/g, '');
}

export function buildWhatsappUrl(numero, mensagem) {
  const num = limparNumero(numero);
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${num}?text=${texto}`;
}

// Link para o CLIENTE avisar o GESTOR de uma nova solicitacao de reserva.
export function linkSolicitacaoReserva({ cliente, quadra, data, horaInicio, horaFim }) {
  const mensagem =
    `Ola! Gostaria de reservar a quadra.\n\n` +
    `*Quadra:* ${quadra.nome}\n` +
    `*Data:* ${data}\n` +
    `*Horario:* ${horaInicio} as ${horaFim}\n` +
    `*Cliente:* ${cliente.nome}\n` +
    `*Telefone:* ${cliente.telefone}`;
  return buildWhatsappUrl(GESTOR_WHATSAPP, mensagem);
}

// Link para o GESTOR avisar um CLIENTE da lista de espera que vagou horario.
export function linkVagaLiberada({ cliente, quadra, data, horaInicio, horaFim }) {
  const mensagem =
    `Ola, ${cliente.nome}! Liberou um horario que voce queria. \n\n` +
    `*Quadra:* ${quadra.nome}\n` +
    `*Data:* ${data}\n` +
    `*Horario:* ${horaInicio} as ${horaFim}\n\n` +
    `Quer confirmar a reserva?`;
  return buildWhatsappUrl(cliente.telefone, mensagem);
}
