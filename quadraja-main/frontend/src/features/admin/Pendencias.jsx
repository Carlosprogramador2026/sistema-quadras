import { useEffect, useState } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { formatarDataLonga } from '../../lib/format.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function Pendencias() {
  const toast = useToast();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [acaoId, setAcaoId] = useState(null);

  function carregar() {
    setCarregando(true);
    api
      .get('/reservas', { params: { status: 'PENDENTE' } })
      .then(({ data }) => setReservas(data))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [toast]);

  async function agir(id, acao) {
    setAcaoId(id + acao);
    try {
      if (acao === 'confirmar') await api.patch(`/reservas/${id}/confirmar`);
      else await api.patch(`/reservas/${id}/recusar`);
      toast(acao === 'confirmar' ? 'Reserva confirmada ✅' : 'Reserva recusada', 'success');
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Pendências</h1>
        <p className="mt-1 text-sm text-slate-500">Solicitações aguardando sua confirmação.</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16 text-primary-600">
          <Spinner className="h-7 w-7" />
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState icon="🎉" title="Nenhuma pendência" description="Todas as solicitações foram tratadas." />
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <p className="font-bold text-slate-900">{r.quadra?.nome}</p>
                  <p className="text-sm text-slate-500">
                    {formatarDataLonga(r.data)} · {r.horaInicio}–{r.horaFim}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    👤 {r.cliente?.nome} · 📱 {r.cliente?.telefone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={acaoId === r.id + 'recusar'}
                    onClick={() => agir(r.id, 'recusar')}
                  >
                    Recusar
                  </Button>
                  <Button
                    size="sm"
                    loading={acaoId === r.id + 'confirmar'}
                    onClick={() => agir(r.id, 'confirmar')}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
