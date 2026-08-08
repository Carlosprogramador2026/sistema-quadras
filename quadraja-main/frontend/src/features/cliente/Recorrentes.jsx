import { useEffect, useState } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { DIAS_SEMANA } from '../../lib/format.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function Recorrentes() {
  const toast = useToast();
  const [recorrencias, setRecorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);

  function carregar() {
    setCarregando(true);
    api
      .get('/reservas-recorrentes')
      .then(({ data }) => setRecorrencias(data))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [toast]);

  async function cancelar(id) {
    if (!window.confirm('Cancelar esta recorrência? Os horários futuros serão liberados.')) return;
    setCancelandoId(id);
    try {
      const { data: resp } = await api.delete(`/reservas-recorrentes/${id}`);
      toast(`Recorrência cancelada. ${resp.canceladas} reserva(s) futura(s) liberada(s).`, 'success');
      setRecorrencias((prev) => prev.map((r) => (r.id === id ? { ...r, ativo: false } : r)));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Mensalista</h1>
        <p className="mt-1 text-sm text-slate-500">Seus horários fixos, reservados toda semana.</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16 text-primary-600">
          <Spinner className="h-7 w-7" />
        </div>
      ) : recorrencias.length === 0 ? (
        <EmptyState
          icon="🔁"
          title="Nenhuma recorrência ainda"
          description='Ao reservar um horário, marque "Repetir toda semana" para virar mensalista.'
        />
      ) : (
        <div className="space-y-3">
          {recorrencias.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div>
                  <p className="font-bold text-slate-900">{r.quadra?.nome}</p>
                  <p className="text-sm text-slate-500">
                    Toda {DIAS_SEMANA[r.diaSemana]} · {r.horaInicio}–{r.horaFim}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={r.ativo ? 'green' : 'gray'}>{r.ativo ? 'Ativa' : 'Cancelada'}</Badge>
                  {r.ativo && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelandoId === r.id}
                      onClick={() => cancelar(r.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
