import { useState } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api, mensagemErro } from '../../lib/api.js';
import { formatarDataLonga } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function ConfirmarReservaModal({ open, onClose, quadraId, quadraNome, data, slot, onConfirmado }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    setLoading(true);
    try {
      const { data: resp } = await api.post('/reservas', {
        quadraId: Number(quadraId),
        data,
        horaInicio: slot.horaInicio,
        horaFim: slot.horaFim,
      });
      // Abre o WhatsApp do gestor com a mensagem pre-preenchida.
      if (resp.whatsappUrl) window.open(resp.whatsappUrl, '_blank', 'noopener');
      toast('Solicitação enviada! Aguarde a confirmação do gestor. 🎉', 'success');
      onConfirmado?.();
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!slot) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar solicitação"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Voltar
          </Button>
          <Button className="flex-1" loading={loading} onClick={confirmar}>
            Confirmar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Você está solicitando a reserva abaixo. Ao confirmar, enviaremos os dados para o WhatsApp
          do gestor.
        </p>
        <dl className="divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
          <Linha rotulo="Quadra" valor={quadraNome} />
          <Linha rotulo="Data" valor={formatarDataLonga(data)} />
          <Linha rotulo="Horário" valor={`${slot.horaInicio} às ${slot.horaFim}`} />
        </dl>
        <p className="text-xs text-slate-400">
          A reserva fica como <strong>pendente</strong> até o gestor confirmar.
        </p>
      </div>
    </Modal>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="font-semibold text-slate-800">{valor}</dd>
    </div>
  );
}
