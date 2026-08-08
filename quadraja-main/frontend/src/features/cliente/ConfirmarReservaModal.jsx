import { useState } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api, mensagemErro } from '../../lib/api.js';
import { dayjs, formatarDataLonga, formatarMoeda } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function ConfirmarReservaModal({ open, onClose, quadra, data, slot, onConfirmado }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [cupomValidado, setCupomValidado] = useState(null);
  const [repetirSemanalmente, setRepetirSemanalmente] = useState(false);

  async function aplicarCupom() {
    if (!cupomCodigo.trim()) return;
    setValidandoCupom(true);
    try {
      const { data: resp } = await api.post('/cupons/validar', {
        codigo: cupomCodigo.trim(),
        quadraId: quadra.id,
      });
      setCupomValidado(resp);
      toast('Cupom aplicado ✅', 'success');
    } catch (err) {
      setCupomValidado(null);
      toast(mensagemErro(err), 'error');
    } finally {
      setValidandoCupom(false);
    }
  }

  async function confirmar() {
    setLoading(true);
    try {
      if (repetirSemanalmente) {
        const { data: resp } = await api.post('/reservas-recorrentes', {
          quadraId: quadra.id,
          diaSemana: dayjs(data).day(),
          horaInicio: slot.horaInicio,
          horaFim: slot.horaFim,
        });
        if (resp.whatsappUrl) window.open(resp.whatsappUrl, '_blank', 'noopener');
        toast(
          `Recorrência criada! ${resp.criadas.length} reserva(s) feita(s)` +
            (resp.puladas.length ? `, ${resp.puladas.length} horário(s) já ocupado(s) foram pulados.` : '.'),
          'success'
        );
      } else {
        const { data: resp } = await api.post('/reservas', {
          quadraId: quadra.id,
          data,
          horaInicio: slot.horaInicio,
          horaFim: slot.horaFim,
          cupomCodigo: cupomValidado ? cupomCodigo.trim() : undefined,
        });
        // Abre o WhatsApp do gestor com a mensagem pre-preenchida.
        if (resp.whatsappUrl) window.open(resp.whatsappUrl, '_blank', 'noopener');
        toast('Solicitação enviada! Aguarde a confirmação do gestor. 🎉', 'success');
      }
      setCupomCodigo('');
      setCupomValidado(null);
      setRepetirSemanalmente(false);
      onConfirmado?.();
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!slot || !quadra) return null;

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
          <Linha rotulo="Quadra" valor={quadra.nome} />
          <Linha rotulo="Data" valor={formatarDataLonga(data)} />
          <Linha rotulo="Horário" valor={`${slot.horaInicio} às ${slot.horaFim}`} />
          {!cupomValidado && <Linha rotulo="Valor" valor={formatarMoeda(quadra.valorHora)} />}
          {cupomValidado && (
            <>
              <Linha rotulo="Desconto" valor={`- ${formatarMoeda(cupomValidado.desconto)}`} />
              <Linha rotulo="Total" valor={formatarMoeda(cupomValidado.valorFinal)} />
            </>
          )}
        </dl>

        {!repetirSemanalmente && (
          <div className="flex gap-2">
            <Input
              placeholder="Código de cupom (opcional)"
              value={cupomCodigo}
              onChange={(e) => {
                setCupomCodigo(e.target.value);
                setCupomValidado(null);
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              loading={validandoCupom}
              disabled={!cupomCodigo.trim()}
              onClick={aplicarCupom}
            >
              Aplicar
            </Button>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={repetirSemanalmente}
            onChange={(e) => setRepetirSemanalmente(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Repetir toda semana neste horário
        </label>

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
