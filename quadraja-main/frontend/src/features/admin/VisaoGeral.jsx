import { useEffect, useState, useCallback } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { hoje, formatarDataLonga, statusMeta } from '../../lib/format.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function VisaoGeral() {
  const toast = useToast();
  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState('');
  const [data, setData] = useState(hoje());
  const [reservas, setReservas] = useState([]);
  const [espera, setEspera] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);

  useEffect(() => {
    api.get('/quadras', { params: { todas: true } }).then(({ data }) => setQuadras(data));
  }, []);

  const carregar = useCallback(() => {
    setCarregando(true);
    const params = { data };
    if (quadraId) params.quadraId = quadraId;
    Promise.all([
      api.get('/reservas', { params }),
      api.get('/lista-espera', { params }),
    ])
      .then(([r1, r2]) => {
        setReservas(r1.data);
        setEspera(r2.data);
      })
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }, [data, quadraId, toast]);

  useEffect(carregar, [carregar]);

  async function cancelar(id) {
    if (!window.confirm('Cancelar esta reserva?')) return;
    setCancelandoId(id);
    try {
      const { data: resp } = await api.delete(`/reservas/${id}`);
      // Se havia alguem na fila, o backend devolve o link de aviso por WhatsApp.
      if (resp.esperaNotificada?.whatsappUrl) {
        window.open(resp.esperaNotificada.whatsappUrl, '_blank', 'noopener');
        toast(`Reserva cancelada. Avisando ${resp.esperaNotificada.listaEspera.cliente.nome} da vaga!`, 'success');
      } else {
        toast('Reserva cancelada.', 'success');
      }
      carregar();
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setCancelandoId(null);
    }
  }

  const podeCancelar = (s) => s === 'PENDENTE' || s === 'CONFIRMADA';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">Todas as reservas e filas por dia e quadra.</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Dia</label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Quadra</label>
            <Select value={quadraId} onChange={(e) => setQuadraId(e.target.value)}>
              <option value="">Todas as quadras</option>
              {quadras.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Reservas */}
      {carregando ? (
        <div className="flex justify-center py-16 text-primary-600">
          <Spinner className="h-7 w-7" />
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState icon="🗓️" title="Sem reservas" description={`Nenhuma reserva em ${formatarDataLonga(data)}.`} />
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => {
            const meta = statusMeta(r.status);
            return (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-extrabold tabular-nums text-slate-900">{r.horaInicio}</p>
                      <p className="text-[11px] text-slate-400">{r.horaFim}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div>
                      <p className="font-bold text-slate-900">{r.quadra?.nome}</p>
                      <p className="text-sm text-slate-500">
                        {r.cliente?.nome} · {r.cliente?.telefone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={meta.badge}>{meta.label}</Badge>
                    {podeCancelar(r.status) && (
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
            );
          })}
        </div>
      )}

      {/* Lista de espera */}
      {espera.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Lista de espera</h2>
          {espera.map((e) => (
            <Card key={e.id}>
              <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Badge color="blue">#{e.posicao}</Badge>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {e.cliente?.nome} · {e.horaInicio}–{e.horaFim}
                    </p>
                    <p className="text-sm text-slate-500">
                      {e.quadra?.nome} · {e.cliente?.telefone}
                    </p>
                  </div>
                </div>
                {e.notificado && <Badge color="green">Avisado</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
